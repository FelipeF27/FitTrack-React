import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import * as Crypto from 'expo-crypto';
import type { Profile, TrainingData, Workout } from '../types/models';
import { accountKey, hash, privateStorage, readTraining, SESSION_KEY, writeTraining } from '../services/storage';
import { validEmail } from '../utils/training';

type Account = { profile: Profile; salt: string; passwordHash: string };
type ContextValue = {
  user: Profile | null; data: TrainingData; loading: boolean; startupError: string;
  busy: boolean; restore: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  saveWorkout: (workout: Workout) => Promise<void>;
  deleteWorkout: (id: string) => Promise<void>;
  completeWorkout: (workout: Workout) => Promise<void>;
};
const Context = createContext<ContextValue | null>(null);
const emptyData = (): TrainingData => ({ workouts: [], sessions: [] });

export function FitTrackProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [data, setData] = useState<TrainingData>(emptyData);
  const [loading, setLoading] = useState(true);
  const [startupError, setStartupError] = useState('');
  const [busy, setBusy] = useState(false);
  const dataRef = useRef(data);
  const lock = useRef(false);

  async function restore() {
    setLoading(true); setStartupError('');
    try {
      const session = await privateStorage.get(SESSION_KEY);
      if (session) {
        const profile = JSON.parse(session) as Profile;
        if (!profile.id || !profile.email || !profile.name) throw new Error('Sessão inválida.');
        const saved = await readTraining(profile);
        dataRef.current = saved; setData(saved); setUser(profile);
      }
    } catch {
      setStartupError('Não foi possível abrir seus dados. Tente novamente para preservar seus treinos.');
    } finally { setLoading(false); }
  }
  useEffect(() => { void restore(); }, []);

  async function exclusive(action: () => Promise<void>) {
    if (lock.current) throw new Error('Aguarde a operação atual terminar.');
    lock.current = true; setBusy(true);
    try { await action(); }
    finally { lock.current = false; setBusy(false); }
  }
  async function openSession(profile: Profile) {
    const saved = await readTraining(profile);
    await privateStorage.set(SESSION_KEY, JSON.stringify(profile));
    dataRef.current = saved; setData(saved); setUser(profile);
  }
  async function login(email: string, password: string) {
    await exclusive(async () => {
      const raw = await privateStorage.get(await accountKey(email));
      if (!raw) throw new Error('E-mail ou senha incorretos. Cadastre sua conta neste aparelho.');
      const account = JSON.parse(raw) as Account;
      if (await hash(`${account.salt}:${password}`) !== account.passwordHash) throw new Error('E-mail ou senha incorretos.');
      await openSession(account.profile);
    });
  }
  async function register(name: string, email: string, password: string) {
    await exclusive(async () => {
      const normalizedEmail = email.trim().toLowerCase();
      if (name.trim().length < 2) throw new Error('Informe seu nome com pelo menos 2 caracteres.');
      if (!validEmail(normalizedEmail)) throw new Error('Informe um e-mail válido.');
      if (password.length < 6) throw new Error('A senha precisa ter pelo menos 6 caracteres.');
      const key = await accountKey(normalizedEmail);
      if (await privateStorage.get(key)) throw new Error('Este e-mail já está cadastrado neste aparelho. Entre com sua senha.');
      const salt = Crypto.randomUUID();
      const profile = { id: Crypto.randomUUID(), name: name.trim(), email: normalizedEmail };
      const account: Account = { profile, salt, passwordHash: await hash(`${salt}:${password}`) };
      await privateStorage.set(key, JSON.stringify(account));
      await openSession(profile);
    });
  }
  async function logout() {
    await exclusive(async () => {
      await privateStorage.remove(SESSION_KEY);
      setUser(null); const clean = emptyData(); dataRef.current = clean; setData(clean);
    });
  }
  async function commit(update: (current: TrainingData) => TrainingData) {
    await exclusive(async () => {
      if (!user) throw new Error('Entre novamente para salvar seus treinos.');
      const next = update(dataRef.current);
      // Só atualiza a tela depois de confirmar a gravação no aparelho.
      await writeTraining(user, next);
      dataRef.current = next; setData(next);
    });
  }
  const saveWorkout = (workout: Workout) => commit(current => ({ ...current,
    workouts: current.workouts.some(w => w.id === workout.id)
      ? current.workouts.map(w => w.id === workout.id ? workout : w)
      : [workout, ...current.workouts],
  }));
  const deleteWorkout = (id: string) => commit(current => ({ ...current, workouts: current.workouts.filter(w => w.id !== id) }));
  const completeWorkout = (workout: Workout) => commit(current => ({ ...current, sessions: [{
    id: Crypto.randomUUID(), workoutId: workout.id, workoutName: workout.name,
    group: workout.group, exercises: workout.exercises.map(e => ({ ...e })), completedAt: new Date().toISOString(),
  }, ...current.sessions] }));

  return <Context.Provider value={{ user, data, loading, startupError, busy, restore, login, register, logout, saveWorkout, deleteWorkout, completeWorkout }}>{children}</Context.Provider>;
}
export function useFitTrack() {
  const value = useContext(Context);
  if (!value) throw new Error('Use useFitTrack dentro do FitTrackProvider.');
  return value;
}

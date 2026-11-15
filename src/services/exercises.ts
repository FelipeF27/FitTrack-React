import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Exercise } from '../types/models';

export const EXERCISES_API = 'https://api.github.com/repos/yuhonas/free-exercise-db/contents/dist/exercises.json';
const CACHE_KEY = '@fittrack/exercises/v1';
export type Catalog = { exercises: Exercise[]; source: 'online' | 'cache'; fetchedAt: string };

export function parseExercises(value: unknown): Exercise[] {
  if (!Array.isArray(value)) throw new Error('O catálogo retornou um formato inesperado.');
  const rows = value.filter((e): e is Exercise => e && typeof e.id === 'string' && typeof e.name === 'string'
    && Array.isArray(e.primaryMuscles) && e.primaryMuscles.every((m: unknown) => typeof m === 'string')
    && Array.isArray(e.instructions) && e.instructions.every((m: unknown) => typeof m === 'string')
    && Array.isArray(e.images) && e.images.every((m: unknown) => typeof m === 'string')
    && typeof e.level === 'string' && (e.equipment === null || typeof e.equipment === 'string'));
  if (!rows.length) throw new Error('Nenhum exercício disponível no catálogo.');
  return rows;
}
export async function fetchExercises(signal: AbortSignal): Promise<Catalog> {
  const response = await fetch(EXERCISES_API, {
    signal, headers: { Accept: 'application/vnd.github.raw+json' },
  });
  if (!response.ok) throw new Error(response.status === 403 || response.status === 429
    ? 'O catálogo atingiu o limite temporário de consultas. Tente novamente mais tarde.'
    : 'Não foi possível consultar os exercícios. Tente novamente.');
  const exercises = parseExercises(await response.json());
  const catalog: Catalog = { exercises, source: 'online', fetchedAt: new Date().toISOString() };
  // Uma falha ao gravar o cache não impede a consulta online.
  await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(catalog)).catch(() => {});
  return catalog;
}
export async function readCachedExercises(): Promise<Catalog | null> {
  const raw = await AsyncStorage.getItem(CACHE_KEY);
  if (!raw) return null;
  const cached = JSON.parse(raw) as Catalog;
  return { exercises: parseExercises(cached.exercises), fetchedAt: cached.fetchedAt, source: 'cache' };
}
export const exerciseImage = (path: string) => `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${path}`;

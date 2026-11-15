import type { Session, TrainingData, WorkoutExercise } from '../types/models';

export const GROUPS = ['Peito', 'Costas', 'Pernas', 'Ombros', 'Braços', 'Abdômen', 'Corpo todo'];
export const muscleLabels: Record<string, string> = {
  abdominals: 'Abdômen', abductors: 'Pernas', adductors: 'Pernas', biceps: 'Braços',
  calves: 'Pernas', chest: 'Peito', forearms: 'Braços', glutes: 'Pernas',
  hamstrings: 'Pernas', lats: 'Costas', 'lower back': 'Costas', 'middle back': 'Costas',
  neck: 'Ombros', quadriceps: 'Pernas', shoulders: 'Ombros', traps: 'Costas', triceps: 'Braços',
};
export const equipmentLabels: Record<string, string> = {
  barbell: 'Barra', dumbbell: 'Halteres', 'body only': 'Peso corporal', cable: 'Cabo',
  machine: 'Máquina', kettlebells: 'Kettlebell', bands: 'Elástico',
  'exercise ball': 'Bola', 'medicine ball': 'Bola medicinal', 'foam roll': 'Rolo', other: 'Outro',
};
export const levelLabels: Record<string, string> = { beginner: 'Iniciante', intermediate: 'Intermediário', expert: 'Avançado' };
export const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
export const validEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
export function validateExercise(name: string, sets: string, reps: string) {
  if (!name.trim()) return 'Informe o nome do exercício.';
  if (!/^\d+$/.test(sets) || Number(sets) < 1 || Number(sets) > 20) return 'Informe entre 1 e 20 séries.';
  if (!/^\d+$/.test(reps) || Number(reps) < 1 || Number(reps) > 100) return 'Informe entre 1 e 100 repetições.';
  return null;
}
export const totalSets = (exercises: WorkoutExercise[]) => exercises.reduce((sum, item) => sum + item.sets, 0);
export function weekSessions(sessions: Session[], today = new Date()) {
  const start = new Date(today);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (start.getDay() + 6) % 7);
  return sessions.filter(s => new Date(s.completedAt) >= start && new Date(s.completedAt) <= today);
}
export function formatDate(value: string) {
  return new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function parseTraining(value: unknown): TrainingData {
  const object = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;
  const text = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0;
  const date = (v: unknown) => text(v) && !Number.isNaN(Date.parse(v));
  const exercise = (v: unknown) => object(v) && text(v.id) && text(v.name)
    && typeof v.sets === 'number' && typeof v.reps === 'number'
    && !validateExercise(v.name, String(v.sets), String(v.reps));
  const exercises = (v: unknown) => Array.isArray(v) && v.length > 0 && v.every(exercise);
  if (!object(value) || !Array.isArray(value.workouts) || !Array.isArray(value.sessions)
    || !value.workouts.every(w => object(w) && text(w.id) && text(w.name) && text(w.group)
      && typeof w.notes === 'string' && date(w.createdAt) && exercises(w.exercises))
    || !value.sessions.every(s => object(s) && text(s.id) && text(s.workoutId) && text(s.workoutName)
      && text(s.group) && date(s.completedAt) && exercises(s.exercises))) {
    throw new Error('Não foi possível ler os treinos salvos.');
  }
  return value as unknown as TrainingData;
}

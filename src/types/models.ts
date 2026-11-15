export type Profile = { id: string; name: string; email: string };
export type WorkoutExercise = { id: string; name: string; sets: number; reps: number };
export type Workout = {
  id: string; name: string; group: string; notes: string;
  exercises: WorkoutExercise[]; createdAt: string;
};
export type Session = {
  id: string; workoutId: string; workoutName: string; group: string;
  exercises: WorkoutExercise[]; completedAt: string;
};
export type TrainingData = { workouts: Workout[]; sessions: Session[] };
export type Exercise = {
  id: string; name: string; primaryMuscles: string[]; equipment: string | null;
  level: string; instructions: string[]; images: string[];
};
export type RootStackParamList = {
  Login: undefined; Cadastro: undefined; Principal: undefined;
  NovoTreino: { workoutId?: string; exerciseName?: string; group?: string } | undefined;
};
export type TabParamList = { Home: undefined; Treinos: undefined; Exercicios: undefined; Historico: undefined };

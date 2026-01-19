export interface SessionExerciseLog {
  exerciseId: number;
  name: string;
  sets: number;
  reps: number;
  weightKg: number;
}

export interface WorkoutSession {
  id: string;
  date: Date;
  exercises: SessionExerciseLog[];
}
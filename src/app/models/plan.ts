export interface WorkoutPlanExercise {
  exerciseId: number;
  name: string;
  sets: number;
  reps: number;
  notes?: string;
}

export interface WorkoutPlanDay {
  id: string;
  title: string;
  emphasis: string;
  exercises: WorkoutPlanExercise[];
}

export interface WorkoutPlan {
  id: string;
  name: string;
  focus: string;
  frequencyPerWeek: number;
  notes?: string;
  createdAt: Date;
  days: WorkoutPlanDay[];
}

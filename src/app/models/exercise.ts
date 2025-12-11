export type MuscleGroup = 'Petto' | 'Schiena' | 'Gambe' | 'Braccia' | 'Spalle' | 'Core' | string;

export interface Exercise {
  id: number;
  name: string;
  muscleGroup: MuscleGroup;
  sets: number;
  reps: number;
  weightKg?: number;
  notes?: string;
}
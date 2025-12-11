import { Injectable, effect, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Exercise } from '../models/exercise';

@Injectable({ providedIn: 'root' })
export class ExerciseService {
  private static readonly STORAGE_KEY = 'gym-app-exercises';
  private readonly defaultExercises: Exercise[] = [
    {
      id: 1,
      name: 'Panca piana con bilanciere',
      muscleGroup: 'Petto',
      sets: 3,
      reps: 8,
      weightKg: 50,
      notes: 'Focus sulla tecnica, niente rimbalzi'
    },
    {
      id: 2,
      name: 'Lat machine avanti',
      muscleGroup: 'Schiena',
      sets: 3,
      reps: 10,
      weightKg: 40,
      notes: 'Tirare al petto senza slanci'
    },
    {
      id: 3,
      name: 'Squat al multipower',
      muscleGroup: 'Gambe',
      sets: 4,
      reps: 8,
      weightKg: 60,
      notes: 'Scendere almeno a parallelo'
    },
    {
      id: 4,
      name: 'Curl manubri in piedi',
      muscleGroup: 'Braccia',
      sets: 3,
      reps: 12,
      weightKg: 10
    },
    {
      id: 5,
      name: 'French press bilanciere EZ',
      muscleGroup: 'Braccia',
      sets: 3,
      reps: 10,
      weightKg: 25
    },
    {
      id: 6,
      name: 'Plank',
      muscleGroup: 'Core',
      sets: 3,
      reps: 30,
      notes: '30 secondi a serie'
    }
  ];

  private nextId = this.defaultExercises.length + 1;
  private readonly exercisesSignal = signal<Exercise[]>(this.loadFromStorage() ?? this.defaultExercises);

  readonly exercises = this.exercisesSignal.asReadonly();
  readonly exercises$ = toObservable(this.exercisesSignal);

  constructor() {
    effect(() => {
      this.persist(this.exercisesSignal());
    });

    this.syncNextId();
  }

  addExercise(exercise: Exercise): void {
    const payload: Exercise = {
      ...exercise,
      id: exercise.id ?? this.generateId()
    };
    this.exercisesSignal.update(list => [...list, payload]);
  }

  updateExercise(exercise: Exercise): void {
    this.exercisesSignal.update(list =>
      list.map(item => (item.id === exercise.id ? { ...exercise } : item))
    );
  }

  deleteExercise(id: number): void {
    this.exercisesSignal.update(list => list.filter(item => item.id !== id));
  }

  private generateId(): number {
    const currentMax = this.exercisesSignal().reduce((max, item) => Math.max(max, item.id), 0);
    this.nextId = Math.max(this.nextId, currentMax + 1);
    return this.nextId++;
  }

  private persist(exercises: Exercise[]): void {
    if (typeof window === 'undefined') {
      return;
    }
    window.localStorage.setItem(ExerciseService.STORAGE_KEY, JSON.stringify(exercises));
  }

  private loadFromStorage(): Exercise[] | null {
    if (typeof window === 'undefined') {
      return null;
    }
    const raw = window.localStorage.getItem(ExerciseService.STORAGE_KEY);
    if (!raw) {
      return null;
    }

    try {
      const parsed = JSON.parse(raw) as Exercise[];
      return Array.isArray(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  private syncNextId(): void {
    const currentMax = this.exercisesSignal().reduce((max, item) => Math.max(max, item.id), 0);
    this.nextId = Math.max(this.nextId, currentMax + 1);
  }
}

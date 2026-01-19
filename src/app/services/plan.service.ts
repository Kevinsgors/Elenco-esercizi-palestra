import { Injectable, effect, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { WorkoutPlan } from '../models/plan';

@Injectable({ providedIn: 'root' })
export class PlanService {
  private static readonly STORAGE_KEY = 'gym-app-plans';
  private readonly plansSignal = signal<WorkoutPlan[]>(this.loadFromStorage());

  readonly plans = this.plansSignal.asReadonly();
  readonly plans$ = toObservable(this.plansSignal);

  constructor() {
    effect(() => {
      this.persist(this.plansSignal());
    });
  }

  savePlan(plan: WorkoutPlan): void {
    this.plansSignal.update(list => [...list, plan]);
  }

  deletePlan(id: string): void {
    this.plansSignal.update(list => list.filter(item => item.id !== id));
  }

  private persist(plans: WorkoutPlan[]): void {
    if (typeof window === 'undefined') {
      return;
    }
    const payload = plans.map(plan => ({
      ...plan,
      createdAt: plan.createdAt instanceof Date ? plan.createdAt.toISOString() : plan.createdAt
    }));
    window.localStorage.setItem(PlanService.STORAGE_KEY, JSON.stringify(payload));
  }

  private loadFromStorage(): WorkoutPlan[] {
    if (typeof window === 'undefined') {
      return [];
    }
    const raw = window.localStorage.getItem(PlanService.STORAGE_KEY);
    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw) as Array<WorkoutPlan & { createdAt: string }>;
      return parsed.map(plan => ({
        ...plan,
        createdAt: new Date(plan.createdAt)
      }));
    } catch {
      return [];
    }
  }
}

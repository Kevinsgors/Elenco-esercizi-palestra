import { Injectable, effect, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { WorkoutSession } from '../models/session';

@Injectable({ providedIn: 'root' })
export class WorkoutService {
  private static readonly STORAGE_KEY = 'gym-app-sessions';
  private readonly sessionsSignal = signal<WorkoutSession[]>(this.loadFromStorage());

  readonly sessions = this.sessionsSignal.asReadonly();
  readonly sessions$ = toObservable(this.sessionsSignal);
  readonly history = this.sessions;
  readonly history$ = this.sessions$;

  constructor() {
    effect(() => {
      this.persist(this.sessionsSignal());
    });
  }

  saveSession(session: WorkoutSession): void {
    this.sessionsSignal.update(list => [...list, session]);
  }

  clearSessions(): void {
    this.sessionsSignal.set([]);
  }

  private persist(sessions: WorkoutSession[]): void {
    if (typeof window === 'undefined') {
      return;
    }
    const payload = sessions.map(session => ({
      ...session,
      date: session.date instanceof Date ? session.date.toISOString() : session.date
    }));
    window.localStorage.setItem(WorkoutService.STORAGE_KEY, JSON.stringify(payload));
  }

  private loadFromStorage(): WorkoutSession[] {
    if (typeof window === 'undefined') {
      return [];
    }
    const raw = window.localStorage.getItem(WorkoutService.STORAGE_KEY);
    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw) as Array<WorkoutSession & { date: string }>;
      return parsed.map(session => ({
        ...session,
        date: new Date(session.date)
      }));
    } catch {
      return [];
    }
  }
}

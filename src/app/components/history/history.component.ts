import { Component, DestroyRef, OnInit } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { WorkoutService } from '../../services/workout.service';
import { WorkoutSession } from '../../models/session';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [DatePipe, DecimalPipe],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {
  history: WorkoutSession[] = [];

  constructor(
    private readonly workoutService: WorkoutService,
    private readonly destroyRef: DestroyRef
  ) {}

  ngOnInit(): void {
    this.workoutService.history$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(data => {
        this.history = data;
      });
  }

  get totalSessions(): number {
    return this.history.length;
  }

  get totalExercises(): number {
    return this.history.reduce((count, session) => count + session.exercises.length, 0);
  }

  get totalSets(): number {
    return this.history.reduce((count, session) => count + this.getSessionSets(session), 0);
  }

  get totalVolume(): number {
    return this.history.reduce((sum, session) => sum + this.getSessionVolume(session), 0);
  }

  get hasVolumeData(): boolean {
    return this.history.some(session =>
      session.exercises.some(exercise => (exercise.weightKg ?? 0) > 0)
    );
  }

  getSessionSets(session: WorkoutSession): number {
    return session.exercises.reduce((count, exercise) => count + (exercise.sets ?? 0), 0);
  }

  getSessionVolume(session: WorkoutSession): number {
    return session.exercises.reduce((sum, exercise) => {
      const weight = exercise.weightKg ?? 0;
      if (weight <= 0) {
        return sum;
      }
      const sets = exercise.sets ?? 0;
      const reps = exercise.reps ?? 0;
      return sum + sets * reps * weight;
    }, 0);
  }
}

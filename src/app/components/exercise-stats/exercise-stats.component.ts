import { Component, DestroyRef, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ExerciseService } from '../../services/exercise.service';
import { WorkoutService } from '../../services/workout.service';
import { Exercise } from '../../models/exercise';

interface ExerciseStatRow {
  date: Date;
  sets: number;
  reps: number;
  weightKg: number;
}

@Component({
  selector: 'app-exercise-stats',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './exercise-stats.component.html',
  styleUrls: ['./exercise-stats.component.css']
})
export class ExerciseStatsComponent implements OnInit {
  exercises: Exercise[] = [];
  selectedExerciseId: number | null = null;
  stats: ExerciseStatRow[] = [];

  constructor(
    private readonly exerciseService: ExerciseService,
    private readonly workoutService: WorkoutService,
    private readonly destroyRef: DestroyRef
  ) {}

  ngOnInit(): void {
    this.exerciseService.exercises$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(data => {
        this.exercises = data;
      });
  }

  onExerciseChange(): void {
    if (this.selectedExerciseId) {
      this.stats = this.workoutService.getStatsForExercise(this.selectedExerciseId);
    } else {
      this.stats = [];
    }
  }
}

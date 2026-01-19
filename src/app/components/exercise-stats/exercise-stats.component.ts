import { Component, DestroyRef, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ExerciseService } from '../../services/exercise.service';
import { WorkoutService } from '../../services/workout.service';
import { Exercise } from '../../models/exercise';
import { FancySelectComponent, FancySelectOption } from '../shared/fancy-select/fancy-select.component';

interface ExerciseStatRow {
  date: Date;
  sets: number;
  reps: number;
  weightKg: number;
}

interface ExerciseStatView extends ExerciseStatRow {
  totalReps: number;
  volume: number;
}

interface ExerciseStatsSummary {
  sessions: number;
  totalSets: number;
  totalReps: number;
  totalVolume: number;
  bestWeight: number;
  firstWeight: number;
  lastWeight: number;
  progressDelta: number;
  progressPercent: number | null;
  peakVolume: number;
  peakVolumeDate: Date | null;
  firstDate: Date | null;
  lastDate: Date | null;
  averageVolume: number;
}

@Component({
  selector: 'app-exercise-stats',
  standalone: true,
  imports: [FormsModule, DatePipe, DecimalPipe, FancySelectComponent],
  templateUrl: './exercise-stats.component.html',
  styleUrls: ['./exercise-stats.component.css']
})
export class ExerciseStatsComponent implements OnInit {
  exercises: Exercise[] = [];
  selectedExerciseId: number | null = null;
  stats: ExerciseStatRow[] = [];
  viewStats: ExerciseStatView[] = [];
  exerciseOptions: FancySelectOption<number>[] = [];
  summary: ExerciseStatsSummary = this.createEmptySummary();
  peakEntry: ExerciseStatView | null = null;

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
        this.exerciseOptions = data.map(item => ({
          value: item.id,
          label: item.name
        }));
      });
  }

  onExerciseChange(): void {
    if (this.selectedExerciseId) {
      const rawStats = this.workoutService.getStatsForExercise(this.selectedExerciseId);
      this.stats = [...rawStats];
      this.viewStats = [...rawStats]
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .map(item => ({
          ...item,
          totalReps: item.sets * item.reps,
          volume: item.sets * item.reps * Math.max(item.weightKg, 0)
        }));
      this.computeSummary();
    } else {
      this.resetStats();
    }
  }

  get hasSelection(): boolean {
    return this.selectedExerciseId !== null;
  }

  get hasStats(): boolean {
    return this.viewStats.length > 0;
  }

  get selectedExerciseName(): string | null {
    if (!this.selectedExerciseId) {
      return null;
    }
    return this.exercises.find(exercise => exercise.id === this.selectedExerciseId)?.name ?? null;
  }

  get averageVolume(): number {
    return this.summary.averageVolume;
  }

  trackStatEntry(index: number, item: ExerciseStatView): string {
    return `${item.date.getTime()}-${index}`;
  }

  private computeSummary(): void {
    if (!this.viewStats.length) {
      this.summary = this.createEmptySummary();
      this.peakEntry = null;
      return;
    }

    const summary: ExerciseStatsSummary = {
      sessions: this.viewStats.length,
      totalSets: 0,
      totalReps: 0,
      totalVolume: 0,
      bestWeight: 0,
      firstWeight: this.viewStats[this.viewStats.length - 1]?.weightKg ?? 0,
      lastWeight: this.viewStats[0]?.weightKg ?? 0,
      progressDelta: 0,
      progressPercent: null,
      peakVolume: 0,
      peakVolumeDate: null,
      firstDate: this.viewStats[this.viewStats.length - 1]?.date ?? null,
      lastDate: this.viewStats[0]?.date ?? null,
      averageVolume: 0
    };

    let peakEntry: ExerciseStatView | null = null;

    for (const entry of this.viewStats) {
      summary.totalSets += entry.sets;
      summary.totalReps += entry.totalReps;
      summary.totalVolume += entry.volume;
      summary.bestWeight = Math.max(summary.bestWeight, entry.weightKg);

      if (!peakEntry || entry.volume > peakEntry.volume) {
        peakEntry = entry;
      }
    }

    summary.peakVolume = peakEntry?.volume ?? 0;
    summary.peakVolumeDate = peakEntry?.date ?? null;
    summary.progressDelta = summary.lastWeight - summary.firstWeight;
    summary.progressPercent = summary.firstWeight > 0 ? (summary.progressDelta / summary.firstWeight) * 100 : null;
    summary.averageVolume = summary.sessions > 0 ? summary.totalVolume / summary.sessions : 0;

    this.summary = summary;
    this.peakEntry = peakEntry;
  }

  private resetStats(): void {
    this.stats = [];
    this.viewStats = [];
    this.summary = this.createEmptySummary();
    this.peakEntry = null;
  }

  private createEmptySummary(): ExerciseStatsSummary {
    return {
      sessions: 0,
      totalSets: 0,
      totalReps: 0,
      totalVolume: 0,
      bestWeight: 0,
      firstWeight: 0,
      lastWeight: 0,
      progressDelta: 0,
      progressPercent: null,
      peakVolume: 0,
      peakVolumeDate: null,
      firstDate: null,
      lastDate: null,
      averageVolume: 0
    };
  }
}

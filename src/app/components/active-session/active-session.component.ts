import { Component, DestroyRef, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ExerciseService } from '../../services/exercise.service';
import { WorkoutService } from '../../services/workout.service';
import { Exercise } from '../../models/exercise';
import { SessionExerciseLog, WorkoutSession } from '../../models/session';
import { FancySelectComponent, FancySelectOption } from '../shared/fancy-select/fancy-select.component';

@Component({
  selector: 'app-active-session',
  standalone: true,
  imports: [FormsModule, FancySelectComponent],
  templateUrl: './active-session.component.html',
  styleUrls: ['./active-session.component.css']
})
export class ActiveSessionComponent implements OnInit {
  availableExercises: Exercise[] = [];
  currentSessionExercises: SessionExerciseLog[] = [];
  selectedExerciseId: number | null = null;
  exerciseOptions: FancySelectOption<number>[] = [];
  showModal = false;
  modalTitle = '';
  modalMessage = '';
  modalTone: 'error' | 'success' = 'success';

  constructor(
    private readonly exerciseService: ExerciseService,
    private readonly workoutService: WorkoutService,
    private readonly destroyRef: DestroyRef
  ) {}

  ngOnInit(): void {
    this.exerciseService.exercises$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(data => {
        this.availableExercises = data;
        this.exerciseOptions = data.map(item => ({
          value: item.id,
          label: item.name
        }));
      });
  }

  addExercise(): void {
    if (!this.selectedExerciseId) {
      return;
    }
    const original = this.availableExercises.find(exercise => exercise.id === this.selectedExerciseId);
    if (original) {
      this.currentSessionExercises.push({
        exerciseId: original.id,
        name: original.name,
        sets: original.sets,
        reps: original.reps,
        weightKg: original.weightKg ?? 0
      });
    }
    this.selectedExerciseId = null;
  }

  removeExercise(index: number): void {
    this.currentSessionExercises.splice(index, 1);
  }

  saveWorkout(): void {
    if (this.currentSessionExercises.length === 0) {
      this.openModal('error', 'Aggiungi almeno un esercizio!');
      return;
    }

    const newSession: WorkoutSession = {
      id: Date.now().toString(),
      date: new Date(),
      exercises: this.currentSessionExercises.map(entry => ({ ...entry }))
    };

    this.workoutService.saveSession(newSession);
    this.openModal('success', 'Allenamento salvato!');
    this.resetSession();
  }

  closeModal(): void {
    this.showModal = false;
  }

  resetSession(): void {
    this.currentSessionExercises = [];
    this.selectedExerciseId = null;
  }

  private openModal(tone: 'error' | 'success', message: string): void {
    this.modalTone = tone;
    this.modalTitle = tone === 'error' ? 'Attenzione' : 'Fatto';
    this.modalMessage = message;
    this.showModal = true;
  }
}

import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ExerciseService } from '../../services/exercise.service';
import { Exercise } from '../../models/exercise';
import { FancySelectComponent, FancySelectOption } from '../shared/fancy-select/fancy-select.component';

@Component({
  selector: 'app-exercise-form',
  standalone: true,
  imports: [FormsModule, FancySelectComponent],
  templateUrl: './exercise-form.component.html',
  styleUrl: './exercise-form.component.css'
})
export class ExerciseFormComponent {
  readonly muscleGroups: string[] = ['Petto', 'Spalle', 'Gambe', 'Braccia', 'Core', 'Schiena'];
  readonly muscleGroupOptions: FancySelectOption<string>[] = this.muscleGroups.map(group => ({
    value: group,
    label: group
  }));

  newExercise: Partial<Exercise> = {
    name: '',
    muscleGroup: '',
    sets: undefined,
    reps: undefined,
    weightKg: undefined,
    notes: ''
  };

  validationError: string | null = null;

  @Output() saved = new EventEmitter<void>();

  constructor(private readonly exerciseService: ExerciseService) {}

  saveExercise(): void {
    if (this.isValid()) {
      const payload = {
        name: this.newExercise.name?.trim() ?? '',
        muscleGroup: this.newExercise.muscleGroup ?? '',
        sets: Number(this.newExercise.sets),
        reps: Number(this.newExercise.reps),
        weightKg:
          this.newExercise.weightKg === undefined || this.newExercise.weightKg === null
            ? undefined
            : Number(this.newExercise.weightKg),
        notes: this.newExercise.notes?.trim() || undefined
      } as Exercise;

      this.exerciseService.addExercise(payload);
      this.validationError = null;
      this.newExercise = {
        name: '',
        muscleGroup: '',
        sets: undefined,
        reps: undefined,
        weightKg: undefined,
        notes: ''
      };
      this.saved.emit();
    } else {
      this.validationError = 'Compila tutti i campi obbligatori (Nome, Gruppo, Serie, Ripetizioni)';
    }
  }

  isValid(): boolean {
    return !!(
      this.newExercise.name &&
      this.newExercise.muscleGroup &&
      (this.newExercise.sets || 0) > 0 &&
      (this.newExercise.reps || 0) > 0
    );
  }
}

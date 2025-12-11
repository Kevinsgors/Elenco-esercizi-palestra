import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ExerciseService } from '../../services/exercise.service';
import { Exercise } from '../../models/exercise';

@Component({
  selector: 'app-exercise-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './exercise-form.component.html',
  styleUrl: './exercise-form.component.css'
})
export class ExerciseFormComponent {
  muscleGroups: string[] = ['Petto', 'Spalle', 'Gambe', 'Braccia', 'Core', 'Schiena'];

  newExercise: Partial<Exercise> = {
    name: '',
    muscleGroup: '',
    sets: 0,
    reps: 0,
    weightKg: 0,
    notes: ''
  };

  constructor(private readonly exerciseService: ExerciseService) {}

  saveExercise(): void {
    if (this.isValid()) {
      this.exerciseService.addExercise(this.newExercise as Exercise);
      this.newExercise = {
        name: '',
        muscleGroup: '',
        sets: 0,
        reps: 0,
        weightKg: 0,
        notes: ''
      };
    } else {
      alert('Compila tutti i campi obbligatori (Nome, Gruppo, Serie, Ripetizioni)');
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

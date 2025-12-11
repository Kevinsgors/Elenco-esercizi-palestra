import { Component, computed } from '@angular/core';
import { ExerciseService } from '../../services/exercise.service';
import { Exercise } from '../../models/exercise';

@Component({
  selector: 'app-exercise-list',
  standalone: true,
  templateUrl: './exercise-list.component.html',
  styleUrl: './exercise-list.component.css'
})
export class ExerciseListComponent {
  readonly exercises = computed(() => this.exerciseService.exercises());

  constructor(private readonly exerciseService: ExerciseService) {}

  trackById(_: number, exercise: Exercise): number {
    return exercise.id;
  }

  deleteExercise(id: number): void {
    if (confirm('Sei sicuro di voler eliminare questo esercizio?')) {
      this.exerciseService.deleteExercise(id);
    }
  }
}

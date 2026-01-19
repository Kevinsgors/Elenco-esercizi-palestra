import { Component, DestroyRef, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ExerciseService } from '../../services/exercise.service';
import { Exercise } from '../../models/exercise';

@Component({
  selector: 'app-exercise-list',
  standalone: true,
  templateUrl: './exercise-list.component.html',
  styleUrl: './exercise-list.component.css'
})
export class ExerciseListComponent implements OnInit {
  exercises: Exercise[] = [];

  constructor(
    private readonly exerciseService: ExerciseService,
    private readonly destroyRef: DestroyRef
  ) {}

  ngOnInit(): void {
    this.exerciseService.exercises$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(data => {
        this.exercises = data;
      });
  }

  delete(id: number): void {
    if (confirm('Sei sicuro di voler eliminare questo esercizio?')) {
      this.exerciseService.deleteExercise(id);
    }
  }
}

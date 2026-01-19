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
  showDeleteModal = false;
  pendingDeleteId: number | null = null;
  pendingDeleteName = '';

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

  requestDelete(exercise: Exercise): void {
    this.pendingDeleteId = exercise.id;
    this.pendingDeleteName = exercise.name;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (this.pendingDeleteId != null) {
      this.exerciseService.deleteExercise(this.pendingDeleteId);
    }
    this.closeDeleteModal();
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.pendingDeleteId = null;
    this.pendingDeleteName = '';
  }
}

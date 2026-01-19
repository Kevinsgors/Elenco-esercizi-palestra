import { Component, DestroyRef, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { WorkoutService } from '../../services/workout.service';
import { WorkoutSession } from '../../models/session';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [DatePipe],
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
}

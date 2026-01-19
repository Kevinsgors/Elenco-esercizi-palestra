import { Component } from '@angular/core';
import { ExerciseFormComponent } from './components/exercise-form/exercise-form.component';
import { ExerciseListComponent } from './components/exercise-list/exercise-list.component';
import { ActiveSessionComponent } from './components/active-session/active-session.component';
import { HistoryComponent } from './components/history/history.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ExerciseFormComponent, ExerciseListComponent, ActiveSessionComponent, HistoryComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}

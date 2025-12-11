import { Component } from '@angular/core';
import { ExerciseFormComponent } from './components/exercise-form/exercise-form.component';
import { ExerciseListComponent } from './components/exercise-list/exercise-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ExerciseFormComponent, ExerciseListComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}

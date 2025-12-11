import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Exercise, MuscleGroup } from './models/exercise';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('gym-app');
  editMode: boolean = false;
  exerciseToEdit: Exercise = this.createEmptyExercise();
  readonly muscleGroups: MuscleGroup[] = ['Petto', 'Schiena', 'Gambe', 'Braccia', 'Spalle', 'Core'];
  exercises: Exercise[] = [
    {
      id: 1,
      name: 'Panca piana con bilanciere',
      muscleGroup: 'Petto',
      sets: 3,
      reps: 8,
      weightKg: 50,
      notes: 'Focus sulla tecnica, niente rimbalzi'
    },
    {
      id: 2,
      name: 'Lat machine avanti',
      muscleGroup: 'Schiena',
      sets: 3,
      reps: 10,
      weightKg: 40,
      notes: 'Tirare al petto senza slanci'
    },
    {
      id: 3,
      name: 'Squat al multipower',
      muscleGroup: 'Gambe',
      sets: 4,
      reps: 8,
      weightKg: 60,
      notes: 'Scendere almeno a parallelo'
    },
    {
      id: 4,
      name: 'Curl manubri in piedi',
      muscleGroup: 'Braccia',
      sets: 3,
      reps: 12,
      weightKg: 10
    },
    {
      id: 5,
      name: 'French press bilanciere EZ',
      muscleGroup: 'Braccia',
      sets: 3,
      reps: 10,
      weightKg: 25
    },
    {
      id: 6,
      name: 'Plank',
      muscleGroup: 'Core',
      sets: 3,
      reps: 30,
      notes: '30 secondi a serie'
    }
  ];

  insertExercise() {
    this.editMode = true;
    this.exerciseToEdit = this.createEmptyExercise();
  }

  editExercise(exercise: Exercise) {
    this.editMode = true;
    this.exerciseToEdit = exercise;
  }

  deleteExercise(id: number) {
    console.log('Elimina esercizio con id:', id);
    const confirmed = confirm(`Sei sicuro di voler eliminare questo esercizio? 🗑️`);
    if (confirmed) {
      this.exercises = this.exercises.filter(ex => ex.id !== id);
      alert('Esercizio eliminato! ✅');
    }
  }

  saveExercise() {
    if (!this.exerciseToEdit.name || this.exerciseToEdit.name.trim() === '') {
      alert('Il nome dell\'esercizio è obbligatorio! ⚠️');
      return;
    }
    if (this.exerciseToEdit.id === 0) {
      // assegno ID progressivo
      this.exerciseToEdit.id = this.exercises.length + 1;
      // inserisco l'esercizio nell'array
      this.exercises.push(this.exerciseToEdit);
    }
    console.log('Esercizio salvato:', this.exerciseToEdit);
    // torno alla modalità visualizzazione (elenco)
    this.editMode = false;
    // resetto l'esercizio in modifica
      this.exerciseToEdit = this.createEmptyExercise();
  }

  cancelEdit() {
    this.editMode = false;
    this.exerciseToEdit = this.createEmptyExercise();
  }

  private createEmptyExercise(): Exercise {
    return {
      id: 0,
      name: '',
      muscleGroup: '',
      sets: 0,
      reps: 0
    };
  }

}

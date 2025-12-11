import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Exercise } from './models/exercise';
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
  exerciseToEdit: Exercise = new Exercise();
  exercises: Exercise[] = [
    {
      id: 1,
      name: 'Panca piana con bilanciere',
      muscleGroup: 'petto',
      sets: 3,
      reps: 8,
      weightKg: 50,
      notes: 'Focus sulla tecnica, niente rimbalzi'
    },
    {
      id: 2,
      name: 'Lat machine avanti',
      muscleGroup: 'schiena',
      sets: 3,
      reps: 10,
      weightKg: 40,
      notes: 'Tirare al petto senza slanci'
    },
    {
      id: 3,
      name: 'Squat al multipower',
      muscleGroup: 'gambe',
      sets: 4,
      reps: 8,
      weightKg: 60,
      notes: 'Scendere almeno a parallelo'
    },
    {
      id: 4,
      name: 'Curl manubri in piedi',
      muscleGroup: 'bicipiti',
      sets: 3,
      reps: 12,
      weightKg: 10
    },
    {
      id: 5,
      name: 'French press bilanciere EZ',
      muscleGroup: 'tricipiti',
      sets: 3,
      reps: 10,
      weightKg: 25
    },
    {
      id: 6,
      name: 'Plank',
      muscleGroup: 'core',
      sets: 3,
      reps: 30,
      notes: '30 secondi a serie'
    }
  ];

  insertExercise() {
    this.editMode = true;
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
    this.exerciseToEdit = new Exercise();
  }

  cancelEdit() {
    this.editMode = false;
    this.exerciseToEdit = new Exercise();
  }

}

import { Component, signal } from '@angular/core';
import { ExerciseFormComponent } from './components/exercise-form/exercise-form.component';
import { ExerciseListComponent } from './components/exercise-list/exercise-list.component';
import { ActiveSessionComponent } from './components/active-session/active-session.component';
import { HistoryComponent } from './components/history/history.component';
import { ExerciseStatsComponent } from './components/exercise-stats/exercise-stats.component';
import { NewPlanComponent } from './components/new-plan/new-plan.component';

type SectionKey = 'esercizi' | 'schede' | 'nuova' | 'sessione' | 'analisi';

interface SectionDefinition {
  key: SectionKey;
  label: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ExerciseFormComponent, ExerciseListComponent, ActiveSessionComponent, HistoryComponent, ExerciseStatsComponent, NewPlanComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  readonly sections: SectionDefinition[] = [
    { key: 'esercizi', label: 'Esercizi' },
    { key: 'nuova', label: 'Schede' },
    { key: 'sessione', label: 'Sessione attiva' },
    { key: 'schede', label: 'Storico allenamenti' },
    { key: 'analisi', label: 'Analisi gruppi muscolari' }
  ];

  readonly activeSection = signal<SectionKey>(this.sections[0].key);
  readonly showExerciseModal = signal(false);

  selectSection(key: SectionKey): void {
    this.activeSection.set(key);
  }

  openExerciseModal(): void {
    this.showExerciseModal.set(true);
  }

  closeExerciseModal(): void {
    this.showExerciseModal.set(false);
  }

  handleExerciseSaved(): void {
    this.closeExerciseModal();
  }
}

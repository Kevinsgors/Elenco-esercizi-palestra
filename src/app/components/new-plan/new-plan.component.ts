import { Component, DestroyRef, OnInit, computed, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ExerciseService } from '../../services/exercise.service';
import { PlanService } from '../../services/plan.service';
import { Exercise } from '../../models/exercise';
import { WorkoutPlan, WorkoutPlanDay, WorkoutPlanExercise } from '../../models/plan';
import { FancySelectComponent, FancySelectOption } from '../shared/fancy-select/fancy-select.component';

interface PlanDraftExercise {
  exerciseId: number | null;
  customName: string;
  sets: number | null;
  reps: number | null;
  notes: string;
}

interface PlanDraftDay {
  id: string;
  title: string;
  emphasis: string;
  exercises: PlanDraftExercise[];
}

interface PlanDraft {
  name: string;
  focus: string;
  frequencyPerWeek: number | null;
  notes: string;
  days: PlanDraftDay[];
}

@Component({
  selector: 'app-new-plan',
  standalone: true,
  imports: [FormsModule, DatePipe, FancySelectComponent],
  templateUrl: './new-plan.component.html',
  styleUrls: ['./new-plan.component.css']
})
export class NewPlanComponent implements OnInit {
  private readonly focusOptions = ['Forza', 'Ipertrofia', 'Resistenza', 'Ricondizionamento', 'Personalizzato'];
  private readonly draftTemplate: PlanDraft = {
    name: '',
    focus: '',
    frequencyPerWeek: 3,
    notes: '',
    days: []
  };

  availableExercises: Exercise[] = [];
  exerciseSelectOptions: FancySelectOption<number>[] = [];
  readonly focusSelectOptions: FancySelectOption<string>[] = this.focusOptions.map(item => ({
    value: item,
    label: item
  }));
  draft = signal<PlanDraft>({ ...this.draftTemplate });
  feedback = signal<{ tone: 'success' | 'error'; message: string } | null>(null);

  viewMode = signal<'library' | 'create'>('library');
  expandedPlanId = signal<string | null>(null);
  readonly plans = computed(() => this.planService.plans());
  readonly isSaveDisabled = computed(() => {
    const plan = this.draft();
    if (!plan.name.trim()) {
      return true;
    }
    if (plan.days.length === 0) {
      return true;
    }
    const validDays = plan.days.filter(day =>
      day.exercises.some(ex => ex.exerciseId !== null && (ex.sets ?? 0) > 0 && (ex.reps ?? 0) > 0)
    );
    return validDays.length === 0;
  });

  constructor(
    private readonly exerciseService: ExerciseService,
    private readonly planService: PlanService,
    private readonly destroyRef: DestroyRef
  ) {}

  ngOnInit(): void {
    this.exerciseService.exercises$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(data => {
        this.availableExercises = data;
        this.exerciseSelectOptions = data.map(item => ({
          value: item.id,
          label: item.name
        }));
      });
  }

  showCreateView(): void {
    this.resetDraft();
    this.feedback.set(null);
    this.viewMode.set('create');
  }

  showLibraryView(): void {
    this.viewMode.set('library');
  }

  togglePlan(id: string): void {
    this.expandedPlanId.update(current => (current === id ? null : id));
  }

  addDay(): void {
    const current = this.draft();
    const nextIndex = current.days.length + 1;
    const nextDay: PlanDraftDay = {
      id: crypto.randomUUID?.() ?? `day-${Date.now()}-${Math.random()}`,
      title: `Giorno ${nextIndex}`,
      emphasis: '',
      exercises: []
    };
    this.draft.set({ ...current, days: [...current.days, nextDay] });
  }

  updateRoot<K extends keyof PlanDraft>(key: K, value: PlanDraft[K]): void {
    const current = this.draft();
    this.draft.set({ ...current, [key]: value });
  }

  removeDay(index: number): void {
    const current = this.draft();
    const updated = current.days.filter((_, idx) => idx !== index);
    this.draft.set({ ...current, days: updated });
  }

  addExercise(dayIndex: number): void {
    const current = this.draft();
    const updatedDays = current.days.map((day, idx) => {
      if (idx !== dayIndex) {
        return day;
      }
      const exercise: PlanDraftExercise = {
        exerciseId: null,
        customName: '',
        sets: null,
        reps: null,
        notes: ''
      };
      return { ...day, exercises: [...day.exercises, exercise] };
    });
    this.draft.set({ ...current, days: updatedDays });
  }

  removeExercise(dayIndex: number, exerciseIndex: number): void {
    const current = this.draft();
    const updatedDays = current.days.map((day, idx) => {
      if (idx !== dayIndex) {
        return day;
      }
      const exercises = day.exercises.filter((_, exIdx) => exIdx !== exerciseIndex);
      return { ...day, exercises };
    });
    this.draft.set({ ...current, days: updatedDays });
  }

  updateDay<K extends keyof PlanDraftDay>(index: number, key: K, value: PlanDraftDay[K]): void {
    const current = this.draft();
    const updatedDays = current.days.map((day, idx) => (idx === index ? { ...day, [key]: value } : day));
    this.draft.set({ ...current, days: updatedDays });
  }

  updateExercise(
    dayIndex: number,
    exerciseIndex: number,
    patch: Partial<PlanDraftExercise>
  ): void {
    const current = this.draft();
    const updatedDays = current.days.map((day, idx) => {
      if (idx !== dayIndex) {
        return day;
      }
      const exercises = day.exercises.map((exercise, exIdx) =>
        exIdx === exerciseIndex ? { ...exercise, ...patch } : exercise
      );
      return { ...day, exercises };
    });
    this.draft.set({ ...current, days: updatedDays });
  }

  savePlan(): void {
    const plan = this.draft();
    const cleanedDays: WorkoutPlanDay[] = plan.days
      .map(day => {
        const exercises: WorkoutPlanExercise[] = day.exercises
          .filter(ex => ex.exerciseId !== null && (ex.sets ?? 0) > 0 && (ex.reps ?? 0) > 0)
          .map(ex => ({
            exerciseId: ex.exerciseId!,
            name: this.resolveExerciseName(ex.exerciseId!, ex.customName),
            sets: ex.sets ?? 0,
            reps: ex.reps ?? 0,
            notes: this.cleanString(ex.notes)
          }));

        return {
          id: day.id,
          title: this.cleanString(day.title) || 'Sessione',
          emphasis: this.cleanString(day.emphasis) || 'Generale',
          exercises
        } satisfies WorkoutPlanDay;
      })
      .filter(day => day.exercises.length > 0);

    if (!plan.name.trim() || cleanedDays.length === 0) {
      this.feedback.set({ tone: 'error', message: 'Completa nome della scheda e almeno una sessione valida.' });
      return;
    }

    const payload: WorkoutPlan = {
      id: crypto.randomUUID?.() ?? `plan-${Date.now()}-${Math.random()}`,
      name: plan.name.trim(),
      focus: this.cleanString(plan.focus) || 'Personalizzato',
      frequencyPerWeek: plan.frequencyPerWeek ?? cleanedDays.length,
      notes: this.cleanString(plan.notes) || undefined,
      createdAt: new Date(),
      days: cleanedDays
    };

    this.planService.savePlan(payload);
    this.feedback.set({ tone: 'success', message: 'Scheda salvata nella libreria.' });
    if (typeof window !== 'undefined') {
      window.setTimeout(() => this.feedback.set(null), 3500);
    }
    this.resetDraft();
    this.showLibraryView();
    this.expandedPlanId.set(payload.id);
  }

  deletePlan(id: string): void {
    this.planService.deletePlan(id);
    if (this.expandedPlanId() === id) {
      this.expandedPlanId.set(null);
    }
  }

  trackByDay(_index: number, day: PlanDraftDay): string {
    return day.id;
  }

  trackByPlan(_index: number, plan: WorkoutPlan): string {
    return plan.id;
  }

  trackByExercise(index: number): number {
    return index;
  }

  private resetDraft(): void {
    this.draft.set({ ...this.draftTemplate, days: [] });
  }

  private resolveExerciseName(exerciseId: number, custom: string): string {
    if (custom && custom.trim()) {
      return custom.trim();
    }
    const found = this.availableExercises.find(item => item.id === exerciseId);
    return found ? found.name : 'Esercizio';
  }

  private cleanString(value: string | null | undefined): string {
    return value ? value.trim() : '';
  }

  parseCount(value: unknown): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) {
      return null;
    }
    return Math.floor(parsed);
  }

  parseFrequency(value: unknown): number | null {
    const parsed = this.parseCount(value);
    if (parsed === null || parsed === 0) {
      return null;
    }
    return parsed;
  }
}

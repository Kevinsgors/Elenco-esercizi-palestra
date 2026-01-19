import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  HostBinding,
  HostListener,
  Input,
  forwardRef
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface FancySelectOption<T = unknown> {
  value: T;
  label: string;
  disabled?: boolean;
}

interface FancySelectMenuItem<T> {
  value: T | null;
  label: string;
  disabled: boolean;
  isPlaceholder: boolean;
}

@Component({
  selector: 'app-fancy-select',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fancy-select.component.html',
  styleUrl: './fancy-select.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FancySelectComponent),
      multi: true
    }
  ]
})
export class FancySelectComponent<T = unknown> implements ControlValueAccessor {
  private static nextInstanceId = 0;

  @Input() placeholder = 'Seleziona';
  @Input() allowReset = true;
  @Input() emptyValue: T | null = null;
  @Input('aria-label') ariaLabel: string | null = null;
  @Input() set options(value: FancySelectOption<T>[] | null) {
    this.optionList = value?.map(item => ({ ...item })) ?? [];
  }

  get options(): FancySelectOption<T>[] {
    return this.optionList;
  }

  @HostBinding('attr.tabindex') hostTabIndex = -1;

  open = false;
  disabled = false;
  highlightedIndex: number | null = null;
  value: T | null = null;
  readonly instanceId = FancySelectComponent.nextInstanceId++;
  readonly panelId = `fancy-select-panel-${this.instanceId}`;
  readonly listboxId = `fancy-select-list-${this.instanceId}`;

  private optionList: FancySelectOption<T>[] = [];
  private onChange: (value: T | null) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private readonly host: ElementRef<HTMLElement>) {}

  writeValue(value: T | null): void {
    this.value = value ?? this.emptyValue ?? null;
  }

  registerOnChange(fn: (value: T | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  togglePanel(event: MouseEvent): void {
    event.stopPropagation();
    if (this.disabled) {
      return;
    }
    this.open ? this.closePanel() : this.openPanel();
  }

  selectIndex(index: number, event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    const item = this.composeMenuItems()[index];
    if (!item || item.disabled) {
      return;
    }
    this.value = item.value;
    this.onChange(this.value);
    this.closePanel();
  }

  clearSelection(event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    if (!this.allowReset || this.disabled) {
      return;
    }
    this.value = this.emptyValue ?? null;
    this.onChange(this.value);
    this.closePanel();
  }

  handleKeydown(event: KeyboardEvent): void {
    if (this.disabled) {
      return;
    }

    const key = event.key;
    if (key === 'ArrowDown') {
      event.preventDefault();
      if (!this.open) {
        this.openPanel();
      }
      this.moveHighlight(1);
      return;
    }

    if (key === 'ArrowUp') {
      event.preventDefault();
      if (!this.open) {
        this.openPanel();
      }
      this.moveHighlight(-1);
      return;
    }

    if (key === 'Enter' || key === ' ') {
      event.preventDefault();
      if (!this.open) {
        this.openPanel();
        return;
      }
      if (this.highlightedIndex !== null) {
        this.selectIndex(this.highlightedIndex);
      }
      return;
    }

    if (key === 'Escape' && this.open) {
      event.preventDefault();
      this.closePanel();
      return;
    }

    if (key === 'Tab' && this.open) {
      this.closePanel();
    }
  }

  onTriggerBlur(): void {
    this.onTouched();
  }

  get currentLabel(): string {
    const matched = this.optionList.find(option => this.areEqual(option.value, this.value));
    return matched ? matched.label : this.placeholder;
  }

  get triggerAriaLabel(): string | null {
    return this.ariaLabel ?? this.currentLabel;
  }

  isActive(index: number): boolean {
    return this.highlightedIndex === index;
  }

  isSelected(option: FancySelectOption<T>): boolean {
    return this.areEqual(option.value, this.value);
  }

  onItemHover(index: number): void {
    const items = this.composeMenuItems();
    if (items[index]?.disabled) {
      return;
    }
    this.highlightedIndex = index;
  }

  trackItem(_index: number, item: FancySelectMenuItem<T>): unknown {
    return item.isPlaceholder ? '__placeholder__' : item.value;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.open) {
      return;
    }
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.closePanel();
      this.onTouched();
    }
  }

  @HostListener('focus')
  onHostFocus(): void {
    const trigger = this.host.nativeElement.querySelector<HTMLButtonElement>('.fancy-select-trigger');
    trigger?.focus();
  }

  get viewItems(): FancySelectMenuItem<T>[] {
    return this.composeMenuItems();
  }

  private composeMenuItems(): FancySelectMenuItem<T>[] {
    const base = this.optionList.map(option => ({
      value: option.value,
      label: option.label,
      disabled: !!option.disabled,
      isPlaceholder: false
    } satisfies FancySelectMenuItem<T>));

    if (this.allowReset) {
      return [
        {
          value: this.emptyValue ?? null,
          label: this.placeholder,
          disabled: false,
          isPlaceholder: true
        },
        ...base
      ];
    }

    return base;
  }

  private openPanel(): void {
    if (this.disabled) {
      return;
    }
    this.open = true;
    const items = this.composeMenuItems();
    const index = items.findIndex(item => this.areEqual(item.value, this.value));
    if (index >= 0) {
      this.highlightedIndex = index;
    } else if (this.allowReset && items.length) {
      this.highlightedIndex = 0;
    } else {
      this.highlightedIndex = null;
    }
  }

  private closePanel(): void {
    this.open = false;
    this.highlightedIndex = null;
  }

  private moveHighlight(step: number): void {
    const items = this.composeMenuItems();
    if (!items.length) {
      this.highlightedIndex = null;
      return;
    }

    let index: number | null = this.highlightedIndex ?? (step > 0 ? -1 : items.length);
    let guard = 0;
    do {
      index = (index ?? (step > 0 ? -1 : items.length)) + step;
      if (index < 0) {
        index = items.length - 1;
      } else if (index >= items.length) {
        index = 0;
      }
      guard += 1;
      if (guard > items.length) {
        index = null;
        break;
      }
    } while (index !== null && items[index]?.disabled);

    this.highlightedIndex = index;
  }

  private areEqual(a: unknown, b: unknown): boolean {
    return a === b;
  }
}

import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Constituent } from '../../models/instrument.model';
import { AppStateService } from '../../services/app-state.service';

@Component({
  selector: 'app-instrument-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './instrument-item.component.html',
  styleUrls: ['./instrument-item.component.scss']
})
export class InstrumentItemComponent {
  @Input() constituent!: Constituent;
  @Output() instrumentSelected = new EventEmitter<Constituent>();

  private appState = inject(AppStateService);

  get isSelected(): boolean {
    const selected = this.appState.selectedInstrument();
    return selected?.code === this.constituent.codeInstrument;
  }

  onItemClick() {
    this.instrumentSelected.emit(this.constituent);
  }

  getPerformanceClass(performance: number): string {
    if (performance > 0) return 'positive';
    if (performance < 0) return 'negative';
    return 'neutral';
  }

  getTendencyIcon(tend: string): string {
    switch (tend) {
      case 'up': return 'pi pi-arrow-up';
      case 'down': return 'pi pi-arrow-down';
      default: return 'pi pi-minus';
    }
  }

  formatNumber(value: number): string {
    return value?.toLocaleString('es-CL', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    }) || '0.00';
  }

  formatPercentage(value: number): string {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value?.toFixed(2)}%` || '0.00%';
  }

  formatVolume(value: number): string {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value?.toLocaleString('es-CL') || '0';
  }
}

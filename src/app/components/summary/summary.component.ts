import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppStateService } from '../../services/app-state.service';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss']
})
export class SummaryComponent {
  private appState = inject(AppStateService);

  get selectedInstrument() {
    return this.appState.selectedInstrument();
  }

  get priceData() {
    return this.selectedInstrument?.price;
  }

  formatNumber(value: number | undefined): string {
    if (value === undefined || value === null) return 'N/A';
    return value.toLocaleString('es-CL', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  }

  formatPercentage(value: number | undefined): string {
    if (value === undefined || value === null) return 'N/A';
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  }

  formatVolume(value: number | undefined): string {
    if (value === undefined || value === null) return 'N/A';
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toLocaleString('es-CL');
  }

  getPerformanceClass(performance: number | undefined): string {
    if (performance === undefined || performance === null) return 'neutral';
    if (performance > 0) return 'positive';
    if (performance < 0) return 'negative';
    return 'neutral';
  }

  getTendencyIcon(tend: string | undefined): string {
    switch (tend) {
      case 'up': return 'pi pi-arrow-up';
      case 'down': return 'pi pi-arrow-down';
      default: return 'pi pi-minus';
    }
  }
}

import { Component, inject, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AppStateService } from '../../services/app-state.service';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  private appState = inject(AppStateService);
  private dataService = inject(DataService);
  private isBrowser: boolean;

  currentIndexData: any = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() { 
    if (this.isBrowser) {
      this.loadIndexData(); 
    }
  }

  get currentIndex() {
    return this.appState.currentIndex();
  }

  get selectedInstrument() {
    return this.appState.selectedInstrument();
  }

  private loadIndexData() {
    this.dataService.getInstrumentSummary(this.currentIndex).subscribe(
      response => {
        this.currentIndexData = response.data;
      }
    );
  }

  getPerformanceClass(performance: number): string {
    if (performance > 0) return 'positive';
    if (performance < 0) return 'negative';
    return 'neutral';
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
}

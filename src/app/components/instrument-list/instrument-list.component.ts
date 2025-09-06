import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppStateService } from '../../services/app-state.service';
import { DataService } from '../../services/data.service';
import { InstrumentItemComponent } from '../instrument-item/instrument-item.component';
import { Constituent } from '../../models/instrument.model';

@Component({
  selector: 'app-instrument-list',
  standalone: true,
  imports: [CommonModule, InstrumentItemComponent],
  templateUrl: './instrument-list.component.html',
  styleUrls: ['./instrument-list.component.scss']
})
export class InstrumentListComponent {
  private appState = inject(AppStateService);
  private dataService = inject(DataService);

  get filteredConstituents() {
    return this.appState.filteredConstituents();
  }

  get isLoading() {
    return this.filteredConstituents.length === 0;
  }

  onInstrumentSelected(constituent: Constituent) {
    this.appState.selectInstrumentByCode(constituent.codeInstrument);
    this.loadInstrumentDetails(constituent.codeInstrument);
  }

  private loadInstrumentDetails(instrumentCode: string) {
    this.dataService.getInstrumentSummary(instrumentCode).subscribe({
      next: (response) => {
        this.appState.updateSelectedInstrumentPrice(response.data.price);
      },
      error: (error) => {
      }
    });

    this.dataService.getInstrumentHistory(instrumentCode).subscribe({
      next: (response) => {
        this.appState.updateSelectedInstrumentHistory(response.data.chart);
      },
      error: (error) => {
      }
    });
  }

  trackByCode(index: number, constituent: Constituent): string {
    return constituent.codeInstrument;
  }
}

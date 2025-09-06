import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppStateService } from '../../services/app-state.service';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tab.component.html',
  styleUrls: ['./tab.component.scss']
})
export class TabComponent {
  private appState = inject(AppStateService);
  private dataService = inject(DataService);

  availableIndices = [
    { code: 'IPSA', name: 'IPSA' },
    { code: 'IGPA', name: 'IGPA' },
    { code: 'NASDAQ', name: 'NASDAQ' },
    { code: 'SP500', name: 'S&P 500' }
  ];

  get currentIndex() {
    return this.appState.currentIndex();
  }

  onTabChange(event: any) {
    const selectedIndex = this.availableIndices[event.index];
    this.appState.setCurrentIndex(selectedIndex.code);
    
    this.appState.setSelectedInstrument(null);
    this.appState.setSearchTerm('');
    
    if (selectedIndex.code === 'IPSA') {
      this.loadConstituents();
    } else {
      // Para otros índices, limpiar la lista o cargar datos específicos
      this.appState.setConstituents([]);
    }
  }

  private loadConstituents() {
    this.dataService.getConstituents().subscribe({
      next: (response) => {
        this.appState.setConstituents(response.data.constituents);
      },
      error: (error) => {
        this.appState.setConstituents([]);
      }
    });
  }

  get activeIndex(): number {
    return this.availableIndices.findIndex(index => index.code === this.currentIndex);
  }
}

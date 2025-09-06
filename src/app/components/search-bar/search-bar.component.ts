import { Component, inject, OnInit, DoCheck } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AppStateService } from '../../services/app-state.service';
import { Constituent } from '../../models/instrument.model';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent implements OnInit, DoCheck {
  private appState = inject(AppStateService);

  searchValue: string = '';

  get searchTerm() {
    return this.appState.searchTerm();
  }

  get searchResults(): Constituent[] {
    return this.appState.filteredConstituents();
  }

  clearSearch() {
    this.searchValue = '';
    this.appState.setSearchTerm('');
  }

  onSearchChange() {
    this.appState.setSearchTerm(this.searchValue);
  }

  onSearchSubmit() {
    // Si hay solo un resultado, seleccionarlo automáticamente
    const results = this.searchResults;
    if (results.length === 1) {
      this.appState.selectInstrumentByCode(results[0].codeInstrument);
    }
  }

  ngOnInit() { 
    this.searchValue = this.searchTerm; 
  }

  ngDoCheck() {
    if (this.searchValue !== this.searchTerm) {
      this.appState.setSearchTerm(this.searchValue);
    }
  }
}

import { Injectable, signal, computed } from '@angular/core';
import { 
  Constituent, 
  SelectedInstrument, 
  TimePeriod, 
  PriceData, 
  ChartData,
  InstrumentInfo
} from '../models/instrument.model';

@Injectable({
  providedIn: 'root'
})
export class AppStateService {
  private _selectedInstrument = signal<SelectedInstrument | null>(null);
  private _constituents = signal<Constituent[]>([]);
  private _currentPeriod = signal<TimePeriod>('1M');
  private _searchTerm = signal<string>('');
  private _currentIndex = signal<string>('IPSA');

  readonly selectedInstrument = computed(() => this._selectedInstrument());
  readonly constituents = computed(() => this._constituents());
  readonly currentPeriod = computed(() => this._currentPeriod());
  readonly searchTerm = computed(() => this._searchTerm());
  readonly currentIndex = computed(() => this._currentIndex());

  readonly filteredConstituents = computed(() => {
    const search = this._searchTerm().toLowerCase();
    if (!search) return this._constituents();
    
    return this._constituents().filter(constituent => 
      constituent.name.toLowerCase().includes(search) ||
      constituent.shortName.toLowerCase().includes(search) ||
      constituent.codeInstrument.toLowerCase().includes(search)
    );
  });

  setSelectedInstrument(instrument: SelectedInstrument | null) {
    this._selectedInstrument.set(instrument);
  }

  setConstituents(constituents: Constituent[]) {
    this._constituents.set(constituents);
  }

  setCurrentPeriod(period: TimePeriod) {
    this._currentPeriod.set(period);
  }

  setSearchTerm(term: string) {
    this._searchTerm.set(term);
  }

  setCurrentIndex(index: string) {
    this._currentIndex.set(index);
  }

  updateSelectedInstrumentPrice(price: PriceData) {
    const current = this._selectedInstrument();
    if (current) {
      this._selectedInstrument.set({
        ...current,
        price
      });
    }
  }

  updateSelectedInstrumentHistory(history: ChartData[]) {
    const current = this._selectedInstrument();
    if (current) {
      this._selectedInstrument.set({
        ...current,
        history
      });
    }
  }

  selectInstrumentByCode(code: string) {
    const constituent = this._constituents().find(c => c.codeInstrument === code);
    if (constituent) {
      this.setSelectedInstrument({
        code: constituent.codeInstrument,
        name: constituent.name
      });
    }
  }
}

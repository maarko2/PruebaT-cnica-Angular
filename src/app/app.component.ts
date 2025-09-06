import { Component, OnInit, inject, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { SearchBarComponent } from './components/search-bar/search-bar.component';
import { InstrumentListComponent } from './components/instrument-list/instrument-list.component';
import { SummaryComponent } from './components/summary/summary.component';
import { ChartComponent } from './components/chart/chart.component';
import { TabComponent } from './components/tab/tab.component';
import { DataService } from './services/data.service';
import { AppStateService } from './services/app-state.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    SearchBarComponent,
    InstrumentListComponent,
    SummaryComponent,
    ChartComponent,
    TabComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'dashboard-finanzas';
  
  private dataService = inject(DataService);
  private appState = inject(AppStateService);
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    if (this.isBrowser) {
      this.loadInitialData();
    }
  }

  private loadInitialData() {
    this.dataService.getConstituents().subscribe({
      next: (response) => {
        this.appState.setConstituents(response.data.constituents);
      },
      error: (error) => {
        this.loadMockData();
      }
    });
  }

  private loadMockData() {
    const mockConstituents = [
      { 
        codeInstrument: 'AGUAS-A', 
        name: 'Aguas Andinas A', 
        shortName: 'AGUAS-A', 
        pctDay: -1.85, 
        pct30D: 5.23, 
        pctCY: 12.45, 
        pct1Y: 8.76, 
        lastPrice: 347.50, 
        datetimeLastPrice: '2025-09-05T15:30:00', 
        volumeMoney: 1250000, 
        accumulatedVolumeMoney: 15600000, 
        tend: 'down' as const, 
        performanceAbsolute: -6.45, 
        performanceRelative: -1.85 
      },
      { 
        codeInstrument: 'ANDINA-B', 
        name: 'Compañía Cervecerías Unidas B', 
        shortName: 'ANDINA-B', 
        pctDay: 2.34, 
        pct30D: -3.12, 
        pctCY: 18.90, 
        pct1Y: 25.43, 
        lastPrice: 8950, 
        datetimeLastPrice: '2025-09-05T15:30:00', 
        volumeMoney: 2340000, 
        accumulatedVolumeMoney: 28900000, 
        tend: 'up' as const, 
        performanceAbsolute: 205, 
        performanceRelative: 2.34 
      },
      { 
        codeInstrument: 'BCI', 
        name: 'Banco de Crédito e Inversiones', 
        shortName: 'BCI', 
        pctDay: 0.89, 
        pct30D: 7.65, 
        pctCY: 22.10, 
        pct1Y: 35.67, 
        lastPrice: 28560, 
        datetimeLastPrice: '2025-09-05T15:30:00', 
        volumeMoney: 4560000, 
        accumulatedVolumeMoney: 67800000, 
        tend: 'up' as const, 
        performanceAbsolute: 252, 
        performanceRelative: 0.89 
      }
    ];
    this.appState.setConstituents(mockConstituents);
  }
}

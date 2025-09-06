import { Component, inject, OnInit, ViewChild, ElementRef, OnDestroy, PLATFORM_ID, Inject, effect } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { AppStateService } from '../../services/app-state.service';
import { DataService } from '../../services/data.service';
import { TimePeriod, ChartData } from '../../models/instrument.model';

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss']
})
export class ChartComponent implements OnInit, OnDestroy {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  private appState = inject(AppStateService);
  private dataService = inject(DataService);
  private chart: Chart | null = null;
  isBrowser: boolean;

  periods: TimePeriod[] = ['1M', '3M', '6M', '1A'];
  private currentChartData: ChartData[] = [];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    // Solo registrar Chart.js en el navegador
    if (this.isBrowser && typeof Chart !== 'undefined') {
      Chart.register(...registerables);
    }

    // Escuchar cambios en el instrumento seleccionado
    effect(() => {
      const selectedInstrument = this.selectedInstrument;
      if (this.isBrowser && selectedInstrument) {
        console.log('Selected instrument changed:', selectedInstrument);
        this.loadInstrumentData(selectedInstrument.code);
      } else if (this.isBrowser) {
        this.currentChartData = this.getSampleData();
        this.updateChart();
      }
    });

    // Escuchar cambios en el período
    effect(() => {
      const period = this.currentPeriod;
      if (this.isBrowser) {
        console.log('Period changed:', period);
        this.updateChart();
      }
    });
  }

  ngOnInit() {
    if (this.isBrowser) {
      this.currentChartData = this.getSampleData();
      
      // Usar setTimeout para asegurar que el canvas está disponible
      setTimeout(() => {
        this.initChart();
        
        // Si ya hay un instrumento seleccionado, cargar sus datos
        const selectedInstrument = this.selectedInstrument;
        if (selectedInstrument) {
          console.log('Loading data for already selected instrument:', selectedInstrument.code);
          this.loadInstrumentData(selectedInstrument.code);
        }
      }, 100);
    }
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  get selectedInstrument() {
    return this.appState.selectedInstrument();
  }

  get currentPeriod() {
    return this.appState.currentPeriod();
  }

  get chartData() {
    let rawData = this.currentChartData.length > 0 ? this.currentChartData : this.getSampleData();
    
    // Asegurar que tenemos datos
    if (!rawData || rawData.length === 0) {
      rawData = this.getSampleData();
    }
    
    const filteredData = this.filterDataByPeriod(rawData, this.currentPeriod);
    
    // Si el filtro devuelve pocos datos (menos de 5), usar más datos como fallback
    if (filteredData.length < 5) {
      // Intentar con un período más amplio
      const fallbackData = rawData.slice(-Math.min(30, rawData.length));
      return fallbackData.length > 0 ? fallbackData : this.getSampleData();
    }
    
    return filteredData;
  }

  private loadInstrumentData(instrumentCode: string) {
    if (!this.isBrowser) return;

    console.log('Loading data for instrument:', instrumentCode);

    this.dataService.getInstrumentHistory(instrumentCode).subscribe({
      next: (response) => {
        console.log('Received response:', response);
        if (response && response.success && response.data && response.data.chart && response.data.chart.length > 0) {
          this.currentChartData = response.data.chart;
          console.log('Chart data loaded:', this.currentChartData.length, 'points');
          this.updateChart();
        } else {
          console.warn('No valid chart data in response, using sample data');
          // Si no hay datos, usar datos de muestra basados en el instrumento
          this.currentChartData = this.getSampleDataForInstrument(instrumentCode);
          this.updateChart();
        }
      },
      error: (error) => {
        console.error('Error loading instrument history:', error);
        console.log('Falling back to sample data for:', instrumentCode);
        // En caso de error, usar datos de muestra
        this.currentChartData = this.getSampleDataForInstrument(instrumentCode);
        this.updateChart();
      }
    });
  }

  private getSampleDataForInstrument(instrumentCode: string): ChartData[] {
    // Crear datos de muestra específicos para cada instrumento
    const basePrices: { [key: string]: number } = {
      'AGUAS-A': 280,
      'ANDINA-B': 2800,
      'BCI': 28000,
      'BSANTANDER': 45000,
      'CAP': 6000
    };

    const basePrice = basePrices[instrumentCode] || 5000;
    const data: ChartData[] = [];
    const now = new Date();
    
    // Generar una semilla basada en el código del instrumento para datos consistentes
    let seed = 0;
    for (let i = 0; i < instrumentCode.length; i++) {
      seed += instrumentCode.charCodeAt(i);
    }
    
    for (let i = 365; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      
      // Usar la semilla para generar cambios más consistentes por instrumento
      const randomFactor = (Math.sin(seed + i * 0.1) + Math.cos(seed * 0.7 + i * 0.15)) / 2;
      const trendFactor = Math.sin(i * 0.2) * 0.3;
      const volatility = basePrice * 0.02; // 2% de volatilidad
      
      const price = basePrice + (randomFactor * volatility) + (trendFactor * volatility);
      const openPrice = price + (Math.sin(seed + i * 0.3) * volatility * 0.5);
      const highPrice = Math.max(price, openPrice) + Math.abs(Math.cos(seed + i * 0.2)) * volatility * 0.3;
      const lowPrice = Math.min(price, openPrice) - Math.abs(Math.sin(seed + i * 0.4)) * volatility * 0.3;
      
      const change = price - basePrice;
      
      data.push({
        datetimeLastPrice: date.toISOString(),
        datetimeLastPriceTs: date.getTime(),
        lastPrice: Math.round(price * 100) / 100,
        openPrice: Math.round(openPrice * 100) / 100,
        closePrice: Math.round(price * 100) / 100,
        highPrice: Math.round(highPrice * 100) / 100,
        lowPrice: Math.round(lowPrice * 100) / 100,
        volume: Math.floor(Math.abs(Math.sin(seed + i)) * 1000000) + 100000,
        volumeMoney: Math.floor(Math.abs(Math.cos(seed + i)) * 50000000) + 1000000,
        performanceRelative: (change / basePrice) * 100,
        performanceAbsolute: change,
        tend: change > 0 ? 'up' : change < 0 ? 'down' : 'same'
      });
    }
    
    return data;
  }

  private getSampleData(): ChartData[] {
    const basePrice = 5000;
    const data: ChartData[] = [];
    const now = new Date();
    
    for (let i = 365; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const randomChange = (Math.random() - 0.5) * 200;
      const price = basePrice + randomChange + (Math.sin(i * 0.2) * 300);
      const openPrice = price + (Math.random() - 0.5) * 50;
      const highPrice = Math.max(price, openPrice) + Math.random() * 30;
      const lowPrice = Math.min(price, openPrice) - Math.random() * 30;
      
      data.push({
        datetimeLastPrice: date.toISOString(),
        datetimeLastPriceTs: date.getTime(),
        lastPrice: Math.round(price * 100) / 100,
        openPrice: Math.round(openPrice * 100) / 100,
        closePrice: Math.round(price * 100) / 100,
        highPrice: Math.round(highPrice * 100) / 100,
        lowPrice: Math.round(lowPrice * 100) / 100,
        volume: Math.floor(Math.random() * 1000000) + 100000,
        volumeMoney: Math.floor(Math.random() * 50000000) + 1000000,
        performanceRelative: (Math.random() - 0.5) * 10,
        performanceAbsolute: randomChange,
        tend: randomChange > 0 ? 'up' : randomChange < 0 ? 'down' : 'same'
      });
    }
    
    return data;
  }

  onPeriodChange(period: TimePeriod) {
    console.log('Period changed to:', period);
    this.appState.setCurrentPeriod(period);
    // No necesitamos llamar updateChart aquí porque el effect se encargará
  }

  private initChart() {
    if (!this.isBrowser || !this.chartCanvas?.nativeElement) {
      console.log('Cannot initialize chart: browser check or canvas not available');
      return;
    }

    if (this.chart) {
      this.chart.destroy();
    }

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) {
      console.error('Could not get 2D context from canvas');
      return;
    }

    console.log('Creating new chart instance');

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Precio',
          data: [],
          borderColor: '#3498db',
          backgroundColor: 'rgba(52, 152, 219, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 1,
          pointHoverRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 0 // Desactivar animaciones para mejor rendimiento
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Fecha'
            },
            grid: {
              display: true,
              color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
              maxTicksLimit: 8, // Limitar el número de ticks
              maxRotation: 45, // Rotar las etiquetas si es necesario
              minRotation: 0
            }
          },
          y: {
            display: true,
            title: {
              display: true,
              text: 'Precio'
            },
            beginAtZero: false,
            grid: {
              display: true,
              color: 'rgba(255, 255, 255, 0.1)'
            }
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: (context) => {
                const value = context.parsed.y;
                return `Precio: ${value.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
              }
            }
          }
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        }
      }
    });

    console.log('Chart initialized successfully');
    this.updateChart();
  }

  private updateChart() {
    if (!this.isBrowser || !this.chart) {
      console.log('Chart not ready for update, browser:', this.isBrowser, 'chart:', !!this.chart);
      return;
    }

    const data = this.chartData;
    
    // Validar que tenemos datos antes de actualizar
    if (!data || data.length === 0) {
      console.warn('No data available for chart update');
      return;
    }
    
    console.log('Updating chart with', data.length, 'data points');
    
    // Reducir la cantidad de etiquetas para evitar amontonamiento
    const maxLabels = 15; // Máximo de etiquetas a mostrar
    const step = Math.ceil(data.length / maxLabels);
    
    const labels = data.map((item, index) => {
      // Solo mostrar etiquetas en intervalos para evitar amontonamiento
      if (index % step === 0 || index === data.length - 1) {
        return this.formatDate(item.datetimeLastPrice);
      }
      return '';
    });
    
    const prices = data.map(item => item.lastPrice);

    this.chart.data.labels = labels;
    this.chart.data.datasets[0].data = prices;
    this.chart.data.datasets[0].label = this.selectedInstrument?.name || 'Precio';

    // Determinar el color basado en la tendencia
    const firstPrice = prices[0];
    const lastPrice = prices[prices.length - 1];
    const isPositive = lastPrice >= firstPrice;
    
    this.chart.data.datasets[0].borderColor = isPositive ? '#27ae60' : '#e74c3c';
    this.chart.data.datasets[0].backgroundColor = isPositive ? 'rgba(39, 174, 96, 0.1)' : 'rgba(231, 76, 60, 0.1)';

    this.chart.update('none');
  }

  private filterDataByPeriod(data: ChartData[], period: TimePeriod): ChartData[] {
    if (!data || data.length === 0) return [];

    // Encontrar la fecha más reciente en los datos para usarla como punto de referencia
    let mostRecentDate: Date = new Date(0);
    
    data.forEach(item => {
      try {
        let itemDate: Date;
        
        if (item.datetimeLastPrice.includes('-') && item.datetimeLastPrice.includes(' ')) {
          // Formato: "06-11-2023 09:00:00" (DD-MM-YYYY)
          const [datePart] = item.datetimeLastPrice.split(' ');
          const [day, month, year] = datePart.split('-');
          itemDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        } else {
          // Fallback para otros formatos
          itemDate = new Date(item.datetimeLastPrice);
        }
        
        if (itemDate > mostRecentDate) {
          mostRecentDate = itemDate;
        }
      } catch (error) {
        // Ignorar fechas inválidas
      }
    });

    // Si no encontramos una fecha válida, usar la fecha actual como fallback
    if (mostRecentDate.getTime() === 0) {
      mostRecentDate = new Date();
    }

    let startDate: Date;

    switch (period) {
      case '1M':
        startDate = new Date(mostRecentDate.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '3M':
        startDate = new Date(mostRecentDate.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '6M':
        startDate = new Date(mostRecentDate.getTime() - 180 * 24 * 60 * 60 * 1000);
        break;
      case '1A':
        startDate = new Date(mostRecentDate.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        return data;
    }

    const filteredData = data.filter(item => {
      try {
        let itemDate: Date;
        
        if (item.datetimeLastPrice.includes('-') && item.datetimeLastPrice.includes(' ')) {
          // Formato: "06-11-2023 09:00:00" (DD-MM-YYYY)
          const [datePart] = item.datetimeLastPrice.split(' ');
          const [day, month, year] = datePart.split('-');
          itemDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        } else {
          // Fallback para otros formatos
          itemDate = new Date(item.datetimeLastPrice);
        }
        
        return itemDate >= startDate && itemDate <= mostRecentDate;
      } catch (error) {
        console.warn('Error parsing date for filtering:', item.datetimeLastPrice, error);
        return false;
      }
    }).sort((a, b) => {
      // Ordenar por fecha ascendente
      try {
        let dateA: Date, dateB: Date;
        
        // Parsear fecha A
        if (a.datetimeLastPrice.includes('-') && a.datetimeLastPrice.includes(' ')) {
          const [datePart] = a.datetimeLastPrice.split(' ');
          const [day, month, year] = datePart.split('-');
          dateA = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        } else {
          dateA = new Date(a.datetimeLastPrice);
        }
        
        // Parsear fecha B
        if (b.datetimeLastPrice.includes('-') && b.datetimeLastPrice.includes(' ')) {
          const [datePart] = b.datetimeLastPrice.split(' ');
          const [day, month, year] = datePart.split('-');
          dateB = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        } else {
          dateB = new Date(b.datetimeLastPrice);
        }
        
        return dateA.getTime() - dateB.getTime();
      } catch (error) {
        return 0;
      }
    });

    console.log(`Filtered data for period ${period}:`, filteredData.length, 'items from', startDate.toLocaleDateString(), 'to', mostRecentDate.toLocaleDateString());
    console.log('Date range in filtered data:', 
      filteredData.length > 0 ? filteredData[0].datetimeLastPrice : 'N/A', 
      'to', 
      filteredData.length > 0 ? filteredData[filteredData.length - 1].datetimeLastPrice : 'N/A'
    );
    
    return filteredData;
  }

  private formatDate(dateString: string): string {
    try {
      // El formato viene como "06-11-2023 09:00:00" (DD-MM-YYYY HH:mm:ss)
      let date: Date;
      
      if (dateString.includes('-') && dateString.includes(' ')) {
        // Formato: "06-11-2023 09:00:00"
        const [datePart] = dateString.split(' ');
        const [day, month, year] = datePart.split('-');
        date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else {
        // Fallback para otros formatos
        date = new Date(dateString);
      }
      
      // Verificar que la fecha es válida
      if (isNaN(date.getTime())) {
        console.warn('Invalid date:', dateString);
        return dateString;
      }
      
      return date.toLocaleDateString('es-CL', { 
        month: 'short', 
        day: 'numeric',
        year: this.currentPeriod === '1A' ? 'numeric' : undefined
      });
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return dateString;
    }
  }

  getMaxPrice(): string {
    if (this.chartData.length === 0) return 'N/A';
    const max = Math.max(...this.chartData.map(d => d.lastPrice));
    return max.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  getMinPrice(): string {
    if (this.chartData.length === 0) return 'N/A';
    const min = Math.min(...this.chartData.map(d => d.lastPrice));
    return min.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  getPriceRange(): string {
    if (this.chartData.length === 0) return 'N/A';
    const max = Math.max(...this.chartData.map(d => d.lastPrice));
    const min = Math.min(...this.chartData.map(d => d.lastPrice));
    const range = max - min;
    return range.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}

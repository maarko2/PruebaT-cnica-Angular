export interface InstrumentInfo {
  name: string;
  shortName: string;
  countryName: string;
  codeInstrument: string;
  currencyName?: string;
  currencySymbol?: string;
  marketName?: string;
  hourOpen?: string;
  hourClose?: string;
  trading?: boolean;
  exchangeRate?: number;
}

export interface Constituent {
  codeInstrument: string;
  name: string;
  shortName: string;
  pctDay: number;
  pct30D: number;
  pctCY: number;
  pct1Y: number;
  lastPrice: number;
  datetimeLastPrice: string;
  volumeMoney: number;
  accumulatedVolumeMoney: number;
  tend: 'up' | 'down' | 'same';
  performanceAbsolute: number;
  performanceRelative: number;
}

export interface PriceData {
  lastPrice: number;
  datetimeLastPrice: string;
  openPrice: number;
  closePrice: number;
  datetimeClosePrice: string;
  performanceAbsolute: number;
  performanceRelative: number;
  bid: number;
  bidVolume: number;
  bidDatetime: string;
  ask: number;
  askVolume: number;
  askDatetime: string;
  highPrice: number;
  lowPrice: number;
  volume: number;
  volumeMoney: number;
  tend: 'up' | 'down' | 'same';
}

export interface ChartData {
  datetimeLastPrice: string;
  datetimeLastPriceTs: number;
  lastPrice: number;
  highPrice: number;
  lowPrice: number;
  openPrice: number;
  closePrice: number;
  volume: number;
  volumeMoney: number;
  performanceRelative: number;
  performanceAbsolute: number;
  tend: 'up' | 'down' | 'same';
}

export interface InstrumentResponse {
  success: boolean;
  code: number;
  data: {
    info: InstrumentInfo;
    constituents: Constituent[];
  };
}

export interface SummaryResponse {
  success: boolean;
  code: number;
  data: {
    info: InstrumentInfo;
    price: PriceData;
  };
}

export interface HistoryResponse {
  success: boolean;
  code: number;
  data: {
    info: InstrumentInfo;
    chart: ChartData[];
  };
}

export type TimePeriod = '1M' | '3M' | '6M' | '1A';

export interface SelectedInstrument {
  code: string;
  name: string;
  price?: PriceData;
  history?: ChartData[];
}

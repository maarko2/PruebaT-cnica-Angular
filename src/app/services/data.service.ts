import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  InstrumentResponse, 
  SummaryResponse, 
  HistoryResponse 
} from '../models/instrument.model';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private http: HttpClient) { }

  getConstituents(): Observable<InstrumentResponse> {
    return this.http.get<InstrumentResponse>('/assets/files/constituyentes/constituensList.json');
  }

  getInstrumentSummary(instrumentCode: string): Observable<SummaryResponse> {
    return this.http.get<SummaryResponse>(`/assets/files/resumen/${instrumentCode}.json`);
  }

  getInstrumentHistory(instrumentCode: string): Observable<HistoryResponse> {
    return this.http.get<HistoryResponse>(`/assets/files/history/history-${instrumentCode}.json`);
  }

  getAvailableInstruments(): string[] {
    return ['AGUAS-A', 'ANDINA-B', 'BCI', 'BSANTANDER', 'CAP', 'IPSA'];
  }
}

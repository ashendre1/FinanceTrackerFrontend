import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private baseUrl = 'http://localhost:5209/api/transactions';

  constructor(private http: HttpClient) {}

//   getAll(username: string): Observable<Transaction[]> {
//     return this.http.get<Transaction[]>(`${this.baseUrl}/getall/${username}`);
//   }

  getCategorySummary(username: string): Observable<{ [category: string]: number }> {
    return this.http.get<{ [category: string]: number }>(`${this.baseUrl}/getall/${username}`);
  }
}
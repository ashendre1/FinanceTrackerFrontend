import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, AuthResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:5209/api/auth'; // Update with your backend URL

  constructor(private http: HttpClient) { }

  signup(user: User): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/signup`, user);
  }

  login(user: User): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, user);
  }
}

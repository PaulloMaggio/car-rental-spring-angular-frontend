import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/auth';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  login(credentials: { login: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response.token && isPlatformBrowser(this.platformId)) {
          localStorage.setItem('token', response.token);
          if (response.role) {
            localStorage.setItem('role', response.role);
          }
        }
      })
    );
  }

  register(userData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, userData);
  }
}
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { LibraryService } from './library.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = '/api/auth';

  constructor(private libraryService: LibraryService) {}

  login(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, data);
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  verify(code: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/verify/${code}`);
  }

  refreshToken(): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/refresh`,
      {},
      {
        withCredentials: true,
      },
    );
  }

  // logout(): void {
  //   this.libraryService.logout();
  // }
}

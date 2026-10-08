import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

interface AuthResponse {
  token: string;
  role: string;
  userId?: string;
  driverId?: string;
  email?: string;
  name?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private tokenKey = 'auth_token';
  private userRoleKey = 'user_role';
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  private userRoleSubject = new BehaviorSubject<string>(this.getUserRole());
  
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  userRole$ = this.userRoleSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  register(userData: any): Observable<AuthResponse> {
    // Using the correct endpoint that matches the backend routes
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData)
      .pipe(
        tap(response => this.handleAuthResponse(response))
      );
  }

  login(email: string, password: string): Observable<AuthResponse> {
    // Using the correct endpoint that matches the backend routes
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap(response => this.handleAuthResponse(response))
      );
  }

  logout(): void {
    // Clear every piece of session data so the next user starts clean
    [this.tokenKey, this.userRoleKey, 'user_id', 'driver_id', 'user_name'].forEach(key =>
      localStorage.removeItem(key)
    );
    this.userId = '';
    this.driverId = '';
    this.userName = '';
    this.isAuthenticatedSubject.next(false);
    this.userRoleSubject.next('');
    this.router.navigate(['/']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getUserRole(): string {
    return localStorage.getItem(this.userRoleKey) || '';
  }

  isAuthenticated(): boolean {
    return this.hasToken();
  }

  isDriver(): boolean {
    return this.getUserRole() === 'driver';
  }

  private userId: string = '';
  private driverId: string = '';
  private userName: string = '';
  
  getUserId(): string {
    return this.userId || localStorage.getItem('user_id') || '';
  }
  
  getDriverId(): string {
    return this.driverId || localStorage.getItem('driver_id') || '';
  }

  getUserName(): string {
    return this.userName || localStorage.getItem('user_name') || '';
  }

  private hasToken(): boolean {
    return !!this.getToken();
  }

  private handleAuthResponse(response: AuthResponse): void {
    if (response && response.token) {
      localStorage.setItem(this.tokenKey, response.token);
      localStorage.setItem(this.userRoleKey, response.role);
      
      // Store user info
      if (response.userId) {
        localStorage.setItem('user_id', response.userId);
        this.userId = response.userId;
      }
      
      if (response.driverId) {
        localStorage.setItem('driver_id', response.driverId);
        this.driverId = response.driverId;
      }
      
      if (response.name || response.email) {
        localStorage.setItem('user_name', response.name || response.email || '');
        this.userName = response.name || response.email || '';
      }
      
      this.isAuthenticatedSubject.next(true);
      this.userRoleSubject.next(response.role);
      
      // Redirect based on role
      this.router.navigate(['/home']);
    }
  }
}
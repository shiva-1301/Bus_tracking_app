// app/login/login.ts
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, HttpClientModule, CommonModule],
  template: `
    <div class="flex flex-col items-center justify-center p-10 bg-white rounded-2xl shadow-xl max-w-lg mx-auto w-full">
      <h2 class="text-3xl font-bold text-indigo-600 mb-6">Login to RouteFinder</h2>

      <div *ngIf="errorMessage" class="w-full p-3 mb-4 bg-red-100 text-red-700 rounded-xl">
        {{ errorMessage }}
      </div>

      <input 
        [(ngModel)]="email" 
        name="email" 
        type="email"
        placeholder="Email Address"
        class="w-full mb-4 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400" 
      />
      
      <input 
        [(ngModel)]="password" 
        name="password"
        type="password"
        placeholder="Password"
        class="w-full mb-6 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400" 
      />

      <button 
        (click)="login()"
        [disabled]="isLoading"
        class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-full transition transform hover:scale-[1.02] disabled:opacity-50">
        {{ isLoading ? 'Logging in...' : 'Log In' }}
      </button>

      <p class="mt-4 text-sm text-gray-500">
        Don't have an account? 
        <a [routerLink]="['/register']" class="text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer">Register here</a>
      </p>
    </div>
  `,
  styles: ``
})
export class LoginComponent {
  email = '';
  password = '';
  isLoading = false;
  errorMessage = '';

  constructor(private authService: AuthService) {}

  login() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter both email and password';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.email, this.password)
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          console.log('Login successful', response);
          // AuthService will handle the redirect to /home
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Login error', error);
          if (error.status === 0) {
            this.errorMessage = 'Cannot connect to server. Please ensure the backend is running.';
          } else {
            this.errorMessage = error.error?.message || 'Login failed. Please check your credentials.';
          }
        }
      });
  }
}
// app/register/register.ts
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, HttpClientModule, CommonModule],
  template: `
    <div class="flex flex-col items-center justify-center p-10 bg-white rounded-2xl shadow-xl max-w-lg mx-auto w-full">
      <h2 class="text-3xl font-bold text-green-600 mb-6">Create New Account</h2>

      <div *ngIf="errorMessage" class="w-full p-3 mb-4 bg-red-100 text-red-700 rounded-xl">
        {{ errorMessage }}
      </div>

      <input 
        [(ngModel)]="email" 
        name="email" 
        type="email"
        placeholder="Email Address"
        class="w-full mb-4 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400" 
      />
      
      <input 
        [(ngModel)]="password" 
        name="password"
        type="password"
        placeholder="Password"
        class="w-full mb-4 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400" 
      />

      <div class="w-full mb-4">
        <label class="flex items-center space-x-2 cursor-pointer">
          <input 
            type="checkbox" 
            [(ngModel)]="isDriver" 
            name="isDriver"
            class="form-checkbox h-5 w-5 text-green-600 rounded focus:ring-green-400"
          />
          <span class="text-gray-700">Register as Driver</span>
        </label>
      </div>

      <input 
        *ngIf="isDriver"
        [(ngModel)]="driverId" 
        name="driverId" 
        placeholder="Driver ID"
        class="w-full mb-4 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400" 
      />

      <!-- Bus number will be entered when starting a trip -->

      <button 
        (click)="register()"
        [disabled]="isLoading"
        class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full transition transform hover:scale-[1.02] disabled:opacity-50">
        {{ isLoading ? 'Registering...' : 'Register' }}
      </button>

      <p class="mt-4 text-sm text-gray-500">
        Already have an account? 
        <a [routerLink]="['/login']" class="text-green-600 hover:text-green-800 font-medium cursor-pointer">Log in here</a>
      </p>
    </div>
  `,
  styles: ``
})
export class RegisterComponent {
  email = '';
  password = '';
  isDriver = false;
  driverId = '';
  isLoading = false;
  errorMessage = '';

  constructor(private authService: AuthService) {}

  register() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter both email and password';
      return;
    }

    if (this.isDriver && !this.driverId) {
      this.errorMessage = 'Driver ID is required for driver registration';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const userData: any = {
      email: this.email,
      password: this.password,
      role: this.isDriver ? 'driver' : 'user'
    };

    if (this.isDriver) {
      userData.driverId = this.driverId;
    }

    this.authService.register(userData)
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          console.log('Registration successful', response);
          // AuthService will handle the redirect to /home
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Registration error', error);
          if (error.status === 0) {
            this.errorMessage = 'Cannot connect to server. Please ensure the backend is running.';
          } else {
            this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
          }
        }
      });
  }
}
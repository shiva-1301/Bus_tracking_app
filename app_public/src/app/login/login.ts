import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  template: `
    <section class="page flex justify-center">
      <div class="w-full max-w-md">
        <div class="mb-8 text-center">
          <h1 class="page-title">Welcome back</h1>
          <p class="mt-2 text-slate-600">Log in to find and track your bus.</p>
        </div>

        <form class="card space-y-5" (ngSubmit)="login()" novalidate>
          <div *ngIf="errorMessage" class="alert-error" role="alert">{{ errorMessage }}</div>

          <div>
            <label for="login-email" class="form-label">Email address</label>
            <input id="login-email" name="email" type="email" autocomplete="email" required
                   [(ngModel)]="email" class="form-input" placeholder="you@college.edu" />
          </div>

          <div>
            <div class="flex items-center justify-between">
              <label for="login-password" class="form-label">Password</label>
              <button type="button" class="mb-1.5 text-xs font-medium text-brand-700 hover:underline"
                      (click)="showPassword = !showPassword" [attr.aria-pressed]="showPassword">
                {{ showPassword ? 'Hide' : 'Show' }}
              </button>
            </div>
            <input id="login-password" name="password" [type]="showPassword ? 'text' : 'password'"
                   autocomplete="current-password" required [(ngModel)]="password" class="form-input" />
          </div>

          <button type="submit" [disabled]="isLoading" class="btn-primary btn-lg w-full">
            <span *ngIf="isLoading" class="spinner h-4 w-4" aria-hidden="true"></span>
            {{ isLoading ? 'Logging in…' : 'Log in' }}
          </button>

          <p class="text-center text-sm text-slate-600">
            Don't have an account?
            <a routerLink="/register" class="font-semibold text-brand-700 hover:underline">Create one</a>
          </p>
        </form>
      </div>
    </section>
  `,
})
export class LoginComponent {
  email = '';
  password = '';
  showPassword = false;
  isLoading = false;
  errorMessage = '';

  constructor(private authService: AuthService) {}

  login() {
    const email = this.email.trim();
    if (!email || !this.password) {
      this.errorMessage = 'Please enter both email and password.';
      return;
    }
    if (!EMAIL_PATTERN.test(email)) {
      this.errorMessage = 'Please enter a valid email address.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(email, this.password).subscribe({
      next: () => {
        this.isLoading = false;
        // AuthService handles the redirect to /home
      },
      error: (error) => {
        this.isLoading = false;
        if (error.status === 0) {
          this.errorMessage = "Can't reach the server. Please make sure the backend is running.";
        } else {
          this.errorMessage = error.error?.message || 'Login failed. Please check your credentials.';
        }
      },
    });
  }
}

import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  template: `
    <section class="page flex justify-center">
      <div class="w-full max-w-md">
        <div class="mb-8 text-center">
          <h1 class="page-title">Create your account</h1>
          <p class="mt-2 text-slate-600">Passengers and drivers both start here.</p>
        </div>

        <form class="card space-y-5" (ngSubmit)="register()" novalidate>
          <div *ngIf="errorMessage" class="alert-error" role="alert">{{ errorMessage }}</div>

          <!-- Account type -->
          <fieldset>
            <legend class="form-label">I am a…</legend>
            <div class="grid grid-cols-2 gap-3">
              <label class="flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition"
                     [ngClass]="!isDriver ? 'border-brand-500 bg-brand-50 text-brand-800 ring-2 ring-brand-100' : 'border-slate-300 hover:border-slate-400'">
                <input type="radio" name="role" [value]="false" [(ngModel)]="isDriver" class="accent-brand-600" /> Passenger
              </label>
              <label class="flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition"
                     [ngClass]="isDriver ? 'border-brand-500 bg-brand-50 text-brand-800 ring-2 ring-brand-100' : 'border-slate-300 hover:border-slate-400'">
                <input type="radio" name="role" [value]="true" [(ngModel)]="isDriver" class="accent-brand-600" /> Driver
              </label>
            </div>
          </fieldset>

          <div>
            <label for="reg-email" class="form-label">Email address</label>
            <input id="reg-email" name="email" type="email" autocomplete="email" required
                   [(ngModel)]="email" class="form-input" placeholder="you@college.edu" />
          </div>

          <div>
            <div class="flex items-center justify-between">
              <label for="reg-password" class="form-label">Password</label>
              <button type="button" class="mb-1.5 text-xs font-medium text-brand-700 hover:underline"
                      (click)="showPassword = !showPassword" [attr.aria-pressed]="showPassword">
                {{ showPassword ? 'Hide' : 'Show' }}
              </button>
            </div>
            <input id="reg-password" name="password" [type]="showPassword ? 'text' : 'password'"
                   autocomplete="new-password" required [(ngModel)]="password" class="form-input"
                   aria-describedby="reg-password-hint" />
            <p id="reg-password-hint" class="form-hint">At least {{ minPasswordLength }} characters.</p>
          </div>

          <div *ngIf="isDriver">
            <label for="reg-driver-id" class="form-label">Driver ID</label>
            <input id="reg-driver-id" name="driverId" required [(ngModel)]="driverId" class="form-input"
                   placeholder="e.g. DRV-1024" aria-describedby="reg-driver-hint" />
            <p id="reg-driver-hint" class="form-hint">You'll enter your bus number when you start a trip.</p>
          </div>

          <button type="submit" [disabled]="isLoading" class="btn-primary btn-lg w-full">
            <span *ngIf="isLoading" class="spinner h-4 w-4" aria-hidden="true"></span>
            {{ isLoading ? 'Creating account…' : 'Create account' }}
          </button>

          <p class="text-center text-sm text-slate-600">
            Already have an account?
            <a routerLink="/login" class="font-semibold text-brand-700 hover:underline">Log in</a>
          </p>
        </form>
      </div>
    </section>
  `,
})
export class RegisterComponent {
  email = '';
  password = '';
  isDriver = false;
  driverId = '';
  showPassword = false;
  isLoading = false;
  errorMessage = '';
  readonly minPasswordLength = MIN_PASSWORD_LENGTH;

  constructor(private authService: AuthService) {}

  register() {
    const email = this.email.trim();
    const driverId = this.driverId.trim();

    if (!email || !this.password) {
      this.errorMessage = 'Please enter both email and password.';
      return;
    }
    if (!EMAIL_PATTERN.test(email)) {
      this.errorMessage = 'Please enter a valid email address.';
      return;
    }
    if (this.password.length < MIN_PASSWORD_LENGTH) {
      this.errorMessage = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
      return;
    }
    if (this.isDriver && !driverId) {
      this.errorMessage = 'Driver ID is required for driver registration.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const userData: { email: string; password: string; role: string; driverId?: string } = {
      email,
      password: this.password,
      role: this.isDriver ? 'driver' : 'user',
    };
    if (this.isDriver) {
      userData.driverId = driverId;
    }

    this.authService.register(userData).subscribe({
      next: () => {
        this.isLoading = false;
        // AuthService handles the redirect to /home
      },
      error: (error) => {
        this.isLoading = false;
        if (error.status === 0) {
          this.errorMessage = "Can't reach the server. Please make sure the backend is running.";
        } else {
          this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
        }
      },
    });
  }
}

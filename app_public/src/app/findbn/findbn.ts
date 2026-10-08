import { Component, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { DriverService, Driver } from '../services/driver.service';
import { staticMapUrl, mapsLink, hasPosition } from '../shared/maps';

@Component({
  selector: 'app-find-by-number',
  standalone: true,
  imports: [FormsModule, DatePipe, DecimalPipe],
  template: `
    <section class="page">
      <header class="page-header">
        <h1 class="page-title">Find by bus number</h1>
        <p class="page-subtitle">Enter a bus number to see its live drivers and where they are right now.</p>
      </header>

      <form class="card mb-8" (ngSubmit)="showInfo()" novalidate>
        <div class="flex flex-col gap-3 sm:flex-row sm:items-start">
          <div class="flex-1">
            <label for="busNumber" class="form-label">Bus number</label>
            <input
              id="busNumber"
              name="busNumber"
              type="text"
              inputmode="text"
              autocomplete="off"
              [(ngModel)]="busNumber"
              (ngModelChange)="submitted = false"
              placeholder="e.g. 12A"
              class="form-input"
              [class.border-red-400]="submitted && !busNumber.trim()"
              [attr.aria-invalid]="submitted && !busNumber.trim()"
              aria-describedby="busNumberHelp"
            />
            @if (submitted && !busNumber.trim()) {
              <p id="busNumberHelp" class="form-error">Please enter a bus number.</p>
            } @else {
              <p id="busNumberHelp" class="form-hint">The number shown on the front of the bus.</p>
            }
          </div>
          <button type="submit" class="btn-primary w-full sm:mt-7 sm:w-auto" [disabled]="loading">
            @if (loading) {
              <span class="spinner h-4 w-4" aria-hidden="true"></span>
              Searching…
            } @else {
              Search
            }
          </button>
        </div>
      </form>

      <div aria-live="polite">
        @if (loading) {
          <div class="flex items-center justify-center gap-3 py-12 text-slate-500">
            <span class="spinner text-brand-600" aria-hidden="true"></span>
            <span>Looking for live drivers…</span>
          </div>
        } @else if (error) {
          <div class="alert-error" role="alert">
            <svg class="mt-0.5 h-5 w-5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            </svg>
            <div class="flex-1">
              <p>{{ error }}</p>
              <button type="button" class="mt-2 font-semibold underline" (click)="showInfo()">Try again</button>
            </div>
          </div>
        } @else if (infoVisible && busDrivers.length > 0) {
          <h2 class="section-title">
            Live drivers for bus {{ searchedNumber }}
            <span class="badge-brand ml-2 align-middle">{{ busDrivers.length }}</span>
          </h2>
          <ul class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            @for (driver of busDrivers; track driver._id) {
              <li class="card flex flex-col">
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <p class="text-xs font-medium uppercase tracking-wide text-slate-500">Bus</p>
                    <h3 class="text-2xl font-bold text-brand-700">{{ driver.busNumber }}</h3>
                  </div>
                  <span class="badge-success">
                    <span class="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true"></span>
                    Live
                  </span>
                </div>
                <p class="mt-2 truncate text-sm text-slate-700" [title]="driver.email">{{ driver.email }}</p>
                @if (driver.currentLocation.timestamp) {
                  <p class="text-xs text-slate-500">Updated {{ driver.currentLocation.timestamp | date: 'medium' }}</p>
                }
                <p class="mt-1 font-mono text-xs text-slate-400">
                  {{ driver.currentLocation.lat | number: '1.5-5' }}, {{ driver.currentLocation.lng | number: '1.5-5' }}
                </p>

                <div class="mt-4 overflow-hidden rounded-xl border border-slate-200">
                  @if (mapUrl(driver.currentLocation.lat, driver.currentLocation.lng); as src) {
                    <img [src]="src" [alt]="'Map showing the location of bus ' + driver.busNumber" class="h-32 w-full object-cover" loading="lazy" />
                  } @else {
                    <div class="flex h-32 w-full flex-col items-center justify-center gap-1 bg-slate-100 text-slate-400">
                      <svg class="h-8 w-8" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0z" />
                      </svg>
                      <span class="text-xs">Map preview unavailable</span>
                    </div>
                  }
                </div>

                <div class="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <a [href]="mapsHref(driver.currentLocation.lat, driver.currentLocation.lng)" target="_blank" rel="noopener noreferrer"
                     class="btn-ghost btn-sm">
                    Open in Google Maps
                    <span class="sr-only">(opens in a new tab)</span>
                  </a>
                  <button type="button" class="btn-primary btn-sm" (click)="trackBus(driver)">Track this bus</button>
                </div>
              </li>
            }
          </ul>
        } @else if (infoVisible) {
          <div class="empty-state">
            <svg class="h-12 w-12 text-slate-300" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 7h8m-8 4h8M6 3h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm1 15v2m10-2v2" />
            </svg>
            <h2 class="mt-4 text-lg font-semibold text-slate-900">No live drivers for bus {{ searchedNumber }}</h2>
            <p class="mt-1 max-w-sm text-sm text-slate-500">
              Nobody is driving this bus right now. Double-check the number, or try again in a few minutes.
            </p>
          </div>
        }
      </div>

      @if (selectedDriver) {
        <div class="modal-backdrop" (click)="cancelTracking()">
          <div class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="trackDialogTitle" (click)="$event.stopPropagation()">
            <div class="p-6">
              <h2 id="trackDialogTitle" class="text-lg font-semibold text-slate-900">Track bus {{ selectedDriver.busNumber }}?</h2>
              <p class="mt-2 text-sm text-slate-600">
                You'll follow the bus driven by <strong class="text-slate-800">{{ selectedDriver.email }}</strong>
                on your tracking page.
              </p>
            </div>
            <div class="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
              <button type="button" class="btn-secondary" (click)="cancelTracking()">Cancel</button>
              <button type="button" class="btn-primary" (click)="confirmTracking()">Start tracking</button>
            </div>
          </div>
        </div>
      }
    </section>
  `
})
export class FindBnComponent {
  busNumber = '';
  searchedNumber = '';
  infoVisible = false;
  submitted = false;
  loading = false;
  error = '';
  busDrivers: Driver[] = [];
  selectedDriver: Driver | null = null;

  readonly mapUrl = (lat: number, lng: number) => staticMapUrl(lat, lng);
  readonly mapsHref = (lat: number, lng: number) => mapsLink(lat, lng);

  constructor(
    private driverService: DriverService,
    private router: Router
  ) {}

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.selectedDriver) this.cancelTracking();
  }

  showInfo() {
    this.submitted = true;
    const busNumber = this.busNumber.trim();
    this.busNumber = busNumber;
    if (!busNumber || this.loading) return;

    this.searchedNumber = busNumber;
    this.loading = true;
    this.error = '';
    this.infoVisible = false;
    this.driverService
      .searchDriversByBusNumber(busNumber)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (drivers) => {
          // Only show drivers with an active trip
          this.busDrivers = (drivers ?? []).filter((driver) =>
            hasPosition(driver.currentLocation?.lat, driver.currentLocation?.lng)
          );
          this.infoVisible = true;
        },
        error: (err: HttpErrorResponse) => {
          this.busDrivers = [];
          if (err?.status === 404) {
            // Backend returns 404 when there are no drivers for this bus
            this.infoVisible = true;
            return;
          }
          console.error('Error fetching drivers by bus number:', err);
          this.error =
            err?.status === 0
              ? "Can't reach the server. Check your connection and try again."
              : 'Something went wrong while searching. Please try again.';
        }
      });
  }

  trackBus(driver: Driver): void {
    this.selectedDriver = driver;
  }

  cancelTracking(): void {
    this.selectedDriver = null;
  }

  confirmTracking(): void {
    if (this.selectedDriver) {
      this.driverService.addBusToTracking(this.selectedDriver);
      this.router.navigate(['/tracking']);
    }
    this.selectedDriver = null;
  }
}

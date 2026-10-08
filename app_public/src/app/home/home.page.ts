import { Component, DestroyRef, HostListener, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../services/auth.service';
import { BusRoutesService, BusRoute } from '../services/bus-routes.service';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  template: `
    <section class="page">
      <header class="page-header">
        <h1 class="page-title">Welcome back{{ userName ? ', ' + userName : '' }}</h1>
        <p class="page-subtitle">
          Find your bus, follow it live on the map, and share feedback with other passengers.
        </p>
      </header>

      <!-- Quick actions -->
      <nav aria-label="Quick actions" class="mb-10">
        <ul class="grid grid-cols-1 gap-4 sm:grid-cols-2" [ngClass]="isDriver ? 'lg:grid-cols-4' : 'lg:grid-cols-3'">
          <li>
            <a [routerLink]="['/find-by-number']" class="card-interactive flex h-full items-start gap-4 no-underline">
              <span aria-hidden="true" class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-xl">🔢</span>
              <span>
                <span class="block font-semibold text-slate-900">Find by number</span>
                <span class="mt-1 block text-sm text-slate-600">Look up a bus using its route number.</span>
              </span>
            </a>
          </li>
          <li>
            <a [routerLink]="['/find-by-registration']" class="card-interactive flex h-full items-start gap-4 no-underline">
              <span aria-hidden="true" class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-xl">🛣️</span>
              <span>
                <span class="block font-semibold text-slate-900">Find by route</span>
                <span class="mt-1 block text-sm text-slate-600">Search buses between two places.</span>
              </span>
            </a>
          </li>
          <li>
            <a [routerLink]="['/tracking']" class="card-interactive flex h-full items-start gap-4 no-underline">
              <span aria-hidden="true" class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-xl">📍</span>
              <span>
                <span class="block font-semibold text-slate-900">Live tracking</span>
                <span class="mt-1 block text-sm text-slate-600">See buses moving in real time.</span>
              </span>
            </a>
          </li>
          <li *ngIf="isDriver">
            <a [routerLink]="['/start-trip']"
               class="card-interactive flex h-full items-start gap-4 border-accent-400 bg-accent-400/10 no-underline hover:border-accent-500">
              <span aria-hidden="true" class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-400 text-xl">🚌</span>
              <span>
                <span class="block font-semibold text-slate-900">Start a trip</span>
                <span class="mt-1 block text-sm text-slate-700">Share your bus location with passengers.</span>
              </span>
            </a>
          </li>
        </ul>
      </nav>

      <!-- How to use -->
      <section aria-labelledby="howto-title" class="card mb-10">
        <h2 id="howto-title" class="section-title">How to use SmartBus</h2>
        <ol class="grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
          <li class="flex gap-3">
            <span aria-hidden="true" class="badge-brand h-6 w-6 shrink-0 justify-center p-0">1</span>
            <span>Use <strong>Find by number</strong> to search for a bus using its bus number.</span>
          </li>
          <li class="flex gap-3">
            <span aria-hidden="true" class="badge-brand h-6 w-6 shrink-0 justify-center p-0">2</span>
            <span>Use <strong>Find by route</strong> to find buses running between a start and a destination.</span>
          </li>
          <li class="flex gap-3">
            <span aria-hidden="true" class="badge-brand h-6 w-6 shrink-0 justify-center p-0">3</span>
            <span>Check <strong><a [routerLink]="['/reviews']" class="text-brand-700 underline hover:text-brand-800">Reviews</a></strong> to read or write feedback about bus services.</span>
          </li>
          <li *ngIf="isDriver" class="flex gap-3">
            <span aria-hidden="true" class="badge-brand h-6 w-6 shrink-0 justify-center p-0">4</span>
            <span>As a driver, use <strong>Start a trip</strong> to begin sharing your location.</span>
          </li>
        </ol>
      </section>

      <!-- All bus routes -->
      <section aria-labelledby="routes-title">
        <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="routes-title" class="section-title mb-1">All bus routes</h2>
            <p class="text-sm text-slate-600" aria-live="polite">
              Showing {{ filteredRoutes.length }} of {{ busRoutes.length }} routes
            </p>
          </div>
          <div class="w-full sm:w-72">
            <label for="route-filter" class="form-label">Filter routes</label>
            <input
              id="route-filter"
              type="search"
              class="form-input"
              placeholder="Bus number or stop name"
              autocomplete="off"
              [(ngModel)]="filterText"
            />
          </div>
        </div>

        <ul *ngIf="filteredRoutes.length > 0; else noRoutes"
            class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <li *ngFor="let route of filteredRoutes; trackBy: trackByNumber">
            <button
              type="button"
              class="card-interactive block h-full w-full text-left"
              (click)="openRoutePopup(route)"
              [attr.aria-label]="'View route for bus ' + route.number + ', ' + getFirstStop(route) + ' to ' + getLastStop(route)"
            >
              <span class="flex items-start justify-between gap-3">
                <span class="text-lg font-bold text-brand-700">Bus {{ route.number }}</span>
                <span class="badge-brand shrink-0">{{ route.stops.length }} stops</span>
              </span>
              <span class="mt-3 flex flex-wrap items-center gap-x-2 text-sm text-slate-700">
                <span class="font-medium">{{ getFirstStop(route) }}</span>
                <span aria-hidden="true" class="text-slate-400">→</span>
                <span class="font-medium">{{ getLastStop(route) }}</span>
              </span>
              <span class="mt-3 block text-xs text-slate-500">View full route</span>
            </button>
          </li>
        </ul>

        <ng-template #noRoutes>
          <div class="empty-state" role="status">
            <span aria-hidden="true" class="mb-2 text-3xl">🔍</span>
            <p class="font-semibold text-slate-900">No routes match "{{ filterText }}"</p>
            <p class="mt-1 text-sm text-slate-600">Try a different bus number or stop name.</p>
            <button type="button" class="btn-secondary btn-sm mt-4" (click)="filterText = ''">Clear filter</button>
          </div>
        </ng-template>
      </section>

      <!-- Route modal -->
      <div *ngIf="selectedRoute as route" class="modal-backdrop" (click)="onBackdropClick($event)">
        <div
          class="modal-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="route-modal-title"
        >
          <div class="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
            <div>
              <h2 id="route-modal-title" class="text-lg font-semibold">Bus {{ route.number }} route</h2>
              <p class="text-sm text-slate-600">{{ route.stops.length }} stops</p>
            </div>
            <button type="button" class="btn-ghost btn-sm" (click)="closeRoutePopup()" aria-label="Close route details">
              <span aria-hidden="true" class="text-xl leading-none">&times;</span>
            </button>
          </div>

          <div class="overflow-y-auto px-5 py-4">
            <ol class="relative">
              <li *ngFor="let stop of route.stops; let i = index; let first = first; let last = last"
                  class="relative flex gap-4 pb-5 last:pb-0">
                <span *ngIf="!last" aria-hidden="true"
                      class="absolute top-4 left-[7px] h-full w-0.5 bg-brand-200"></span>
                <span aria-hidden="true"
                      class="relative z-10 mt-1 h-4 w-4 shrink-0 rounded-full border-2"
                      [ngClass]="first ? 'border-emerald-600 bg-emerald-500' : last ? 'border-red-600 bg-red-500' : 'border-brand-500 bg-white'"></span>
                <span class="flex flex-wrap items-center gap-2 text-sm"
                      [ngClass]="first || last ? 'font-semibold text-slate-900' : 'text-slate-700'">
                  <span class="sr-only">Stop {{ i + 1 }}:</span>
                  {{ stop }}
                  <span *ngIf="first" class="badge-success">Start</span>
                  <span *ngIf="last && !first" class="badge-danger">End</span>
                </span>
              </li>
            </ol>
          </div>

          <div class="flex justify-end border-t border-slate-200 px-5 py-4">
            <button type="button" (click)="closeRoutePopup()" class="btn-primary">Close</button>
          </div>
        </div>
      </div>
    </section>
  `
})
export class HomePageComponent implements OnInit {
  isDriver = false;
  busRoutes: BusRoute[] = [];
  selectedRoute: BusRoute | null = null;
  filterText = '';
  userName = '';

  private destroyRef = inject(DestroyRef);

  constructor(
    private authService: AuthService,
    private busRoutesService: BusRoutesService
  ) {
    this.authService.userRole$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(role => {
        this.isDriver = role === 'driver';
      });
  }

  ngOnInit(): void {
    this.busRoutes = this.busRoutesService.getBusRoutes();
    this.userName = this.authService.getUserName();
  }

  get filteredRoutes(): BusRoute[] {
    const q = this.filterText.trim().toLowerCase();
    if (!q) {
      return this.busRoutes;
    }
    return this.busRoutes.filter(route =>
      String(route.number).toLowerCase().includes(q) ||
      route.stops.some(stop => stop.toLowerCase().includes(q))
    );
  }

  trackByNumber(_: number, route: BusRoute): string {
    return route.number;
  }

  getFirstStop(route: BusRoute): string {
    return route.stops.length > 0 ? route.stops[0] : 'Unknown';
  }

  getLastStop(route: BusRoute): string {
    return route.stops.length > 0 ? route.stops[route.stops.length - 1] : 'Unknown';
  }

  openRoutePopup(route: BusRoute): void {
    this.selectedRoute = route;
    // Move focus into the dialog once it renders.
    setTimeout(() => {
      const btn = document.querySelector<HTMLButtonElement>('[aria-label="Close route details"]');
      btn?.focus();
    });
  }

  closeRoutePopup(): void {
    this.selectedRoute = null;
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeRoutePopup();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.selectedRoute) {
      this.closeRoutePopup();
    }
  }
}

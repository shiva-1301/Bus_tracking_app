import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DriverService, Driver } from '../services/driver.service';
import { BusRoutesService, BusRoute } from '../services/bus-routes.service';
import { staticMapUrl, mapsLink, hasPosition } from '../shared/maps';

@Component({
  selector: 'app-find-by-registration',
  standalone: true,
  imports: [FormsModule, DatePipe, DecimalPipe],
  template: `
    <section class="page">
      <header class="page-header">
        <h1 class="page-title">Find buses by route</h1>
        <p class="page-subtitle">Pick where you're starting and where you're going. We'll list the buses that connect them and any that are live right now.</p>
      </header>

      <form class="card mb-8" (ngSubmit)="searchByRoute()" novalidate>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label for="fromLocation" class="form-label">From</label>
            <input
              id="fromLocation"
              name="fromLocation"
              type="text"
              autocomplete="off"
              [(ngModel)]="fromLocation"
              (ngModelChange)="submitted = false"
              placeholder="Starting stop"
              class="form-input"
              [class.border-red-400]="submitted && !fromLocation.trim()"
              [attr.aria-invalid]="submitted && !fromLocation.trim()"
              aria-describedby="fromHelp"
              list="fromStops"
            />
            <datalist id="fromStops">
              @for (stop of allStops; track stop) {
                <option [value]="stop"></option>
              }
            </datalist>
            @if (submitted && !fromLocation.trim()) {
              <p id="fromHelp" class="form-error">Please enter a starting stop.</p>
            } @else {
              <p id="fromHelp" class="form-hint">Start typing to see matching stops.</p>
            }
          </div>

          <div>
            <label for="toLocation" class="form-label">To</label>
            <input
              id="toLocation"
              name="toLocation"
              type="text"
              autocomplete="off"
              [(ngModel)]="toLocation"
              (ngModelChange)="submitted = false"
              placeholder="Destination stop"
              class="form-input"
              [class.border-red-400]="submitted && !toLocation.trim()"
              [attr.aria-invalid]="submitted && !toLocation.trim()"
              aria-describedby="toHelp"
              list="toStops"
            />
            <datalist id="toStops">
              @for (stop of allStops; track stop) {
                <option [value]="stop"></option>
              }
            </datalist>
            @if (submitted && !toLocation.trim()) {
              <p id="toHelp" class="form-error">Please enter a destination stop.</p>
            } @else {
              <p id="toHelp" class="form-hint">Where you want to get off.</p>
            }
          </div>
        </div>

        <button type="submit" class="btn-primary mt-5 w-full sm:w-auto" [disabled]="pendingLookups > 0">
          @if (pendingLookups > 0) {
            <span class="spinner h-4 w-4" aria-hidden="true"></span>
            Searching…
          } @else {
            Find buses
          }
        </button>
      </form>

      @if (searchPerformed) {
        <div aria-live="polite" class="space-y-10">
          @if (matchingBuses.length === 0) {
            <div class="empty-state">
              <svg class="h-12 w-12 text-slate-300" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
              </svg>
              <h2 class="mt-4 text-lg font-semibold text-slate-900">No buses on this route</h2>
              <p class="mt-1 max-w-sm text-sm text-slate-500">
                We couldn't find a bus from <strong class="text-slate-700">{{ searchedFrom }}</strong> to
                <strong class="text-slate-700">{{ searchedTo }}</strong>. Check the stop names, or pick them from the suggestions.
              </p>
            </div>
          } @else {
            <section aria-labelledby="matchingTitle">
              <h2 id="matchingTitle" class="section-title">
                Buses on this route
                <span class="badge-brand ml-2 align-middle">{{ matchingBuses.length }}</span>
              </h2>
              <ul class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                @for (bus of matchingBuses; track bus.number) {
                  <li class="card p-4 sm:p-5">
                    <div class="flex items-center justify-between gap-3">
                      <h3 class="text-lg font-bold text-brand-700">Bus {{ bus.number }}</h3>
                      <button
                        type="button"
                        class="btn-ghost btn-sm"
                        (click)="toggleBusRoute(bus.number)"
                        [attr.aria-expanded]="expandedBuses.has(bus.number)"
                        [attr.aria-controls]="'route-' + bus.number">
                        {{ expandedBuses.has(bus.number) ? 'Hide' : 'Show' }} stops
                      </button>
                    </div>
                    <p class="mt-1 text-xs text-slate-500">{{ bus.stops.length }} stops</p>
                    @if (expandedBuses.has(bus.number)) {
                      <ol [id]="'route-' + bus.number" class="mt-3 max-h-40 space-y-1 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                        @for (stop of bus.stops; track $index) {
                          <li class="flex items-center gap-2">
                            <span class="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" aria-hidden="true"></span>
                            {{ stop }}
                          </li>
                        }
                      </ol>
                    }
                  </li>
                }
              </ul>
            </section>

            <section aria-labelledby="liveTitle">
              <h2 id="liveTitle" class="section-title">
                Live drivers
                @if (liveDrivers.length > 0) {
                  <span class="badge-success ml-2 align-middle">{{ liveDrivers.length }}</span>
                }
              </h2>

              @if (lookupErrors > 0 && pendingLookups === 0) {
                <div class="alert-error mb-4" role="alert">
                  <svg class="mt-0.5 h-5 w-5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  </svg>
                  <div class="flex-1">
                    <p>{{ lookupErrorMessage }}</p>
                    <button type="button" class="mt-2 font-semibold underline" (click)="searchByRoute()">Try again</button>
                  </div>
                </div>
              }

              @if (liveDrivers.length > 0) {
                <ul class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  @for (driver of liveDrivers; track driver._id) {
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
              }

              @if (pendingLookups > 0) {
                <div class="flex items-center gap-3 py-6 text-sm text-slate-500" [class.justify-center]="liveDrivers.length === 0">
                  <span class="spinner text-brand-600" aria-hidden="true"></span>
                  <span>Checking live drivers…</span>
                </div>
              } @else if (liveDrivers.length === 0 && lookupErrors < matchingBuses.length) {
                <div class="empty-state">
                  <svg class="h-12 w-12 text-slate-300" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                  </svg>
                  <h3 class="mt-4 text-lg font-semibold text-slate-900">No live drivers right now</h3>
                  <p class="mt-1 max-w-sm text-sm text-slate-500">
                    None of these buses are currently on a trip. Check back in a few minutes.
                  </p>
                </div>
              }
            </section>
          }
        </div>
      }

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
export class FindBrComponent implements OnInit, OnDestroy {
  fromLocation = '';
  toLocation = '';
  searchedFrom = '';
  searchedTo = '';
  allStops: string[] = [];
  matchingBuses: BusRoute[] = [];
  driversByBus = new Map<string, Driver[]>();
  liveDrivers: Driver[] = [];
  expandedBuses = new Set<string>();
  searchPerformed = false;
  submitted = false;
  pendingLookups = 0;
  lookupErrors = 0;
  lookupErrorMessage = '';
  selectedDriver: Driver | null = null;

  readonly mapUrl = (lat: number, lng: number) => staticMapUrl(lat, lng);
  readonly mapsHref = (lat: number, lng: number) => mapsLink(lat, lng);

  private lookupSubs: Subscription[] = [];

  constructor(
    private driverService: DriverService,
    private busRoutesService: BusRoutesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Collect all unique stops from all bus routes for the suggestions
    const stopsSet = new Set<string>();
    this.busRoutesService.getBusRoutes().forEach((route) => {
      route.stops.forEach((stop) => stopsSet.add(stop));
    });
    this.allStops = Array.from(stopsSet).sort();
  }

  ngOnDestroy(): void {
    this.cancelLookups();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.selectedDriver) this.cancelTracking();
  }

  searchByRoute(): void {
    this.submitted = true;
    this.fromLocation = this.fromLocation.trim();
    this.toLocation = this.toLocation.trim();
    if (!this.fromLocation || !this.toLocation) return;

    this.cancelLookups();
    this.searchedFrom = this.fromLocation;
    this.searchedTo = this.toLocation;
    this.searchPerformed = true;
    this.matchingBuses = this.busRoutesService.findBusesBetweenStops(this.fromLocation, this.toLocation);
    this.driversByBus.clear();
    this.liveDrivers = [];
    this.lookupErrors = 0;
    this.lookupErrorMessage = '';
    this.pendingLookups = this.matchingBuses.length;

    // For each matching bus, look up its drivers
    this.matchingBuses.forEach((bus) => {
      const sub = this.driverService.searchDriversByBusNumber(bus.number).subscribe({
        next: (drivers) => {
          // Only keep drivers with an active trip
          const activeDrivers = (drivers ?? []).filter((driver) =>
            hasPosition(driver.currentLocation?.lat, driver.currentLocation?.lng)
          );
          if (activeDrivers.length > 0) {
            this.driversByBus.set(bus.number, activeDrivers);
            this.refreshLiveDrivers();
          }
          this.lookupDone();
        },
        error: (err: HttpErrorResponse) => {
          // 404 means "no drivers for this bus", which is not an error for the user
          if (err?.status !== 404) {
            console.error(`Error fetching drivers for bus ${bus.number}:`, err);
            this.lookupErrors++;
            this.lookupErrorMessage =
              err?.status === 0
                ? "Can't reach the server, so we couldn't check for live drivers. Check your connection and try again."
                : "Some live driver information couldn't be loaded. Please try again.";
          }
          this.lookupDone();
        }
      });
      this.lookupSubs.push(sub);
    });
  }

  toggleBusRoute(busNumber: string): void {
    if (this.expandedBuses.has(busNumber)) {
      this.expandedBuses.delete(busNumber);
    } else {
      this.expandedBuses.add(busNumber);
    }
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

  private refreshLiveDrivers(): void {
    // Keep the order of matching buses so results don't jump around
    this.liveDrivers = this.matchingBuses.flatMap((bus) => this.driversByBus.get(bus.number) ?? []);
  }

  private lookupDone(): void {
    this.pendingLookups = Math.max(0, this.pendingLookups - 1);
  }

  private cancelLookups(): void {
    this.lookupSubs.forEach((s) => s.unsubscribe());
    this.lookupSubs = [];
    this.pendingLookups = 0;
  }
}

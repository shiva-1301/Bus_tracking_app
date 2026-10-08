import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';
import { AuthService } from '../services/auth.service';

interface NavItem {
  label: string;
  path: string;
}

@Component({
  selector: 'app-framework',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <a href="#main" class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow-lg">
      Skip to content
    </a>

    <div class="flex min-h-screen flex-col">
      <!-- Header / Navbar -->
      <header class="sticky top-0 z-40 border-b border-white/10 bg-brand-900/95 text-white backdrop-blur supports-[backdrop-filter]:bg-brand-900/85">
        <div class="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <a [routerLink]="isLoggedIn ? '/home' : '/'" class="flex items-center gap-2.5 rounded-lg font-bold tracking-tight">
            <span class="grid h-9 w-9 place-items-center rounded-xl bg-accent-500 text-slate-900 shadow-sm" aria-hidden="true">
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6v6M16 6v6M2 12h19.6M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/><circle cx="7" cy="18" r="2"/><path d="M9 18h5"/><circle cx="16" cy="18" r="2"/></svg>
            </span>
            <span class="text-lg">SmartBus<span class="text-accent-400"> Tracker</span></span>
          </a>

          <!-- Desktop nav -->
          <nav class="hidden items-center gap-1 md:flex" aria-label="Main">
            <ng-container *ngIf="isLoggedIn; else guestLinks">
              <a *ngFor="let item of navItems" [routerLink]="item.path"
                 routerLinkActive="bg-white/15 text-white" [routerLinkActiveOptions]="{ exact: true }"
                 class="rounded-lg px-3 py-2 text-sm font-medium text-brand-100 transition hover:bg-white/10 hover:text-white">
                {{ item.label }}
              </a>
              <a *ngIf="isDriver" routerLink="/start-trip" routerLinkActive="ring-2 ring-white/60"
                 class="btn-accent btn-sm ml-2">Start trip</a>
              <button type="button" (click)="logout()" class="btn-sm btn ml-1 text-brand-100 hover:bg-white/10 hover:text-white">
                Log out
              </button>
            </ng-container>
            <ng-template #guestLinks>
              <a routerLink="/login" class="rounded-lg px-3 py-2 text-sm font-medium text-brand-100 transition hover:bg-white/10 hover:text-white">Log in</a>
              <a routerLink="/register" class="btn-accent btn-sm ml-1">Create account</a>
            </ng-template>
          </nav>

          <!-- Mobile menu toggle -->
          <button type="button" class="grid h-10 w-10 place-items-center rounded-lg text-brand-100 transition hover:bg-white/10 md:hidden"
                  (click)="menuOpen = !menuOpen" [attr.aria-expanded]="menuOpen" aria-controls="mobile-menu"
                  [attr.aria-label]="menuOpen ? 'Close menu' : 'Open menu'">
            <svg *ngIf="!menuOpen" class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
            <svg *ngIf="menuOpen" class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
          </button>
        </div>

        <!-- Mobile nav -->
        <nav *ngIf="menuOpen" id="mobile-menu" class="border-t border-white/10 px-4 pb-4 pt-2 md:hidden" aria-label="Mobile">
          <ng-container *ngIf="isLoggedIn; else guestMobile">
            <a *ngFor="let item of navItems" [routerLink]="item.path" routerLinkActive="bg-white/15 text-white"
               class="block rounded-lg px-3 py-2.5 text-base font-medium text-brand-100 hover:bg-white/10">{{ item.label }}</a>
            <a *ngIf="isDriver" routerLink="/start-trip" class="btn-accent mt-2 w-full">Start trip</a>
            <button type="button" (click)="logout()" class="mt-2 block w-full rounded-lg px-3 py-2.5 text-left text-base font-medium text-brand-100 hover:bg-white/10">Log out</button>
          </ng-container>
          <ng-template #guestMobile>
            <a routerLink="/login" class="block rounded-lg px-3 py-2.5 text-base font-medium text-brand-100 hover:bg-white/10">Log in</a>
            <a routerLink="/register" class="btn-accent mt-2 w-full">Create account</a>
          </ng-template>
        </nav>
      </header>

      <!-- Page content -->
      <main id="main" class="flex-1" tabindex="-1">
        <router-outlet></router-outlet>
      </main>

      <!-- Footer -->
      <footer class="border-t border-slate-200 bg-white">
        <div class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:px-6 lg:px-8">
          <p>&copy; {{ year }} SmartBus Tracker &middot; Real-time college bus tracking</p>
          <nav class="flex gap-4" aria-label="Footer">
            <a routerLink="/reviews" class="hover:text-brand-700">Reviews</a>
            <a routerLink="/tracking" class="hover:text-brand-700">Live tracking</a>
          </nav>
        </div>
      </footer>
    </div>
  `,
})
export class FrameworkComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  isLoggedIn = false;
  isDriver = false;
  menuOpen = false;
  year = new Date().getFullYear();

  navItems: NavItem[] = [
    { label: 'Dashboard', path: '/home' },
    { label: 'Find by number', path: '/find-by-number' },
    { label: 'Find by route', path: '/find-by-registration' },
    { label: 'Tracking', path: '/tracking' },
    { label: 'Reviews', path: '/reviews' },
  ];

  ngOnInit(): void {
    this.authService.isAuthenticated$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(isAuthenticated => (this.isLoggedIn = isAuthenticated));

    this.authService.userRole$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(role => (this.isDriver = role === 'driver'));

    // Close the mobile menu after navigating
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => (this.menuOpen = false));
  }

  logout(): void {
    this.authService.logout();
  }
}

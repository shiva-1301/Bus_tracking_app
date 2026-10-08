import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="page">
      <header class="page-header">
        <h1 class="page-title">How would you like to search?</h1>
        <p class="page-subtitle">Pick the option that matches what you know about your trip.</p>
      </header>

      <ul class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <li>
          <a [routerLink]="['/find-by-route']" class="card-interactive flex h-full flex-col items-start gap-3">
            <span aria-hidden="true" class="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-xl">🛣️</span>
            <span class="font-semibold text-slate-900">Find by route</span>
            <span class="text-sm text-slate-600">Search using your start and destination.</span>
          </a>
        </li>
        <li>
          <a [routerLink]="['/find-by-number']" class="card-interactive flex h-full flex-col items-start gap-3">
            <span aria-hidden="true" class="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-xl">🔢</span>
            <span class="font-semibold text-slate-900">Find by number</span>
            <span class="text-sm text-slate-600">Look up a bus using its bus number.</span>
          </a>
        </li>
        <li>
          <a [routerLink]="['/tracking']" class="card-interactive flex h-full flex-col items-start gap-3">
            <span aria-hidden="true" class="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-xl">📍</span>
            <span class="font-semibold text-slate-900">Live tracking</span>
            <span class="text-sm text-slate-600">Follow buses on the map in real time.</span>
          </a>
        </li>
        <li>
          <a [routerLink]="['/reviews']" class="card-interactive flex h-full flex-col items-start gap-3">
            <span aria-hidden="true" class="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-400/20 text-xl">⭐</span>
            <span class="font-semibold text-slate-900">Reviews</span>
            <span class="text-sm text-slate-600">Read or write passenger reviews.</span>
          </a>
        </li>
      </ul>
    </section>
  `
})
export class SearchComponent {}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface Feature {
  title: string;
  text: string;
  icon: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <!-- Hero -->
    <section class="relative overflow-hidden bg-brand-900 text-white">
      <div class="pointer-events-none absolute inset-0 opacity-40" aria-hidden="true"
           style="background: radial-gradient(60rem 30rem at 85% -10%, rgb(99 102 241 / .6), transparent), radial-gradient(40rem 20rem at -10% 110%, rgb(245 158 11 / .35), transparent);"></div>
      <div class="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2 lg:px-8">
        <div>
          <span class="badge bg-white/10 text-accent-400 ring-1 ring-white/15">Live college bus tracking</span>
          <h1 class="mt-5 text-4xl font-extrabold leading-tight text-white sm:text-5xl">
            Know exactly where your bus is.
          </h1>
          <p class="mt-5 max-w-xl text-lg text-brand-100">
            Find buses by number or by the stops you travel between, follow drivers in real time,
            and share feedback with other passengers.
          </p>
          <div class="mt-8 flex flex-col gap-3 sm:flex-row">
            <a routerLink="/register" class="btn-accent btn-lg">Get started — it's free</a>
            <a routerLink="/login" class="btn btn-lg border border-white/25 text-white hover:bg-white/10">I already have an account</a>
          </div>
        </div>

        <!-- Illustrative route card -->
        <div class="hidden lg:block" aria-hidden="true">
          <div class="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10 backdrop-blur">
            <div class="flex items-center justify-between">
              <p class="text-sm font-semibold text-brand-100">Bus 279</p>
              <span class="inline-flex items-center gap-2 rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-300">
                <span class="h-2 w-2 animate-pulse rounded-full bg-emerald-400"></span> Live
              </span>
            </div>
            <ol class="mt-6 space-y-5">
              <li *ngFor="let stop of demoStops; let i = index; let last = last" class="relative flex items-center gap-4 pl-1">
                <span class="relative z-10 h-3 w-3 rounded-full ring-4"
                      [ngClass]="i <= 1 ? 'bg-accent-400 ring-accent-400/20' : 'bg-white/40 ring-white/10'"></span>
                <span *ngIf="!last" class="absolute left-[9px] top-4 h-7 w-0.5 bg-white/15"></span>
                <span class="text-sm" [ngClass]="i === 1 ? 'font-semibold text-white' : 'text-brand-100'">{{ stop }}</span>
                <span *ngIf="i === 1" class="ml-auto text-xs text-accent-400">Bus is here</span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="page" aria-labelledby="features-title">
      <div class="mx-auto max-w-2xl text-center">
        <h2 id="features-title" class="text-2xl font-bold sm:text-3xl">Everything you need for the daily commute</h2>
        <p class="mt-3 text-slate-600">Built for students, staff and drivers on campus routes.</p>
      </div>
      <ul class="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <li *ngFor="let f of features" class="card transition hover:-translate-y-0.5 hover:shadow-md">
          <span class="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-xl" aria-hidden="true">{{ f.icon }}</span>
          <h3 class="mt-4 font-semibold">{{ f.title }}</h3>
          <p class="mt-1.5 text-sm text-slate-600">{{ f.text }}</p>
        </li>
      </ul>
    </section>

    <!-- How it works -->
    <section class="border-y border-slate-200 bg-white" aria-labelledby="how-title">
      <div class="page">
        <h2 id="how-title" class="text-center text-2xl font-bold sm:text-3xl">How it works</h2>
        <ol class="mt-10 grid gap-8 md:grid-cols-3">
          <li *ngFor="let step of steps; let i = index" class="text-center">
            <span class="mx-auto grid h-10 w-10 place-items-center rounded-full bg-brand-600 font-bold text-white">{{ i + 1 }}</span>
            <h3 class="mt-4 font-semibold">{{ step.title }}</h3>
            <p class="mt-1.5 text-sm text-slate-600">{{ step.text }}</p>
          </li>
        </ol>
      </div>
    </section>

    <!-- CTA -->
    <section class="page">
      <div class="flex flex-col items-center justify-between gap-6 rounded-3xl bg-brand-600 px-6 py-10 text-center text-white sm:px-10 md:flex-row md:text-left">
        <div>
          <h2 class="text-2xl font-bold text-white">Driving a route?</h2>
          <p class="mt-1 text-brand-100">Register as a driver to share your live location with passengers.</p>
        </div>
        <a routerLink="/register" class="btn-accent btn-lg shrink-0">Register as a driver</a>
      </div>
    </section>
  `,
})
export class HomeComponent {
  demoStops = ['Ibrahimpatnam Bus Station', 'Sheriguda Bus Stop', 'Sri Indu Engineering College', 'L.B Nagar'];

  features: Feature[] = [
    { icon: '🔢', title: 'Find by number', text: 'Type a bus number and see every driver currently running it.' },
    { icon: '🛣️', title: 'Find by route', text: 'Pick where you are and where you’re going — we list the buses that connect them.' },
    { icon: '📍', title: 'Live tracking', text: 'Follow buses on your tracking list; positions refresh automatically.' },
    { icon: '⭐', title: 'Reviews', text: 'Rate your ride and read what other passengers say.' },
  ];

  steps = [
    { title: 'Create an account', text: 'Sign up as a passenger, or as a driver with your driver ID.' },
    { title: 'Find your bus', text: 'Search by bus number or by the two stops you travel between.' },
    { title: 'Track it live', text: 'Add the bus to your tracking list and watch it approach.' },
  ];
}

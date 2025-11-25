import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { BusRoutesService, BusRoute } from '../services/bus-routes.service';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <div class="flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-xl w-full">
      <h1 class="text-4xl font-extrabold text-indigo-700 mb-6">Welcome to SmartBus Tracker</h1>
      <p class="text-xl text-gray-600 mb-8 max-w-2xl text-center">
        Track buses in real-time, find routes between locations, and read reviews from passengers.
      </p>
      
      <div class="bg-indigo-50 p-6 rounded-xl mb-8 w-full max-w-2xl">
        <h2 class="text-2xl font-bold text-indigo-800 mb-4">How to Use This Service</h2>
        <ul class="list-disc pl-6 space-y-2 text-gray-700">
          <li>Use <strong>Find by Number</strong> to search for buses using their bus number</li>
          <li>Use <strong>Find by Route</strong> to search for drivers registered with a specific bus number</li>
          <li>Check <strong>Reviews</strong> to read or write feedback about bus services</li>
          <li *ngIf="isDriver">As a driver, use <strong>Start Trip</strong> to begin tracking your location</li>
        </ul>
      </div>
      
      <!-- Available Buses Section -->
      <div class="w-full max-w-4xl mb-8">
        <h2 class="text-2xl font-bold text-gray-800 mb-4">Available Buses</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div *ngFor="let route of busRoutes" 
               class="bg-white p-4 rounded-lg shadow border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow"
               (click)="openRoutePopup(route)">
            <div class="flex justify-between items-start">
              <div>
                <h3 class="text-lg font-bold text-indigo-700">Bus {{ route.number }}</h3>
                <p class="text-sm text-gray-600 mt-1">
                  <span class="font-medium">From:</span> {{ getFirstStop(route) }}
                </p>
                <p class="text-sm text-gray-600">
                  <span class="font-medium">To:</span> {{ getLastStop(route) }}
                </p>
              </div>
              <span class="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                {{ route.stops.length }} stops
              </span>
            </div>
            <div class="mt-3 text-xs text-gray-500">
              Click to view full route
            </div>
          </div>
        </div>
      </div>
      
      <!-- Route Popup Modal -->
      <div *ngIf="selectedRoute" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          <div class="bg-indigo-700 text-white p-4 flex justify-between items-center">
            <h3 class="text-xl font-bold">Bus {{ selectedRoute.number }} Route</h3>
            <button (click)="closeRoutePopup()" class="text-white hover:text-gray-200 text-2xl">&times;</button>
          </div>
          <div class="p-4 overflow-y-auto flex-grow">
            <div class="mb-4">
              <p class="text-gray-700"><span class="font-semibold">Total Stops:</span> {{ selectedRoute.stops.length }}</p>
            </div>
            <div class="border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
              <ol class="space-y-2">
                <li *ngFor="let stop of selectedRoute.stops; let i = index" 
                    class="flex items-start"
                    [ngClass]="{'text-green-600 font-semibold': i === 0, 'text-red-600 font-semibold': i === selectedRoute.stops.length - 1}">
                  <span class="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center text-xs mr-2 mt-0.5">
                    {{ i + 1 }}
                  </span>
                  <span [ngClass]="{'font-bold': i === 0 || i === selectedRoute.stops.length - 1}">
                    {{ stop }}
                    <span *ngIf="i === 0" class="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">Start</span>
                    <span *ngIf="i === selectedRoute.stops.length - 1" class="ml-2 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">End</span>
                  </span>
                </li>
              </ol>
            </div>
          </div>
          <div class="p-4 border-t border-gray-200 flex justify-end">
            <button (click)="closeRoutePopup()" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              Close
            </button>
          </div>
        </div>
      </div>
      
      <div class="flex flex-wrap justify-center gap-4">
        <a [routerLink]="['/find-by-number']" 
           class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow transition duration-200">
          Find by Number
        </a>
        <a [routerLink]="['/find-by-registration']" 
           class="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow transition duration-200">
          Find by Route
        </a>
        <a [routerLink]="['/reviews']" 
           class="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-lg shadow transition duration-200">
          Reviews
        </a>
      </div>
    </div>
  `
})
export class HomePageComponent implements OnInit {
  isDriver = false;
  busRoutes: BusRoute[] = [];
  selectedRoute: BusRoute | null = null;
  
  constructor(
    private authService: AuthService,
    private busRoutesService: BusRoutesService
  ) {
    this.authService.userRole$.subscribe(role => {
      this.isDriver = role === 'driver';
    });
  }
  
  ngOnInit(): void {
    this.busRoutes = this.busRoutesService.getBusRoutes();
  }
  
  getFirstStop(route: BusRoute): string {
    return route.stops.length > 0 ? route.stops[0] : 'Unknown';
  }
  
  getLastStop(route: BusRoute): string {
    return route.stops.length > 0 ? route.stops[route.stops.length - 1] : 'Unknown';
  }
  
  openRoutePopup(route: BusRoute): void {
    this.selectedRoute = route;
  }
  
  closeRoutePopup(): void {
    this.selectedRoute = null;
  }
}
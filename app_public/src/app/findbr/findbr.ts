import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, KeyValuePipe } from '@angular/common';
import { Router } from '@angular/router';
import { DriverService, Driver } from '../services/driver.service';
import { BusRoutesService, BusRoute } from '../services/bus-routes.service';

@Component({
  selector: 'app-find-by-registration',
  standalone: true,
  imports: [FormsModule, CommonModule, KeyValuePipe],
  template: `
    <div class="flex flex-col items-center justify-center p-10 bg-white rounded-2xl shadow-xl max-w-4xl mx-auto">
      <h2 class="text-3xl font-bold text-green-700 mb-6">Find Drivers by Route</h2>

      <!-- Search Form -->
      <div class="w-full mb-8 p-6 bg-gray-50 rounded-xl">
        <h3 class="text-xl font-semibold text-gray-800 mb-4">Search by Route</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-gray-700 font-medium mb-2">From</label>
            <input 
              [(ngModel)]="fromLocation" 
              placeholder="Enter starting location"
              class="w-full mb-4 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
              list="fromStops"
            />
            <datalist id="fromStops">
              <option *ngFor="let stop of allStops" [value]="stop">{{ stop }}</option>
            </datalist>
          </div>
          
          <div>
            <label class="block text-gray-700 font-medium mb-2">To</label>
            <input 
              [(ngModel)]="toLocation" 
              placeholder="Enter destination"
              class="w-full mb-4 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
              list="toStops"
            />
            <datalist id="toStops">
              <option *ngFor="let stop of allStops" [value]="stop">{{ stop }}</option>
            </datalist>
          </div>
        </div>
        
        <button 
          (click)="searchByRoute()" 
          [disabled]="!fromLocation || !toLocation"
          class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
          Find Buses
        </button>
      </div>

      <!-- Results Section -->
      <div *ngIf="searchPerformed" class="w-full">
        <!-- Matching Buses -->
        <div *ngIf="matchingBuses.length > 0" class="mb-8">
          <h3 class="text-xl font-semibold text-green-600 mb-4">Matching Buses</h3>
          <div class="grid grid-cols-1 gap-4">
            <div *ngFor="let bus of matchingBuses" class="p-4 border border-green-200 rounded-xl bg-green-50">
              <div class="flex justify-between items-center">
                <h4 class="text-lg font-bold text-green-700">Bus {{ bus.number }}</h4>
                <button 
                  (click)="toggleBusRoute(bus.number)" 
                  class="text-green-600 hover:text-green-800 text-sm font-medium">
                  {{ expandedBuses.has(bus.number) ? 'Hide' : 'Show' }} Route
                </button>
              </div>
              <div *ngIf="expandedBuses.has(bus.number)" class="mt-3">
                <p class="text-sm text-gray-600 mb-2">Route:</p>
                <div class="max-h-32 overflow-y-auto border border-gray-200 rounded p-2 bg-white">
                  <ul class="list-disc pl-5 space-y-1">
                    <li *ngFor="let stop of bus.stops" class="text-sm">{{ stop }}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Drivers for Matching Buses -->
        <div *ngIf="driversByBus.size > 0" class="mb-8">
          <h3 class="text-xl font-semibold text-blue-600 mb-4">Available Drivers</h3>
          <div class="overflow-x-auto">
            <div class="flex space-x-4 pb-4">
              <div *ngFor="let busEntry of driversByBus | keyvalue" class="flex-shrink-0 w-80">
                <h4 class="text-lg font-bold text-blue-700 mb-2">Bus {{ busEntry.key }}</h4>
                <div class="flex space-x-4">
                  <div *ngFor="let driver of busEntry.value" 
                       class="bg-white border border-gray-200 rounded-lg shadow-sm p-4 w-80 cursor-pointer hover:shadow-md transition-shadow"
                       (click)="trackBus(driver)">
                    <div class="flex justify-between items-start">
                      <div>
                        <h5 class="font-bold text-gray-800">{{ driver.email }}</h5>
                        <p class="text-sm text-gray-600 mt-1">
                          <span class="font-medium">Lat:</span> {{ driver.currentLocation?.lat?.toFixed(6) || 'N/A' }}
                        </p>
                        <p class="text-sm text-gray-600">
                          <span class="font-medium">Lng:</span> {{ driver.currentLocation?.lng?.toFixed(6) || 'N/A' }}
                        </p>
                        <p class="text-sm text-gray-600" *ngIf="driver.currentLocation?.timestamp">
                          <span class="font-medium">Updated:</span> {{ driver.currentLocation?.timestamp | date:'short' }}
                        </p>
                      </div>
                      <span class="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
                        Track
                      </span>
                    </div>
                    
                    <!-- Map Thumbnail -->
                    <div class="mt-3 rounded-lg overflow-hidden border border-gray-200" *ngIf="driver.currentLocation?.lat && driver.currentLocation?.lng">
                      <img 
                        [src]="'https://maps.googleapis.com/maps/api/staticmap?center=' + driver.currentLocation.lat + ',' + driver.currentLocation.lng + '&zoom=15&size=300x150&markers=color:red%7C' + driver.currentLocation.lat + ',' + driver.currentLocation.lng + '&key=AIzaSyCV4p_A65476vApQdtj7RbGxJ05Tp3lnRE'" 
                        alt="Bus Location Map" 
                        class="w-full h-24 object-cover"
                        onerror="this.src='https://via.placeholder.com/300x150/cccccc/969696?text=Map+Not+Available'"
                      />
                    </div>
                    
                    <div class="mt-3 flex justify-between items-center">
                      <div class="text-xs text-gray-500">
                        Click to track this bus
                      </div>
                      <a 
                        *ngIf="driver.currentLocation?.lat && driver.currentLocation?.lng"
                        href="https://www.google.com/maps?q={{ driver.currentLocation.lat }},{{ driver.currentLocation.lng }}" 
                        target="_blank" 
                        class="inline-flex items-center px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-full transition-colors"
                        (click)="$event.stopPropagation()">
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
                        </svg>
                        View on Map
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- No Results -->
        <div *ngIf="matchingBuses.length === 0" class="border border-gray-300 rounded-xl w-full p-4 flex items-center justify-center bg-gray-100">
          <p class="text-gray-600">No buses found for the route from <b>{{ fromLocation }}</b> to <b>{{ toLocation }}</b></p>
        </div>
      </div>
      
      <!-- Tracking Confirmation Modal -->
      <div *ngIf="selectedDriver" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-xl shadow-2xl max-w-md w-full">
          <div class="p-6">
            <h3 class="text-xl font-bold text-gray-800 mb-4">Track Bus</h3>
            <p class="text-gray-600 mb-6">
              Do you want to track the bus driven by <strong>{{ selectedDriver.email }}</strong> 
              (Bus {{ selectedDriver.busNumber }})?
            </p>
            <div class="flex justify-end space-x-3">
              <button (click)="cancelTracking()" 
                      class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                No
              </button>
              <button (click)="confirmTracking()" 
                      class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Yes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class FindBrComponent implements OnInit {
  fromLocation = '';
  toLocation = '';
  allStops: string[] = [];
  matchingBuses: BusRoute[] = [];
  driversByBus = new Map<string, Driver[]>();
  expandedBuses = new Set<string>();
  searchPerformed = false;
  selectedDriver: Driver | null = null;

  constructor(
    private driverService: DriverService,
    private busRoutesService: BusRoutesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get all unique stops from all bus routes
    const allRoutes = this.busRoutesService.getBusRoutes();
    const stopsSet = new Set<string>();
    
    allRoutes.forEach(route => {
      route.stops.forEach(stop => stopsSet.add(stop));
    });
    
    this.allStops = Array.from(stopsSet).sort();
  }

  searchByRoute(): void {
    if (this.fromLocation && this.toLocation) {
      console.log('Searching for buses from', this.fromLocation, 'to', this.toLocation);
      this.searchPerformed = true;
      this.matchingBuses = this.busRoutesService.findBusesBetweenStops(this.fromLocation, this.toLocation);
      console.log('Matching buses found:', this.matchingBuses);
      this.driversByBus.clear();
      
      // For each matching bus, find the drivers
      this.matchingBuses.forEach(bus => {
        console.log('Searching for drivers for bus:', bus.number);
        this.driverService.searchDriversByBusNumber(bus.number).subscribe(
          (drivers) => {
            console.log('Drivers found for bus', bus.number, ':', drivers);
            // Filter to show only drivers with active trips
            const activeDrivers = drivers.filter(driver => 
              driver.currentLocation && 
              driver.currentLocation.lat !== 0 && 
              driver.currentLocation.lng !== 0
            );
            console.log('Active drivers for bus', bus.number, ':', activeDrivers);
            if (activeDrivers.length > 0) {
              this.driversByBus.set(bus.number, activeDrivers);
            } else {
              console.log('No active drivers found for bus', bus.number);
            }
          },
          (error) => {
            console.error(`Error fetching drivers for bus ${bus.number}:`, error);
          }
        );
      });
    }
  }
  
  toggleBusRoute(busNumber: string): void {
    if (this.expandedBuses.has(busNumber)) {
      this.expandedBuses.delete(busNumber);
    } else {
      this.expandedBuses.add(busNumber);
    }
  }
  
  trackBus(driver: Driver): void {
    console.log('Tracking bus with driver data:', driver);
    this.selectedDriver = driver;
  }
  
  cancelTracking(): void {
    this.selectedDriver = null;
  }
  
  confirmTracking(): void {
    if (this.selectedDriver) {
      console.log('Confirming tracking for driver in findbr:', this.selectedDriver);
      // Add the bus to tracking using the service
      this.driverService.addBusToTracking(this.selectedDriver);
      
      // Redirect to tracking page
      this.router.navigate(['/tracking']);
    }
    
    this.selectedDriver = null;
  }
}
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocationService } from '../services/location.service';
import { Driver } from '../services/driver.service';

interface TrackedBus {
  driverId: string;
  email: string;
  busNumber: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
  tripExpired: boolean;
}

@Component({
  selector: 'app-tracking',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-xl w-full">
      <h2 class="text-3xl font-bold text-indigo-700 mb-6">Bus Tracking</h2>
      
      <div *ngIf="trackedBuses.length === 0" class="w-full text-center py-12">
        <p class="text-gray-500 text-lg">No buses are currently being tracked.</p>
        <p class="text-gray-400 mt-2">Find buses in the "Find by Number" or "Find by Route" sections and add them to tracking.</p>
      </div>
      
      <div *ngIf="trackedBuses.length > 0" class="w-full">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div *ngFor="let bus of trackedBuses" 
               class="bg-white border rounded-xl shadow-sm overflow-hidden"
               [ngClass]="{'border-green-200': !bus.tripExpired, 'border-red-200': bus.tripExpired}">
            <div class="p-5">
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="text-xl font-bold text-indigo-700">Bus {{ bus.busNumber }}</h3>
                  <p class="text-gray-600">Driver: {{ bus.email }}</p>
                </div>
                <span [ngClass]="{
                  'bg-green-100 text-green-800': !bus.tripExpired, 
                  'bg-red-100 text-red-800': bus.tripExpired
                }" class="text-xs font-semibold px-2.5 py-0.5 rounded">
                  {{ bus.tripExpired ? 'Trip Expired' : 'Active' }}
                </span>
              </div>
              
              <div *ngIf="!bus.tripExpired" class="mt-4">
                <div class="grid grid-cols-2 gap-2 text-sm">
                  <p><span class="font-medium">Latitude:</span> {{ bus.latitude.toFixed(6) }}</p>
                  <p><span class="font-medium">Longitude:</span> {{ bus.longitude.toFixed(6) }}</p>
                  <p><span class="font-medium">Last Updated:</span> {{ bus.timestamp | date:'short' }}</p>
                </div>
                
                <!-- Map Thumbnail -->
                <div class="mt-3 rounded-lg overflow-hidden border border-gray-200">
                  <img 
                    [src]="'https://maps.googleapis.com/maps/api/staticmap?center=' + bus.latitude + ',' + bus.longitude + '&zoom=15&size=300x150&markers=color:red%7C' + bus.latitude + ',' + bus.longitude + '&key=AIzaSyCV4p_A65476vApQdtj7RbGxJ05Tp3lnRE'" 
                    alt="Bus Location Map" 
                    class="w-full h-32 object-cover"
                    onerror="this.src='https://via.placeholder.com/300x150/cccccc/969696?text=Map+Not+Available'"
                  />
                </div>
                
                <div class="mt-3">
                  <a href="https://www.google.com/maps?q={{ bus.latitude }},{{ bus.longitude }}" 
                     target="_blank" 
                     class="inline-flex items-center px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-full transition-colors">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
                    </svg>
                    View on Map
                  </a>
                </div>
              </div>
              
              <div *ngIf="bus.tripExpired" class="mt-4 text-red-600 text-sm">
                This bus trip has ended. The driver has finished their route.
              </div>
            </div>
            
            <div class="bg-gray-50 px-5 py-3 flex justify-end">
              <button (click)="removeBus(bus.driverId)" 
                      class="text-red-600 hover:text-red-800 font-medium text-sm">
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TrackingComponent implements OnInit {
  trackedBuses: TrackedBus[] = [];
  
  constructor(private locationService: LocationService) {}
  
  ngOnInit(): void {
    this.loadTrackedBuses();
    this.checkBusStatus();
    
    // Check bus status every 30 seconds
    console.log('Setting up interval to check bus status every 30 seconds');
    setInterval(() => {
      console.log('Interval triggered - checking bus status');
      this.checkBusStatus();
    }, 30000);
  }
  
  loadTrackedBuses(): void {
    const tracked = localStorage.getItem('trackedBuses');
    console.log('Loading tracked buses from localStorage:', tracked);
    if (tracked) {
      this.trackedBuses = JSON.parse(tracked);
      console.log('Parsed tracked buses:', this.trackedBuses);
    }
  }
  
  saveTrackedBuses(): void {
    localStorage.setItem('trackedBuses', JSON.stringify(this.trackedBuses));
  }
  
  removeBus(driverId: string): void {
    this.trackedBuses = this.trackedBuses.filter(bus => bus.driverId !== driverId);
    this.saveTrackedBuses();
  }
  
  checkBusStatus(): void {
    console.log('Checking bus status for', this.trackedBuses.length, 'buses');
    // For each tracked bus, check if the trip is still active
    this.trackedBuses.forEach(bus => {
      console.log('Checking status for bus:', bus);
      if (!bus.tripExpired) {
        // Check if the bus is still active by trying to get its location
        this.locationService.getBusLocationsByNumber(bus.busNumber).subscribe(
          (locations) => {
            console.log('Locations for bus', bus.busNumber, ':', locations);
            // Check if this specific driver is still active
            const driverLocation = locations.find((loc: any) => {
              // Check both possible locations for driverId
              const locationDriverId = loc.driverId || (loc.userId && loc.userId.driverId);
              console.log('Comparing location driverId:', locationDriverId, 'with tracked driverId:', bus.driverId);
              return locationDriverId === bus.driverId;
            });
            
            console.log('Found driver location:', driverLocation);
            
            if (!driverLocation) {
              // Driver is no longer active
              console.log('Driver no longer active, marking as expired');
              bus.tripExpired = true;
              this.saveTrackedBuses();
            } else {
              // Update location info
              console.log('Driver still active, updating location');
              bus.latitude = driverLocation.latitude;
              bus.longitude = driverLocation.longitude;
              bus.timestamp = driverLocation.timestamp;
              this.saveTrackedBuses();
            }
          },
          (error) => {
            console.error('Error checking bus status:', error);
            // If there's an error, we assume the trip might be expired
            // bus.tripExpired = true;
            // this.saveTrackedBuses();
          }
        );
      } else {
        console.log('Bus already marked as expired:', bus);
      }
    });
  }
}
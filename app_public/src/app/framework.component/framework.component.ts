import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router'; // 1. CRITICAL: Import Router for navigation
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-framework', 
  standalone: true, 
  // 2. CRITICAL: Add RouterOutlet, RouterLink, and CommonModule to imports
  imports: [RouterOutlet, RouterLink, CommonModule], 
  template: `
    <!-- Comprehensive Framework Layout with Tailwind CSS -->
    <div class="min-h-screen bg-gray-50 flex flex-col font-sans">
      
      <!-- 1. Header/Navbar - Only shown when logged in -->
      <header *ngIf="isLoggedIn" class="sticky top-0 z-40 w-full bg-indigo-700 shadow-lg text-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          <!-- Logo/App Title with Home Link -->
          <div class="text-2xl font-bold">
             <a [routerLink]="['/home']" class="hover:text-indigo-100 transition duration-150">RouteFinder</a>
          </div>
          
          <!-- Navigation Links -->
          <nav class="flex space-x-2 sm:space-x-4 items-center">
            <!-- Main Route Links - Only shown when logged in -->
            <a [routerLink]="['/find-by-number']" class="px-3 py-2 rounded-lg text-sm font-medium hover:bg-indigo-600 transition duration-150">Find by Number</a>
            <a [routerLink]="['/find-by-registration']" class="px-3 py-2 rounded-lg text-sm font-medium hover:bg-indigo-600 transition duration-150">Find by Route</a>
            <a [routerLink]="['/tracking']" class="px-3 py-2 rounded-lg text-sm font-medium hover:bg-indigo-600 transition duration-150">Tracking</a>
            <a [routerLink]="['/reviews']" class="px-3 py-2 rounded-lg text-sm font-medium hover:bg-indigo-600 transition duration-150">Reviews</a>
            
            <!-- Driver-specific Start Trip link (only shown for drivers) -->
            <a *ngIf="isDriver" [routerLink]="['/start-trip']" 
               class="px-3 py-2 rounded-lg text-sm font-medium bg-yellow-500 hover:bg-yellow-600 transition duration-150">
               Start Trip
            </a>
            
            <!-- Logout button -->
            <button (click)="logout()" 
               class="px-3 py-2 rounded-full text-sm font-bold text-white bg-red-500 hover:bg-red-400 transition transform hover:scale-105 shadow-md">
               Logout
            </button>
          </nav>

        </div>
      </header>

      <!-- 2. Main Content Container -->
      <div class="flex flex-1 overflow-hidden p-4 sm:p-8 justify-center items-start">
        
        <!-- 3. Page Content Area -->
        <!-- This is where Angular will render the components for the active route! -->
        <main class="flex-1 max-w-5xl w-full flex justify-center mt-10">
          <router-outlet></router-outlet>
        </main>
        
      </div>
    </div>
  `,
  // Styles are defined inline
  styles: [`
    :host {
      display: block;
      /* Ensures the component takes up the full viewport height */
      height: 100vh;
      width: 100%;
    }
  `]
})
export class FrameworkComponent implements OnInit {
  isLoggedIn = false;
  isDriver = false;
  
  constructor(private authService: AuthService, private router: Router) {}
  
  ngOnInit(): void {
    // Subscribe to authentication status changes
    this.authService.isAuthenticated$.subscribe(isAuthenticated => {
      this.isLoggedIn = isAuthenticated;
    });
    
    // Subscribe to user role changes
    this.authService.userRole$.subscribe(role => {
      this.isDriver = role === 'driver';
    });
  }
  
  logout(): void {
    this.authService.logout();
    // Redirect to home page after logout
    this.router.navigate(['/']);
  }
}
import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

// IMPORTANT: Updated imports to match the probable file names in your directories (e.g., home.ts instead of home.component.ts)
import { HomeComponent } from './home/home'; 
import { HomePageComponent } from './home/home.page';
import { SearchComponent } from './search/search'; 
import { FindBrComponent } from './findbr/findbr'; 
import { FindBnComponent } from './findbn/findbn'; 
import { ReviewComponent } from './review/review';
import { MapSearchComponent } from './map-search/map-search';
import { TrackingComponent } from './tracking/tracking';

// Auth components
import { LoginComponent } from './login/login'; 
import { RegisterComponent } from './register/register'; 
import { StartTripComponent } from './driver/start-trip/start-trip';
import { AuthService } from './services/auth.service';

// Auth guards
// Only logged-in users may open protected pages; otherwise send them to /login.
const isAuthenticated = () => {
  const authService = inject(AuthService);
  return authService.isAuthenticated() ? true : inject(Router).createUrlTree(['/login']);
};

// Driver-only pages: guests go to /login, passengers go to their dashboard.
const isDriver = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  if (!authService.isAuthenticated()) return router.createUrlTree(['/login']);
  return authService.isDriver() ? true : router.createUrlTree(['/home']);
};

// Logged-in users skip the landing/login/register pages.
const isGuest = () => {
  const authService = inject(AuthService);
  return authService.isAuthenticated() ? inject(Router).createUrlTree(['/home']) : true;
};

export const routes: Routes = [
  // 1. Landing Page: If you want the Home component to load on the base URL ('')
  // We're keeping this simple and using HomeComponent as the default landing page.
  { path: '', component: HomeComponent, title: 'SmartBus Tracker', canActivate: [isGuest] }, 
  
  // 2. Home Page for logged in users
  { path: 'home', component: HomePageComponent, title: 'Dashboard', canActivate: [isAuthenticated] },
  
  // 3. Search Page: The navigation hub
  { path: 'search', component: SearchComponent, title: 'Search Options', canActivate: [isAuthenticated] },
  
  // 4. Find by Route Page
  { path: 'find-by-route', component: FindBrComponent, title: 'Search by Route', canActivate: [isAuthenticated] },
  
  // 5. Find by Number Page
  { path: 'find-by-number', component: FindBnComponent, title: 'Search by Number', canActivate: [isAuthenticated] },
  
  // 6. Find by Registration Page (this should be a different component or have a different route)
  { path: 'find-by-registration', component: FindBrComponent, title: 'Find by Registration', canActivate: [isAuthenticated] },
  
  // 7. Reviews Page
  { path: 'reviews', component: ReviewComponent, title: 'User Reviews', canActivate: [isAuthenticated] },

  // 8. Map Search Page
  { path: 'map', component: MapSearchComponent, title: 'Map Search', canActivate: [isAuthenticated] },
  
  // 9. Tracking Page
  { path: 'tracking', component: TrackingComponent, title: 'Bus Tracking', canActivate: [isAuthenticated] },
  
  // 10. NEW: Login Page
  { path: 'login', component: LoginComponent, title: 'Log in · SmartBus', canActivate: [isGuest] },

  // 11. NEW: Register Page
  { path: 'register', component: RegisterComponent, title: 'Create account · SmartBus', canActivate: [isGuest] },
  
  // 12. Driver-specific Start Trip Page (protected by driver guard)
  { path: 'start-trip', component: StartTripComponent, title: 'Start Trip', canActivate: [isDriver] },
  
  // Optional: Wildcard route for 404/Unknown path redirection
  // Redirects any unknown path back to the Home page ('')
  { path: '**', redirectTo: '' }
];
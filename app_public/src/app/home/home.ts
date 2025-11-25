import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="flex flex-col md:flex-row w-full h-full min-h-[80vh] bg-white rounded-2xl shadow-xl overflow-hidden">
      <!-- Left side - Welcome message -->
      <div class="flex-1 bg-indigo-700 text-white p-12 flex flex-col justify-center">
        <h1 class="text-4xl md:text-5xl font-extrabold mb-6">Welcome to SmartBus Tracker</h1>
        <p class="text-xl md:text-2xl mb-8 max-w-lg">
          Track buses in real-time, find routes between locations, and read reviews from passengers.
        </p>
        <p class="text-lg text-indigo-200">
          Sign in or register to get started with our bus tracking service.
        </p>
      </div>
      
      <!-- Right side - Login/Register options -->
      <div class="flex-1 p-12 flex flex-col justify-center items-center bg-gray-50">
        <div class="w-full max-w-md">
          <h2 class="text-3xl font-bold text-gray-800 mb-8 text-center">Get Started</h2>
          
          <div class="space-y-6">
            <a [routerLink]="['/login']" 
               class="block w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition duration-200 transform hover:scale-105 text-center">
              Login
            </a>
            
            <a [routerLink]="['/register']" 
               class="block w-full py-4 px-6 bg-white hover:bg-gray-100 text-indigo-700 font-bold rounded-xl shadow-lg border-2 border-indigo-600 transition duration-200 transform hover:scale-105 text-center">
              Register
            </a>
          </div>
          
          <div class="mt-12 text-center">
            <p class="text-gray-600 mb-4">Already have an account?</p>
            <a [routerLink]="['/login']" class="text-indigo-600 hover:text-indigo-800 font-medium">
              Sign in here
            </a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class HomeComponent {}
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface Review {
  id?: string;
  userId?: string;
  username: string;
  busNumber?: string;
  rating: number;
  comment: string;
  createdAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = 'http://localhost:3000/api/reviews';
  private reviewsSubject = new BehaviorSubject<Review[]>([]);
  public reviews$ = this.reviewsSubject.asObservable();

  // Removed mock data - now using actual API calls

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    // Load reviews from API
    this.getReviews().subscribe();
  }

  // Get all reviews
  getReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(this.apiUrl).pipe(
      tap(reviews => this.reviewsSubject.next(reviews)),
      catchError(error => {
        console.error('Error fetching reviews', error);
        this.reviewsSubject.next([]);
        return of([]);
      })
    );
  }

  // Add a new review
  addReview(review: Review): Observable<Review> {
    return this.http.post<Review>(this.apiUrl, review).pipe(
      tap(newReview => {
        // Add the new review to the current reviews list
        const currentReviews = this.reviewsSubject.value;
        this.reviewsSubject.next([newReview, ...currentReviews]);
      }),
      catchError(error => {
        console.error('Error adding review', error);
        throw error;
      })
    );
  }

  // Get reviews for a specific bus
  getReviewsByBus(busNumber: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/bus/${busNumber}`).pipe(
      catchError(error => {
        console.error(`Error fetching reviews for bus ${busNumber}`, error);
        return of([]);
      })
    );
  }
}
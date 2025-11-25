import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReviewService, Review } from '../services/review.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-review',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './review.html',
  styleUrls: ['./review.css']
})
export class ReviewComponent implements OnInit {
  username = '';
  review = '';
  busNumber = '';
  rating = 5;
  reviews: Review[] = [];
  isLoggedIn = false;
  isSubmitting = false;
  errorMessage = '';

  constructor(
    private reviewService: ReviewService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Check if user is logged in
    this.authService.isAuthenticated$.subscribe(isAuth => {
      this.isLoggedIn = isAuth;
      
      if (this.isLoggedIn) {
        // Pre-fill username if available
        this.username = this.authService.getUserName() || '';
      }
    });
    
    // Load reviews
    this.loadReviews();
    
    // Subscribe to review updates
    this.reviewService.reviews$.subscribe(reviews => {
      this.reviews = reviews;
    });
  }

  loadReviews() {
    this.reviewService.getReviews().subscribe();
  }

  addReview() {
    // Allow submission even if some fields are empty
    this.isSubmitting = true;
    this.errorMessage = '';
    
    // Use default values if fields are empty
    const newReview: Review = {
      username: this.username || 'Anonymous',
      busNumber: this.busNumber || undefined,
      rating: this.rating || 5,
      comment: this.review || 'Great service!'
    };
    
    this.reviewService.addReview(newReview).subscribe({
      next: () => {
        // Clear form after successful submission
        this.review = '';
        this.busNumber = '';
        this.rating = 5;
        this.isSubmitting = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to submit review. Please try again.';
        this.isSubmitting = false;
        console.error('Error submitting review:', error);
      }
    });
  }
}

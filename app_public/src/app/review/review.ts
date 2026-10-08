import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { ReviewService, Review } from '../services/review.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-review',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './review.html'
})
export class ReviewComponent implements OnInit, OnDestroy {
  readonly minCommentLength = 5;
  readonly maxCommentLength = 500;
  readonly stars = [1, 2, 3, 4, 5];

  username = '';
  review = '';
  busNumber = '';
  rating = 0;
  reviews: Review[] = [];
  isLoggedIn = false;
  isSubmitting = false;
  isLoading = false;
  submitted = false;
  errorMessage = '';
  successMessage = '';

  private subscriptions = new Subscription();
  private successTimer?: ReturnType<typeof setTimeout>;

  constructor(
    private reviewService: ReviewService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Check if user is logged in
    this.subscriptions.add(
      this.authService.isAuthenticated$.subscribe(isAuth => {
        this.isLoggedIn = isAuth;

        if (this.isLoggedIn && !this.username) {
          // Pre-fill username if available
          this.username = this.authService.getUserName() || '';
        }
      })
    );

    // Load reviews
    this.loadReviews();

    // Subscribe to review updates
    this.subscriptions.add(
      this.reviewService.reviews$.subscribe(reviews => {
        this.reviews = reviews;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    if (this.successTimer) {
      clearTimeout(this.successTimer);
    }
  }

  get trimmedComment(): string {
    return this.review.trim();
  }

  get commentError(): string {
    const len = this.trimmedComment.length;
    if (len === 0) return 'Please write a comment.';
    if (len < this.minCommentLength) return `Comment must be at least ${this.minCommentLength} characters.`;
    if (this.review.length > this.maxCommentLength) return `Comment must be at most ${this.maxCommentLength} characters.`;
    return '';
  }

  get ratingError(): string {
    return this.rating >= 1 && this.rating <= 5 ? '' : 'Please choose a rating from 1 to 5 stars.';
  }

  get isFormValid(): boolean {
    return !this.commentError && !this.ratingError;
  }

  get averageRating(): number {
    if (this.reviews.length === 0) return 0;
    const total = this.reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0);
    return total / this.reviews.length;
  }

  setRating(star: number): void {
    this.rating = star;
  }

  loadReviews() {
    this.isLoading = true;
    this.subscriptions.add(
      this.reviewService.getReviews()
        .pipe(finalize(() => (this.isLoading = false)))
        .subscribe()
    );
  }

  addReview(form?: NgForm) {
    this.submitted = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.isFormValid) {
      return;
    }

    this.isSubmitting = true;

    const newReview: Review = {
      username: this.username.trim() || 'Anonymous',
      busNumber: this.busNumber.trim() || undefined,
      rating: this.rating,
      comment: this.trimmedComment
    };

    this.subscriptions.add(
      this.reviewService.addReview(newReview).subscribe({
        next: () => {
          // Clear form after successful submission
          this.review = '';
          this.busNumber = '';
          this.rating = 0;
          this.submitted = false;
          this.isSubmitting = false;
          form?.resetForm({ username: this.username, busNumber: '', review: '' });
          this.showSuccess('Thanks! Your review has been posted.');
        },
        error: (error) => {
          this.errorMessage = 'Failed to submit review. Please try again.';
          this.isSubmitting = false;
          console.error('Error submitting review:', error);
        }
      })
    );
  }

  private showSuccess(message: string): void {
    this.successMessage = message;
    if (this.successTimer) {
      clearTimeout(this.successTimer);
    }
    this.successTimer = setTimeout(() => (this.successMessage = ''), 3000);
  }
}

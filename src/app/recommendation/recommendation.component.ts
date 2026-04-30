import { NgForOf, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { combineLatest } from 'rxjs';
import { CollectionService } from '../services/collection.service';
import { Film, FilmService } from '../services/film.service';
import { FilmRecommendation, RecommendationService } from '../services/recommendation.service';
import { getProductFragmentById, getProductLinkById } from '../utils/special-product-links';

@Component({
  selector: 'app-recommendation',
  standalone: true,
  imports: [NgIf, NgForOf, RouterLink],
  templateUrl: './recommendation.component.html',
  styleUrls: ['./recommendation.component.scss'],
})
export class RecommendationComponent implements OnInit {
  readonly backendWakeupMessage = 'The backend might take a moment to wake up at first load....';
  readonly loadingMessage = 'Loading';
  readonly showDesktopBackendStatus = typeof window === 'undefined' || window.innerWidth > 768;
  readonly ratingStars = [1, 2, 3, 4, 5];
  readonly titleMaxLength = 38;
  readonly directorMaxLength = 26;
  recommendations: FilmRecommendation[] = [];
  collection: Film[] = [];
  allFilms: Film[] = [];
  isLoading = true;
  error: string | null = null;

  constructor(
    private collectionService: CollectionService,
    private filmService: FilmService,
    private recommendationService: RecommendationService
  ) {}

  ngOnInit(): void {
    combineLatest([
      this.collectionService.getCollection(),
      this.filmService.getAllFilms(),
    ]).subscribe({
      next: ([collection, films]) => {
        this.collection = collection;
        this.allFilms = films;
        this.recommendations = this.recommendationService.generateRecommendations(collection, films);
        this.isLoading = false;
        this.error = this.recommendations.length === 5 ? null : 'Unable to load recommendations right now.';
      },
      error: (error) => {
        console.error('Failed to load recommendations:', error);
        this.error = 'Unable to load recommendations right now.';
        this.isLoading = false;
      },
    });
  }

  scramble(): void {
    this.recommendations = this.recommendationService.generateRecommendations(this.collection, this.allFilms);
    this.error = this.recommendations.length === 5 ? null : 'Unable to load recommendations right now.';
  }

  getFilmLink(film: Film): string[] {
    return getProductLinkById(film.id);
  }

  getFilmFragment(film: Film): string | undefined {
    return getProductFragmentById(film.id);
  }

  getCommunityRatingValue(film: Film): number {
    return film.averageCommunityRating ?? 0;
  }

  shouldUseCoverFit(film: Film): boolean {
    const brandName = film.brand?.name?.trim().toLowerCase() ?? '';
    return brandName === 'bfi' || brandName === 'masters of cinema';
  }

  getStarFillPercentage(film: Film, star: number): number {
    const normalized = this.getCommunityRatingValue(film) - (star - 1);
    return Math.max(0, Math.min(100, normalized * 100));
  }

  truncateText(value: string | undefined | null, maxLength: number): string {
    const normalized = value?.trim() ?? '';

    if (normalized.length <= maxLength) {
      return normalized;
    }

    return `${normalized.slice(0, maxLength).trim()}...`;
  }

  trackByFilmId(_index: number, item: FilmRecommendation): number {
    return item.film.id;
  }
}

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Film } from './film.service';
import { normalizeFilmData } from '../utils/film-normalization';

@Injectable({
  providedIn: 'root',
})
export class CollectionService {
  private collection: Film[] = [];
  private collection$ = new BehaviorSubject<Film[]>([]);

  constructor() {
    const stored = localStorage.getItem('collection');
    if (stored) {
      this.collection = JSON.parse(stored).map((film: Film) => normalizeFilmData(film));
      this.persistCollection();
    }
  }

  getCollection() {
    return this.collection$.asObservable();
  }

  addToCollection(film: Film) {
    if (!this.collection.find((f) => f.id === film.id)) {
      this.collection.push({
        ...normalizeFilmData(film),
        userRating: film.userRating ?? null,
      });
      this.persistCollection();
    }
  }

  syncStoredItem(film: Film): void {
    const index = this.collection.findIndex((item) => item.id === film.id);
    if (index === -1) {
      return;
    }

    this.collection[index] = {
      ...normalizeFilmData(film),
      userRating: film.userRating ?? this.collection[index].userRating ?? null,
    };
    this.persistCollection();
  }

  removeFromCollection(filmId: number) {
    this.collection = this.collection.filter(f => f.id !== filmId);
    this.persistCollection();
  }

  isInCollection(filmId: number): boolean {
    return this.collection.some(f => f.id === filmId);
  }

  getRating(filmId: number): number {
    return this.collection.find(f => f.id === filmId)?.userRating ?? 0;
  }

  rateFilm(filmId: number, rating: number): void {
    const index = this.collection.findIndex(f => f.id === filmId);
    if (index === -1 || rating < 1 || rating > 5) {
      return;
    }

    this.collection[index] = {
      ...this.collection[index],
      userRating: rating,
    };

    this.persistCollection();
  }

  private persistCollection(): void {
    this.collection$.next([...this.collection]);
    localStorage.setItem('collection', JSON.stringify(this.collection));
  }
}

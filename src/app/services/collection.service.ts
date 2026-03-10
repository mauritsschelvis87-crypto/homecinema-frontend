import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Film } from './film.service';

@Injectable({
  providedIn: 'root',
})
export class CollectionService {
  private collection: Film[] = [];
  private collection$ = new BehaviorSubject<Film[]>([]);

  constructor() {
    const stored = localStorage.getItem('collection');
    if (stored) {
      this.collection = JSON.parse(stored);
      this.collection$.next(this.collection);
    }
  }

  getCollection() {
    return this.collection$.asObservable();
  }

  addToCollection(film: Film) {
    if (!this.collection.find((f) => f.id === film.id)) {
      this.collection.push(film);
      this.collection$.next(this.collection);
      localStorage.setItem('collection', JSON.stringify(this.collection));
    }
  }

  syncStoredItem(film: Film): void {
    const index = this.collection.findIndex((item) => item.id === film.id);
    if (index === -1) {
      return;
    }

    this.collection[index] = film;
    this.collection$.next([...this.collection]);
    localStorage.setItem('collection', JSON.stringify(this.collection));
  }

  removeFromCollection(filmId: number) {
    this.collection = this.collection.filter(f => f.id !== filmId);
    this.collection$.next(this.collection);
    localStorage.setItem('collection', JSON.stringify(this.collection));
  }

  isInCollection(filmId: number): boolean {
    return this.collection.some(f => f.id === filmId);
  }
}

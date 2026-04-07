import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Film } from './film.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private wishlist: Film[] = [];
  private wishlistSubject = new BehaviorSubject<Film[]>([]);
  wishlist$ = this.wishlistSubject.asObservable();
  private readonly specialWishlistStorageKey = 'specialWishlist';

  private baseUrl = `${environment.apiUrl}/wishlist`;
  private userId = 1;

  constructor(private http: HttpClient) {
    this.wishlist = this.getStoredSpecialWishlist();
    this.wishlistSubject.next([...this.wishlist]);
  }

  loadWishlistFromServer(): void {
    this.http.get<Film[]>(`${this.baseUrl}/${this.userId}`).subscribe({
      next: (films) => {
        this.wishlist = this.mergeWishlist(films);
        this.wishlistSubject.next([...this.wishlist]);
      },
      error: (err) => console.error('Wishlist ophalen mislukt:', err)
    });
  }

  addToWishlist(film: Film): void {
    if (this.isSpecialWishlistItem(film.id)) {
      if (!this.wishlist.some(item => item.id === film.id)) {
        const specialItems = [...this.getStoredSpecialWishlist(), film];
        this.persistSpecialWishlist(specialItems);
        this.wishlist = this.mergeWishlist(this.wishlist.filter(item => !this.isSpecialWishlistItem(item.id)));
        this.wishlistSubject.next([...this.wishlist]);
      }
      return;
    }

    console.log('🟢 addToWishlist aangeroepen met film:', film);
    console.log('📦 Film ID:', film?.id);
    console.log('🌐 Request URL:', `${this.baseUrl}/${this.userId}/add/${film?.id}`);

    this.http.post<Film[]>(`${this.baseUrl}/${this.userId}/add/${film.id}`, {}).subscribe({
      next: (films) => {
        console.log('✅ Toevoegen gelukt, nieuwe wishlist:', films);
        this.wishlist = this.mergeWishlist(films);
        this.wishlistSubject.next([...this.wishlist]);
      },
      error: (err) => {
        console.error('❌ Toevoegen mislukt:', err);
      }
    });
  }

  syncStoredSpecialItem(film: Film): void {
    if (!this.isSpecialWishlistItem(film.id)) {
      return;
    }

    const specialItems = this.getStoredSpecialWishlist();
    const index = specialItems.findIndex((item) => item.id === film.id);

    if (index === -1) {
      return;
    }

    specialItems[index] = film;
    this.persistSpecialWishlist(specialItems);
    this.wishlist = this.mergeWishlist(this.wishlist.filter(item => !this.isSpecialWishlistItem(item.id)));
    this.wishlistSubject.next([...this.wishlist]);
  }

  removeFromWishlist(filmId: number): void {
    if (this.isSpecialWishlistItem(filmId)) {
      const specialItems = this.getStoredSpecialWishlist().filter(item => item.id !== filmId);
      this.persistSpecialWishlist(specialItems);
      this.wishlist = this.wishlist.filter(item => item.id !== filmId);
      this.wishlistSubject.next([...this.wishlist]);
      return;
    }

    this.http.delete<Film[]>(`${this.baseUrl}/${this.userId}/remove/${filmId}`).subscribe({
      next: (films) => {
        this.wishlist = this.mergeWishlist(films);
        this.wishlistSubject.next([...this.wishlist]);
      },
      error: (err) => console.error('Verwijderen mislukt:', err)
    });
  }

  isInWishlist(filmId: number): boolean {
    return this.wishlist.some(f => f.id === filmId);
  }

  getWishlist(): Film[] {
    return [...this.wishlist];
  }

  private isSpecialWishlistItem(filmId: number): boolean {
    return filmId >= 900000;
  }

  private getStoredSpecialWishlist(): Film[] {
    const stored = localStorage.getItem(this.specialWishlistStorageKey);
    return stored ? JSON.parse(stored) : [];
  }

  private persistSpecialWishlist(items: Film[]): void {
    localStorage.setItem(this.specialWishlistStorageKey, JSON.stringify(items));
  }

  private mergeWishlist(serverFilms: Film[]): Film[] {
    return [...serverFilms, ...this.getStoredSpecialWishlist()];
  }
}

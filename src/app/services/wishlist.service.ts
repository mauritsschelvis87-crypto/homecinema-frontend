import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Film } from './film.service';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private wishlist: Film[] = [];
  private wishlistSubject = new BehaviorSubject<Film[]>([]);
  wishlist$ = this.wishlistSubject.asObservable();

  private baseUrl = 'http://localhost:8080/api/wishlist';
  private userId = 1;

  constructor(private http: HttpClient) {}

  loadWishlistFromServer(): void {
    this.http.get<Film[]>(`${this.baseUrl}/${this.userId}`).subscribe({
      next: (films) => {
        this.wishlist = films;
        this.wishlistSubject.next([...films]);
      },
      error: (err) => console.error('Wishlist ophalen mislukt:', err)
    });
  }

  addToWishlist(film: Film): void {
    console.log('🟢 addToWishlist aangeroepen met film:', film);
    console.log('📦 Film ID:', film?.id);
    console.log('🌐 Request URL:', `${this.baseUrl}/${this.userId}/add/${film?.id}`);

    this.http.post<Film[]>(`${this.baseUrl}/${this.userId}/add/${film.id}`, {}).subscribe({
      next: (films) => {
        console.log('✅ Toevoegen gelukt, nieuwe wishlist:', films);
        this.wishlist = films;
        this.wishlistSubject.next([...films]);
      },
      error: (err) => {
        console.error('❌ Toevoegen mislukt:', err);
      }
    });
  }

  removeFromWishlist(filmId: number): void {
    this.http.delete<Film[]>(`${this.baseUrl}/${this.userId}/remove/${filmId}`).subscribe({
      next: (films) => {
        this.wishlist = films;
        this.wishlistSubject.next([...films]);
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
}

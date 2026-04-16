import { Component, OnInit } from '@angular/core';
import { WishlistService } from '../services/wishlist.service';
import { Film } from '../services/film.service';
import { CartService } from '../services/cart.service';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {RouterLink} from '@angular/router';
import {FormsModule} from '@angular/forms';
import { CollectionService } from '../services/collection.service';
import { FilmRegionValue, getFilmRegion, matchesFilmSearch, normalizeFilmRegion } from '../utils/film-search';
import { getProductFragmentById, getProductLinkById } from '../utils/special-product-links';
import { createFallbackMediaAssets, MediaAssets, MediaAssetsService } from '../services/media-assets.service';
import { findGiftCardByFilmId } from '../giftcards-page/giftcard-catalog';

@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.scss'],
  standalone: true,
  imports: [
    NgClass,
    RouterLink,
    NgIf,
    FormsModule,
    NgForOf,
  ]
})
export class WishlistComponent implements OnInit {
  readonly cardTitleMaxLength = 15;
  readonly ratingStars = [1, 2, 3, 4, 5];
  readonly regionOptions: FilmRegionValue[] = ['A', 'B', 'Free'];
  wishlist: Film[] = [];
  filteredWishlist: Film[] = [];
  loading = false;
  mediaAssets: MediaAssets = createFallbackMediaAssets();

  allCountries: string[] = [];
  allDirectors: string[] = [];
  allYears: number[] = [];
  allTypes: string[] = [];
  allBrands: string[] = [];

  filteredCountries: string[] = [];
  filteredDirectors: string[] = [];
  filteredYears: number[] = [];
  filteredTypes: string[] = [];
  filteredBrands: string[] = [];

  filters = {
    title: '',
    country: '',
    region: '',
    director: '',
    year: '',
    type: '',
    brand: ''
  };

  showGrid = true;

  constructor(
    private wishlistService: WishlistService,
    private cartService: CartService,
    private collectionService: CollectionService,
    private mediaAssetsService: MediaAssetsService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.mediaAssetsService.getMediaAssets().subscribe((assets) => {
      this.mediaAssets = assets;
    });

    this.wishlistService.loadWishlistFromServer();
    this.wishlistService.wishlist$.subscribe(films => {
      this.loading = false;
      this.wishlist = films.sort((a, b) => a.title.localeCompare(b.title));
      this.filteredWishlist = [...this.wishlist];

      this.allCountries = [...new Set(films.map(f => f.country))].sort();
      this.allDirectors = [...new Set(films.map(f => f.director))].sort();
      this.allYears = [...new Set(films.map(f => f.year))].sort((a, b) => a - b);
      this.allTypes = [...new Set(films.map(f => f.type))].sort();
      this.allBrands = [...new Set(films.map(f => f.brand?.name).filter(Boolean))].sort();

      this.resetDropdowns();
    });
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  private applyFilters(): void {
    // 1) Filter films
    this.filteredWishlist = this.wishlist.filter(film =>
      (!this.filters.title   || matchesFilmSearch(film, this.filters.title)) &&
      (!this.filters.country || film.country === this.filters.country) &&
      (!this.filters.region  || getFilmRegion(film) === normalizeFilmRegion(this.filters.region)) &&
      (!this.filters.director|| film.director === this.filters.director) &&
      (!this.filters.year    || film.year.toString() === this.filters.year) &&
      (!this.filters.type    || film.type === this.filters.type) &&
      (!this.filters.brand   || film.brand?.name === this.filters.brand)
    ).sort((a, b) => a.title.localeCompare(b.title));

    this.updateDropdowns();
  }

  private updateDropdowns(): void {
    const c = new Set<string>();
    const d = new Set<string>();
    const y = new Set<number>();
    const t = new Set<string>();
    const b = new Set<string>();

    this.filteredWishlist.forEach(film => {
      c.add(film.country);
      d.add(film.director);
      y.add(film.year);
      if (film.type) t.add(film.type);
      if (film.brand?.name) b.add(film.brand.name);
    });

    this.filteredCountries = [...c].sort();
    this.filteredDirectors = [...d].sort();
    this.filteredYears = [...y].sort((a, b) => a - b);
    this.filteredTypes = [...t].sort();
    this.filteredBrands = [...b].sort();

    if (this.filters.country && !c.has(this.filters.country))   this.filters.country = '';
    if (this.filters.director && !d.has(this.filters.director)) this.filters.director = '';
    if (this.filters.year && !y.has(+this.filters.year))        this.filters.year = '';
    if (this.filters.type && !t.has(this.filters.type))         this.filters.type = '';
    if (this.filters.brand && !b.has(this.filters.brand))       this.filters.brand = '';
  }

  private resetDropdowns(): void {
    this.filteredCountries = [...this.allCountries];
    this.filteredDirectors = [...this.allDirectors];
    this.filteredYears = [...this.allYears];
    this.filteredTypes = [...this.allTypes];
    this.filteredBrands = [...this.allBrands];
  }

  resetFilters(): void {
    this.filters = { title:'', country:'', region:'', director:'', year:'', type:'', brand:'' };
    this.filteredWishlist = [...this.wishlist];
    this.resetDropdowns();
  }

  toggleView(): void {
    this.showGrid = !this.showGrid;
  }

  remove(filmId: number): void {
    this.wishlistService.removeFromWishlist(filmId);
  }

  addToCart(film: Film): void {
    this.cartService.addToCart(film);
    this.remove(film.id);
  }

  getFilmLink(film: Film): string[] {
    return getProductLinkById(film.id);
  }

  getFilmFragment(film: Film): string | undefined {
    return getProductFragmentById(film.id);
  }

  getFilmImageUrl(film: Film): string {
    const giftCard = findGiftCardByFilmId(film.id);

    if (!giftCard) {
      return film.imageUrl;
    }

    return this.mediaAssets.gifts[giftCard.assetKey] ?? giftCard.assetKey;
  }

  truncateTitle(title: string): string {
    return title.length > this.cardTitleMaxLength
      ? `${title.slice(0, this.cardTitleMaxLength).trim()}...`
      : title;
  }

  isInCollection(filmId: number): boolean {
    return this.collectionService.isInCollection(filmId);
  }

  setRating(event: MouseEvent, film: Film, star: number): void {
    event.preventDefault();
    event.stopPropagation();
    const rating = this.resolveRatingFromPointer(event, star);
    this.collectionService.rateFilm(film.id, rating);
    film.userRating = rating;
  }

  getStarFillPercentage(film: Film, star: number): number {
    return this.getFillPercentage(this.collectionService.getRating(film.id), star);
  }

  getFilmRegionValue(film: Film): FilmRegionValue | null {
    return getFilmRegion(film);
  }

  private resolveRatingFromPointer(event: MouseEvent, star: number): number {
    const button = event.currentTarget as HTMLElement | null;
    const bounds = button?.getBoundingClientRect();

    if (!bounds) {
      return star;
    }

    return event.clientX - bounds.left < bounds.width / 2 ? star - 0.5 : star;
  }

  private getFillPercentage(rating: number | null | undefined, star: number): number {
    const normalized = (rating ?? 0) - (star - 1);
    return Math.max(0, Math.min(100, normalized * 100));
  }
}

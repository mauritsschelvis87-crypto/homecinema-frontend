import { Component, OnInit } from '@angular/core';
import { CollectionService } from '../services/collection.service';
import { Film, FilmService } from '../services/film.service';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilmRegionValue, getFilmRegion, normalizeFilmRegion } from '../utils/film-search';
import { BoxsetService } from '../services/boxset.service';
import { forkJoin } from 'rxjs';
import { getProductFragmentById, getProductLinkById } from '../utils/special-product-links';

@Component({
  selector: 'app-collection',
  standalone: true,
  imports: [NgForOf, NgIf, NgClass, FormsModule, RouterLink],
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.scss']
})
export class CollectionComponent implements OnInit {
  readonly cardTitleMaxLength = 15;
  readonly ratingStars = [1, 2, 3, 4, 5];
  readonly regionOptions: FilmRegionValue[] = ['A', 'B', 'Free'];
  collection: Film[] = [];
  filteredCollection: Film[] = [];
  loading = true;
  showGrid = true;
  private hasRefreshedStoredItems = false;

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

  constructor(
    private collectionService: CollectionService,
    private route: ActivatedRoute,
    private filmService: FilmService,
    private boxsetService: BoxsetService
  ) {}

  ngOnInit(): void {
    this.collectionService.getCollection().subscribe(films => {
      this.collection = films.sort((a, b) => a.title.localeCompare(b.title));
      this.initFilters();
      this.applyQueryParam();
      this.loading = false;

      if (films.length > 0 && !this.hasRefreshedStoredItems) {
        this.hasRefreshedStoredItems = true;
        this.refreshStoredCollectionItems(films);
      }
    });
  }

  private refreshStoredCollectionItems(storedFilms: Film[]): void {
    forkJoin({
      films: this.filmService.getAllFilms(),
      boxsets: this.boxsetService.getBoxsets(),
    }).subscribe({
      next: ({ films, boxsets }) => {
        const latestById = new Map<number, Film>();

        films.forEach((film) => latestById.set(film.id, film));
        boxsets.forEach((boxset) => latestById.set(boxset.product.id, boxset.product));

        storedFilms.forEach((storedFilm) => {
          const latestFilm = latestById.get(storedFilm.id);
          if (latestFilm) {
            this.collectionService.syncStoredItem(latestFilm);
          }
        });
      },
      error: (error) => {
        console.error('Failed to refresh stored collection items:', error);
      },
    });
  }

  private initFilters() {
    this.filteredCollection = [...this.collection];
    this.allCountries   = Array.from(new Set(this.collection.map(f => f.country))).sort();
    this.allDirectors   = Array.from(new Set(this.collection.map(f => f.director))).sort();
    this.allYears       = Array.from(new Set(this.collection.map(f => f.year))).sort((a,b)=>a-b);
    this.allTypes       = Array.from(new Set(this.collection.map(f => f.type))).sort();
    this.allBrands      = Array.from(new Set(this.collection.map(f => f.brand?.name).filter(Boolean))).sort();
    this.resetDropdowns();
  }

  private applyQueryParam() {
    this.route.queryParams.subscribe(params => {
      const q = (params['q'] || '').toLowerCase();
      if (!q) return;
      this.filters.title = q;
      this.filters.director = q;
      this.filters.country = q;
      this.filters.year = q;
      // Pas filtering toe
      this.onFilterChange();
    });
  }

  onFilterChange(): void {
    this.filteredCollection = this.collection.filter(f =>
      (!this.filters.title    || f.title.toLowerCase().includes(this.filters.title.toLowerCase())) &&
      (!this.filters.country  || f.country.toLowerCase()  === this.filters.country.toLowerCase()) &&
      (!this.filters.region   || getFilmRegion(f) === normalizeFilmRegion(this.filters.region)) &&
      (!this.filters.director || f.director.toLowerCase() === this.filters.director.toLowerCase()) &&
      (!this.filters.year     || f.year.toString() === this.filters.year) &&
      (!this.filters.type     || f.type     === this.filters.type) &&
      (!this.filters.brand    || f.brand?.name === this.filters.brand)
    );
    this.resetDropdownsFiltered();
  }

  resetFilters(): void {
    this.filters = { title:'', country:'', region:'', director:'', year:'', type:'', brand:'' };
    this.filteredCollection = [...this.collection];
    this.resetDropdowns();
  }

  private resetDropdowns() {
    this.filteredCountries  = [...this.allCountries];
    this.filteredDirectors  = [...this.allDirectors];
    this.filteredYears      = [...this.allYears];
    this.filteredTypes      = [...this.allTypes];
    this.filteredBrands     = [...this.allBrands];
  }

  private resetDropdownsFiltered() {
    this.filteredCountries  = Array.from(new Set(this.filteredCollection.map(f => f.country))).sort();
    this.filteredDirectors  = Array.from(new Set(this.filteredCollection.map(f => f.director))).sort();
    this.filteredYears      = Array.from(new Set(this.filteredCollection.map(f => f.year))).sort((a,b)=>a-b);
    this.filteredTypes      = Array.from(new Set(this.filteredCollection.map(f => f.type))).sort();
    this.filteredBrands     = Array.from(new Set(this.filteredCollection.map(f => f.brand?.name).filter(Boolean))).sort();
  }

  toggleView(): void {
    this.showGrid = !this.showGrid;
  }

  getFilmLink(film: Film): string[] {
    return getProductLinkById(film.id);
  }

  getFilmFragment(film: Film): string | undefined {
    return getProductFragmentById(film.id);
  }

  setRating(event: MouseEvent, film: Film, star: number): void {
    event.preventDefault();
    event.stopPropagation();
    const rating = this.resolveRatingFromPointer(event, star);
    this.collectionService.rateFilm(film.id, rating);
    film.userRating = rating;
  }

  getStarFillPercentage(film: Film, star: number): number {
    return this.getFillPercentage(film.userRating, star);
  }

  truncateTitle(title: string): string {
    return title.length > this.cardTitleMaxLength
      ? `${title.slice(0, this.cardTitleMaxLength).trim()}...`
      : title;
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

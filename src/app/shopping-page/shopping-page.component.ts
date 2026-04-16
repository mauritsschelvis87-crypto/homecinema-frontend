import { Component, OnInit } from '@angular/core';
import { Film, FilmService }     from '../services/film.service';
import { ActivatedRoute }        from '@angular/router';
import { RouterLink }            from '@angular/router';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { FormsModule }           from '@angular/forms';
import { CollectionService } from '../services/collection.service';
import { FilmRegionValue, getFilmRegion, matchesFilmSearch, normalizeFilmRegion } from '../utils/film-search';
import { matchesDirectorSlug, reverseDirectorName } from '../utils/director-filter';

@Component({
  selector: 'app-shopping-page',
  standalone: true,
  imports: [RouterLink, NgForOf, NgIf, FormsModule, NgClass],
  templateUrl: './shopping-page.component.html',
  styleUrls: ['./shopping-page.component.scss']
})
export class ShoppingPageComponent implements OnInit {
  readonly cardTitleMaxLength = 15;
  readonly ratingStars = [1, 2, 3, 4, 5];
  readonly regionOptions: FilmRegionValue[] = ['A', 'B', 'Free'];
  allFilms: Film[]      = [];
  filteredFilms: Film[] = [];
  visibleFilms: Film[]  = [];

  loading     = true;
  loadingMore = false;

  uniqueCountries: string[] = [];
  uniqueDirectors: string[] = [];
  directorMap    = new Map<string,string>();
  uniqueYears: number[]     = [];
  uniqueTypes: string[]     = [];
  uniqueBrands: string[]    = [];

  filteredCountries: string[] = [];
  filteredDirectors: string[] = [];
  filteredYears: number[]     = [];
  filteredTypes: string[]     = [];
  filteredBrands: string[]    = [];

  filters = {
    title:    '',
    country:  '',
    region:   '',
    director: '',
    year:     '',
    type:     '',
    brand:    '',
    colorOrBlackAndWhite: ''
  };

  silentOnly = false;
  directorSlugFilter = '';
  routeDirectorValue = '';

  showGrid   = true;
  batchSize  = 24;
  currentPage= 0;

  constructor(
    private filmService: FilmService,
    private route: ActivatedRoute,
    private collectionService: CollectionService
  ) {}

  ngOnInit(): void {
    this.filmService.getAllFilms().subscribe({
      next: data => {
        // sort by title ignoring leading “The ”
        this.allFilms = data.sort((a,b) =>
          this.normalizeTitle(a.title).localeCompare(this.normalizeTitle(b.title))
        );
        // extract master filter sets
        const cSet = new Set<string>();
        const dSet = new Set<string>();
        const ySet = new Set<number>();
        const tSet = new Set<string>();
        const bSet = new Set<string>();

        data.forEach(f => {
          f.country?.split(/[,/]/).map(c=>c.trim()).forEach(c=>c&&cSet.add(c));
          if (f.director) {
            const rev = reverseDirectorName(f.director);
            this.directorMap.set(rev,f.director);
            dSet.add(rev);
          }
          ySet.add(f.year);
          f.type && tSet.add(f.type);
          f.brand?.name && bSet.add(f.brand.name);
        });

        this.uniqueCountries  = [...cSet].sort();
        this.uniqueDirectors  = [...dSet].sort();
        this.uniqueYears      = [...ySet].sort((a,b)=>a-b);
        this.uniqueTypes      = [...tSet].sort();
        this.uniqueBrands     = [...bSet].sort();

        this.resetDropdowns();

        this.route.queryParams.subscribe(params => {
          this.applyRouteFilters(params);
          this.applyFilters();
          this.loading = false;
        });
      },
      error: err => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  normalizeTitle(t: string)   { return t.toLowerCase().replace(/^the\s+/i,''); }
  trackByFilmId(_:number, f:Film) { return f.id; }

  toggleSilentOnly() {
    this.silentOnly = !this.silentOnly;
    this.applyFilters();
  }

  yearMatches(y:number, flt:string):boolean {
    if (!flt) return true;
    if (flt.includes('-')) {
      const [s,e] = flt.split('-').map(Number);
      return y>=s && y<=e;
    }
    return y===+flt;
  }

  onFilterChange() {
    if (this.directorSlugFilter && this.filters.director !== this.routeDirectorValue) {
      this.directorSlugFilter = '';
      this.routeDirectorValue = '';
    }
    this.applyFilters();
  }

  applyFilters() {
    this.filteredFilms = this.allFilms.filter(film => {
      const countries = film.country?.split(/[,/]/).map(c=>c.trim())||[];
      const selDir    = this.directorMap.get(this.filters.director)||'';
      const okSilent  = !this.silentOnly || !!film.silent;
      const okColor   = !this.filters.colorOrBlackAndWhite
        || film.colorOrBlackAndWhite === this.filters.colorOrBlackAndWhite;

      return okSilent
        && okColor
        && (!this.filters.title    || matchesFilmSearch(film, this.filters.title))
        && (!this.filters.country  || countries.includes(this.filters.country))
        && (!this.filters.region   || getFilmRegion(film) === normalizeFilmRegion(this.filters.region))
        && this.matchesDirectorFilter(film, selDir)
        && (!this.filters.year     || this.yearMatches(film.year,this.filters.year))
        && (!this.filters.type     || film.type===this.filters.type)
        && (!this.filters.brand    || film.brand?.name===this.filters.brand);
    });

    this.updateFilteredOptions();
    this.resetVisibleFilms();
  }

  updateFilteredOptions() {
    const cSet= new Set<string>(),
      dSet= new Set<string>(),
      ySet= new Set<number>(),
      tSet= new Set<string>(),
      bSet= new Set<string>();

    this.filteredFilms.forEach(f => {
      f.country?.split(/[,/]/).map(c=>c.trim()).forEach(c=>c&&cSet.add(c));
      if (f.director) {
        const rev = reverseDirectorName(f.director);
        dSet.add(rev);
        this.directorMap.set(rev,f.director);
      }
      ySet.add(f.year);
      f.type && tSet.add(f.type);
      f.brand?.name && bSet.add(f.brand.name);
    });

    this.filteredCountries  = [...cSet].sort();
    this.filteredDirectors  = [...dSet].sort();
    this.filteredYears      = [...ySet].sort((a,b)=>a-b);
    this.filteredTypes      = [...tSet].sort();
    this.filteredBrands     = [...bSet].sort();
  }

  resetVisibleFilms() {
    this.currentPage  = 1;
    this.visibleFilms = this.filteredFilms.slice(0,this.batchSize);
  }

  loadMore() {
    if (this.loadingMore) return;
    this.loadingMore = true;
    setTimeout(() => {
      this.currentPage++;
      const next = this.filteredFilms.slice(
        (this.currentPage-1)*this.batchSize,
        this.currentPage*this.batchSize
      );
      this.visibleFilms = [...this.visibleFilms,...next];
      this.loadingMore = false;
    },500);
  }

  resetDropdowns() {
    this.filteredCountries  = [...this.uniqueCountries];
    this.filteredDirectors  = [...this.uniqueDirectors];
    this.filteredYears      = [...this.uniqueYears];
    this.filteredTypes      = [...this.uniqueTypes];
    this.filteredBrands     = [...this.uniqueBrands];
  }

  resetFilters() {
    this.filters = {
      title:'', country:'', region:'', director:'', year:'', type:'', brand:'', colorOrBlackAndWhite:''
    };
    this.silentOnly= false;
    this.directorSlugFilter = '';
    this.routeDirectorValue = '';
    this.filteredFilms = [...this.allFilms];
    this.resetDropdowns();
    this.resetVisibleFilms();
  }

  toggleView(){ this.showGrid = !this.showGrid; }

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

  private applyRouteFilters(params: Record<string, string | undefined>): void {
    this.filters = {
      title: '',
      country: '',
      region: '',
      director: '',
      year: '',
      type: '',
      brand: '',
      colorOrBlackAndWhite: ''
    };
    this.silentOnly = params['silent'] === 'true';
    this.directorSlugFilter = params['directorSlug'] ?? '';

    if (params['colorOrBlackAndWhite']) {
      this.filters.colorOrBlackAndWhite = params['colorOrBlackAndWhite'];
    }

    ['type', 'country', 'region', 'brand', 'year', 'director', 'title', 'q']
      .forEach(fld => {
        if (params[fld]) {
          if (fld === 'q') {
            this.filters.title = params[fld]!;
          } else {
            (this.filters as any)[fld] = params[fld];
          }
        }
      });

    if (!this.filters.director && this.directorSlugFilter) {
      this.filters.director = this.getDirectorFilterLabel(this.directorSlugFilter);
    }

    this.routeDirectorValue = this.filters.director;
  }

  private getDirectorFilterLabel(slug: string): string {
    const exactMatch = this.uniqueDirectors.find(label => {
      const directorName = this.directorMap.get(label);
      return directorName ? matchesDirectorSlug(directorName, slug) : false;
    });

    return exactMatch ?? '';
  }

  private matchesDirectorFilter(film: Film, selectedDirector: string): boolean {
    if (this.directorSlugFilter) {
      return matchesDirectorSlug(film.director, this.directorSlugFilter);
    }

    return !this.filters.director || film.director === selectedDirector;
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

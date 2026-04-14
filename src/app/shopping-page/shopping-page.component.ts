import { Component, OnInit } from '@angular/core';
import { Film, FilmService }     from '../services/film.service';
import { ActivatedRoute }        from '@angular/router';
import { RouterLink }            from '@angular/router';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { FormsModule }           from '@angular/forms';
import { CollectionService } from '../services/collection.service';

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
    director: '',
    year:     '',
    type:     '',
    brand:    '',
    colorOrBlackAndWhite: ''
  };

  silentOnly = false;

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
            const rev = this.reverseName(f.director);
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
          if (params['silent'] !== undefined) {
            this.silentOnly = params['silent']==='true';
          }
          if (params['colorOrBlackAndWhite']) {
            this.filters.colorOrBlackAndWhite = params['colorOrBlackAndWhite'];
          }
          ['type','country','brand','year','director','title']
            .forEach(fld => {
              if (params[fld]) (this.filters as any)[fld] = params[fld];
            });
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
  reverseName(n: string)     {
    const p = n.trim().split(' ');
    if (p.length<2) return n;
    const l = p.pop();
    return `${l}, ${p.join(' ')}`;
  }
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

  onFilterChange() { this.applyFilters(); }

  applyFilters() {
    this.filteredFilms = this.allFilms.filter(film => {
      const countries = film.country?.split(/[,/]/).map(c=>c.trim())||[];
      const selDir    = this.directorMap.get(this.filters.director)||'';
      const okSilent  = !this.silentOnly || !!film.silent;
      const okColor   = !this.filters.colorOrBlackAndWhite
        || film.colorOrBlackAndWhite === this.filters.colorOrBlackAndWhite;

      return okSilent
        && okColor
        && (!this.filters.title    || film.title.toLowerCase().includes(this.filters.title.toLowerCase()))
        && (!this.filters.country  || countries.includes(this.filters.country))
        && (!this.filters.director || film.director===selDir)
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
        const rev = this.reverseName(f.director);
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
    this.filters   = {
      title:'', country:'', director:'', year:'', type:'', brand:'', colorOrBlackAndWhite:''
    };
    this.silentOnly= false;
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

  setRating(event: Event, film: Film, rating: number): void {
    event.preventDefault();
    event.stopPropagation();
    this.collectionService.rateFilm(film.id, rating);
    film.userRating = rating;
  }

  isStarFilled(film: Film, star: number): boolean {
    return star <= this.collectionService.getRating(film.id);
  }
}

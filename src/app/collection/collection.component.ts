import { Component, OnInit } from '@angular/core';
import { CollectionService } from '../services/collection.service';
import { Film } from '../services/film.service';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-collection',
  standalone: true,
  imports: [NgForOf, NgIf, NgClass, FormsModule, RouterLink],
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.scss']
})
export class CollectionComponent implements OnInit {
  collection: Film[] = [];
  filteredCollection: Film[] = [];
  loading = true;
  showGrid = true;
  private readonly specialBoxsetSlugs: Record<number, string> = {
    900001: 'bergman',
    900002: 'wong-kar-wai',
    900003: 'world-cinema-project',
    900004: 'john-cassavetes',
    900005: 'abbas-kiarostami',
  };

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
    director: '',
    year: '',
    type: '',
    brand: ''
  };

  constructor(
    private collectionService: CollectionService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.collectionService.getCollection().subscribe(films => {
      this.collection = films.sort((a, b) => a.title.localeCompare(b.title));
      this.initFilters();
      this.applyQueryParam();
      this.loading = false;
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
      (!this.filters.director || f.director.toLowerCase() === this.filters.director.toLowerCase()) &&
      (!this.filters.year     || f.year.toString() === this.filters.year) &&
      (!this.filters.type     || f.type     === this.filters.type) &&
      (!this.filters.brand    || f.brand?.name === this.filters.brand)
    );
    this.resetDropdownsFiltered();
  }

  resetFilters(): void {
    this.filters = { title:'', country:'', director:'', year:'', type:'', brand:'' };
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
    return film.id >= 900000
      ? ['/boxsets/special-edition']
      : ['/product', film.id.toString()];
  }

  getFilmFragment(film: Film): string | undefined {
    return this.specialBoxsetSlugs[film.id] ?? undefined;
  }
}

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FilmService, Film } from '../services/film.service';
import { CommonModule } from '@angular/common';
import { CollectionService } from '../services/collection.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  query = '';
  allFilms: Film[] = [];
  results: Film[] = [];

  constructor(
    private route: ActivatedRoute,
    private filmService: FilmService,
    private collectionService: CollectionService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.query = (params['q'] || '').toLowerCase();
      this.filmService.getAllFilms().subscribe(films => {
        this.allFilms = films;
        this.filterResults();
      });
    });
  }

  filterResults(): void {
    this.results = this.allFilms.filter(f =>
      f.title.toLowerCase().includes(this.query) ||
      f.director.toLowerCase().includes(this.query) ||
      f.country.toLowerCase().includes(this.query) ||
      f.year.toString().includes(this.query)
    );
  }

  isInCollection(filmId: number): boolean {
    return this.collectionService.isInCollection(filmId);
  }
}

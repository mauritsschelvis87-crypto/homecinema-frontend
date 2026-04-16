import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FilmService, Film } from '../services/film.service';
import { CommonModule } from '@angular/common';
import { CollectionService } from '../services/collection.service';
import { getFilmSearchScore } from '../utils/film-search';
import { getGiftCardSearchFilms } from '../giftcards-page/giftcard-catalog';
import { getProductFragmentById, getProductLinkById } from '../utils/special-product-links';
import {
  getSearchResultDetails,
  getSearchResultTitle,
} from '../utils/search-result-display';

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
        this.allFilms = [...films, ...getGiftCardSearchFilms()];
        this.filterResults();
      });
    });
  }

  filterResults(): void {
    this.results = this.allFilms
      .map((film) => ({ film, score: getFilmSearchScore(film, this.query) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score || a.film.title.localeCompare(b.film.title))
      .map(({ film }) => film);
  }

  isInCollection(filmId: number): boolean {
    return this.collectionService.isInCollection(filmId);
  }

  getProductLink(productId: number): string[] {
    return getProductLinkById(productId);
  }

  getProductFragment(productId: number): string | undefined {
    return getProductFragmentById(productId);
  }

  getResultTitle(film: Film): string {
    return getSearchResultTitle(film);
  }

  getResultDetails(film: Film): string[] {
    return getSearchResultDetails(film);
  }
}

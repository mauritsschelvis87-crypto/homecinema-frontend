import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FilmService, Film } from '../services/film.service';
import { DirectorService, Director } from '../services/director.service';
import { CollectionService } from '../services/collection.service';

import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-director-detail',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './director-detail.component.html',
  styleUrl: './director-detail.component.scss'
})
export class DirectorDetailComponent implements OnInit {
  readonly cardTitleMaxLength = 15;
  readonly ratingStars = [1, 2, 3, 4, 5];
  private readonly exploreDirectorImages: Record<string, string> = {
    'jean-luc-godard': '/assets/directors/jean_luc_godard.jpg',
    'powell-pressburger': '/assets/directors/michael_powell.jpg',
    'akira-kurosawa': '/assets/directors/akira_kurosawa.jpg',
    'jean-renoir': '/assets/directors/jean_renoir.jpg',
    'andrei-tarkovsky': '/assets/directors/andrei_tarkovsky.jpg',
    'friedrich-murnau': '/assets/directors/murnau.jpg',
    'friedrich-w-murnau': '/assets/directors/murnau.jpg',
  };

  director: Director | undefined;
  films: Film[] = [];
  directorName = '';
  currentSlug = '';
  shareUrl = '';

  constructor(
    private route: ActivatedRoute,
    private directorService: DirectorService,
    private filmService: FilmService,
    private collectionService: CollectionService
  ) {}

  ngOnInit(): void {
    const slug =
      this.route.snapshot.paramMap.get('slug') ??
      this.route.snapshot.paramMap.get('slugs');
    if (slug) {
      this.currentSlug = slug;
      this.shareUrl = typeof window !== 'undefined' ? window.location.href : '';
      this.directorService.getDirectorBySlug(slug).subscribe(d => {
        this.director = d;
        this.directorName = d?.name ?? this.directorName;
      });

      this.filmService.getAllFilms().subscribe(films => {
        this.films = films.filter(f => this.matchesDirectorSlug(f.director, slug));
        if (!this.directorName && this.films.length > 0) {
          this.directorName = this.films[0].director;
        }
      });
    }
  }

  private slugify(name: string): string {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\-]/g, '');
  }

  private matchesDirectorSlug(directorName: string, slug: string): boolean {
    const normalizedDirector = this.slugify(directorName);
    const aliases = this.getDirectorAliases(slug);
    if (aliases.includes(normalizedDirector)) {
      return true;
    }

    if (slug === 'powell-pressburger') {
      return normalizedDirector.includes('powell') || normalizedDirector.includes('pressburger');
    }

    if (slug === 'friedrich-murnau' || slug === 'friedrich-w-murnau') {
      return normalizedDirector.includes('murnau');
    }

    return false;
  }

  private getDirectorAliases(slug: string): string[] {
    const aliases = new Set<string>([slug]);

    if (slug === 'powell-pressburger') {
      aliases.add('michael-powell-emeric-pressburger');
      aliases.add('michael-powell-and-emeric-pressburger');
      aliases.add('powell-and-pressburger');
      aliases.add('powell--pressburger');
    }

    if (slug === 'friedrich-murnau' || slug === 'friedrich-w-murnau') {
      aliases.add('friedrich-w-murnau');
      aliases.add('friedrich-wilhelm-murnau');
      aliases.add('fw-murnau');
      aliases.add('f-w-murnau');
      aliases.add('fwmurnau');
      aliases.add('murnau');
    }

    return [...aliases];
  }

  get directorImage(): string {
    return this.exploreDirectorImages[this.currentSlug] || this.director?.image || '';
  }

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

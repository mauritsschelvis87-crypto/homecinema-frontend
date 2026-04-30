import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FilmService, Film } from '../services/film.service';
import { DirectorService, Director } from '../services/director.service';
import { MediaItem, MediaSliderComponent } from '../media-slider/media-slider.component';
import { CollectionService } from '../services/collection.service';
import { RouterLink } from '@angular/router';
import { matchesDirectorSlug, reverseDirectorName } from '../utils/director-filter';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-director-detail',
  standalone: true,
  imports: [RouterLink, MediaSliderComponent],
  templateUrl: './director-detail.component.html',
  styleUrl: './director-detail.component.scss'
})
export class DirectorDetailComponent implements OnInit {
  readonly backendWakeupMessage = 'The backend might take a moment to wake up at first load....';
  readonly pageLoadingMessage = 'Loading the directors page might take a bit longer.';
  readonly showDesktopBackendStatus = typeof window === 'undefined' || window.innerWidth > 768;
  director: Director | undefined;
  films: Film[] = [];
  mediaItems: MediaItem[] = [];
  directorName = '';
  currentSlug = '';
  shareUrl = '';
  loading = true;
  error = false;

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
    if (!slug) {
      this.error = true;
      this.loading = false;
      return;
    }

    this.currentSlug = slug;
    this.shareUrl = typeof window !== 'undefined' ? window.location.href : '';

    forkJoin({
      director: this.directorService.getDirectorBySlug(slug),
      films: this.filmService.getAllFilms(),
    }).subscribe({
      next: ({ director, films }) => {
        this.director = director;
        this.films = films.filter((film) => this.matchesDirectorSlug(film.director, slug));
        this.directorName = director?.name ?? this.films[0]?.director ?? '';
        this.mediaItems = this.buildMediaItems(this.films);
        this.error = !this.director;
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
      },
    });
  }

  private matchesDirectorSlug(directorName: string, slug: string): boolean {
    return matchesDirectorSlug(directorName, slug);
  }

  get directorImage(): string {
    return this.director?.image || '';
  }

  get discographyQueryParams(): { directorSlug: string; director?: string } {
    const firstFilmDirector = this.films[0]?.director;
    return {
      directorSlug: this.currentSlug,
      ...(firstFilmDirector ? { director: reverseDirectorName(firstFilmDirector) } : {})
    };
  }

  get ownedFilmCount(): number {
    return this.films.filter(film => this.collectionService.isInCollection(film.id)).length;
  }

  private buildMediaItems(films: Film[]): MediaItem[] {
    const items: MediaItem[] = [];
    const seen = new Set<string>();
    const firstTrailer = films.find(film => film.trailerUrl);

    if (firstTrailer) {
      const embedUrl = this.getEmbedUrl(firstTrailer.trailerUrl);
      if (embedUrl && !seen.has(embedUrl)) {
        seen.add(embedUrl);
        items.push({ type: 'video', url: embedUrl });
      }
    }

    films.forEach(film => {
      film.stills?.forEach(stillUrl => {
        if (!seen.has(stillUrl)) {
          seen.add(stillUrl);
          items.push({ type: 'image', url: stillUrl });
        }
      });
    });

    if (items.length <= 1) {
      films.forEach(film => {
        if (!seen.has(film.imageUrl)) {
          seen.add(film.imageUrl);
          items.push({ type: 'image', url: film.imageUrl });
        }
      });
    }

    return items.slice(0, 10);
  }

  private getEmbedUrl(url: string): string {
    const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/;
    const match = url.match(youtubeRegex);
    return match && match[1] ? `https://www.youtube.com/embed/${match[1]}` : url;
  }
}

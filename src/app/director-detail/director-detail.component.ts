import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FilmService, Film } from '../services/film.service';
import { DirectorService, Director } from '../services/director.service';
import { MediaItem, MediaSliderComponent } from '../media-slider/media-slider.component';
import { CollectionService } from '../services/collection.service';
import { RouterLink } from '@angular/router';
import { matchesDirectorSlug, reverseDirectorName } from '../utils/director-filter';

@Component({
  selector: 'app-director-detail',
  standalone: true,
  imports: [RouterLink, MediaSliderComponent],
  templateUrl: './director-detail.component.html',
  styleUrl: './director-detail.component.scss'
})
export class DirectorDetailComponent implements OnInit {
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
  mediaItems: MediaItem[] = [];
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
        this.mediaItems = this.buildMediaItems(this.films);
      });
    }
  }

  private matchesDirectorSlug(directorName: string, slug: string): boolean {
    return matchesDirectorSlug(directorName, slug);
  }

  get directorImage(): string {
    return this.exploreDirectorImages[this.currentSlug] || this.director?.image || '';
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

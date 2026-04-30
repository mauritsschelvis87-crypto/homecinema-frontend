import { Injectable } from '@angular/core';
import { catchError, forkJoin, map, Observable, shareReplay, tap, throwError } from 'rxjs';
import { BoxsetService } from './boxset.service';
import { DirectorService } from './director.service';
import { FilmService } from './film.service';
import { MediaAssets, MediaAssetsService } from './media-assets.service';

@Injectable({ providedIn: 'root' })
export class StartupPreloadService {
  private warmup$?: Observable<void>;

  constructor(
    private filmService: FilmService,
    private directorService: DirectorService,
    private boxsetService: BoxsetService,
    private mediaAssetsService: MediaAssetsService
  ) {}

  warmup(): Observable<void> {
    if (this.warmup$) {
      return this.warmup$;
    }

    this.warmup$ = forkJoin({
      films: this.filmService.primeCache(),
      directors: this.directorService.primeCache(),
      boxsets: this.boxsetService.primeCache(),
      mediaAssets: this.mediaAssetsService.primeCache(),
    }).pipe(
      tap(({ directors, boxsets, mediaAssets }) => {
        this.preloadImages([
          ...directors.map((director) => director.image),
          ...boxsets.flatMap((boxset) => [
            boxset.product.imageUrl,
            boxset.topImage,
            boxset.secondaryImage,
            ...boxset.mediaItems
              .filter((item) => item.type === 'image')
              .map((item) => item.url),
          ]),
          ...this.getMediaAssetUrls(mediaAssets),
        ]);
      }),
      map(() => void 0),
      catchError((error) => {
        this.warmup$ = undefined;
        return throwError(() => error);
      }),
      shareReplay(1)
    );

    return this.warmup$;
  }

  private preloadImages(urls: string[]): void {
    if (typeof window === 'undefined') {
      return;
    }

    const uniqueUrls = [...new Set(urls.filter((url) => !!url))];

    uniqueUrls.forEach((url) => {
      const image = new Image();
      image.decoding = 'async';
      image.src = url;
    });
  }

  private getMediaAssetUrls(mediaAssets: MediaAssets): string[] {
    return [
      ...Object.values(mediaAssets.covers),
      ...Object.values(mediaAssets.stills),
      ...Object.values(mediaAssets.directors),
      ...Object.values(mediaAssets.boxset),
      ...Object.values(mediaAssets.gifts),
    ];
  }
}

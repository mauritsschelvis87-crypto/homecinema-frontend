import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, finalize, map, of, shareReplay, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { readSessionCache, writeSessionCache } from '../utils/session-cache';

export interface MediaAssets {
  covers: Record<string, string>;
  stills: Record<string, string>;
  directors: Record<string, string>;
  boxset: Record<string, string>;
  gifts: Record<string, string>;
}

const fallbackMediaAssets: MediaAssets = {
  covers: {},
  boxset: {},
  gifts: {
    '/assets/gifts/digital-10.png': '/assets/gifts/digital-10.png',
    '/assets/gifts/digital-20.png': '/assets/gifts/digital-20.png',
    '/assets/gifts/digital-30.png': '/assets/gifts/digital-30.png',
    '/assets/gifts/digital-50.png': '/assets/gifts/digital-50.png',
    '/assets/gifts/digital-100.png': '/assets/gifts/digital-100.png',
    '/assets/gifts/physical-10.png': '/assets/gifts/physical-10.png',
    '/assets/gifts/physical-20.png': '/assets/gifts/physical-20.png',
    '/assets/gifts/physical-30.png': '/assets/gifts/physical-30.png',
    '/assets/gifts/10_euro.png': '/assets/gifts/10_euro.png',
    '/assets/gifts/20_euro.png': '/assets/gifts/20_euro.png',
    '/assets/gifts/30_euro.png': '/assets/gifts/30_euro.png',
    '/assets/gifts/50_euro.png': '/assets/gifts/50_euro.png',
    '/assets/gifts/100_euro.png': '/assets/gifts/100_euro.png',
    '/assets/gifts/10_pound.png': '/assets/gifts/10_pound.png',
    '/assets/gifts/20_pound.png': '/assets/gifts/20_pound.png',
    '/assets/gifts/30_pound.png': '/assets/gifts/30_pound.png',
    '/assets/gifts/50_pound.png': '/assets/gifts/50_pound.png',
    '/assets/gifts/100_pound.png': '/assets/gifts/100_pound.png',
    '/assets/gifts/dvd.png': '/assets/gifts/dvd.png',
    '/assets/gifts/blu-ray.png': '/assets/gifts/blu-ray.png',
    '/assets/gifts/4k-uhd.png': '/assets/gifts/4k-uhd.png',
  },
  stills: {
    '/assets/stills/Harold-Lloyd-Safety-Last-1923.jpg':
      'https://res.cloudinary.com/duurvelke/image/upload/v1776333945/Harold-Lloyd-Safety-Last-1923_nejs4g.jpg',
    '/assets/stills/vivre_sa_vie.jpg':
      'https://res.cloudinary.com/duurvelke/image/upload/v1776333950/vivre_sa_vie_my6k8f.jpg',
    '/assets/stills/Satyricon.jpg':
      'https://res.cloudinary.com/duurvelke/image/upload/v1776333947/Satyricon_pzlhab.jpg',
    '/assets/stills/nosferatu2-1922.jpg':
      'https://res.cloudinary.com/duurvelke/image/upload/v1776333945/nosferatu2-1922_fospnv.avif',
    '/assets/stills/red_shoes.jpg':
      'https://res.cloudinary.com/duurvelke/image/upload/v1776333947/red_shoes_bq2n5u.jpg',
    '/assets/stills/Hamlet2.jpg':
      'https://res.cloudinary.com/duurvelke/image/upload/v1776333944/Hamlet2_husszk.jpg',
  },
  directors: {
    '/assets/directors/jean_luc_godard.jpg':
      'https://res.cloudinary.com/duurvelke/image/upload/v1776337768/jean_luc_godard_slfq0f.jpg',
    '/assets/directors/michael_powell.jpg':
      'https://res.cloudinary.com/duurvelke/image/upload/v1776337770/michael_powell_qm9tz8.jpg',
    '/assets/directors/akira_kurosawa.jpg':
      'https://res.cloudinary.com/duurvelke/image/upload/v1776337755/akira_kurosawa_hwvxoa.jpg',
    '/assets/directors/jean_renoir.jpg':
      'https://res.cloudinary.com/duurvelke/image/upload/v1776337768/jean_renoir_uvojcw.jpg',
    '/assets/directors/andrei_tarkovsky.jpg':
      'https://res.cloudinary.com/duurvelke/image/upload/v1776337766/andrei_tarkovsky_qqswvq.jpg',
    '/assets/directors/murnau.jpg':
      'https://res.cloudinary.com/duurvelke/image/upload/v1776337770/murnau_hjmney.jpg',
  },
};

export function createFallbackMediaAssets(): MediaAssets {
  return {
    covers: { ...fallbackMediaAssets.covers },
    stills: { ...fallbackMediaAssets.stills },
    directors: { ...fallbackMediaAssets.directors },
    boxset: { ...fallbackMediaAssets.boxset },
    gifts: { ...fallbackMediaAssets.gifts },
  };
}

@Injectable({
  providedIn: 'root',
})
export class MediaAssetsService {
  private readonly apiUrl = `${environment.apiUrl}/media-assets`;
  private readonly storageKey = 'hcp-media-assets-cache-v1';
  private mediaAssetsCache: MediaAssets | null = readSessionCache<MediaAssets>(this.storageKey);
  private mediaAssetsRequest$?: Observable<MediaAssets>;

  constructor(private http: HttpClient) {}

  getMediaAssets(): Observable<MediaAssets> {
    if (this.mediaAssetsCache) {
      return of(this.mediaAssetsCache);
    }

    if (this.mediaAssetsRequest$) {
      return this.mediaAssetsRequest$;
    }

    this.mediaAssetsRequest$ = this.http.get<MediaAssets>(this.apiUrl).pipe(
      map((assets) => mergeMediaAssets(fallbackMediaAssets, assets)),
      tap((assets) => {
        this.mediaAssetsCache = assets;
        writeSessionCache(this.storageKey, assets);
      }),
      catchError(() => of(createFallbackMediaAssets())),
      finalize(() => {
        this.mediaAssetsRequest$ = undefined;
      }),
      shareReplay(1)
    );

    return this.mediaAssetsRequest$;
  }

  primeCache(): Observable<MediaAssets> {
    return this.getMediaAssets();
  }
}

function mergeMediaAssets(fallback: MediaAssets, incoming: MediaAssets | null | undefined): MediaAssets {
  return {
    covers: mergeCategory(fallback.covers, incoming?.covers),
    stills: mergeCategory(fallback.stills, incoming?.stills),
    directors: mergeCategory(fallback.directors, incoming?.directors),
    boxset: mergeCategory(fallback.boxset, incoming?.boxset),
    gifts: mergeCategory(fallback.gifts, incoming?.gifts),
  };
}

function mergeCategory(
  fallback: Record<string, string>,
  incoming: Record<string, string> | null | undefined
): Record<string, string> {
  const merged = { ...fallback };

  for (const [key, value] of Object.entries(incoming ?? {})) {
    if (value) {
      merged[key] = value;
    }
  }

  return merged;
}

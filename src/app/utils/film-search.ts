import { Film } from '../services/film.service';

export type FilmRegionValue = 'A' | 'B' | 'Free';

type RegionQuery = FilmRegionValue | null;

export function normalizeFilmRegion(region?: string | null): FilmRegionValue | null {
  const normalized = region?.trim().toLowerCase();

  if (normalized === 'a') {
    return 'A';
  }

  if (normalized === 'b') {
    return 'B';
  }

  if (normalized === 'free') {
    return 'Free';
  }

  return null;
}

export function getFilmRegion(film: Film): FilmRegionValue | null {
  if (film.type?.trim().toLowerCase() === '4k ultra hd') {
    return 'Free';
  }

  const explicitRegion = normalizeFilmRegion(film.region);
  if (explicitRegion) {
    return explicitRegion;
  }

  const brandName = film.brand?.name?.trim();
  if (brandName === 'Criterion Collection') {
    return 'A';
  }

  if (brandName === 'Masters of Cinema' || brandName === 'BFI') {
    return 'B';
  }

  return null;
}

function getRegionQuery(rawQuery: string): RegionQuery {
  const normalized = rawQuery.trim().toLowerCase();

  if (normalized === 'a' || normalized === 'region a') {
    return 'A';
  }

  if (normalized === 'b' || normalized === 'region b') {
    return 'B';
  }

  if (normalized === 'free' || normalized === 'region free' || normalized === 'region-free' || normalized === 'regionfree') {
    return 'Free';
  }

  return null;
}

export function matchesFilmSearch(film: Film, rawQuery: string): boolean {
  const query = rawQuery.trim().toLowerCase();
  if (!query) {
    return false;
  }

  const regionQuery = getRegionQuery(rawQuery);
  if (regionQuery) {
    return getFilmRegion(film) === regionQuery;
  }

  return film.title.toLowerCase().includes(query)
    || film.director.toLowerCase().includes(query)
    || film.country.toLowerCase().includes(query)
    || film.year.toString().includes(query)
    || film.brand?.name?.toLowerCase().includes(query)
    || film.type.toLowerCase().includes(query)
    || getFilmRegion(film)?.toLowerCase() === query;
}

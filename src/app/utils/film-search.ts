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
  return getFilmSearchScore(film, rawQuery) > 0;
}

export function getFilmSearchScore(film: Film, rawQuery: string): number {
  const query = rawQuery.trim().toLowerCase();
  if (!query) {
    return 0;
  }

  const regionQuery = getRegionQuery(rawQuery);
  if (regionQuery) {
    return getFilmRegion(film) === regionQuery ? 100 : 0;
  }

  const title = film.title.toLowerCase();
  const director = film.director.toLowerCase();
  const country = film.country.toLowerCase();
  const brand = film.brand?.name?.toLowerCase() ?? '';
  const type = film.type.toLowerCase();
  const genre = film.genre.toLowerCase();
  const description = film.description.toLowerCase();
  const year = film.year.toString();
  const region = getFilmRegion(film)?.toLowerCase() ?? '';
  const searchTerms = film.searchTerms ?? [];

  let score = 0;

  score += getFieldSearchScore(title, query, 120, 90, 70);
  score += getFieldSearchScore(director, query, 60, 45, 35);
  score += getFieldSearchScore(genre, query, 55, 40, 30);
  score += getFieldSearchScore(type, query, 50, 35, 25);
  score += getFieldSearchScore(brand, query, 45, 30, 20);
  score += getFieldSearchScore(country, query, 40, 25, 15);
  score += getFieldSearchScore(description, query, 20, 0, 10);
  score += getFieldSearchScore(year, query, 30, 0, 20);
  score += getFieldSearchScore(region, query, 30, 0, 20);

  for (const term of searchTerms) {
    score += getFieldSearchScore(term.toLowerCase(), query, 70, 50, 40);
  }

  return score;
}

function getFieldSearchScore(
  value: string,
  query: string,
  exactScore: number,
  startsWithScore: number,
  includesScore: number
): number {
  if (!value) {
    return 0;
  }

  if (value === query) {
    return exactScore;
  }

  if (value.startsWith(query)) {
    return startsWithScore;
  }

  if (value.includes(query)) {
    return includesScore;
  }

  return 0;
}

import { Film } from '../services/film.service';

const COUNTRY_REPLACEMENTS: Record<string, string> = {
  'Verenigd Koninkrijk': 'United Kingdom',
};

export function normalizeFilmData(film: Film): Film {
  return {
    ...film,
    country: normalizeCountry(film.country),
  };
}

function normalizeCountry(country: string): string {
  return COUNTRY_REPLACEMENTS[country] ?? country;
}

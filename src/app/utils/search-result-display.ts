import { Film } from '../services/film.service';
import { getFilmRegion } from './film-search';
import { getProductDisplayTitle } from './product-display';
import { findGiftCardByFilmId } from '../giftcards-page/giftcard-catalog';

export function getSearchResultTitle(film: Film): string {
  return getProductDisplayTitle(film);
}

export function getSearchResultDetails(film: Film): string[] {
  const giftCard = findGiftCardByFilmId(film.id);

  if (giftCard) {
    return [
      'Giftcard',
      giftCard.priceLabel,
      giftCard.category === 'physical' ? 'Physical' : giftCard.formatLabel,
      giftCard.regionLabel,
    ];
  }

  const region = getFilmRegion(film);

  return [
    film.director,
    String(film.year),
    film.type,
    region ? `Region ${region}` : '',
  ]
    .filter(Boolean);
}

export function getSearchResultGiftCardRegionCode(film: Film): 'EU' | 'UK' | null {
  return findGiftCardByFilmId(film.id)?.regionCode ?? null;
}

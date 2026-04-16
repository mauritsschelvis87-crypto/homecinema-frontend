import { findGiftCardByFilmId } from '../giftcards-page/giftcard-catalog';

type DisplayBrand = {
  name?: string | null;
} | null | undefined;

export type DisplayProduct = {
  id: number | string;
  title: string;
  type?: string | null;
  brand?: DisplayBrand;
};

function getGiftCard(product: DisplayProduct) {
  return findGiftCardByFilmId(Number(product.id));
}

export function getProductDisplayTitle(product: DisplayProduct): string {
  const giftCard = getGiftCard(product);

  if (!giftCard) {
    return product.title;
  }

  return giftCard.category === 'gift-a-movie'
    ? `Gift a ${giftCard.formatLabel}`
    : giftCard.title;
}

export function getProductDisplayBrand(product: DisplayProduct): string {
  const giftCard = getGiftCard(product);

  if (!giftCard) {
    return product.brand?.name?.trim() || 'Unknown';
  }

  return giftCard.category === 'gift-a-movie'
    ? 'Gift a Movie'
    : 'Gift Card';
}

export function getProductDisplayType(product: DisplayProduct): string {
  const giftCard = getGiftCard(product);

  if (!giftCard) {
    return product.type?.trim() || 'Unknown';
  }

  return giftCard.regionCode === 'EU'
    ? 'Europe'
    : 'United Kingdom';
}

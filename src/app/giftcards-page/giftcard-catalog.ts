import { Film } from '../services/film.service';

export type GiftCardCategory = 'physical' | 'gift-a-movie';
export type GiftCardCurrency = 'EUR' | 'GBP';
export type GiftCardFormat = 'DVD' | 'Blu-ray' | '4K UHD';

export interface GiftCardCatalogItem {
  id: number;
  slug: string;
  assetKey: string;
  title: string;
  coverLabel: string;
  regionCode: 'EU' | 'UK';
  category: GiftCardCategory;
  categoryLabel: string;
  currency: GiftCardCurrency;
  currencyLabel: string;
  formatLabel: string;
  regionLabel: string;
  price: number;
  priceLabel: string;
  deliveryLabel: string;
  description: string;
  searchTerms: string[];
  gradientStart: string;
  gradientEnd: string;
}

const EUR_TO_GBP_RATE = 0.86935;

export const giftCardCatalog: GiftCardCatalogItem[] = [
  createPhysicalCard(910010, 'physical-eur-10', '/assets/gifts/10_euro.png', '10€ Gift Card', 'European countries', 10, 'EUR', '€10', '#5d0f0f', '#d1a441'),
  createPhysicalCard(910020, 'physical-eur-20', '/assets/gifts/20_euro.png', '20€ Gift Card', 'European countries', 20, 'EUR', '€20', '#1d2f5f', '#d9c36a'),
  createPhysicalCard(910030, 'physical-eur-30', '/assets/gifts/30_euro.png', '30€ Gift Card', 'European countries', 30, 'EUR', '€30', '#214238', '#d0a24c'),
  createPhysicalCard(910050, 'physical-eur-50', '/assets/gifts/50_euro.png', '50€ Gift Card', 'European countries', 50, 'EUR', '€50', '#3f1812', '#cf9c55'),
  createPhysicalCard(910100, 'physical-eur-100', '/assets/gifts/100_euro.png', '100€ Gift Card', 'European countries', 100, 'EUR', '€100', '#2f1f51', '#d7b96e'),
  createPhysicalCard(910110, 'physical-gbp-10', '/assets/gifts/10_pound.png', '10£ Gift Card', 'United Kingdom', 10, 'GBP', '£10', '#11243d', '#c9a34b'),
  createPhysicalCard(910120, 'physical-gbp-20', '/assets/gifts/20_pound.png', '20£ Gift Card', 'United Kingdom', 20, 'GBP', '£20', '#1e3a2b', '#ceb66b'),
  createPhysicalCard(910130, 'physical-gbp-30', '/assets/gifts/30_pound.png', '30£ Gift Card', 'United Kingdom', 30, 'GBP', '£30', '#3c1f14', '#d8aa5b'),
  createPhysicalCard(910150, 'physical-gbp-50', '/assets/gifts/50_pound.png', '50£ Gift Card', 'United Kingdom', 50, 'GBP', '£50', '#17263d', '#d6bc70'),
  createPhysicalCard(910200, 'physical-gbp-100', '/assets/gifts/100_pound.png', '100£ Gift Card', 'United Kingdom', 100, 'GBP', '£100', '#2a1838', '#d5b867'),
  createGiftMovie(910301, 'gift-movie-eu-dvd', '/assets/gifts/dvd.png', 'DVD', 'DVD', 'Europe', 24.5, 'EUR', '#4b1610', '#ca9950'),
  createGiftMovie(910302, 'gift-movie-eu-bluray', '/assets/gifts/blu-ray.png', 'Blu-ray', 'Blu-ray', 'Europe', 29.5, 'EUR', '#173153', '#d0b15e'),
  createGiftMovie(910303, 'gift-movie-eu-uhd', '/assets/gifts/4k-uhd.png', '4K UHD', '4K UHD', 'Europe', 34.5, 'EUR', '#1f1f24', '#d2b56d'),
  createGiftMovie(910401, 'gift-movie-uk-dvd', '/assets/gifts/dvd.png', 'DVD', 'DVD', 'United Kingdom', convertEuroToGbp(24.5), 'GBP', '#4b1610', '#ca9950'),
  createGiftMovie(910402, 'gift-movie-uk-bluray', '/assets/gifts/blu-ray.png', 'Blu-ray', 'Blu-ray', 'United Kingdom', convertEuroToGbp(29.5), 'GBP', '#173153', '#d0b15e'),
  createGiftMovie(910403, 'gift-movie-uk-uhd', '/assets/gifts/4k-uhd.png', '4K UHD', '4K UHD', 'United Kingdom', convertEuroToGbp(34.5), 'GBP', '#1f1f24', '#d2b56d'),
];

export function findGiftCardBySlug(slug: string): GiftCardCatalogItem | undefined {
  return giftCardCatalog.find((giftCard) => giftCard.slug === slug);
}

export function findGiftCardByFilmId(filmId: number): GiftCardCatalogItem | undefined {
  return giftCardCatalog.find((giftCard) => giftCard.id === filmId);
}

export function getGiftCardSlugByFilmId(filmId: number): string | undefined {
  return findGiftCardByFilmId(filmId)?.slug;
}

export function toGiftCardFilm(giftCard: GiftCardCatalogItem, imageUrl: string | null): Film {
  return {
    id: giftCard.id,
    title: giftCard.title,
    genre: giftCard.categoryLabel,
    director: giftCard.categoryLabel,
    country: giftCard.regionLabel,
    year: 2026,
    runtime: 0,
    price: giftCard.price,
    imageUrl: imageUrl ?? '',
    trailerUrl: '',
    aspectRatio: 'N/A',
    colorOrBlackAndWhite: 'Color',
    description: giftCard.description,
    brand: {
      id: 9100,
      name: 'Home Cinema Project Gifts',
    },
    type: giftCard.formatLabel,
    weight: giftCard.category === 'physical' ? 120 : 0,
    stills: [],
    silent: false,
    userRating: null,
    searchTerms: buildGiftCardSearchTerms(giftCard),
  };
}

export function getGiftCardSearchFilms(): Film[] {
  return giftCardCatalog.map((giftCard) => toGiftCardFilm(giftCard, giftCard.assetKey));
}

function createPhysicalCard(
  id: number,
  slug: string,
  assetKey: string,
  title: string,
  regionLabel: string,
  amount: number,
  currency: GiftCardCurrency,
  coverLabel: string,
  gradientStart: string,
  gradientEnd: string
): GiftCardCatalogItem {
  const priceLabel = formatPrice(amount, currency);

  return {
    id,
    slug,
    assetKey,
    title,
    coverLabel,
    regionCode: currency === 'EUR' ? 'EU' : 'UK',
    category: 'physical',
    categoryLabel: 'Physical Gift Card',
    currency,
    currencyLabel: currency === 'EUR' ? 'Euro' : 'Pound',
    formatLabel: 'Gift Card',
    regionLabel,
    price: amount,
    priceLabel,
    deliveryLabel: 'Shipping',
    description: currency === 'EUR'
      ? 'A physical gift card usable within (non UK) European countries.'
      : 'A physical gift card usable within the UK.',
    searchTerms: [
      title,
      regionLabel,
      'Gift Card',
      priceLabel,
      String(amount),
      currency === 'EUR' ? 'euro' : 'pound',
      'physical',
      'gift card',
    ],
    gradientStart,
    gradientEnd,
  };
}

function createGiftMovie(
  id: number,
  slug: string,
  assetKey: string,
  title: string,
  formatLabel: string,
  regionLabel: string,
  price: number,
  currency: GiftCardCurrency,
  gradientStart: string,
  gradientEnd: string
): GiftCardCatalogItem {
  const priceLabel = formatPrice(price, currency);

  return {
    id,
    slug,
    assetKey,
    title,
    coverLabel: formatLabel,
    regionCode: currency === 'EUR' ? 'EU' : 'UK',
    category: 'gift-a-movie',
    categoryLabel: 'Gift a Movie',
    currency,
    currencyLabel: currency === 'EUR' ? 'Euro' : 'Pound',
    formatLabel,
    regionLabel,
    price,
    priceLabel,
    deliveryLabel: 'Single-title gift code',
    description: `One ${formatLabel} gift for the ${regionLabel} catalogue.`,
    searchTerms: [
      title,
      formatLabel,
      regionLabel,
      priceLabel,
      currency === 'EUR' ? 'euro' : 'pound',
      'gift movie',
      'gift a movie',
    ],
    gradientStart,
    gradientEnd,
  };
}

function convertEuroToGbp(amount: number): number {
  return Math.round(amount * EUR_TO_GBP_RATE * 100) / 100;
}

function formatPrice(amount: number, currency: GiftCardCurrency): string {
  const symbol = currency === 'EUR' ? '€' : '£';
  const hasCents = Math.round(amount * 100) % 100 !== 0;
  return `${symbol}${hasCents ? amount.toFixed(2) : amount.toFixed(0)}`;
}

function buildGiftCardSearchTerms(giftCard: GiftCardCatalogItem): string[] {
  const formatLabel = giftCard.formatLabel.toLowerCase();

  return Array.from(new Set([
    ...giftCard.searchTerms,
    giftCard.categoryLabel,
    giftCard.currencyLabel,
    giftCard.regionLabel,
    giftCard.slug.replace(/-/g, ' '),
    'giftcard',
    'giftcards',
    'gift card',
    'gift cards',
    giftCard.category === 'gift-a-movie' ? `gift a ${formatLabel}` : '',
  ].filter(Boolean)));
}

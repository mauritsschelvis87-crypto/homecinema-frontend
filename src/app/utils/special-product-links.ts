import { getGiftCardSlugByFilmId } from '../giftcards-page/giftcard-catalog';

const SPECIAL_BOXSET_SLUGS: Record<number, string> = {
  900001: 'bergman',
  900002: 'wong-kar-wai',
  900003: 'world-cinema-project',
  900004: 'john-cassavetes',
  900005: 'abbas-kiarostami',
};

export function getProductLinkById(productId: number): string[] {
  const giftCardSlug = getGiftCardSlugByFilmId(productId);

  if (giftCardSlug) {
    return ['/giftcards/item', giftCardSlug];
  }

  if (SPECIAL_BOXSET_SLUGS[productId]) {
    return ['/boxsets/special-edition'];
  }

  return ['/product', productId.toString()];
}

export function getProductFragmentById(productId: number): string | undefined {
  return SPECIAL_BOXSET_SLUGS[productId];
}

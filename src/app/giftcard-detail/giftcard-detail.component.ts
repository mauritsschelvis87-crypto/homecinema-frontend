import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgClass, NgIf } from '@angular/common';
import { CartService } from '../services/cart.service';
import { WishlistService } from '../services/wishlist.service';
import { Film } from '../services/film.service';
import { createFallbackMediaAssets, MediaAssets, MediaAssetsService } from '../services/media-assets.service';
import { GiftCardCatalogItem, findGiftCardBySlug, toGiftCardFilm } from '../giftcards-page/giftcard-catalog';

@Component({
  selector: 'app-giftcard-detail',
  standalone: true,
  imports: [NgIf, NgClass],
  templateUrl: './giftcard-detail.component.html',
  styleUrls: ['./giftcard-detail.component.scss'],
})
export class GiftcardDetailComponent implements OnInit, OnDestroy {
  readonly backendWakeupMessage = 'The backend might take a moment to wake up at first load....';
  readonly loadingMessage = 'Loading';
  readonly showDesktopBackendStatus = typeof window === 'undefined' || window.innerWidth > 768;
  loading = true;
  error = false;
  giftCard!: GiftCardCatalogItem;
  giftFilm!: Film;
  detailMediaHeight = 0;
  wishlistHover = false;
  wishlistClickLock = false;
  shareUrl = '';
  mediaAssets: MediaAssets = createFallbackMediaAssets();
  private currentSlug = '';
  private resizeObserver?: ResizeObserver;
  private mediaElement?: ElementRef<HTMLElement>;

  @ViewChild('giftMediaStack')
  set giftMediaRef(value: ElementRef<HTMLElement> | undefined) {
    this.mediaElement = value;
    this.observeGiftMedia();
  }

  constructor(
    private route: ActivatedRoute,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private mediaAssetsService: MediaAssetsService
  ) {}

  ngOnInit(): void {
    this.mediaAssetsService.getMediaAssets().subscribe((assets) => {
      this.mediaAssets = assets;
      this.loadGiftCard();
    });

    this.route.paramMap.subscribe((params) => {
      this.currentSlug = params.get('slug') ?? '';
      this.loadGiftCard();
    });
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  addToCart(): void {
    if (!this.giftFilm) {
      return;
    }

    this.cartService.addToCart(this.giftFilm);
  }

  isInWishlist(): boolean {
    return !!this.giftFilm && this.wishlistService.isInWishlist(this.giftFilm.id);
  }

  toggleWishlist(): void {
    if (!this.giftFilm) {
      return;
    }

    if (this.isInWishlist()) {
      this.wishlistService.removeFromWishlist(this.giftFilm.id);
    } else {
      this.wishlistService.addToWishlist(this.giftFilm);
    }

    this.wishlistClickLock = true;
    setTimeout(() => {
      this.wishlistClickLock = false;
    }, 2000);
  }

  syncMediaHeight(): void {
    const media = this.mediaElement?.nativeElement;

    if (!media) {
      return;
    }

    this.detailMediaHeight = Math.round(media.getBoundingClientRect().height);
  }

  get detailTitle(): string {
    if (!this.giftCard) {
      return '';
    }

    return this.isGiftMovieCard(this.giftCard)
      ? `Gift a ${this.giftCard.formatLabel}`
      : this.giftCard.title;
  }

  get detailCategoryLabel(): string {
    if (!this.giftCard) {
      return '';
    }

    return this.isGiftMovieCard(this.giftCard)
      ? 'Physical Gift Card'
      : this.giftCard.categoryLabel;
  }

  get detailDeliveryLabel(): string {
    if (!this.giftCard) {
      return '';
    }

    return this.isGiftMovieCard(this.giftCard)
      ? 'Shipping'
      : this.giftCard.deliveryLabel;
  }

  get detailDescription(): string {
    if (!this.giftCard) {
      return '';
    }

    if (!this.isGiftMovieCard(this.giftCard)) {
      return this.giftCard.description;
    }

    return this.giftCard.regionCode === 'UK'
      ? `Not sure which movie to buy as a present? Let them choose for themselves with our ${this.detailTitle} option. It is usable within the UK.`
      : `Not sure which movie to buy as a present? Let them choose for themselves with our ${this.detailTitle} option. It is usable across European countries (no UK).`;
  }

  get detailRegionLabel(): string {
    if (!this.giftCard) {
      return '';
    }

    if (this.giftCard.regionCode === 'EU') {
      return 'European countries (no UK)';
    }

    if (!this.isGiftMovieCard(this.giftCard)) {
      return this.giftCard.regionLabel;
    }

    return 'United Kingdom (UK)';
  }

  private loadGiftCard(): void {
    if (!this.currentSlug) {
      return;
    }

    const giftCard = findGiftCardBySlug(this.currentSlug);

    if (!giftCard) {
      this.error = true;
      this.loading = false;
      return;
    }

    this.giftCard = giftCard;
    this.giftFilm = toGiftCardFilm(giftCard, this.giftImageUrl(giftCard));
    this.shareUrl = `https://jouwshop.nl/giftcards/item/${giftCard.slug}`;
    this.loading = false;
    this.error = false;
    this.syncMediaHeight();
  }

  private giftImageUrl(giftCard: GiftCardCatalogItem): string | null {
    return this.mediaAssets.gifts[giftCard.assetKey] ?? null;
  }

  private observeGiftMedia(): void {
    this.resizeObserver?.disconnect();

    const media = this.mediaElement?.nativeElement;

    if (!media) {
      return;
    }

    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.syncMediaHeight());
      this.resizeObserver.observe(media);
    }

    this.syncMediaHeight();
  }

  private isGiftMovieCard(giftCard: GiftCardCatalogItem): boolean {
    return giftCard.category === 'gift-a-movie';
  }
}

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrderService, Order } from '../services/order.service';
import { DatePipe, NgForOf, NgIf } from '@angular/common';
import { getDiscountSummaryLabel } from '../utils/discount-code-display';
import { CollectionService } from '../services/collection.service';
import { createFallbackMediaAssets, MediaAssets, MediaAssetsService } from '../services/media-assets.service';
import { findGiftCardByFilmId } from '../giftcards-page/giftcard-catalog';

@Component({
  selector: 'app-order-history-detail',
  templateUrl: './order-history-detail.component.html',
  imports: [NgIf, DatePipe, NgForOf],
  styleUrl: './order-history-detail.component.scss',
})
export class OrderHistoryDetailComponent implements OnInit {
  order: Order | null = null;
  isLoading = true;
  error: string | null = null;
  mediaAssets: MediaAssets = createFallbackMediaAssets();

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private collectionService: CollectionService,
    private mediaAssetsService: MediaAssetsService
  ) {}

  ngOnInit(): void {
    this.mediaAssetsService.getMediaAssets().subscribe((assets) => {
      this.mediaAssets = assets;
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.orderService.getOrderById(+id).subscribe({
        next: (data) => {
          this.order = data;

          this.order.orderItems.forEach(item => {
            if (!item.film.brand) {
              item.film.brand = { name: 'Onbekend' };
            }
            if (!item.film.type) {
              item.film.type = 'Onbekend';
            }


          });

          this.isLoading = false;
        },
        error: (err) => {
          const localOrder = this.orderService.getLocalOrderById(+id);
          if (localOrder) {
            this.order = localOrder;
            this.isLoading = false;
            return;
          }

          this.error = 'Bestelling niet gevonden.';
          this.isLoading = false;
        },
      });
    }
  }

  getSubtotal(): number {
    if (!this.order) {
      return 0;
    }

    if (this.order.subtotalPrice != null) {
      return this.order.subtotalPrice;
    }

    return this.order.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  getDiscountAmount(): number {
    if (!this.order) {
      return 0;
    }

    if (this.order.discountAmount != null) {
      return this.order.discountAmount;
    }

    return Math.max(0, this.getSubtotal() - (this.order.totalPrice ?? this.getSubtotal()));
  }

  getPaidAmount(): number {
    if (!this.order) {
      return 0;
    }

    return this.order.totalPrice ?? Math.max(0, this.getSubtotal() - this.getDiscountAmount());
  }

  hasDiscount(): boolean {
    return this.getDiscountAmount() > 0;
  }

  getDiscountLabel(): string {
    return getDiscountSummaryLabel(
      this.order?.appliedGiftCardCode,
      this.order?.appliedGiftCode
    );
  }

  getAppliedCodes(): string[] {
    const codes = [
      this.order?.appliedGiftCardCode,
      this.order?.appliedGiftCode,
    ].filter((code): code is string => Boolean(code));

    return [...new Set(codes)];
  }

  getProductImageUrl(product: { id: number | string; imageUrl: string }): string {
    const giftCard = findGiftCardByFilmId(Number(product.id));

    if (!giftCard) {
      return product.imageUrl;
    }

    return this.mediaAssets.gifts[giftCard.assetKey] ?? giftCard.assetKey;
  }

  isInCollection(filmId: number | string): boolean {
    return this.collectionService.isInCollection(Number(filmId));
  }
}

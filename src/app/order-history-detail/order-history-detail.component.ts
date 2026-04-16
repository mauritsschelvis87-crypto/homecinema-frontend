import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService, Order } from '../services/order.service';
import { DatePipe, NgForOf, NgIf } from '@angular/common';
import { getDiscountSummaryLabel } from '../utils/discount-code-display';
import { CollectionService } from '../services/collection.service';
import { createFallbackMediaAssets, MediaAssets, MediaAssetsService } from '../services/media-assets.service';
import { findGiftCardByFilmId } from '../giftcards-page/giftcard-catalog';
import { getProductDisplayBrand, getProductDisplayTitle, getProductDisplayType } from '../utils/product-display';
import { getProductFragmentById, getProductLinkById } from '../utils/special-product-links';

@Component({
  selector: 'app-order-history-detail',
  templateUrl: './order-history-detail.component.html',
  imports: [NgIf, DatePipe, NgForOf, RouterLink],
  styleUrl: './order-history-detail.component.scss',
})
export class OrderHistoryDetailComponent implements OnInit {
  order: Order | null = null;
  isLoading = true;
  error: string | null = null;
  mediaAssets: MediaAssets = createFallbackMediaAssets();
  returnRequestMode = false;
  submittedReturnItemCount: number | null = null;
  private selectedReturnItemIndexes = new Set<number>();

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
          this.resetReturnRequestState();

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
            this.resetReturnRequestState();
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

  getProductLink(product: { id: number | string }): string[] {
    return getProductLinkById(Number(product.id));
  }

  getProductFragment(product: { id: number | string }): string | undefined {
    return getProductFragmentById(Number(product.id));
  }

  getProductDisplayTitle(product: { id: number | string; title: string; type?: string; brand?: { name: string } }): string {
    return getProductDisplayTitle(product);
  }

  getProductDisplayBrand(product: { id: number | string; title: string; type?: string; brand?: { name: string } }): string {
    return getProductDisplayBrand(product);
  }

  getProductDisplayType(product: { id: number | string; title: string; type?: string; brand?: { name: string } }): string {
    return getProductDisplayType(product);
  }

  toggleReturnRequestMode(): void {
    this.returnRequestMode = !this.returnRequestMode;
    this.submittedReturnItemCount = null;

    if (!this.returnRequestMode) {
      this.selectedReturnItemIndexes.clear();
    }
  }

  cancelReturnRequest(): void {
    this.returnRequestMode = false;
    this.selectedReturnItemIndexes.clear();
  }

  onReturnItemSelectionChange(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.checked) {
      this.selectedReturnItemIndexes.add(index);
      return;
    }

    this.selectedReturnItemIndexes.delete(index);
  }

  isReturnItemSelected(index: number): boolean {
    return this.selectedReturnItemIndexes.has(index);
  }

  getSelectedReturnItemCount(): number {
    return this.selectedReturnItemIndexes.size;
  }

  submitReturnRequest(): void {
    const selectedCount = this.getSelectedReturnItemCount();

    if (!selectedCount) {
      return;
    }

    this.submittedReturnItemCount = selectedCount;
    this.returnRequestMode = false;
    this.selectedReturnItemIndexes.clear();
  }

  isInCollection(filmId: number | string): boolean {
    return this.collectionService.isInCollection(Number(filmId));
  }

  private resetReturnRequestState(): void {
    this.returnRequestMode = false;
    this.submittedReturnItemCount = null;
    this.selectedReturnItemIndexes.clear();
  }
}

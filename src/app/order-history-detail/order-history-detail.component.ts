import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService, Order } from '../services/order.service';
import { DatePipe, NgForOf, NgIf } from '@angular/common';
import { getDiscountSummaryLabel } from '../utils/discount-code-display';

@Component({
  selector: 'app-order-history-detail',
  templateUrl: './order-history-detail.component.html',
  imports: [NgIf, RouterLink, DatePipe, NgForOf],
  styleUrl: './order-history-detail.component.scss',
})
export class OrderHistoryDetailComponent implements OnInit {
  order: Order | null = null;
  isLoading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
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
}

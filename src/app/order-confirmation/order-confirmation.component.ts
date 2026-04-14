import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { Order, OrderService } from '../services/order.service';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  templateUrl: './order-confirmation.component.html',
  styleUrls: ['./order-confirmation.component.scss'],
  imports: [RouterLink, NgIf]
})
export class OrderConfirmationComponent implements OnInit {
  order: Order | null = null;
  errorMessage = '';

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    const latestOrderId = this.orderService.getLatestPlacedOrderId();
    if (!latestOrderId) {
      return;
    }

    this.orderService.getOrderById(latestOrderId).subscribe({
      next: order => {
        this.order = order;
      },
      error: err => {
        this.errorMessage = 'We could not load the final order totals.';
        console.error(err);
      },
    });
  }

  formatBackendAmount(amount: number): string {
    return `$${amount.toFixed(2)}`;
  }
}

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService, Order } from '../services/order.service';
import { DatePipe, NgForOf, NgIf } from '@angular/common';

@Component({
  selector: 'app-order-history-detail',
  templateUrl: './order-history-detail.component.html',
  imports: [NgIf, RouterLink, DatePipe, NgForOf],
  styleUrls: ['./order-history-detail.component.scss'],
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
          this.error = 'Bestelling niet gevonden.';
          this.isLoading = false;
        },
      });
    }
  }

  getTotal(): number {
    return this.order?.orderItems.reduce((sum, item) => sum + item.price, 0) || 0;
  }
}

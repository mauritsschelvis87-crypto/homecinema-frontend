import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { MediaSliderComponent } from '../media-slider/media-slider.component';
import { CartService } from '../services/cart.service';
import { WishlistService } from '../services/wishlist.service';
import { CollectionService } from '../services/collection.service';
import { Boxset, BoxsetService } from '../services/boxset.service';

@Component({
  selector: 'app-boxset-detail',
  standalone: true,
  imports: [NgFor, NgIf, NgClass, MediaSliderComponent],
  templateUrl: './boxset-detail.component.html',
  styleUrls: ['./boxset-detail.component.scss'],
})
export class BoxsetDetailComponent implements OnInit, AfterViewInit {
  wishlistHoverId: number | null = null;
  collectionHoverId: number | null = null;
  wishlistClickLockId: number | null = null;
  collectionClickLockId: number | null = null;
  boxsets: Boxset[] = [];
  loading = true;
  error = false;
  private detailImageHeights: Record<string, number> = {};

  @ViewChildren('boxsetImage')
  private boxsetImages!: QueryList<ElementRef<HTMLImageElement>>;

  constructor(
    private boxsetService: BoxsetService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    public collectionService: CollectionService
  ) {}

  ngOnInit(): void {
    this.boxsetService.getBoxsets().subscribe({
      next: (boxsets) => {
        this.boxsets = boxsets;
        this.boxsets.forEach((boxset) => {
          this.wishlistService.syncStoredSpecialItem(boxset.product);
          this.collectionService.syncStoredItem(boxset.product);
        });
        this.loading = false;
        setTimeout(() => this.syncAllImageHeights());
      },
      error: () => {
        this.error = true;
        this.loading = false;
      },
    });
  }

  ngAfterViewInit(): void {
    this.boxsetImages.changes.subscribe(() => {
      setTimeout(() => this.syncAllImageHeights());
    });
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.syncAllImageHeights();
  }

  getShareUrl(slug: string): string {
    return `https://jouwshop.nl/boxsets/${slug}`;
  }

  addToCart(boxset: Boxset): void {
    this.cartService.addToCart(boxset.product);
  }

  isInWishlist(boxset: Boxset): boolean {
    return this.wishlistService.isInWishlist(boxset.product.id);
  }

  isInCollection(boxset: Boxset): boolean {
    return this.collectionService.isInCollection(boxset.product.id);
  }

  toggleWishlist(boxset: Boxset): void {
    if (this.isInWishlist(boxset)) {
      this.wishlistService.removeFromWishlist(boxset.product.id);
    } else {
      this.wishlistService.addToWishlist(boxset.product);
    }

    this.wishlistClickLockId = boxset.product.id;
    setTimeout(() => {
      this.wishlistClickLockId = null;
    }, 2000);
  }

  toggleCollection(boxset: Boxset): void {
    if (this.isInCollection(boxset)) {
      this.collectionService.removeFromCollection(boxset.product.id);
    } else {
      this.collectionService.addToCollection(boxset.product);
    }

    this.collectionClickLockId = boxset.product.id;
    setTimeout(() => {
      this.collectionClickLockId = null;
    }, 2000);
  }

  syncImageHeight(slug: string, image: HTMLImageElement): void {
    this.detailImageHeights[slug] = Math.round(image.getBoundingClientRect().height);
  }

  getDetailImageHeight(slug: string): number | null {
    return this.detailImageHeights[slug] ?? null;
  }

  private syncAllImageHeights(): void {
    if (!this.boxsetImages) {
      return;
    }

    this.boxsetImages.forEach((imageRef) => {
      const image = imageRef.nativeElement;
      const slug = image.dataset['slug'];

      if (slug) {
        this.syncImageHeight(slug, image);
      }
    });
  }
}

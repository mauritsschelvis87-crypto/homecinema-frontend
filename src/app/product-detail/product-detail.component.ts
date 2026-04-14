import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FilmService, Film } from '../services/film.service';
import { CartService } from '../services/cart.service';
import { WishlistService } from '../services/wishlist.service';
import { CollectionService } from '../services/collection.service';
import { MediaSliderComponent } from '../media-slider/media-slider.component';
import { NgClass, NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [MediaSliderComponent, NgIf, NgClass, NgFor],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss'],
})
export class ProductDetailComponent implements OnInit {
  readonly ratingStars = [1, 2, 3, 4, 5];
  product!: Film;
  loading = true;
  error = false;

  mediaArray: { type: 'image' | 'video'; url: string }[] = [];

  wishlistHover = false;
  collectionHover = false;

  wishlistClickLock = false;
  collectionClickLock = false;

  shareUrl: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private filmService: FilmService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    public collectionService: CollectionService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');

      if (!id) {
        this.error = true;
        this.loading = false;
        return;
      }

      this.loading = true;
      this.error = false;

      this.filmService.getFilmById(id).subscribe({
        next: (film) => {
          this.product = film;
          this.syncRatingFromCollection();
          this.setupMedia();
          this.loading = false;
          this.shareUrl = `https://jouwshop.nl/product/${film.id}`;
        },
        error: () => {
          this.error = true;
          this.loading = false;
        },
      });
    });
  }

  setupMedia(): void {
    this.mediaArray = [];

    if (this.product.trailerUrl) {
      const embedUrl = this.getEmbedUrl(this.product.trailerUrl);
      this.mediaArray.push({ type: 'video', url: embedUrl });
    }

    if ((this.product as any).stills?.length > 0) {
      (this.product as any).stills.forEach((stillUrl: string) => {
        this.mediaArray.push({ type: 'image', url: stillUrl });
      });
    }
  }

  getEmbedUrl(url: string): string {
    const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/;
    const match = url.match(youtubeRegex);
    return match && match[1] ? `https://www.youtube.com/embed/${match[1]}` : url;
  }

  addToCart(): void {
    this.cartService.addToCart(this.product);
  }

  isInWishlist(): boolean {
    return this.wishlistService.isInWishlist(this.product.id);
  }

  isInCollection(): boolean {
    return this.collectionService.isInCollection(this.product.id);
  }

  toggleWishlist(): void {
    if (this.isInWishlist()) {
      this.wishlistService.removeFromWishlist(this.product.id);
    } else {
      this.wishlistService.addToWishlist(this.product);
    }

    this.wishlistClickLock = true;
    setTimeout(() => {
      this.wishlistClickLock = false;
    }, 2000);
  }

  toggleCollection(): void {
    if (this.isInCollection()) {
      this.collectionService.removeFromCollection(this.product.id);
      this.product.userRating = null;
    } else {
      this.collectionService.addToCollection(this.product);
      this.syncRatingFromCollection();
    }

    this.collectionClickLock = true;
    setTimeout(() => {
      this.collectionClickLock = false;
    }, 2000);
  }

  goBack(): void {
    this.router.navigate(['/shopping']);
  }

  setRating(rating: number): void {
    if (!this.isInCollection()) {
      return;
    }

    this.collectionService.rateFilm(this.product.id, rating);
    this.product.userRating = rating;
  }

  isStarFilled(star: number): boolean {
    return star <= (this.product?.userRating ?? 0);
  }

  private syncRatingFromCollection(): void {
    if (!this.product) {
      return;
    }

    this.product.userRating = this.isInCollection()
      ? this.collectionService.getRating(this.product.id)
      : null;
  }
}

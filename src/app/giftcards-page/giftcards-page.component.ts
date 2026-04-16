import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { createFallbackMediaAssets, MediaAssets, MediaAssetsService } from '../services/media-assets.service';
import {
  GiftCardCatalogItem,
  GiftCardCategory,
  GiftCardCurrency,
  GiftCardFormat,
  giftCardCatalog,
} from './giftcard-catalog';

@Component({
  selector: 'app-giftcards-page',
  standalone: true,
  imports: [NgIf, NgForOf, NgClass, FormsModule, RouterLink],
  templateUrl: './giftcards-page.component.html',
  styleUrl: './giftcards-page.component.scss',
})
export class GiftcardsPageComponent implements OnInit {
  readonly giftCards: GiftCardCatalogItem[] = giftCardCatalog;

  filters = {
    title: '',
    currency: '' as GiftCardCurrency | '',
    category: '' as GiftCardCategory | '',
    format: '' as GiftCardFormat | '',
  };
  showGrid = true;
  filteredGiftCards: GiftCardCatalogItem[] = [];
  mediaAssets: MediaAssets = createFallbackMediaAssets();
  private routeCategory: GiftCardCategory | '' = '';

  constructor(
    private route: ActivatedRoute,
    private mediaAssetsService: MediaAssetsService
  ) {}

  ngOnInit(): void {
    this.mediaAssetsService.getMediaAssets().subscribe((assets) => {
      this.mediaAssets = assets;
    });

    this.route.paramMap.subscribe(params => {
      const category = params.get('category');
      this.routeCategory = this.isCategory(category) ? category : '';
      this.filters.category = this.routeCategory;
      this.applyFilters();
    });
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  resetFilters(): void {
    this.filters.title = '';
    this.filters.currency = '';
    this.filters.category = this.routeCategory;
    this.filters.format = '';
    this.applyFilters();
  }

  toggleView(): void {
    this.showGrid = !this.showGrid;
  }

  trackByGiftCardId(_: number, giftCard: GiftCardCatalogItem): number {
    return giftCard.id;
  }

  giftImageUrl(giftCard: GiftCardCatalogItem): string | null {
    return this.mediaAssets.gifts[giftCard.assetKey] ?? null;
  }

  private applyFilters(): void {
    const searchTerm = this.filters.title.trim().toLowerCase();
    const currencyFilter = this.filters.currency;
    const categoryFilter = this.filters.category;
    const formatFilter = this.filters.format;

    this.filteredGiftCards = this.giftCards.filter(giftCard => {
      const matchesCategory = !categoryFilter || giftCard.category === categoryFilter;
      const matchesCurrency = !currencyFilter || giftCard.currency === currencyFilter;
      const matchesFormat = !formatFilter || giftCard.formatLabel === formatFilter;
      const matchesSearch = !searchTerm || [
        giftCard.title,
        giftCard.categoryLabel,
        giftCard.currencyLabel,
        giftCard.formatLabel,
        giftCard.priceLabel,
        ...giftCard.searchTerms,
      ].some(value => value.toLowerCase().includes(searchTerm));

      return matchesCategory && matchesCurrency && matchesFormat && matchesSearch;
    });
  }

  private isCategory(value: string | null): value is GiftCardCategory {
    return value === 'physical' || value === 'gift-a-movie';
  }
}

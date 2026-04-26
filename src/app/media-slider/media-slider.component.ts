import { Component, Input } from '@angular/core';
import { SafeUrlPipe } from '../pipes/safe-url.pipe';

export interface MediaItem {
  type: 'image' | 'video';
  url?: string | null;
}

@Component({
  selector: 'app-media-slider',
  standalone: true,
  templateUrl: './media-slider.component.html',
  styleUrls: ['./media-slider.component.scss'],
  imports: [SafeUrlPipe]
})
export class MediaSliderComponent {
  private _items: MediaItem[] = [];

  @Input() showArrows = true;

  @Input()
  set items(value: MediaItem[]) {
    // 🔥 FIX: filter lege of null urls (dus geen lege trailers meer)
    this._items = (value || []).filter(item =>
      item.url && item.url.trim() !== ''
    );

    if (this.currentIndex >= this._items.length) {
      this.currentIndex = 0;
    }
  }

  get items(): MediaItem[] {
    return this._items;
  }

  currentIndex = 0;

  get shouldShowArrows(): boolean {
    return this.showArrows && this.items.length > 1;
  }

  prev(): void {
    if (!this.items.length) return;
    this.currentIndex =
      (this.currentIndex - 1 + this.items.length) % this.items.length;
  }

  next(): void {
    if (!this.items.length) return;
    this.currentIndex =
      (this.currentIndex + 1) % this.items.length;
  }
}

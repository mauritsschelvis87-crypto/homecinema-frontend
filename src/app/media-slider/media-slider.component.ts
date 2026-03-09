import { Component, Input } from '@angular/core';
import {SafeUrlPipe} from '../pipes/safe-url.pipe';


export interface MediaItem {
  type: 'image' | 'video';
  url: string;
}

@Component({
  selector: 'app-media-slider',
  standalone: true,
  templateUrl: './media-slider.component.html',
  styleUrls: ['./media-slider.component.scss'],
  imports: [
    SafeUrlPipe
]
})
export class MediaSliderComponent {
  @Input() items: MediaItem[] = [];
  currentIndex = 0;

  prev(): void {
    this.currentIndex = (this.currentIndex - 1 + this.items.length) % this.items.length;
  }

  next(): void {
    this.currentIndex = (this.currentIndex + 1) % this.items.length;
  }
}

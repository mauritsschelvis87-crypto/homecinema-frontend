import { Component, AfterViewInit, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIf, NgStyle } from '@angular/common';
import { MediaAssets, MediaAssetsService, createFallbackMediaAssets } from '../services/media-assets.service';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [RouterLink, NgIf, NgStyle],
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.scss']
})
export class ExploreComponent implements AfterViewInit {
  public currentIndex = 0;
  public mediaAssets: MediaAssets = createFallbackMediaAssets();

  public sections = [
    'split-feature-hero-1',
    'split-feature-hero-2',
    'split-feature-hero-3',
    'footer'
  ];

  private isScrolling = false;
  private readonly mobileBreakpoint = 768;

  constructor(private mediaAssetsService: MediaAssetsService) {
    this.mediaAssetsService.getMediaAssets().subscribe((assets) => {
      this.mediaAssets = assets;
    });
  }

  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent) {
    if (this.isScrolling) return;

    if (!this.isMobileView()) {
      event.preventDefault();
    }

    const targets = this.getScrollTargets();

    if (event.deltaY > 0 && this.currentIndex < targets.length - 1) {
      this.currentIndex++;
      this.scrollToCurrentSection();
    } else if (event.deltaY < 0 && this.currentIndex > 0) {
      this.currentIndex--;
      this.scrollToCurrentSection();
    }
  }

  ngAfterViewInit() {
    this.triggerSlideInAnimation();
  }

  scrollDown(): void {
    if (this.currentIndex < this.getScrollTargets().length - 1) {
      this.currentIndex++;
      this.scrollToCurrentSection();
    }
  }

  scrollUp(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.scrollToCurrentSection();
    }
  }

  private scrollToCurrentSection(): void {
    this.isScrolling = true;
    const targets = this.getScrollTargets();
    const element = targets[this.currentIndex] ?? null;

    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }

    this.triggerSlideInAnimation();

    setTimeout(() => {
      this.isScrolling = false;
    }, this.isMobileView() ? 700 : 300);
  }

  private triggerSlideInAnimation(): void {
    // Verwijder eerst de slide-in class
    this.sections.forEach((sectionClass) => {
      if (sectionClass === 'footer') return;

      const left = document.querySelector(`section.${sectionClass} .split-left`);
      const right = document.querySelector(`section.${sectionClass} .split-right`);

      left?.classList.remove('slide-in');
      right?.classList.remove('slide-in');
    });

    setTimeout(() => {
      const currentSection = this.sections[this.currentIndex];
      if (currentSection === 'footer') return;

      const left = document.querySelector(`section.${currentSection} .split-left`);
      const right = document.querySelector(`section.${currentSection} .split-right`);

      left?.classList.add('slide-in');
      right?.classList.add('slide-in');
    }, 50);
  }

  public splitBackgroundStyle(assetPath: string): Record<string, string> {
    const imageUrl = this.mediaAssets.directors[assetPath];
    return imageUrl ? { 'background-image': `url('${imageUrl}')` } : {};
  }

  public hasMoreTargets(): boolean {
    return this.currentIndex < this.getLastArrowTargetIndex();
  }

  public isLastTarget(): boolean {
    return this.currentIndex >= this.getLastArrowTargetIndex();
  }

  private getScrollTargets(): Element[] {
    if (this.isMobileView()) {
      const targets: Element[] = [];

      this.sections.forEach((sectionClass) => {
        if (sectionClass === 'footer') {
          const footer = document.querySelector('footer.site-footer');
          if (footer) targets.push(footer);
          return;
        }

        const section = document.querySelector(`section.${sectionClass}`);
        const left = section?.querySelector('.split-left');
        const right = section?.querySelector('.split-right');

        if (left) targets.push(left);
        if (right) targets.push(right);
      });

      return targets;
    }

    return this.sections
      .map((sectionClass) => {
        if (sectionClass === 'footer') {
          return document.querySelector('footer.site-footer');
        }

        return document.querySelector(`section.${sectionClass}`);
      })
      .filter((element): element is Element => element !== null);
  }

  private isMobileView(): boolean {
    return typeof window !== 'undefined' && window.innerWidth <= this.mobileBreakpoint;
  }

  private getLastArrowTargetIndex(): number {
    return Math.max(0, this.getScrollTargets().length - 2);
  }
}

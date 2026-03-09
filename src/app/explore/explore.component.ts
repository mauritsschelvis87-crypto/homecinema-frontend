import { Component, AfterViewInit, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [RouterLink, NgIf],
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.scss']
})
export class ExploreComponent implements AfterViewInit {
  public currentIndex = 0;

  public sections = [
    'split-feature-hero-1',
    'split-feature-hero-2',
    'split-feature-hero-3',
    'footer'
  ];

  private isScrolling = false;

  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent) {
    if (this.isScrolling) return;

    if (event.deltaY > 0 && this.currentIndex < this.sections.length - 1) {
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
    if (this.currentIndex < this.sections.length - 1) {
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

    const sectionClass = this.sections[this.currentIndex];
    let element: Element | null;

    if (sectionClass === 'footer') {
      element = document.querySelector('footer.site-footer');
    } else {
      element = document.querySelector(`section.${sectionClass}`);
    }

    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }

    this.triggerSlideInAnimation();

    setTimeout(() => {
      this.isScrolling = false;
    }, 700);
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
}

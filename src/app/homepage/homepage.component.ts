import { Component, HostListener, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgForOf, NgIf } from '@angular/common';

@Component({
  selector: 'app-homepage',
  standalone: true,
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss'],
  imports: [
    RouterLink,
    NgIf,
  ]
})
export class HomepageComponent implements OnInit {
  currentIndex = 0;

  sections = [
    'comedy-hero',
    'french-new-wave-hero',
    'italian-classics-hero',
    'silent-films-hero',
    'technicolor-hero',
    'footer',
  ];

  private isScrolling = false;

  constructor() {}

  ngOnInit(): void {}

  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent) {
    if (this.isScrolling) return;
    if (event.deltaY > 0) {
      if (this.currentIndex < this.sections.length - 1) {
        this.currentIndex++;
        this.scrollToCurrentSection();
      }
    } else if (event.deltaY < 0) {
      if (this.currentIndex > 0) {
        this.currentIndex--;
        this.scrollToCurrentSection();
      }
    }
  }

  scrollToCurrentSection() {
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

    setTimeout(() => {
      this.isScrolling = false;
    }, 300);
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
}

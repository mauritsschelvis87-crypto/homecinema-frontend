import { Component, OnInit } from '@angular/core';


interface NewsItem {
  title: string;
  orderDate: string;
  summary: string;
  content: string;
}

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  imports: [],
  styleUrls: ['./news.component.scss']
})
export class NewsComponent implements OnInit {
  news: NewsItem[] = [];

  ngOnInit(): void {
    this.news = [
      {
        title: 'New Blu-ray Releases',
        orderDate: '2025-07-01',
        summary: 'Explore the latest additions to our collection.',
        content: 'We have just added dozens of new Blu-ray and 4K UHD titles. Discover standout films from directors such as Wong Kar-Wai and Akira Kurosawa...'
      },
      {
        title: 'Summer Promotion: 3 for 2',
        orderDate: '2025-06-15',
        summary: 'Take advantage of our limited-time summer offer.',
        content: 'Buy 3 films and only pay for 2. Valid through the end of July for all Criterion Collection titles.'
      },
      {
        title: 'Special Boxset Spotlight',
        orderDate: '2025-05-28',
        summary: 'A closer look at our newest collector boxsets.',
        content: 'This month we are highlighting several premium editions, including curated sets dedicated to Ingmar Bergman, Wong Kar Wai, and other essential filmmakers for collectors.'
      },
      {
        title: 'Restoration Picks of the Month',
        orderDate: '2025-05-10',
        summary: 'A short list of restorations we think deserve extra attention.',
        content: 'From beautifully restored classics to overlooked modern masterpieces, our monthly restoration picks celebrate the craft of film preservation and presentation.'
      },
      {
        title: 'Staff Favorites',
        orderDate: '2025-04-22',
        summary: 'Our team shares a few personal recommendations.',
        content: 'The Home Cinema Project team selected a handful of favorites ranging from poetic world cinema to daring American independent films, all chosen for their replay value and collectible editions.'
      }
    ];
  }
}

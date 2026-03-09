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
        title: 'Nieuwe releases op Blu-ray',
        orderDate: '2025-07-01',
        summary: 'Bekijk de nieuwste toevoegingen aan onze collectie!',
        content: 'We hebben zojuist tientallen nieuwe titels toegevoegd op Blu-ray en 4K UHD. Ontdek parels van regisseurs als Wong Kar-Wai en Akira Kurosawa...'
      },
      {
        title: 'Zomeractie: 3 voor 2',
        orderDate: '2025-06-15',
        summary: 'Profiteer van onze tijdelijke zomeractie!',
        content: 'Koop 3 films en betaal er maar 2. Geldig tot eind juli voor alle Criterion Collection titels.'
      }
    ];
  }
}

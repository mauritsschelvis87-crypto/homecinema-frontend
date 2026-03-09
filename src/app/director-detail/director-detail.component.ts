import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FilmService, Film } from '../services/film.service';
import { DirectorService, Director } from '../services/director.service';

import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-director-detail',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './director-detail.component.html',
  styleUrls: ['./director-detail.component.scss']
})
export class DirectorDetailComponent implements OnInit {
  director: Director | undefined;
  films: Film[] = [];

  constructor(
    private route: ActivatedRoute,
    private directorService: DirectorService,
    private filmService: FilmService
  ) {}

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.directorService.getDirectorBySlug(slug).subscribe(d => {
        this.director = d;
      });

      this.filmService.getAllFilms().subscribe(films => {
        this.films = films.filter(f => this.slugify(f.director) === slug);
      });
    }
  }

  private slugify(name: string): string {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\-]/g, '');
  }
}

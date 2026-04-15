import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Director, DirectorService } from './director.service';
import { environment } from '../../environments/environment';

describe('DirectorService', () => {
  let service: DirectorService;
  let httpTestingController: HttpTestingController;

  const createDirector = (overrides: Partial<Director> = {}): Director => ({
    name: 'Test Director',
    slug: 'test-director',
    birthPlace: 'Amsterdam',
    birthYear: 1950,
    image: '/assets/test.jpg',
    bio: 'Bio',
    education: 'Film School',
    ...overrides,
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DirectorService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(DirectorService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('loads the directors payload from the api', () => {
    const response = [
      createDirector({ slug: 'akira-kurosawa' }),
      createDirector({ slug: 'jean-renoir' }),
      createDirector({ slug: 'andrei-tarkovsky' }),
    ];

    let directors: Director[] | undefined;
    service.getDirectors().subscribe(result => {
      directors = result;
    });

    const request = httpTestingController.expectOne(`${environment.apiUrl}/directors`);
    request.flush(response);

    expect(directors?.length).toBe(3);
    expect(directors?.map(director => director.slug)).toEqual([
      'akira-kurosawa',
      'jean-renoir',
      'andrei-tarkovsky',
    ]);
  });

  it('matches the murnau slug alias when loading a director', () => {
    let director: Director | undefined;

    service.getDirectorBySlug('friedrich-murnau').subscribe(result => {
      director = result;
    });

    const request = httpTestingController.expectOne(`${environment.apiUrl}/directors/friedrich-murnau`);
    request.flush(
      createDirector({
        name: 'Friedrich W. Murnau',
        slug: 'friedrich-w-murnau',
      })
    );

    expect(director?.slug).toBe('friedrich-w-murnau');
  });
});

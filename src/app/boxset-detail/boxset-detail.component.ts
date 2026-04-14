import { Component } from '@angular/core';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { MediaSliderComponent, MediaItem } from '../media-slider/media-slider.component';
import { Film } from '../services/film.service';
import { CartService } from '../services/cart.service';
import { WishlistService } from '../services/wishlist.service';
import { CollectionService } from '../services/collection.service';

interface BoxsetSpec {
  label: string;
  value: string;
}

interface BoxsetItem {
  slug: string;
  title: string;
  subtitle: string;
  topImage: string;
  secondaryImage: string;
  description: string;
  specs: BoxsetSpec[];
  mediaItems: MediaItem[];
  product: Film;
}

@Component({
  selector: 'app-boxset-detail',
  standalone: true,
  imports: [NgFor, NgIf, NgClass, MediaSliderComponent],
  templateUrl: './boxset-detail.component.html',
  styleUrls: ['./boxset-detail.component.scss'],
})
export class BoxsetDetailComponent {
  wishlistHoverId: number | null = null;
  collectionHoverId: number | null = null;
  wishlistClickLockId: number | null = null;
  collectionClickLockId: number | null = null;

  readonly boxsets: BoxsetItem[] = [
    {
      slug: 'bergman',
      title: 'Ingmar Bergman Box Set',
      subtitle: 'A landmark special edition celebrating one of cinema’s defining auteurs.',
      topImage: 'assets/boxset/bergman_box_2.jpg',
      secondaryImage: 'assets/boxset/bergman_box.jpg',
      description:
        'This collector’s edition brings together a curated selection of Ingmar Bergman classics with new restorations, extensive supplements, and premium packaging for home cinema collectors.',
      specs: [
        { label: 'Director', value: 'Ingmar Bergman' },
        { label: 'Publisher', value: 'Criterion Collection' },
        { label: 'Edition', value: 'Special Edition Box Set' },
        { label: 'Region', value: 'Region B / Multi-region dependent player recommended' },
        { label: 'Format', value: 'Blu-ray' },
        { label: 'Discs', value: '30 discs' },
        { label: 'Subtitles', value: 'English' },
        { label: 'Price', value: '€199.95' },
      ],
      mediaItems: [
        { type: 'video', url: 'https://www.youtube.com/embed/wq9TT5kiEzA?start=19' },
        { type: 'image', url: 'assets/boxset/bergman_box_3.jpg' },
        { type: 'image', url: 'assets/boxset/bergman_box_4.jpg' },
        { type: 'image', url: 'assets/boxset/bergman_box_5.jpg' },
      ],
      product: {
        id: 900001,
        title: 'Ingmar Bergman Box Set',
        genre: 'Drama',
        director: 'Ingmar Bergman',
        country: 'Sweden',
        year: 2018,
        runtime: 1800,
        price: 199.95,
        imageUrl: 'assets/boxset/bergman_box_2.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=wq9TT5kiEzA&t=19s',
        aspectRatio: 'Various',
        colorOrBlackAndWhite: 'Mixed',
        description:
          'A premium collector edition dedicated to Ingmar Bergman with restored masters, archival supplements, and deluxe packaging.',
        brand: { id: 9001, name: 'Criterion Collection' },
        type: 'Blu-ray Box Set',
        weight: 3200,
        stills: [
          'assets/boxset/bergman_box_3.jpg',
          'assets/boxset/bergman_box_4.jpg',
          'assets/boxset/bergman_box_5.jpg'
        ],
        silent: false,
      },
    },
    {
      slug: 'wong-kar-wai',
      title: 'Wong Kar Wai World of Cinema',
      subtitle: 'A premium box set built around color, mood, romance, and urban longing.',
      topImage: 'assets/boxset/WongKarWai.jpg',
      secondaryImage: 'assets/boxset/wong_boxset.jpg',
      description:
        'A collector-focused edition featuring restored transfers, deluxe packaging, and curated extras highlighting the visual style and emotional architecture of Wong Kar Wai’s films.',
      specs: [
        { label: 'Director', value: 'Wong Kar Wai' },
        { label: 'Publisher', value: 'Criterion Collection' },
        { label: 'Edition', value: 'Limited Collector Box' },
        { label: 'Format', value: 'Blu-ray' },
        { label: 'Discs', value: '7 discs' },
        { label: 'Audio', value: 'Original mono / stereo mixes' },
        { label: 'Packaging', value: 'Slipcase with fold-out materials' },
        { label: 'Price', value: '€129.95' },
      ],
      mediaItems: [
        { type: 'video', url: 'https://www.youtube.com/embed/AfZbh4cteqI?start=80' },

        { type: 'image', url: 'assets/boxset/wong_boxset2.jpg' },
        { type: 'image', url: 'assets/boxset/wong_boxset2.jpeg' },
      ],
      product: {
        id: 900002,
        title: 'Wong Kar Wai World of Cinema',
        genre: 'Drama',
        director: 'Wong Kar Wai',
        country: 'Hong Kong',
        year: 2021,
        runtime: 930,
        price: 129.95,
        imageUrl: 'assets/boxset/WongKarWai.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=AfZbh4cteqI&t=80s',
        aspectRatio: 'Various',
        colorOrBlackAndWhite: 'Color',
        description:
          'A richly designed collector box dedicated to Wong Kar Wai’s cinema, with major restorations and presentation-focused extras.',
        brand: { id: 9001, name: 'Criterion Collection' },
        type: 'Blu-ray Box Set',
        weight: 1800,
        stills: [
          'assets/boxset/WongKarWai.jpg',
          'assets/boxset/wong_boxset.jpg',
          'assets/boxset/wong_boxset2.jpg',
          'assets/boxset/wong_boxset2.jpeg'
        ],
        silent: false,
      },
    },
    {
      slug: 'world-cinema-project',
      title: 'World Cinema Project Box Set',
      subtitle: 'A global curation of restored landmark films presented in a collector edition.',
      topImage: 'assets/boxset/WorldCinemaProject1.jpg',
      secondaryImage: 'assets/boxset/world_boxset3.webp',
      description:
        'This set focuses on preservation, restoration, and access, bringing together historically important films from around the world in a substantial archival-style edition.',
      specs: [
        { label: 'Curator', value: 'Martin Scorsese / The Film Foundation' },
        { label: 'Publisher', value: 'Criterion Collection' },
        { label: 'Edition', value: 'Collector Restoration Set' },
        { label: 'Format', value: 'Blu-ray' },
        { label: 'Discs', value: '6 discs' },
        { label: 'Scope', value: 'International restorations' },
        { label: 'Packaging', value: 'Deluxe multi-disc box format' },
        { label: 'Price', value: '€149.95' },
      ],
      mediaItems: [
        { type: 'video', url: 'https://www.youtube.com/embed/brMSp0087Xw' },


        { type: 'image', url: 'assets/boxset/World_boxset3.jpeg' },
        { type: 'image', url: 'assets/boxset/world_boxset4.jpeg' },
        { type: 'image', url: 'assets/boxset/world_boxset5.jpeg' },
      ],
      product: {
        id: 900003,
        title: 'World Cinema Project Box Set',
        genre: 'World Cinema',
        director: 'Various',
        country: 'International',
        year: 2020,
        runtime: 780,
        price: 149.95,
        imageUrl: 'assets/boxset/WorldCinemaProject1.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=brMSp0087Xw',
        aspectRatio: 'Various',
        colorOrBlackAndWhite: 'Mixed',
        description:
          'A preservation-driven box set featuring globally significant restorations with essays, contextual extras, and archival presentation.',
        brand: { id: 9001, name: 'Criterion Collection' },
        type: 'Blu-ray Box Set',
        weight: 2100,
        stills: [
          'assets/boxset/WorldCinemaProject1.jpg',
          'assets/boxset/WorldCinemaProject2.jpg',
          'assets/boxset/world_boxset3.webp',
          'assets/boxset/World_boxset3.jpeg',
          'assets/boxset/world_boxset4.jpeg',
          'assets/boxset/world_boxset5.jpeg'
        ],
        silent: false,
      },
    },
    {
      slug: 'john-cassavetes',
      title: 'John Cassavetes: Five Films',
      subtitle: 'A landmark director box set centered on performance, intimacy, and independent American cinema.',
      topImage: 'assets/boxset/cassavetes_boxset1.jpg',
      secondaryImage: 'assets/boxset/cassavetes_boxset2.jpg',
      description:
        'This collector edition brings together five defining John Cassavetes features in a substantial box set focused on raw performances, actor-driven direction, and one of the key bodies of work in American independent film.',
      specs: [
        { label: 'Director', value: 'John Cassavetes' },
        { label: 'Publisher', value: 'Criterion Collection' },
        { label: 'Edition', value: 'Collector Box Set' },
        { label: 'Format', value: 'Blu-ray' },
        { label: 'Films', value: '5 films' },
        { label: 'Focus', value: 'Independent American cinema' },
        { label: 'Packaging', value: 'Deluxe multi-disc box format' },
        { label: 'Price', value: '€139.95' },
      ],
      mediaItems: [
        { type: 'video', url: 'https://www.youtube.com/embed/TP8KgFHwNeA' },
        { type: 'image', url: 'assets/boxset/cassavetes_boxset3.jpg' },
        { type: 'image', url: 'assets/boxset/cassavetes_boxset4.jpg' },
        { type: 'image', url: 'assets/boxset/cassavetes_boxset5.jpg' },
      ],
      product: {
        id: 900004,
        title: 'John Cassavetes: Five Films',
        genre: 'Drama',
        director: 'John Cassavetes',
        country: 'United States',
        year: 2013,
        runtime: 695,
        price: 139.95,
        imageUrl: 'assets/boxset/cassavetes_boxset1.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=TP8KgFHwNeA',
        aspectRatio: 'Various',
        colorOrBlackAndWhite: 'Mixed',
        description:
          'A Criterion box set gathering five major John Cassavetes films with a presentation aimed at collectors and admirers of American independent cinema.',
        brand: { id: 9001, name: 'Criterion Collection' },
        type: 'Blu-ray Box Set',
        weight: 2400,
        stills: [
          'assets/boxset/cassavetes_boxset3.jpg',
          'assets/boxset/cassavetes_boxset4.jpg',
          'assets/boxset/cassavetes_boxset5.jpg'
        ],
        silent: false,
      },
    },
    {
      slug: 'abbas-kiarostami',
      title: 'Abbas Kiarostami Box Set',
      subtitle: 'A collector edition devoted to one of modern cinema’s most essential and quietly radical filmmakers.',
      topImage: 'assets/boxset/abbas_boxset1.jpg',
      secondaryImage: 'assets/boxset/abbas_boxset5.jpg',
      description:
        'This box set brings together a curated selection of Abbas Kiarostami works in a presentation focused on poetic realism, formal precision, and the director’s singular place in world cinema.',
      specs: [
        { label: 'Director', value: 'Abbas Kiarostami' },
        { label: 'Publisher', value: 'Criterion Collection' },
        { label: 'Edition', value: 'Collector Box Set' },
        { label: 'Format', value: 'Blu-ray' },
        { label: 'Scope', value: 'World cinema essentials' },
        { label: 'Focus', value: 'Poetic realism and modern Iranian cinema' },
        { label: 'Packaging', value: 'Deluxe multi-disc box format' },
        { label: 'Price', value: '€149.95' },
      ],
      mediaItems: [
        { type: 'video', url: 'https://www.youtube.com/embed/fu3iQLnforw' },
        { type: 'image', url: 'assets/boxset/abbas_boxset2.jpg' },
        { type: 'image', url: 'assets/boxset/abbas_boxset3.jpg' },
        { type: 'image', url: 'assets/boxset/abbas_boxset4.jpg' },
      ],
      product: {
        id: 900005,
        title: 'Abbas Kiarostami Box Set',
        genre: 'Drama',
        director: 'Abbas Kiarostami',
        country: 'Iran',
        year: 2021,
        runtime: 900,
        price: 149.95,
        imageUrl: 'assets/boxset/abbas_boxset1.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=fu3iQLnforw',
        aspectRatio: 'Various',
        colorOrBlackAndWhite: 'Mixed',
        description:
          'A collector-focused Abbas Kiarostami edition centered on landmark works, refined presentation, and the director’s enduring influence on world cinema.',
        brand: { id: 9001, name: 'Criterion Collection' },
        type: 'Blu-ray Box Set',
        weight: 2300,
        stills: [
          'assets/boxset/abbas_boxset2.jpg',
          'assets/boxset/abbas_boxset3.jpg',
          'assets/boxset/abbas_boxset4.jpg'
        ],
        silent: false,
      },
    },
  ];

  constructor(
    private cartService: CartService,
    private wishlistService: WishlistService,
    public collectionService: CollectionService
  ) {
    this.boxsets.forEach((boxset) => {
      this.wishlistService.syncStoredSpecialItem(boxset.product);
      this.collectionService.syncStoredItem(boxset.product);
    });
  }

  getShareUrl(slug: string): string {
    return `https://jouwshop.nl/boxsets/${slug}`;
  }

  addToCart(boxset: BoxsetItem): void {
    this.cartService.addToCart(boxset.product);
  }

  isInWishlist(boxset: BoxsetItem): boolean {
    return this.wishlistService.isInWishlist(boxset.product.id);
  }

  isInCollection(boxset: BoxsetItem): boolean {
    return this.collectionService.isInCollection(boxset.product.id);
  }

  toggleWishlist(boxset: BoxsetItem): void {
    if (this.isInWishlist(boxset)) {
      this.wishlistService.removeFromWishlist(boxset.product.id);
    } else {
      this.wishlistService.addToWishlist(boxset.product);
    }

    this.wishlistClickLockId = boxset.product.id;
    setTimeout(() => {
      this.wishlistClickLockId = null;
    }, 2000);
  }

  toggleCollection(boxset: BoxsetItem): void {
    if (this.isInCollection(boxset)) {
      this.collectionService.removeFromCollection(boxset.product.id);
    } else {
      this.collectionService.addToCollection(boxset.product);
    }

    this.collectionClickLockId = boxset.product.id;
    setTimeout(() => {
      this.collectionClickLockId = null;
    }, 2000);
  }
}

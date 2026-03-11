import { CartService } from './cart.service';
import { Film } from './film.service';

describe('CartService', () => {
  let service: CartService;

  const createFilm = (overrides: Partial<Film> = {}): Film => ({
    id: 1,
    title: 'Test Film',
    genre: 'Drama',
    director: 'Test Director',
    country: 'NL',
    year: 2024,
    runtime: 120,
    price: 12.5,
    imageUrl: '/test.jpg',
    trailerUrl: '/test-trailer',
    aspectRatio: '1.85:1',
    colorOrBlackAndWhite: 'Color',
    description: 'Test description',
    brand: { id: 1, name: 'Criterion' },
    type: 'Blu-ray',
    weight: 300,
    stills: [],
    silent: false,
    ...overrides,
  });

  beforeEach(() => {
    service = new CartService();
  });

  it('adds a new film to the cart', () => {
    const film = createFilm();

    service.addToCart(film);

    expect(service.getCurrentCartItems()).toEqual([
      { product: film, quantity: 1 },
    ]);
  });

  it('increments quantity when the same film is added twice', () => {
    const film = createFilm();

    service.addToCart(film);
    service.addToCart(film);

    expect(service.getCurrentCartItems()[0].quantity).toBe(2);
  });

  it('calculates total price and shipping cost from cart contents', () => {
    service.addToCart(createFilm({ id: 1, price: 10, weight: 400 }));
    service.addToCart(createFilm({ id: 2, price: 15, weight: 700 }));

    expect(service.getTotalPrice()).toBe(25);
    expect(service.getTotalWeight()).toBe(1100);
    expect(service.getShippingCost()).toBe(6.95);
  });
});

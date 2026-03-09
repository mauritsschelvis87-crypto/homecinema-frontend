export interface Brand {
  id?: number;
  name: string;
}

export interface Type {
  id?: number;
  name: string;
}

export interface Film {
  id: number;
  title: string;
  genre: string;
  director: string;
  country: string;
  year: number;
  runtime: number;
  type: { id?: number; name: string };
  price: number;
  imageUrl: string;
  brand?: Brand;
  aspectRatio: string;
  colorOrBlackAndWhite: string;
  stills?: string[];
  weight?: number;
  silent: boolean;
}

export interface OrderItemResponse {
  film: Film;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  orderDate: string;
  totalPrice: number;
  orderItems: OrderItemResponse[];
}

export interface OrderItemRequest {
  productId: string;
  quantity: number;
}

export interface ShippingAddress {
  street: string;
  postalCode: string;
  city: string;
  country: string;
}

export interface OrderRequest {
  username: string;
  email: string;
  items: OrderItemRequest[];
  totalPrice: number;
  shippingAddress: ShippingAddress;
  paymentMethod: string;
}

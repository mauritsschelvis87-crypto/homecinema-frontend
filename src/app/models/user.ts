export interface Address {
  street: string;
  postalCode: string;
  city: string;
  country: string;
}

export interface User {
  username: string;
  email?: string;
  name?: string;
  role?: string;
  address?: Address;
}

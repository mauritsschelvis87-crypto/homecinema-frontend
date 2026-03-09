export interface GiftCodeProduct {
  id: string;
  type: 'gift-code';
  title: string;
  format: string;
  recipientEmail: string;
  price: number;
}

import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ShippingService {
  private euCountries = [
    { name: 'Netherlands', cost: 4.95 },
    { name: 'Belgium', cost: 5.95 },
    { name: 'Germany', cost: 6.50 },
    { name: 'France', cost: 7.25 },
    { name: 'Luxembourg', cost: 5.75 },
    { name: 'Spain', cost: 8.95 },
    { name: 'Italy', cost: 8.50 },
    { name: 'Austria', cost: 7.10 },
    { name: 'Poland', cost: 6.80 },
    { name: 'Sweden', cost: 9.00 },
    { name: 'Finland', cost: 9.50 },
    { name: 'Denmark', cost: 8.25 },
    { name: 'Ireland', cost: 9.75 },
    { name: 'Portugal', cost: 8.80 },
    { name: 'Czech Republic', cost: 7.40 },
    { name: 'Hungary', cost: 7.10 },
    { name: 'Greece', cost: 10.25 },
    { name: 'Slovakia', cost: 6.90 },
    { name: 'Slovenia', cost: 7.25 },
    { name: 'Croatia', cost: 8.00 },
    { name: 'Estonia', cost: 9.10 },
    { name: 'Latvia', cost: 9.10 },
    { name: 'Lithuania', cost: 9.10 },
    { name: 'Romania', cost: 9.80 },
    { name: 'Bulgaria', cost: 10.00 },
    { name: 'Cyprus', cost: 11.50 },
    { name: 'Malta', cost: 11.00 }
  ];

  getShippingCost(country: string): number {
    const found = this.euCountries.find(c => c.name === country);
    return found ? found.cost : 9.99;
  }
}

import { Injectable } from '@angular/core';
import { SHIPPING_COSTS } from '../constants/shipping-costs';
import {SHIPPING_COST_RULES} from '../models/shipping-cost-rules';
import {ShippingCostRule} from '../models/shipping-cost';

@Injectable({
  providedIn: 'root',
})
export class ShippingCostService {
  constructor() {}

  calculateShippingCost(countryCode: string, totalWeightInGrams: number): number {
    const rule: ShippingCostRule | undefined = SHIPPING_COST_RULES[countryCode];
    if (!rule) {
      return 8.99;
    }
    return rule.calculateShippingCost(totalWeightInGrams);
  }
}

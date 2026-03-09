import { SHIPPING_COSTS } from '../constants/shipping-costs';
import { COUNTRY_NAME_TO_CODE } from '../constants/country-code-mapping';

export interface EuCountry {
  name: string;
  code: string;
  shippingCost: number;
}
export const EU_COUNTRIES: EuCountry[] = Object.entries(COUNTRY_NAME_TO_CODE).map(([name, code]) => ({
  name,
  code,
  shippingCost: SHIPPING_COSTS[code] ?? 8.99,
}));

export function getShippingCostByCountryName(name: string): number {
  const code = COUNTRY_NAME_TO_CODE[name];
  return SHIPPING_COSTS[code] ?? 8.99;
}

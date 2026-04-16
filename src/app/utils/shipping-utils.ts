import { SHIPPING_COSTS } from '../constants/shipping-costs';
import { COUNTRY_NAME_TO_CODE } from '../constants/country-code-mapping';

export interface EuCountry {
  name: string;
  code: string;
  shippingCost: number;
}

const COUNTRY_CODE_TO_NAME: Record<string, string> = Object.fromEntries(
  Object.entries(COUNTRY_NAME_TO_CODE).map(([name, code]) => [code, name])
);

export const EU_COUNTRIES: EuCountry[] = Object.entries(COUNTRY_NAME_TO_CODE).map(([name, code]) => ({
  name,
  code,
  shippingCost: SHIPPING_COSTS[code] ?? 8.99,
}));

export function getShippingCountryCode(value: string | null | undefined): string {
  const normalizedValue = value?.trim() ?? '';
  if (!normalizedValue) {
    return '';
  }

  if (COUNTRY_CODE_TO_NAME[normalizedValue]) {
    return normalizedValue;
  }

  return COUNTRY_NAME_TO_CODE[normalizedValue] ?? '';
}

export function getShippingCountryName(value: string | null | undefined): string {
  const countryCode = getShippingCountryCode(value);
  return COUNTRY_CODE_TO_NAME[countryCode] ?? '';
}

export function getShippingCostByCountryValue(value: string | null | undefined): number | null {
  const countryCode = getShippingCountryCode(value);
  return countryCode ? (SHIPPING_COSTS[countryCode] ?? null) : null;
}

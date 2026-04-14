function parseFreeCodeValue(code?: string | null): number | null {
  if (!code) {
    return null;
  }

  const match = code.trim().match(/^FREE(\d+(?:[.,]\d+)?)$/i);
  if (!match) {
    return null;
  }

  const normalized = match[1].replace(',', '.');
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

function formatEuroValue(amount: number): string {
  const isWholeNumber = Number.isInteger(amount);
  return isWholeNumber ? `${amount} euro` : `${amount.toFixed(2)} euro`;
}

function formatPercentageValue(percentage: number): string {
  const isWholeNumber = Number.isInteger(percentage);
  return isWholeNumber ? `${percentage}%` : `${percentage.toFixed(2)}%`;
}

export function getDiscountSummaryLabel(
  appliedGiftCardCode?: string | null,
  appliedGiftCode?: string | null
): string {
  const fixedDiscount = parseFreeCodeValue(appliedGiftCardCode);
  const percentageDiscount = parseFreeCodeValue(appliedGiftCode);

  if (fixedDiscount == null && percentageDiscount == null) {
    return 'Discount:';
  }

  if (fixedDiscount != null && percentageDiscount != null) {
    return `Discount: ${formatEuroValue(fixedDiscount)} + ${formatPercentageValue(percentageDiscount)}`;
  }

  if (fixedDiscount != null) {
    return `Discount: ${formatEuroValue(fixedDiscount)}`;
  }

  return `Discount: ${formatPercentageValue(percentageDiscount!)}`;
}

export interface WeightBracket {
  maxWeightInGrams: number;
  surchargeInEuro: number;
}

export class ShippingCostRule {
  baseShippingPriceInEuro: number;
  weightBrackets: WeightBracket[];

  constructor(basePrice: number, weightBrackets: WeightBracket[]) {
    this.baseShippingPriceInEuro = basePrice;
    this.weightBrackets = weightBrackets;
  }

  calculateShippingCost(totalWeightInGrams: number): number {
    const bracket = this.weightBrackets.find(b => totalWeightInGrams <= b.maxWeightInGrams);
    if (!bracket) {
      throw new Error(`Geen gewichtsklasse gevonden voor gewicht ${totalWeightInGrams} gram`);
    }
    return parseFloat((this.baseShippingPriceInEuro + bracket.surchargeInEuro).toFixed(2));
  }
}

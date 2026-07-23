// ESOP Tax Calculator - India specific rules
// Models perquisite tax at exercise only (FMV at exercise - grant price, taxed at slab rate).
// Does NOT model capital gains tax on a future sale, since holding period varies per person
// and is outside scope of an offer-comparison tool - deliberate simplification, documented in README.
// Verified against Income Tax Act Section 17(2)(vi) rules, July 2026.

import { calculateTakeHome } from './taxCalculator';

interface EsopTaxInput {
  esopSpreadValue: number;
  existingAnnualIncome: number;
}

export function calculateEsopTax(input: EsopTaxInput) {
  const { esopSpreadValue, existingAnnualIncome } = input;

  const taxWithoutEsop = calculateTakeHome(existingAnnualIncome);
  const taxWithEsop = calculateTakeHome(existingAnnualIncome + esopSpreadValue);

  const extraTaxDueToEsop = taxWithEsop.totalTax - taxWithoutEsop.totalTax;
  const postTaxEsopValue = esopSpreadValue - extraTaxDueToEsop;

  return {
    esopSpreadValue,
    extraTaxDueToEsop: Math.round(extraTaxDueToEsop),
    postTaxEsopValue: Math.round(postTaxEsopValue),
    effectiveTaxRateOnEsop: esopSpreadValue > 0
      ? Number(((extraTaxDueToEsop / esopSpreadValue) * 100).toFixed(2))
      : 0,
  };
}

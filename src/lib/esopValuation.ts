// ESOP (Employee Stock Option) Valuation Calculator
// Estimates the present-day, risk-adjusted value of an ESOP grant.
// Risk haircut is now dynamic based on company size classification (see companyRiskProfile.ts),
// falling back to a neutral 15% default when the company isn't in our curated list.

interface EsopInput {
  unitsGranted: number;
  grantPrice: number;
  currentStockPrice: number;
  vestingYears: number;
  cliffYears: number;
  riskHaircut?: number; // optional override - defaults to 0.15 if not provided
}

const DISCOUNT_RATE = 0.10;
const DEFAULT_RISK_HAIRCUT = 0.15;

export function calculateEsopValue(input: EsopInput) {
  const {
    unitsGranted, grantPrice, currentStockPrice,
    vestingYears, cliffYears, riskHaircut,
  } = input;

  const effectiveHaircut = riskHaircut ?? DEFAULT_RISK_HAIRCUT;

  const spreadPerShare = Math.max(0, currentStockPrice - grantPrice);

  const vestingYearsAfterCliff = vestingYears - cliffYears;
  const unitsPerVestingYear = vestingYearsAfterCliff > 0
    ? unitsGranted / vestingYearsAfterCliff
    : unitsGranted;

  let totalPresentValue = 0;
  const yearlyBreakdown = [];

  for (let year = cliffYears + 1; year <= vestingYears; year++) {
    const rawValueThisYear = unitsPerVestingYear * spreadPerShare;
    const yearsToDiscount = year;
    const presentValueThisYear = rawValueThisYear / Math.pow(1 + DISCOUNT_RATE, yearsToDiscount);

    totalPresentValue += presentValueThisYear;
    yearlyBreakdown.push({
      year,
      unitsVesting: Math.round(unitsPerVestingYear),
      rawValue: Math.round(rawValueThisYear),
      presentValue: Math.round(presentValueThisYear),
    });
  }

  const riskAdjustedValue = totalPresentValue * (1 - effectiveHaircut);
  const effectiveAnnualValue = riskAdjustedValue / vestingYears;

  return {
    spreadPerShare: Math.round(spreadPerShare),
    riskHaircutUsed: effectiveHaircut,
    totalPresentValue: Math.round(totalPresentValue),
    riskAdjustedValue: Math.round(riskAdjustedValue),
    effectiveAnnualValue: Math.round(effectiveAnnualValue),
    yearlyBreakdown,
  };
}

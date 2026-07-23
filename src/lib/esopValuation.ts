// ESOP (Employee Stock Option) Valuation Calculator
// Estimates the present-day, risk-adjusted value of an ESOP grant

interface EsopInput {
  unitsGranted: number;
  grantPrice: number;       // strike price per share, in ₹
  currentStockPrice: number; // live market price per share, in ₹
  vestingYears: number;     // total vesting period, e.g. 4
  cliffYears: number;       // cliff period, e.g. 1
}

const DISCOUNT_RATE = 0.10;      // 10% per year - standard present value discount
const RISK_HAIRCUT = 0.15;       // 15% reduction for forfeiture/market risk

/**
 * Calculates the present-value, risk-adjusted worth of an ESOP grant,
 * and also returns the value spread evenly per year for "effective annual value" comparisons.
 */
export function calculateEsopValue(input: EsopInput) {
  const { unitsGranted, grantPrice, currentStockPrice, vestingYears, cliffYears } = input;

  // Step 1: per-share profit ("spread") - can't be negative (underwater options are worth 0)
  const spreadPerShare = Math.max(0, currentStockPrice - grantPrice);

  // Step 2: units vesting each year after the cliff (equal annual vesting)
  const vestingYearsAfterCliff = vestingYears - cliffYears;
  const unitsPerVestingYear = vestingYearsAfterCliff > 0
    ? unitsGranted / vestingYearsAfterCliff
    : unitsGranted;

  // Step 3: for each vesting year, calculate present value of that year's vested shares
  let totalPresentValue = 0;
  const yearlyBreakdown = [];

  for (let year = cliffYears + 1; year <= vestingYears; year++) {
    const rawValueThisYear = unitsPerVestingYear * spreadPerShare;
    const yearsToDiscount = year; // years from now until this tranche vests
    const presentValueThisYear = rawValueThisYear / Math.pow(1 + DISCOUNT_RATE, yearsToDiscount);

    totalPresentValue += presentValueThisYear;
    yearlyBreakdown.push({
      year,
      unitsVesting: Math.round(unitsPerVestingYear),
      rawValue: Math.round(rawValueThisYear),
      presentValue: Math.round(presentValueThisYear),
    });
  }

  // Step 4: apply risk haircut for forfeiture/market uncertainty
  const riskAdjustedValue = totalPresentValue * (1 - RISK_HAIRCUT);

  // Step 5: spread the total risk-adjusted value evenly across the vesting period
  // to get a comparable "effective annual value" (useful for comparing against annual salary)
  const effectiveAnnualValue = riskAdjustedValue / vestingYears;

  return {
    spreadPerShare: Math.round(spreadPerShare),
    totalPresentValue: Math.round(totalPresentValue),
    riskAdjustedValue: Math.round(riskAdjustedValue),
    effectiveAnnualValue: Math.round(effectiveAnnualValue),
    yearlyBreakdown,
  };
}

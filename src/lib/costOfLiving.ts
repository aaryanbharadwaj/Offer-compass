// Cost of Living Adjustment - Indian Cities
// NOTE: Precise numeric cost-of-living indices (e.g. Numbeo's exact index values) are
// behind paid data providers. These adjustment factors are a documented ESTIMATE based on
// consistent relative rankings across multiple published sources (Numbeo, Mercer 2024/2025,
// local cost-of-living guides), cross-verified July 2026. Bangalore is used as the baseline (1.0).
// This is a deliberate simplification - should be replaced with a licensed COL data API
// for production-grade accuracy.
//
// Cities outside this list return adjustmentAvailable: false rather than a guessed multiplier,
// so the app never silently pretends to adjust for a location we have no real data on.

type ListedCity = 'Bangalore' | 'Mumbai' | 'Delhi NCR' | 'Pune' | 'Hyderabad' | 'Chennai';

const CITY_COST_MULTIPLIERS: Record<ListedCity, number> = {
  'Mumbai': 1.30,
  'Delhi NCR': 1.20,
  'Bangalore': 1.00,
  'Pune': 0.95,
  'Chennai': 0.80,
  'Hyderabad': 0.75,
};

const LISTED_CITIES = Object.keys(CITY_COST_MULTIPLIERS);

export function adjustForCostOfLiving(annualValue: number, city: string) {
  const isListed = LISTED_CITIES.includes(city);

  if (!isListed) {
    return {
      city,
      originalValue: annualValue,
      costMultiplier: null,
      costAdjustedValue: annualValue, // unchanged - no adjustment applied
      adjustmentAvailable: false,
    };
  }

  const multiplier = CITY_COST_MULTIPLIERS[city as ListedCity];
  const adjustedValue = annualValue / multiplier;

  return {
    city,
    originalValue: annualValue,
    costMultiplier: multiplier,
    costAdjustedValue: Math.round(adjustedValue),
    adjustmentAvailable: true,
  };
}

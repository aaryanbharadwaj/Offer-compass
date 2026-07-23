// Offer Comparator - the main "conductor" function.
// Combines tax, ESOP valuation, ESOP tax, cost-of-living, and live stock price
// into one final, comparable "effective annual value" for a job offer.

import { calculateTakeHome } from './taxCalculator';
import { calculateEsopValue } from './esopValuation';
import { calculateEsopTax } from './esopTax';
import { adjustForCostOfLiving } from './costOfLiving';
import { fetchStockPrice } from './stockPriceFetcher';

interface OfferInput {
  companyName: string;
  tickerSymbol: string;    // e.g. "TCS.BSE" - optional if no ESOPs
  city: string;
  baseSalary: number;
  joiningBonus: number;
  annualBonus: number;
  esopUnitsGranted?: number;
  esopGrantPrice?: number;
  esopVestingYears?: number;
  esopCliffYears?: number;
}

export async function compareOffer(input: OfferInput) {
  const {
    companyName, tickerSymbol, city,
    baseSalary, joiningBonus, annualBonus,
    esopUnitsGranted, esopGrantPrice, esopVestingYears, esopCliffYears,
  } = input;

  // Step 1: cash components, taxed
  const grossCashIncome = baseSalary + joiningBonus + annualBonus;
  const cashTaxResult = calculateTakeHome(grossCashIncome);

  // Step 2 & 3: ESOP valuation and tax (only if the offer actually includes ESOPs)
  let esopPostTaxValue = 0;
  let esopDetails = null;
  let stockPriceUsed = null;

  const hasEsops = esopUnitsGranted && esopUnitsGranted > 0 && esopGrantPrice && tickerSymbol;

  if (hasEsops) {
    const stockResult = await fetchStockPrice(tickerSymbol);

    if (stockResult.success && stockResult.price) {
      stockPriceUsed = stockResult.price;

      const esopValue = calculateEsopValue({
        unitsGranted: esopUnitsGranted,
        grantPrice: esopGrantPrice,
        currentStockPrice: stockResult.price,
        vestingYears: esopVestingYears ?? 4,
        cliffYears: esopCliffYears ?? 1,
      });

      const esopTaxResult = calculateEsopTax({
        esopSpreadValue: esopValue.effectiveAnnualValue,
        existingAnnualIncome: grossCashIncome,
      });

      esopPostTaxValue = esopTaxResult.postTaxEsopValue;
      esopDetails = { ...esopValue, ...esopTaxResult };
    } else {
      esopDetails = { error: stockResult.errorMessage ?? 'Could not fetch stock price' };
    }
  }

  // Step 4: total real value before location adjustment
  const totalAnnualValue = cashTaxResult.takeHome + esopPostTaxValue;

  // Step 5: cost-of-living adjustment
  const costAdjusted = adjustForCostOfLiving(totalAnnualValue, city);

  return {
    companyName,
    city,
    cashBreakdown: cashTaxResult,
    esopBreakdown: esopDetails,
    stockPriceUsed,
    totalAnnualValueBeforeCOL: totalAnnualValue,
    finalComparableValue: costAdjusted.costAdjustedValue,
    costOfLivingAdjustmentApplied: costAdjusted.adjustmentAvailable,
  };
}

// Offer Comparator - the main "conductor" function.
// Combines tax, ESOP valuation (with company-risk-adjusted haircut), ESOP tax,
// cost-of-living, and live stock price into one final comparable offer value.

import { calculateTakeHome } from './taxCalculator';
import { calculateEsopValue } from './esopValuation';
import { calculateEsopTax } from './esopTax';
import { adjustForCostOfLiving } from './costOfLiving';
import { fetchStockPrice } from './stockPriceFetcher';
import { getCompanyRiskProfile } from './companyRiskProfile';

interface OfferInput {
  companyName: string;
  tickerSymbol: string;
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

  const grossCashIncome = baseSalary + joiningBonus + annualBonus;
  const cashTaxResult = calculateTakeHome(grossCashIncome);

  let esopPostTaxValue = 0;
  let esopDetails = null;
  let stockPriceUsed = null;

  const riskProfile = getCompanyRiskProfile(companyName);
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
        riskHaircut: riskProfile.riskHaircut ?? undefined,
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

  const totalAnnualValue = cashTaxResult.takeHome + esopPostTaxValue;
  const costAdjusted = adjustForCostOfLiving(totalAnnualValue, city);

  return {
    companyName,
    companyRiskProfile: riskProfile,
    city,
    cashBreakdown: cashTaxResult,
    esopBreakdown: esopDetails,
    stockPriceUsed,
    totalAnnualValueBeforeCOL: totalAnnualValue,
    finalComparableValue: costAdjusted.costAdjustedValue,
    costOfLivingAdjustmentApplied: costAdjusted.adjustmentAvailable,
  };
}

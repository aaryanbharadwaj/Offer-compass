// Indian Income Tax Calculator - New Tax Regime
// Verified against Budget 2025 rules (FY 2025-26 / AY 2026-27), confirmed unchanged in Budget 2026.
// Source: Union Budget 2025 announcement, cross-verified across multiple tax advisory publications (July 2026).

interface TaxSlab {
  min: number;
  max: number | null;
  rate: number;
}

const TAX_SLABS: TaxSlab[] = [
  { min: 0, max: 400000, rate: 0 },
  { min: 400000, max: 800000, rate: 0.05 },
  { min: 800000, max: 1200000, rate: 0.10 },
  { min: 1200000, max: 1600000, rate: 0.15 },
  { min: 1600000, max: 2000000, rate: 0.20 },
  { min: 2000000, max: 2400000, rate: 0.25 },
  { min: 2400000, max: null, rate: 0.30 },
];

const STANDARD_DEDUCTION = 75000;
const CESS_RATE = 0.04;
const REBATE_87A_INCOME_LIMIT = 1200000; // taxable income limit for full rebate eligibility
const REBATE_87A_MAX_AMOUNT = 60000;     // max rebate amount, wipes out tax if income <= limit

function calculateSlabTax(taxableIncome: number): number {
  let tax = 0;
  for (const slab of TAX_SLABS) {
    if (taxableIncome <= slab.min) break;
    const slabUpperBound = slab.max ?? Infinity;
    const incomeInThisSlab = Math.min(taxableIncome, slabUpperBound) - slab.min;
    if (incomeInThisSlab > 0) {
      tax += incomeInThisSlab * slab.rate;
    }
  }
  return tax;
}

export function calculateTakeHome(grossAnnualIncome: number) {
  const taxableIncome = Math.max(0, grossAnnualIncome - STANDARD_DEDUCTION);
  let baseTax = calculateSlabTax(taxableIncome);

  // Section 87A rebate: if taxable income <= 12L, rebate wipes out tax (up to 60,000)
  let rebateApplied = 0;
  if (taxableIncome <= REBATE_87A_INCOME_LIMIT) {
    rebateApplied = Math.min(baseTax, REBATE_87A_MAX_AMOUNT);
    baseTax -= rebateApplied;
  }

  const cess = baseTax * CESS_RATE;
  const totalTax = baseTax + cess;
  const takeHome = grossAnnualIncome - totalTax;

  return {
    grossAnnualIncome,
    standardDeduction: STANDARD_DEDUCTION,
    taxableIncome,
    baseTax: Math.round(baseTax),
    rebateApplied: Math.round(rebateApplied),
    cess: Math.round(cess),
    totalTax: Math.round(totalTax),
    takeHome: Math.round(takeHome),
    effectiveTaxRate: Number(((totalTax / grossAnnualIncome) * 100).toFixed(2)),
  };
}

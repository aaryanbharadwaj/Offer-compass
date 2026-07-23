// Company Risk Profile - ESOP risk classification based on SEBI/AMFI market-cap categories
//
// SOURCE: Classification framework defined by SEBI circular SEBI/HO/IMD/DF3/CIR/P/2017/114
// (6 Oct 2017), implemented via AMFI's official published list at
// https://www.amfiindia.com/otherdata/categorisation-of-stocks (updated every 6 months, Jan/Jul).
//
// LIMITATION (documented deliberately): AMFI's list is published as a PDF/Excel file, not a
// structured API, and updates only twice yearly - so rather than build fragile live-parsing
// for data that barely changes, this is a manually curated reference list of major recruiters
// relevant to campus placements, verified against AMFI's July 2026 categorisation.
// Companies not in this list return riskCategory: null rather than a guessed value.
//
// Large-cap cutoff (July 2026, AMFI): ~₹1,06,300 Cr average market cap (6-month basis)

type RiskCategory = 'Large-cap' | 'Mid-cap' | 'Small-cap';

interface CompanyEntry {
  category: RiskCategory;
  asOf: string; // classification date, since this can change every 6 months
}

// Curated list - major campus recruiters, classified per AMFI July 2026 data.
// Company name keys are matched case-insensitively.
const COMPANY_RISK_LIST: Record<string, CompanyEntry> = {
  'tcs': { category: 'Large-cap', asOf: 'July 2026' },
  'tata consultancy services': { category: 'Large-cap', asOf: 'July 2026' },
  'infosys': { category: 'Large-cap', asOf: 'July 2026' },
  'wipro': { category: 'Large-cap', asOf: 'July 2026' },
  'hcl technologies': { category: 'Large-cap', asOf: 'July 2026' },
  'hcltech': { category: 'Large-cap', asOf: 'July 2026' },
  'tech mahindra': { category: 'Large-cap', asOf: 'July 2026' },
  'ltimindtree': { category: 'Large-cap', asOf: 'July 2026' },
};

// Risk haircut adjustment per category - THIS is our own methodology, not AMFI's.
// Informed by the general finance principle that larger, more established companies
// carry lower forfeiture/volatility risk for employees holding unvested ESOPs.
const RISK_HAIRCUT_BY_CATEGORY: Record<RiskCategory, number> = {
  'Large-cap': 0.10,
  'Mid-cap': 0.15,
  'Small-cap': 0.25,
};

export function getCompanyRiskProfile(companyName: string) {
  const key = companyName.trim().toLowerCase();
  const entry = COMPANY_RISK_LIST[key];

  if (!entry) {
    return {
      companyName,
      riskCategory: null,
      riskHaircut: null,
      dataAvailable: false,
      note: 'Company not in our curated reference list - classification unavailable',
    };
  }

  return {
    companyName,
    riskCategory: entry.category,
    classificationAsOf: entry.asOf,
    riskHaircut: RISK_HAIRCUT_BY_CATEGORY[entry.category],
    dataAvailable: true,
  };
}

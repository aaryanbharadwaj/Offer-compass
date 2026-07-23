import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { compareOffer } from './offerComparator';

compareOffer({
  companyName: 'TCS',
  tickerSymbol: 'TCS.BSE',
  city: 'Bangalore',
  baseSalary: 900000,
  joiningBonus: 50000,
  annualBonus: 100000,
  esopUnitsGranted: 500,
  esopGrantPrice: 1500,
  esopVestingYears: 4,
  esopCliffYears: 1,
}).then(result => console.log(JSON.stringify(result, null, 2)));

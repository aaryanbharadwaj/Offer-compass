import { calculateEsopValue } from './esopValuation';

console.log(calculateEsopValue({
  unitsGranted: 1000,
  grantPrice: 50,
  currentStockPrice: 80,
  vestingYears: 4,
  cliffYears: 1,
}));

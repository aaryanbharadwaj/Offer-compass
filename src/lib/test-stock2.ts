import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { fetchStockPrice } from './stockPriceFetcher';

fetchStockPrice('TCS.BSE').then(result => console.log(result));

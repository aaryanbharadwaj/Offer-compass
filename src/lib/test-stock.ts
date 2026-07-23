import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { fetchStockPrice } from './stockPriceFetcher';

fetchStockPrice('IBM').then(result => console.log(result));

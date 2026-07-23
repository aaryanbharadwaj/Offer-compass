// Stock Price Fetcher - fetches real-time stock prices from Alpha Vantage API
// Source: Alpha Vantage (https://www.alphavantage.co) - established financial data provider,
// widely used free-tier API for real-time and historical market data.
// NOTE: Free tier is limited to 25 requests/day - caching layer (via database) should be
// added on top of this function to avoid hitting that limit under normal usage.

interface StockPriceResult {
  ticker: string;
  price: number | null;
  success: boolean;
  errorMessage?: string;
}

export async function fetchStockPrice(ticker: string): Promise<StockPriceResult> {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;

  if (!apiKey) {
    return {
      ticker,
      price: null,
      success: false,
      errorMessage: 'API key not configured',
    };
  }

  const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    // Alpha Vantage returns an object like { "Global Quote": { "05. price": "123.45", ... } }
    const priceString = data['Global Quote']?.['05. price'];

    if (!priceString) {
      return {
        ticker,
        price: null,
        success: false,
        errorMessage: data['Note'] || data['Error Message'] || 'No price data returned - check ticker symbol or API limit',
      };
    }

    return {
      ticker,
      price: parseFloat(priceString),
      success: true,
    };
  } catch (error) {
    return {
      ticker,
      price: null,
      success: false,
      errorMessage: 'Network error while fetching stock price',
    };
  }
}

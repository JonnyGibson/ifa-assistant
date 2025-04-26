const axios = require('axios');
const cheerio = require('cheerio');
const NodeCache = require('node-cache');

// Initialize cache with 12 hour TTL (in seconds)
const cache = new NodeCache({ stdTTL: 43200 });

// Rate limiting - store last request timestamps
const requestTimestamps = {};

// Rate limit helper function
const checkRateLimit = (isin) => {
  const now = Date.now();
  const lastRequest = requestTimestamps[isin] || 0;
  
  if (now - lastRequest < 1000) { // 1 second rate limit
    return false;
  }
  
  requestTimestamps[isin] = now;
  return true;
};

exports.handler = async (event) => {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  // Get ISIN from query parameters
  const { isin } = event.queryStringParameters || {};
  if (!isin) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'ISIN parameter is required' }),
    };
  }

  try {
    // Check rate limit
    if (!checkRateLimit(isin)) {
      return {
        statusCode: 429,
        body: JSON.stringify({ 
          error: 'Rate limit exceeded',
          message: 'Please wait at least 1 second between requests'
        })
      };
    }

    // Check cache first
    const cachedData = cache.get(isin);
    if (cachedData) {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=43200'
        },
        body: JSON.stringify({
          ...cachedData,
          cached: true
        })
      };
    }

    // Construct FT URL
    const url = `https://markets.ft.com/data/funds/tearsheet/summary?s=${isin}`;
    
    // Make request with headers that mimic a browser
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    // Load HTML into cheerio
    const $ = cheerio.load(response.data);
    
    // Extract price information
    const priceElement = $('.mod-tearsheet-overview__quote__bar li').first();
    const price = priceElement.find('.mod-ui-data-list__value').text().trim();
    
    // Extract currency from the label
    const currencyMatch = priceElement
      .find('.mod-ui-data-list__label')
      .text()
      .match(/\(([A-Z]{3})\)/);
    const currency = currencyMatch ? currencyMatch[1] : null;

    // Extract change information
    const changeElement = $('.mod-tearsheet-overview__quote__bar li').eq(1);
    const change = changeElement.find('.mod-ui-data-list__value').text().trim();
    
    // Get timestamp
    const timestamp = new Date().toISOString();

    // Prepare response data
    const responseData = {
      isin,
      price: parseFloat(price),
      currency,
      change,
      timestamp,
      source: 'FT Markets'
    };

    // Store in cache
    cache.set(isin, responseData);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=43200'
      },
      body: JSON.stringify(responseData)
    };
  } catch (error) {
    console.error('Error fetching fund price:', error);
    return {
      statusCode: error.response?.status || 500,
      body: JSON.stringify({ 
        error: 'Failed to fetch fund price',
        message: error.message
      })
    };
  }
};
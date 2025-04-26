const axios = require('axios');
const cheerio = require('cheerio');
const NodeCache = require('node-cache');

// Initialize cache with 12 hour TTL (in seconds)
const cache = new NodeCache({ stdTTL: 43200 });

// Rate limiting - store last request timestamps
const requestTimestamps = {};
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

// Common headers for all responses
const getResponseHeaders = () => ({
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Cache-Control': 'public, max-age=43200'
});

// Rate limit helper function
const checkRateLimit = (isin) => {
  const now = Date.now();
  const lastRequest = requestTimestamps[isin] || 0;
  
  if (now - lastRequest < 2000) { // Increase to 2 second rate limit
    return false;
  }
  
  requestTimestamps[isin] = now;
  return true;
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const fetchWithRetry = async (url, headers, isin, retryCount = 0) => {
  try {
    console.log(`[getFundPrice] Attempt ${retryCount + 1} for ${isin}`);
    const response = await axios.get(url, { headers });
    
    // Check if we got an error page instead of fund data
    if (response.data.includes('Access Denied') || 
        response.data.includes('Too Many Requests') ||
        response.data.includes('rate limit')) {
      throw new Error('Access denied or rate limited');
    }

    return response;
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
      console.log(`[getFundPrice] Retrying in ${delay}ms for ${isin}`);
      await sleep(delay);
      return fetchWithRetry(url, headers, isin, retryCount + 1);
    }
    throw error;
  }
};

// Add helper function to parse numbers with commas
const parsePrice = (priceStr) => {
  if (!priceStr) return null;
  // Remove commas and convert to float
  return parseFloat(priceStr.replace(/,/g, ''));
};

exports.handler = async (event) => {
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: getResponseHeaders(),
      body: ''
    };
  }

  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: getResponseHeaders(),
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  // Get ISIN from query parameters
  const { isin } = event.queryStringParameters || {};
  if (!isin) {
    return {
      statusCode: 400,
      headers: getResponseHeaders(),
      body: JSON.stringify({ error: 'ISIN parameter is required' }),
    };
  }

  try {
    // Check rate limit
    if (!checkRateLimit(isin)) {
      return {
        statusCode: 429,
        headers: getResponseHeaders(),
        body: JSON.stringify({ 
          error: 'Rate limit exceeded',
          message: 'Please wait at least 2 seconds between requests'
        })
      };
    }

    // Check cache first
    const cachedData = cache.get(isin);
    if (cachedData) {
      return {
        statusCode: 200,
        headers: getResponseHeaders(),
        body: JSON.stringify({
          ...cachedData,
          cached: true
        })
      };
    }

    // Construct FT URL
    const url = `https://markets.ft.com/data/funds/tearsheet/summary?s=${isin}`;
    
    // Make request with enhanced headers
    const requestHeaders = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Referer': 'https://markets.ft.com/data/funds',
      'sec-ch-ua': '"Chromium";v="122", "Google Chrome";v="122"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"macOS"',
      'Upgrade-Insecure-Requests': '1'
    };

    const response = await fetchWithRetry(url, requestHeaders, isin);

    console.log(`[getFundPrice] Response for ${isin}:`, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      contentType: response.headers['content-type']
    });

    // Load HTML into cheerio
    const $ = cheerio.load(response.data);
    
    // Log the actual price element we're trying to find
    const priceElement = $('.mod-tearsheet-overview__quote__bar li').first();
    console.log(`[getFundPrice] Price element found for ${isin}:`, Boolean(priceElement.length));
    if (priceElement.length) {
      console.log(`[getFundPrice] Price element HTML for ${isin}:`, priceElement.html());
    } else {
      console.log(`[getFundPrice] Full page HTML preview for ${isin}:`, response.data.substring(0, 500));
    }
    
    const priceText = priceElement.find('.mod-ui-data-list__value').text().trim();
    const price = parsePrice(priceText);
    console.log(`[getFundPrice] Extracted price for ${isin}:`, priceText, '→', price);
    
    // Extract currency from the label
    const currencyMatch = priceElement
      .find('.mod-ui-data-list__label')
      .text()
      .match(/\(([A-Z]{3})\)/);
    const currency = currencyMatch ? currencyMatch[1] : null;
    console.log(`[getFundPrice] Extracted currency for ${isin}:`, currency);

    // If we didn't find a price element, throw an error
    if (!price) {
      throw new Error('Could not parse price from page');
    }
    
    // Extract change information
    const changeElement = $('.mod-tearsheet-overview__quote__bar li').eq(1);
    const change = changeElement.find('.mod-ui-data-list__value').text().trim();
    
    // Get timestamp
    const timestamp = new Date().toISOString();

    // Prepare response data
    const responseData = {
      isin,
      price,
      currency,
      change,
      timestamp,
      source: 'FT Markets'
    };

    // Store in cache
    cache.set(isin, responseData);

    return {
      statusCode: 200,
      headers: getResponseHeaders(),
      body: JSON.stringify(responseData)
    };
  } catch (error) {
    console.error('Error fetching fund price:', error);
    return {
      statusCode: error.response?.status || 500,
      headers: getResponseHeaders(),
      body: JSON.stringify({ 
        error: 'Failed to fetch fund price',
        message: error.message
      })
    };
  }
};
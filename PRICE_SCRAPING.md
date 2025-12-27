# Price Scraping Guide

## Quick Start

### Automated Scraping (Vercel Cron Job)

The app automatically scrapes prices daily at 2 AM UTC. No action required!

### Manual Scraping

Trigger price scraping manually:

```bash
# For production
curl -X POST https://soexpensive.vercel.app/api/fetch-prices

# For development
curl -X POST http://localhost:3000/api/fetch-prices
```

### Manual Price Import

Import prices from a JSON file:

```bash
# Import sample prices
./import-sample-prices.sh https://soexpensive.vercel.app

# Import custom prices
curl -X POST https://soexpensive.vercel.app/api/import-prices \
  -H "Content-Type: application/json" \
  -d @my-prices.json
```

## JSON Format for Manual Import

```json
{
  "prices": [
    {"product": "Milk", "store": "Lidl", "price": 0.99},
    {"product": "Bread", "store": "S-Market", "price": 1.29}
  ]
}
```

## Supported Stores

- **Lidl** - Browser automation (puppeteer)
- **S-Market** - Foodie.fm API
- **Prisma** - Foodie.fm API
- **K-Citymarket** - K-Ruoka API
- **K-Supermarket** - K-Ruoka API
- **Alepa** - Foodie.fm API

## How It Works

### Automated Scrapers

1. **K-Ruoka API** - Used for Kesko stores (K-City, K-Super)
   - Endpoint: `https://www.k-ruoka.fi/kr-api/product/search`
   - Searches for common products
   - Parses JSON responses

2. **Foodie.fm API** - Used for SOK stores (S-Market, Prisma, Alepa)
   - Endpoint: `https://www.foodie.fi/api/v1/products/search`
   - Searches for common products
   - Parses JSON responses

3. **Lidl Scraper** - Browser automation
   - Uses puppeteer + chromium
   - Navigates to https://www.lidl.fi/tuotteet
   - Searches and extracts prices from HTML

### Product Matching

Scraped products are fuzzy-matched to database products by name:
- Normalizes Finnish characters (å, ä, ö)
- Case-insensitive matching
- Partial name matches

### Database Updates

- Uses `INSERT ... ON CONFLICT` for upserts
- Updates both price and `recorded_at` timestamp
- Handles errors gracefully per product

## Troubleshooting

### No data returned

1. Check if the APIs are accessible from Vercel
2. Try manual import as fallback
3. Check Vercel function logs for errors

### Timeouts

The fetch-prices function has:
- 3GB memory allocation
- 5-minute timeout
- Configured in `vercel.json`

### API Blockers

Some supermarkets may block automated requests. Solutions:
- Rotate user agents
- Add delays between requests
- Use residential proxies (advanced)
- Fall back to manual import

## Adding More Products

Edit `api/fetch-prices.js`:

```javascript
const commonProducts = [
  'maito', 'leipä', 'juusto', // existing
  'your-product-here'          // add here
];
```

## Development

Test scrapers locally:

```bash
# Start server
npm run dev

# Trigger scraping
curl -X POST http://localhost:3000/api/fetch-prices
```

Note: Puppeteer may not work locally without Chrome installed. It works on Vercel with @sparticuz/chromium.

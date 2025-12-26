# SoExpensive 💰

A fast and simple web application to compare prices of Finnish supermarket goods across multiple stores and track price changes over time.

## Features

- 📊 **Price Comparison** - Compare prices across 6 major Finnish supermarkets
- 📈 **Price History** - Track and visualize price changes over time
- 🔍 **Smart Filtering** - Search by product name and filter by category
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile
- ⚡ **Fast Performance** - Minimal dependencies, optimized for speed
- 💾 **Historical Data** - Store and analyze price progression throughout the year

## Supported Stores

- S-Market
- Prisma
- K-Citymarket
- K-Supermarket
- Lidl
- Alepa

## Tech Stack

- **Backend**: Node.js + Express
- **Database**: SQLite (better-sqlite3)
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Charts**: Chart.js (only external library for visualizations)

## 🚀 Quick Deploy to Replit

**Easiest way to get started:**

1. Go to [Replit](https://replit.com)
2. Click "Create Repl" → "Import from GitHub"
3. Paste this repository URL
4. Click "Run"
5. Your app is live!

See [DEPLOY.md](DEPLOY.md) for detailed deployment instructions.

## Installation

1. Clone the repository
```bash
git clone <repository-url>
cd soexpensive
```

2. Install dependencies
```bash
npm install
```

3. Seed the database with sample data
```bash
node seed.js
```

4. Start the server
```bash
npm start
```

5. Open your browser and navigate to
```
http://localhost:3000
```

## Usage

### Viewing Prices

- Browse all products in the main table
- See which store has the best price (highlighted in green)
- Compare prices across all stores at a glance

### Filtering & Sorting

- **Search**: Type product name in the search box
- **Category Filter**: Select a category from the dropdown
- **Sort Options**:
  - By name (alphabetical)
  - By category
  - By price (low to high, high to low)
  - By price variance (biggest price differences)

### Price History

- Click the "📊 History" button next to any product
- View an interactive chart showing price changes over time
- Compare price trends across different stores

## Database Structure

### Tables

**products**
- id, name, category, unit, created_at

**stores**
- id, name, created_at

**prices**
- id, product_id, store_id, price, recorded_at

## API Endpoints

### GET /api/products
Returns all products with their latest prices

### GET /api/products/:id/history
Returns price history for a specific product

### GET /api/stores
Returns all stores

### POST /api/prices
Add a new price entry
```json
{
  "product_id": 1,
  "store_id": 1,
  "price": 2.99
}
```

### GET /api/products/:id
Get details for a specific product

## Adding New Data

To add new products or update prices, you can:

1. Use the API endpoints
2. Modify the `seed.js` file and re-run it
3. Directly insert into the SQLite database

Example using the API:
```javascript
fetch('http://localhost:3000/api/prices', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    product_id: 1,
    store_id: 1,
    price: 2.99
  })
});
```

## Project Structure

```
soexpensive/
├── package.json          # Dependencies and scripts
├── server.js             # Express server
├── db.js                 # Database operations
├── seed.js               # Sample data seeder
├── prices.db             # SQLite database (created after seeding)
├── public/               # Frontend files
│   ├── index.html        # Main HTML
│   ├── styles.css        # Styling
│   └── app.js            # Frontend JavaScript
└── README.md             # This file
```

## Development

The application is designed to be simple and fast:

- No build process required
- No heavy frameworks
- Minimal dependencies (only Express, better-sqlite3, and Chart.js)
- Pure vanilla JavaScript on the frontend

## Performance

- Fast page loads (< 100ms)
- Efficient database queries with indexing
- Lazy loading of price history data
- Responsive UI with debounced search

## Future Enhancements

Potential features to add:
- Real API integration with actual Finnish supermarket data
- User accounts and shopping lists
- Price alerts and notifications
- Export data to CSV/Excel
- Mobile app version
- Barcode scanning

## License

MIT

## Author

Created as a simple, useful tool for comparing Finnish supermarket prices.

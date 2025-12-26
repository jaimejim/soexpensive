# SoExpensive - Quick Start Guide

Finnish supermarket price comparison application deployed on Vercel.

## 🚀 Current Status

### ✅ Deployment Ready
All code has been optimized and pushed to the `claude/price-comparison-app-km6Wj` branch. Vercel will automatically deploy when you merge or when new commits are pushed.

### 🔧 Recent Fixes
- ✅ Removed better-sqlite3 (incompatible with Vercel)
- ✅ Migrated to PostgreSQL (@vercel/postgres)
- ✅ Fixed static file serving paths
- ✅ Added comprehensive error handling
- ✅ Added caching headers for performance
- ✅ Created health check endpoint
- ✅ Created verification script

## 📋 Complete Setup Checklist

### Step 1: Verify Deployment is Live

1. Check your Vercel dashboard for the latest deployment
2. The build should succeed without errors
3. Click on the deployment URL to visit the site

**Expected**: You'll see the site load, but show "Error loading data" because database isn't configured yet.

### Step 2: Add PostgreSQL Database

1. Go to your Vercel project: https://vercel.com/dashboard
2. Select the `soexpensive` project
3. Go to the **Storage** tab
4. Click **Create Database**
5. Select **Postgres**
6. Click **Create** (free tier is fine for testing)
7. Vercel will automatically set the environment variables

**Important**: After adding the database, the deployment will automatically redeploy with the new environment variables.

### Step 3: Verify Database Connection

Visit: `https://your-deployment-url.vercel.app/api/health`

You should see:
```json
{
  "status": "ok",
  "database": {
    "hasPostgresUrl": true,
    "state": "initialized_empty"
  }
}
```

If `hasPostgresUrl` is `false`, the database wasn't configured correctly.

### Step 4: Seed the Database

Run these commands locally:

```bash
# Pull the Vercel environment variables
vercel env pull

# This creates a .env.local file with POSTGRES_URL

# Run the seed script
node seed.js
```

**Expected output:**
```
Seeding database...
✓ Added 6 stores
✓ Added 67 products
✓ Added 402 current price entries
✓ Added 2412 historical price entries
✓ Database is ready to use
```

### Step 5: Verify Everything Works

1. Visit your deployment URL
2. You should now see products and prices
3. Try filtering by category and searching
4. Click on a product row to see price history

**Or use the verification script:**

```bash
node verify-deployment.js https://your-deployment-url.vercel.app
```

Expected output:
```
✅ Home page: 200
✅ Health check: 200
   Database configured: ✅
   Database state: initialized_with_data
✅ Stores API: 200
✅ Products API: 200
```

## 🎯 What You Get

### Features
- 67 Finnish products across 14 categories
- 6 major Finnish supermarkets
- Real-time price comparison
- Historical price tracking (6 months of data)
- Interactive price history charts
- Search and filter functionality
- Mobile-responsive design

### Stores
- S-Market
- Prisma
- K-Citymarket
- K-Supermarket
- Lidl
- Alepa

### Product Categories
- Maito ja Munat (Milk & Eggs)
- Leipä (Bread)
- Liha (Meat)
- Vihannekset (Vegetables)
- Hedelmät (Fruits)
- Juusto (Cheese)
- Kala (Fish)
- Pakasteet (Frozen)
- Juomat (Beverages)
- Kahvi ja Tee (Coffee & Tea)
- Välipalat (Snacks)
- Einekset (Ready meals)
- Mausteet (Spices)
- Hygienia (Hygiene)

## 🔍 API Endpoints

All endpoints return JSON:

- `GET /api/health` - Health check and database status
- `GET /api/stores` - List all stores
- `GET /api/products` - List all products with current prices
- `GET /api/products/:id` - Get specific product details
- `GET /api/products/:id/history` - Get price history for a product
- `POST /api/prices` - Add a new price entry

## 🛠️ Troubleshooting

### "Error loading data"

**Cause**: Database not configured or not seeded

**Fix**:
1. Check `/api/health` endpoint
2. Ensure PostgreSQL is added in Vercel
3. Run seed script: `node seed.js`

### Build failures

**Cause**: Usually dependency issues

**Fix**:
1. Check Vercel deployment logs
2. Ensure `package.json` only has express and @vercel/postgres
3. No better-sqlite3 or native dependencies

### Seed script fails

**Error**: "Database not configured"

**Fix**:
```bash
# Make sure you've pulled environment variables
vercel env pull

# Check that .env.local exists and has POSTGRES_URL
cat .env.local | grep POSTGRES_URL

# Run seed again
node seed.js
```

### Slow performance

**Check**:
1. Caching headers are set (in vercel.json)
2. Database indexes are created (automatic in seed script)
3. Chart.js is loading from CDN

## 📚 Project Structure

```
soexpensive/
├── api/
│   └── index.js              # Vercel serverless entry point
├── public/
│   ├── index.html           # Frontend UI
│   ├── app.js              # Client-side JavaScript
│   └── styles.css          # Styling
├── server.js               # Express application
├── db.js                   # PostgreSQL database layer
├── seed.js                 # Database seeding script
├── verify-deployment.js    # Deployment verification
├── vercel.json            # Vercel configuration
├── package.json           # Dependencies
├── DEPLOYMENT_STATUS.md   # Detailed deployment info
└── QUICK_START.md        # This file
```

## 🔐 Environment Variables

Required in Vercel (automatically set when you add PostgreSQL):

- `POSTGRES_URL` - Full database connection URL
- `POSTGRES_PRISMA_URL` - Prisma-compatible URL (auto-set)
- `POSTGRES_URL_NON_POOLING` - Non-pooling connection (auto-set)

## 📈 Next Steps (Optional)

### Add More Products
Edit `seed.js` and add products to the `products` array, then run:
```bash
node seed.js
```

### Update Prices
Use the API to add new price entries:
```bash
curl -X POST https://your-url.vercel.app/api/prices \
  -H "Content-Type: application/json" \
  -d '{"product_id": 1, "store_id": 1, "price": 2.99}'
```

### Custom Domain
1. Go to Vercel project settings
2. Click "Domains"
3. Add your custom domain

### Analytics
1. Go to Vercel project settings
2. Click "Analytics"
3. Enable Web Analytics

## 🆘 Need Help?

Check these resources:
- `DEPLOYMENT_STATUS.md` - Detailed deployment information
- `VERCEL_DEPLOY.md` - Original Vercel deployment guide
- `/api/health` - Current system status
- Vercel deployment logs - For build and runtime errors

## 📝 Commands Reference

```bash
# Development
npm run dev              # Run server locally
npm run seed            # Seed database

# Deployment
vercel env pull         # Pull environment variables
node verify-deployment.js <url>  # Verify deployment

# Git
git status              # Check changes
git add .              # Stage changes
git commit -m "msg"    # Commit changes
git push               # Push to remote
```

---

**Happy price comparing! 💰🛒**

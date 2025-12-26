# Site Verification Checklist

## Deployment URL
**https://soexpensive.vercel.app/**

Use this checklist to verify the deployment is working correctly.

## ✅ Step-by-Step Verification

### 1. Check Health Endpoint

Visit: **https://soexpensive.vercel.app/api/health**

**Expected Response:**
```json
{
  "status": "ok",
  "database": {
    "hasPostgresUrl": true,
    "state": "initialized_with_data"
  },
  "timestamp": "2025-12-26T..."
}
```

**What to Check:**
- [ ] `status` is `"ok"`
- [ ] `hasPostgresUrl` is `true`
- [ ] `state` is one of:
  - `"initialized_with_data"` ✅ (Perfect! Site is ready)
  - `"initialized_empty"` ⚠️ (Database configured but needs seeding)
  - `"not_initialized"` ❌ (Database not configured)

---

### 2. Check Stores API

Visit: **https://soexpensive.vercel.app/api/stores**

**Expected Response:**
```json
[
  { "id": 1, "name": "S-Market", "created_at": "..." },
  { "id": 2, "name": "Prisma", "created_at": "..." },
  ...
]
```

**What to Check:**
- [ ] Returns JSON array
- [ ] Contains 6 stores
- [ ] Each store has `id`, `name`, `created_at`

---

### 3. Check Products API

Visit: **https://soexpensive.vercel.app/api/products**

**Expected Response:**
```json
[
  {
    "id": 1,
    "name": "Maito 1L",
    "category": "Maito ja Munat",
    "unit": "1L",
    "prices": {
      "S-Market": { "price": 1.29, "recorded_at": "..." },
      "Prisma": { "price": 1.25, "recorded_at": "..." },
      ...
    }
  },
  ...
]
```

**What to Check:**
- [ ] Returns JSON array
- [ ] Contains 67 products
- [ ] Each product has prices for multiple stores
- [ ] Prices are numbers, not null

---

### 4. Check Main Website

Visit: **https://soexpensive.vercel.app/**

**What to Check:**

#### Page Load
- [ ] Page loads without errors
- [ ] No "Error loading data" message
- [ ] Finnish language interface displays correctly

#### Summary Cards (Top of Page)
- [ ] Shows total products (should be 67)
- [ ] Shows total stores (should be 6)
- [ ] Shows cheapest overall store

#### Product Table
- [ ] Products are displayed in a table
- [ ] Store names in columns (S-Market, Prisma, K-Citymarket, K-Supermarket, Lidl, Alepa)
- [ ] Prices are shown (format: €X.XX)
- [ ] Cheapest prices are highlighted in green

#### Filters and Search
- [ ] Search box works (type product name)
- [ ] Category filter dropdown has categories
- [ ] Sort dropdown has options (Name, Category, Price)
- [ ] Filtering updates the table in real-time

---

### 5. Check Price History Feature

**Steps:**
1. Click on any product row in the table
2. A modal should appear with price history chart

**What to Check:**
- [ ] Modal opens when clicking a product
- [ ] Product name is shown in modal title
- [ ] Chart displays with multiple lines (one per store)
- [ ] Chart shows historical data (6 months)
- [ ] Can close modal by clicking X or outside

---

### 6. Check Mobile Responsiveness

**Test on mobile device or resize browser:**
- [ ] Layout adapts to smaller screens
- [ ] Tables are scrollable on mobile
- [ ] Filters remain accessible
- [ ] Charts display correctly

---

## 🚨 If Database is Not Configured

If health check shows `"hasPostgresUrl": false` or `"state": "not_initialized"`:

### Add PostgreSQL Database:
1. Go to https://vercel.com/dashboard
2. Select `soexpensive` project
3. Go to **Storage** tab
4. Click **Create Database** → **Postgres**
5. Click **Create**
6. Wait for deployment to complete (auto-redeploys with env vars)

### Seed the Database:
```bash
# Pull environment variables
vercel env pull

# Run seed script
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

---

## 🎯 Success Criteria

Your deployment is successful if:
- ✅ Health endpoint shows `"initialized_with_data"`
- ✅ Stores API returns 6 stores
- ✅ Products API returns 67 products with prices
- ✅ Main website displays product table with prices
- ✅ Price history charts work when clicking products
- ✅ Search and filters function correctly

---

## 📊 What You Should See

### Products (67 total across 14 categories):

**Categories:**
1. Maito ja Munat (Milk & Eggs)
2. Leipä (Bread)
3. Liha (Meat)
4. Vihannekset (Vegetables)
5. Hedelmät (Fruits)
6. Juusto (Cheese)
7. Kala (Fish)
8. Pakasteet (Frozen)
9. Juomat (Beverages)
10. Kahvi ja Tee (Coffee & Tea)
11. Välipalat (Snacks)
12. Einekset (Ready meals)
13. Mausteet (Spices)
14. Hygienia (Hygiene)

### Stores (6 total):
- S-Market
- Prisma
- K-Citymarket
- K-Supermarket
- Lidl
- Alepa

### Price Data:
- Current prices for all products across all stores
- 6 months of historical price data
- Prices vary by store (realistic Finnish supermarket prices)

---

## 🔧 Troubleshooting

### Site shows "Error loading data"
**Cause:** Database not seeded
**Fix:** Run `node seed.js` after pulling env vars

### Health check shows error message
**Cause:** Database connection issue
**Fix:** Check Vercel logs, verify POSTGRES_URL is set

### Products show but no prices
**Cause:** Price data not seeded
**Fix:** Re-run seed script

### Charts don't display
**Cause:** Chart.js CDN not loading
**Fix:** Check browser console, verify CDN is accessible

---

## 📝 Quick Test Commands

**From your terminal:**
```bash
# Test health endpoint
curl https://soexpensive.vercel.app/api/health

# Test stores
curl https://soexpensive.vercel.app/api/stores

# Test products (returns large JSON, pipe to jq for formatting)
curl https://soexpensive.vercel.app/api/products | jq '.[0]'

# Count products
curl -s https://soexpensive.vercel.app/api/products | jq 'length'
```

---

**Last Updated:** After all deployment optimizations
**Status:** ✅ Ready for production testing

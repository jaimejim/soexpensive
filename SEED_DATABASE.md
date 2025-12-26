# Database Seeding Instructions

## ✅ Database Created Successfully!

Your Neon PostgreSQL database is now connected to your Vercel project.

**Database:** `neondb` on Neon (EU Central 1)
**Status:** Connected and ready to seed

---

## 🌱 Seed the Database (Run Locally)

From your local terminal, run these commands:

```bash
# 1. Make sure you're in the project directory
cd soexpensive

# 2. Pull the environment variables from Vercel
vercel env pull

# This creates a .env.local file with your database credentials

# 3. Run the seed script
node seed.js
```

---

## 📊 Expected Output

When seeding completes successfully, you should see:

```
Seeding database...
Added store: S-Market (ID: 1)
Added store: Prisma (ID: 2)
Added store: K-Citymarket (ID: 3)
Added store: K-Supermarket (ID: 4)
Added store: Lidl (ID: 5)
Added store: Alepa (ID: 6)
Added product: Maito 1L
Added product: Piimä 1L
... (67 products total)
✓ Database seeded successfully!
✓ Added 6 stores
✓ Added 67 products
✓ Added 402 current price entries
Adding historical price data...
✓ Added 2412 historical price entries
✓ Database is ready to use
```

---

## 🔍 Verify the Site Works

After seeding, visit:

### 1. Check Health
**URL:** https://soexpensive.vercel.app/api/health

**Expected response:**
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

### 2. View the Site
**URL:** https://soexpensive.vercel.app/

**You should see:**
- Summary cards showing 67 products and 6 stores
- Product table with prices across all stores
- Green highlighting on cheapest prices
- Working search and filter controls
- Price history charts when clicking products

---

## 🎯 What Gets Added to Database

### Stores (6)
1. S-Market
2. Prisma
3. K-Citymarket
4. K-Supermarket
5. Lidl
6. Alepa

### Products (67 across 14 categories)

**Categories:**
- Maito ja Munat (Milk & Eggs) - 5 products
- Leipä (Bread) - 4 products
- Liha (Meat) - 6 products
- Vihannekset (Vegetables) - 5 products
- Hedelmät (Fruits) - 5 products
- Juusto (Cheese) - 4 products
- Kala (Fish) - 4 products
- Pakasteet (Frozen) - 5 products
- Juomat (Beverages) - 5 products
- Kahvi ja Tee (Coffee & Tea) - 5 products
- Välipalat (Snacks) - 5 products
- Einekset (Ready meals) - 5 products
- Mausteet (Spices) - 4 products
- Hygienia (Hygiene) - 5 products

### Price Data
- **Current prices:** 402 entries (67 products × 6 stores)
- **Historical data:** 2,412 entries (6 months of history)
- **Price range:** €0.79 - €15.99 (realistic Finnish prices)

---

## 🚨 Troubleshooting

### "No existing credentials found"
Run: `vercel login` first, then `vercel env pull`

### "Error connecting to database"
- Make sure you ran `vercel env pull`
- Check that `.env.local` file exists
- Verify the POSTGRES_URL is in the file

### Seed script fails
- Ensure you have Node.js installed
- Run `npm install` to install dependencies
- Check your internet connection

### Site shows "Error loading data" after seeding
- Wait 30 seconds and refresh (serverless cold start)
- Check `/api/health` endpoint
- Verify database shows `"initialized_with_data"`

---

## 🎉 You're Done!

Once seeding completes and you see the site working:

✅ Database is populated
✅ Site is live at https://soexpensive.vercel.app/
✅ All features working (search, filters, price history)
✅ 67 Finnish products ready to compare
✅ 6 stores with realistic prices

Enjoy your Finnish supermarket price comparison app! 💰🛒

---

**Database Region:** EU Central 1 (AWS Neon)
**Connection:** Pooled (optimized for serverless)
**SSL:** Required (secure connection)

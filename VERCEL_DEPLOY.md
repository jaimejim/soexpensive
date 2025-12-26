# Deploy to Vercel - Complete Guide

This guide will help you deploy the SoExpensive app to Vercel with Postgres database.

## Prerequisites

- A [Vercel account](https://vercel.com/signup) (free tier works)
- Your code pushed to GitHub

## Step 1: Deploy to Vercel

### Option A: Using Vercel Dashboard (Recommended)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Project"
3. Import your GitHub repository (`jaimejim/soexpensive`)
4. Vercel will auto-detect the Node.js framework
5. Click "Deploy" (don't worry about the database yet)

### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## Step 2: Add Vercel Postgres Database

1. Go to your project dashboard on Vercel
2. Click on the "Storage" tab
3. Click "Create Database"
4. Select "Postgres"
5. Choose your region (select closest to your users)
6. Click "Create"

Vercel will automatically:
- Create a Postgres database
- Add environment variables to your project
- Redeploy your app with the database connection

## Step 3: Seed the Database

After the database is created, you need to seed it with initial data.

### Method 1: Using Vercel CLI (Easiest)

```bash
# Pull environment variables locally
vercel env pull

# Run seed script
node seed.js
```

### Method 2: Using Vercel Dashboard

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Copy all `POSTGRES_*` variables
4. Create a local `.env` file with these values
5. Run: `node seed.js`

### Method 3: Create a seed API endpoint

We'll create a protected endpoint to seed the database:

1. Create `/api/seed` endpoint (already configured in the code)
2. Visit: `https://your-app.vercel.app/api/seed?secret=YOUR_SECRET_KEY`

## Step 4: Verify Deployment

Visit your deployed URL:
```
https://your-project-name.vercel.app
```

You should see:
- ✅ The main page loads
- ✅ Products are displayed
- ✅ Price history charts work
- ✅ All 67 products with prices

## Environment Variables

Vercel Postgres automatically provides these variables:

- `POSTGRES_URL` - Connection string for the database
- `POSTGRES_PRISMA_URL` - Connection pooling URL
- `POSTGRES_URL_NON_POOLING` - Direct connection URL
- `POSTGRES_USER` - Database user
- `POSTGRES_HOST` - Database host
- `POSTGRES_PASSWORD` - Database password
- `POSTGRES_DATABASE` - Database name

You don't need to set these manually - Vercel handles it automatically!

## Custom Domain (Optional)

1. Go to your project settings
2. Click "Domains"
3. Add your custom domain
4. Update DNS records as instructed

## Troubleshooting

### Database Connection Errors

If you see database errors:

1. Check that Postgres storage is properly connected
2. Verify environment variables are set
3. Redeploy the project

### No Data Showing

If the app loads but shows no products:

1. Run the seed script (see Step 3)
2. Check Vercel logs for errors
3. Verify database tables were created

### Checking Logs

View logs in real-time:
```bash
vercel logs
```

Or in the Vercel dashboard:
1. Go to your project
2. Click "Deployments"
3. Click on the latest deployment
4. View logs

## Database Management

### Accessing the Database

Use Vercel's SQL editor:
1. Go to Storage tab
2. Click on your Postgres database
3. Use the "Query" tab

Or connect with psql:
```bash
psql "$(vercel env get POSTGRES_URL)"
```

### Backup Database

```bash
# Export data
vercel env get POSTGRES_URL | xargs pg_dump > backup.sql

# Import data
vercel env get POSTGRES_URL | xargs psql < backup.sql
```

## Updating the App

1. Push changes to GitHub
2. Vercel automatically redeploys
3. Changes go live in ~30 seconds

## Costs

**Free Tier Includes:**
- Unlimited deployments
- 100 GB bandwidth/month
- Serverless functions
- 60 hours of Postgres compute time
- 256 MB database storage

Perfect for this project!

## Performance Tips

1. **Enable caching**: Add cache headers for static content
2. **Use connection pooling**: Already configured with `POSTGRES_PRISMA_URL`
3. **Monitor usage**: Check Vercel analytics dashboard

## Support

- Vercel Docs: https://vercel.com/docs
- Postgres Docs: https://vercel.com/docs/storage/vercel-postgres
- Issues: https://github.com/jaimejim/soexpensive/issues

---

Your Finnish supermarket price comparison app is now live on Vercel! 🎉

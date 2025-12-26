# Deploy SoExpensive to Replit

This guide will help you deploy the Finnish supermarket price comparison app to Replit.

## Quick Deploy (Easiest Method)

### Option 1: Import from GitHub

1. Go to [Replit](https://replit.com)
2. Click "Create Repl" or "+"
3. Select "Import from GitHub"
4. Paste your repository URL: `https://github.com/jaimejim/soexpensive`
5. Click "Import from GitHub"
6. Replit will automatically detect the configuration and install dependencies
7. Click "Run" - the database will be automatically seeded on first run
8. Your app will be live! The URL will be shown at the top of the Replit window

### Option 2: Manual Upload

1. Go to [Replit](https://replit.com) and sign in
2. Click "Create Repl"
3. Choose "Node.js" as the template
4. Name it "soexpensive" or whatever you prefer
5. Once created, upload all project files:
   - Click on the Files icon
   - Drag and drop all project files OR use "Upload file" button
   - Upload: `.replit`, `replit.nix`, `package.json`, `server.js`, `db.js`, `seed.js`, `init.js`, `README.md`
   - Upload the `public/` folder with all its contents
6. Click "Run" button
7. Replit will install dependencies and start the server automatically

## After Deployment

Once deployed, your app will be accessible at:
```
https://soexpensive.YOUR-USERNAME.repl.co
```

The exact URL will be shown in the Replit webview window at the top.

## Configuration Already Included

The following files are already configured for Replit:

- `.replit` - Replit run configuration
- `replit.nix` - Nix package dependencies
- `init.js` - Auto-seeds database on first run
- `package.json` - Updated start script

## Features After Deployment

Once deployed on Replit, your app will:

✅ Automatically install all dependencies
✅ Seed the database with 67 Finnish products
✅ Generate 6 months of historical price data
✅ Be accessible via a public URL
✅ Auto-wake when someone visits the URL (on free tier)

## Replit-Specific Notes

### Free Tier Limitations
- App sleeps after inactivity (wakes up on next visit)
- Always-on requires Hacker plan ($7/month)

### Making it Always-On (Optional)
1. Click on your Repl name at the top
2. Go to "Settings"
3. Find "Always On" toggle
4. Enable it (requires paid plan)

### Custom Domain (Optional)
1. Go to your Repl settings
2. Click "Domains" tab
3. Link your custom domain

## Database Persistence

The SQLite database (`prices.db`) will persist in Replit storage. To reset it:

1. Open Shell in Replit
2. Run: `rm prices.db`
3. Click "Run" again to reseed

## Updating Prices

To add new price data, you can:

1. Use the API endpoints (see README.md)
2. Modify `seed.js` and re-run: `npm run seed`
3. Access the database directly in Replit Shell

## Troubleshooting

### "Module not found" errors
- Click "Shell" tab
- Run: `npm install`
- Click "Run" again

### Database not seeding
- Open Shell
- Run: `rm prices.db`
- Run: `npm run seed`

### Port issues
Replit automatically handles ports. If you see port errors, the app is likely already running.

## Support

For issues specific to:
- **The app**: Check README.md
- **Replit deployment**: Visit [Replit Docs](https://docs.replit.com)

---

Enjoy your Finnish supermarket price comparison app! 🇫🇮 💰

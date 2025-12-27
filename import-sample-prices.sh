#!/bin/bash
# Import sample prices to the database
# Usage: ./import-sample-prices.sh [URL]
# Example: ./import-sample-prices.sh https://soexpensive.vercel.app

URL=${1:-http://localhost:3000}

echo "Importing sample prices to $URL/api/import-prices..."

curl -X POST "$URL/api/import-prices" \
  -H "Content-Type: application/json" \
  -d @sample-prices.json \
  | jq '.'

echo "\nDone! Check the output above for results."

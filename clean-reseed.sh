#!/bin/bash

echo "=== Step 1: Cleaning database (dropping old tables) ==="
curl -X POST https://soexpensive.vercel.app/api/cleanup
echo -e "\n"

echo "=== Step 2: Reseeding database (creating new tables with INTEGER cents) ==="
curl -X GET https://soexpensive.vercel.app/api/seed
echo -e "\n"

echo "=== Step 3: Verifying data (fetching products) ==="
curl -X GET https://soexpensive.vercel.app/api/products
echo -e "\n"

echo "=== Done! Check the website: https://soexpensive.vercel.app ==="

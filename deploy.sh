#!/bin/bash

# Vercel Deployment Script
# Triggers deployment for claude/price-comparison-app-km6Wj branch

DEPLOY_HOOK="https://api.vercel.com/v1/integrations/deploy/prj_0AXEktDp4NFhbVeOYLDAz3wXOv6e/zH2UYKjBQA"
BYPASS_TOKEN="gax219N3ufYXlCZETlOocgr27b33nKpd"

echo "🚀 Triggering Vercel deployment..."
echo ""

response=$(curl -X POST "${DEPLOY_HOOK}?x-vercel-protection-bypass=${BYPASS_TOKEN}" 2>&1)

if [ $? -eq 0 ]; then
    echo "✅ Deployment triggered successfully!"
    echo ""
    echo "Response:"
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
    echo ""
    echo "Check your deployment at: https://vercel.com/jaimejim/soexpensive/deployments"
else
    echo "❌ Deployment failed"
    echo "$response"
fi

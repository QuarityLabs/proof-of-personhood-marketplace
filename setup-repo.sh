#!/bin/bash

set -e

REPO=$(gh repo view --json name --jq .name)
OWNER=$(gh repo view --json owner --jq .owner.login)

echo "Setting up branch protection for $OWNER/$REPO..."

gh api \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  repos/$OWNER/$REPO/branches/main/protection \
  -f required_pull_request_reviews='{"required_approving_review_count":1}' \
  -f enforce_admins=false \
  -f required_linear_history=true \
  -f allow_deletions=false \
  -f allow_force_pushes=false \
  -f restrictions=null \
  -f required_status_checks='{"strict":true,"contexts":["CI"]}' \
  --jq '{
    branch: input.branch,
    required_pull_request_reviews: .required_pull_request_reviews,
    required_status_checks: .required_status_checks,
    enforce_admins: .enforce_admins,
    allow_deletions: .allow_deletions,
    allow_force_pushes: .allow_force_pushes
  }'

echo "✓ Branch protection configured successfully"
echo "  - Pull requests required"
echo "  - CI status check required"
echo "  - Force push disabled"
echo "  - Branch deletion disabled"

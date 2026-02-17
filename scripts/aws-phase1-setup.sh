#!/usr/bin/env bash
# Phase 1: Create S3 bucket eid-meme-maker-assets, CORS, and IAM user for Convex.
# Prerequisites: AWS CLI installed and configured (aws configure).
# Usage: ./scripts/aws-phase1-setup.sh [region]
# Optional: CORS_ORIGIN (default "*") — set to your app origin for production.
# Default region: us-east-1

set -euo pipefail
REGION="${1:-us-east-1}"
BUCKET="eid-meme-maker-assets"
IAM_USER="eid-meme-convex"
CORS_ORIGIN="${CORS_ORIGIN:-*}"

echo "Using region: $REGION"
echo "Bucket: $BUCKET"
echo "IAM user: $IAM_USER"
echo ""

# 1. Create S3 bucket
echo "Creating S3 bucket..."
BUCKET_CHECK=$(aws s3api head-bucket --bucket "$BUCKET" 2>&1) || true
BUCKET_CHECK_STATUS=$?
if [ "$BUCKET_CHECK_STATUS" -eq 0 ]; then
  echo "Bucket $BUCKET already exists and is owned by this account, skipping create."
elif echo "$BUCKET_CHECK" | grep -q "403\|Forbidden"; then
  echo "ERROR: Bucket $BUCKET exists but is owned by another account. Aborting." >&2
  exit 1
else
  if [ "$REGION" = "us-east-1" ]; then
    aws s3api create-bucket --bucket "$BUCKET" --region "$REGION"
  else
    aws s3api create-bucket \
      --bucket "$BUCKET" \
      --region "$REGION" \
      --create-bucket-configuration "LocationConstraint=$REGION"
  fi
  echo "Bucket created."
  echo "Blocking public access..."
  aws s3api put-public-access-block \
    --bucket "$BUCKET" \
    --public-access-block-configuration \
    "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
  echo "Public access blocked."
fi

# 2. Apply CORS
echo "Applying CORS configuration..."
CORS_FILE=$(mktemp)
echo "{\"CORSRules\":[{\"AllowedHeaders\":[\"*\"],\"AllowedMethods\":[\"GET\",\"PUT\",\"HEAD\"],\"AllowedOrigins\":[\"$CORS_ORIGIN\"],\"ExposeHeaders\":[\"ETag\"]}]}" > "$CORS_FILE"
aws s3api put-bucket-cors --bucket "$BUCKET" --cors-configuration "file://$CORS_FILE"
rm -f "$CORS_FILE"
echo "CORS applied."

# 3. Create IAM user (idempotent: only ignore EntityAlreadyExists)
echo "Creating IAM user..."
IAM_OUT=$(aws iam create-user --user-name "$IAM_USER" 2>&1) || true
IAM_EXIT=$?
if [ "$IAM_EXIT" -eq 0 ]; then
  echo "IAM user $IAM_USER created."
elif echo "$IAM_OUT" | grep -q "EntityAlreadyExists"; then
  echo "IAM user $IAM_USER already exists."
else
  echo "ERROR: Failed to create IAM user: $IAM_OUT" >&2
  exit 1
fi

# 4. Attach inline policy for S3 access (use $BUCKET so changing BUCKET var works)
echo "Attaching S3 policy to IAM user..."
POLICY_FILE=$(mktemp)
cat > "$POLICY_FILE" << POLICY
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::${BUCKET}/*"
    },
    {
      "Effect": "Allow",
      "Action": ["s3:ListBucket"],
      "Resource": "arn:aws:s3:::${BUCKET}"
    }
  ]
}
POLICY
aws iam put-user-policy \
  --user-name "$IAM_USER" \
  --policy-name "eid-meme-s3-access" \
  --policy-document "file://$POLICY_FILE"
rm -f "$POLICY_FILE"
echo "Policy attached."

# 5. Create access key only if user has fewer than 2 keys (idempotent)
echo "Creating access key..."
KEY_COUNT=$(aws iam list-access-keys --user-name "$IAM_USER" --query 'AccessKeyMetadata | length(@)' --output text 2>/dev/null || echo "0")
if [ "${KEY_COUNT:-0}" -ge 2 ]; then
  echo "User $IAM_USER already has $KEY_COUNT access keys (max 2). Create or rotate keys in AWS Console: IAM > Users > $IAM_USER > Security credentials."
  echo "Then set Convex env: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION=$REGION, S3_BUCKET=$BUCKET"
else
  if ! KEY_JSON=$(aws iam create-access-key --user-name "$IAM_USER" 2>/dev/null); then
    echo "Could not create access key. Create one in AWS Console: IAM > Users > $IAM_USER > Security credentials > Create access key."
    echo "Then set Convex env: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION=$REGION, S3_BUCKET=$BUCKET"
  else
    echo "$KEY_JSON"
    echo ""
    echo "--- Save the SecretAccessKey above; it is shown only once. Then add to Convex (Settings > Environment Variables): ---"
    echo "  AWS_ACCESS_KEY_ID     = (AccessKeyId from above)"
    echo "  AWS_SECRET_ACCESS_KEY = (SecretAccessKey from above)"
    echo "  AWS_REGION            = $REGION"
    echo "  S3_BUCKET             = $BUCKET"
  fi
fi

echo ""
echo "Phase 1 done. Bucket: $BUCKET, region: $REGION, IAM user: $IAM_USER"

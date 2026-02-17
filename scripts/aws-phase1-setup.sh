#!/usr/bin/env bash
# Phase 1: Create S3 bucket eid-meme-maker-assets, CORS, and IAM user for Convex.
# Prerequisites: AWS CLI installed and configured (aws configure).
# Usage: ./scripts/aws-phase1-setup.sh [region]
# Default region: us-east-1

set -e
REGION="${1:-us-east-1}"
BUCKET="eid-meme-maker-assets"
IAM_USER="eid-meme-convex"

echo "Using region: $REGION"
echo "Bucket: $BUCKET"
echo "IAM user: $IAM_USER"
echo ""

# 1. Create S3 bucket
echo "Creating S3 bucket..."
if aws s3api head-bucket --bucket "$BUCKET" 2>/dev/null; then
  echo "Bucket $BUCKET already exists, skipping create."
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
fi

# 2. Apply CORS
echo "Applying CORS configuration..."
CORS_FILE=$(mktemp)
echo '{"CORSRules":[{"AllowedHeaders":["*"],"AllowedMethods":["GET","PUT","HEAD"],"AllowedOrigins":["*"],"ExposeHeaders":["ETag"]}]}' > "$CORS_FILE"
aws s3api put-bucket-cors --bucket "$BUCKET" --cors-configuration "file://$CORS_FILE"
rm -f "$CORS_FILE"
echo "CORS applied."

# 3. Create IAM user (idempotent: ignore error if user exists)
echo "Creating IAM user..."
aws iam create-user --user-name "$IAM_USER" 2>/dev/null || echo "IAM user $IAM_USER already exists."

# 4. Attach inline policy for S3 access
echo "Attaching S3 policy to IAM user..."
POLICY_FILE=$(mktemp)
cat > "$POLICY_FILE" << 'POLICY'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::eid-meme-maker-assets/*"
    },
    {
      "Effect": "Allow",
      "Action": ["s3:ListBucket"],
      "Resource": "arn:aws:s3:::eid-meme-maker-assets"
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

# 5. Create access key (secret is shown only once)
echo "Creating access key..."
if ! KEY_JSON=$(aws iam create-access-key --user-name "$IAM_USER" 2>/dev/null); then
  echo "Could not create access key (user may already have 2 keys). Create one in AWS Console: IAM > Users > $IAM_USER > Security credentials > Create access key."
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

echo ""
echo "Phase 1 done. Bucket: $BUCKET, region: $REGION, IAM user: $IAM_USER"

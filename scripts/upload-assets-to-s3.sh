#!/bin/bash
# Upload local asset files to S3 bucket.
#
# Prerequisites:
#   - aws CLI configured with IAM credentials (from scripts/aws-phase1-setup.sh)
#   - Asset files exist locally in an ./assets/ directory
#
# Usage:
#   ./scripts/upload-assets-to-s3.sh [--dry-run]
#
# Directory structure expected:
#   assets/
#   ├── heads/          (celebrity head PNGs)
#   ├── backgrounds/    (videos/images)
#   ├── lottie/         (JSON animation files)
#   ├── fonts/          (TTF files)
#   └── sounds/         (MP3 files)

set -euo pipefail

BUCKET="eid-meme-maker-assets"
REGION="${AWS_REGION:-us-east-1}"
ASSETS_DIR="${1:-./assets}"
DRY_RUN=""

if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN="--dryrun"
  ASSETS_DIR="${2:-./assets}"
  echo "=== DRY RUN MODE ==="
fi

if [ ! -d "$ASSETS_DIR" ]; then
  echo "Error: Assets directory '$ASSETS_DIR' not found."
  echo "Create it with the following structure:"
  echo "  assets/heads/      - Celebrity head PNGs"
  echo "  assets/backgrounds/ - Background videos/images"
  echo "  assets/lottie/     - Lottie JSON files"
  echo "  assets/fonts/      - Font TTF files"
  echo "  assets/sounds/     - Sound MP3 files"
  exit 1
fi

echo "Uploading assets to s3://$BUCKET ..."

# Upload each directory with appropriate content types
for dir in heads backgrounds lottie fonts sounds; do
  if [ -d "$ASSETS_DIR/$dir" ]; then
    echo ""
    echo "--- $dir ---"
    aws s3 sync "$ASSETS_DIR/$dir" "s3://$BUCKET/$dir/" \
      --region "$REGION" \
      --acl public-read \
      $DRY_RUN
  else
    echo "Skipping $dir (directory not found)"
  fi
done

echo ""
echo "Upload complete! Assets available at:"
echo "  https://$BUCKET.s3.amazonaws.com/<key>"

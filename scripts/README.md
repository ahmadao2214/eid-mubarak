# Scripts

## AWS Phase 1 setup (`aws-phase1-setup.sh`)

Creates the S3 bucket `eid-meme-maker-assets`, CORS, and IAM user for Convex (Phase 1 of the backend plan).

### Prerequisites

1. **Install AWS CLI** (if not installed):
   - macOS: `brew install awscli`
   - Or: [Install AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)

2. **Configure credentials**:
   ```bash
   aws configure
   ```
   Enter your AWS Access Key ID, Secret Access Key, and default region (e.g. `us-east-1`). You need an IAM user/role that can create S3 buckets and IAM users (e.g. admin or PowerUser).

### Run

```bash
# Default region us-east-1
./scripts/aws-phase1-setup.sh

# Or specify region
./scripts/aws-phase1-setup.sh eu-west-1
```

### After it runs

- Save the **SecretAccessKey** from the JSON output (it is only shown once).
- Add these to **Convex** (Phase 2): Dashboard → your project → Settings → Environment Variables:
  - `AWS_ACCESS_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY`
  - `AWS_REGION` (e.g. `us-east-1`)
  - `S3_BUCKET` = `eid-meme-maker-assets`

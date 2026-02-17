# Backend setup

Step-by-step backend setup for the Eid Meme Maker (Convex + AWS). See [init-plan.md](init-plan.md) for the full plan.

---

## Phase 1: AWS S3 bucket and IAM

Creates the S3 bucket `eid-meme-maker-assets`, CORS, and IAM user for Convex.

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

---

## Phase 2: Convex init and deploy

After Phase 1, from the repo root:

1. **Log in and create/link Convex project** (interactive):
   ```bash
   npx convex dev
   ```
   When prompted, log in to Convex and create a new project or link an existing one. This will create `convex.json` and deploy the schema.

2. **Add environment variables** in the Convex dashboard (Settings → Environment Variables): `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `S3_BUCKET` (from Phase 1 script output).

3. **Deployment URL:** After the first deploy, copy the Convex URL from the dashboard or terminal and set `EXPO_PUBLIC_CONVEX_URL` in the mobile app (e.g. in `.env` and [apps/mobile/src/lib/convex.ts](../apps/mobile/src/lib/convex.ts)).

The schema is in `convex/schema.ts` (projects, renders, sounds, assets, uploads).

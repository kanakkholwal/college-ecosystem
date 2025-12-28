# Analysis: cd-server.yml vs deploy-servers.yml Failure

## Error Summary
The `cd-server.yml` workflow is failing with a `PERMISSION_DENIED` error when trying to deploy to Cloud Run, specifically:
- **Error Code**: `CONSUMER_INVALID`
- **Service Account**: `college-platform-deployment@nith-website.iam.gserviceaccount.com`
- **Issue**: Permission denied on resource project

## Root Cause Analysis

### Key Differences Between the Two Workflows

#### 1. **Deployment Approach** (CRITICAL DIFFERENCE)

**deploy-servers.yml** (✅ WORKS):
```yaml
- Uses: `--source ./apps/server` deployment
- Deploys directly from source code
- Cloud Build handles the containerization automatically
- No image registry involved in the deployment step
```

**cd-server.yml** (❌ FAILS):
```yaml
- Uses: `--image "${AR_IMAGE}"` deployment
- Tries to pull from GCP Artifact Registry Remote Repository
- Image path: us-central1-docker.pkg.dev/***/ghcr-remote/ghcr.io/kanakkholwal/college-ecosystem/college-ecosystem-server:latest
- Requires additional permissions for Artifact Registry access
```

#### 2. **Authentication Credentials**

**deploy-servers.yml**:
```yaml
credentials_json: ${{ secrets.CREDENTIALS_JSON }}
```

**cd-server.yml**:
```yaml
credentials_json: ${{ secrets.GCP_CREDENTIALS }}
```

⚠️ These might be different service accounts with different permissions!

#### 3. **Project Configuration**

**deploy-servers.yml**:
- No explicit `--project` flag (uses default from credentials)
- Region from: `${{ secrets.GCP_PROJECT_REGION }}`

**cd-server.yml**:
- Explicit `--project ${{ secrets.GCP_PROJECT_ID }}`
- Region from: `${{ vars.GCP_SERVING_REGION }}`

## Why cd-server.yml is Failing

### Issue 1: Missing Artifact Registry Permissions
The service account `college-platform-deployment@nith-website.iam.gserviceaccount.com` likely lacks:
- `roles/artifactregistry.reader` - To pull images from Artifact Registry
- `roles/run.developer` - To deploy to Cloud Run with custom images
- Access to the remote repository `ghcr-remote`

### Issue 2: Remote Repository Configuration
The workflow assumes a GCP Artifact Registry Remote Repository exists that proxies GHCR, but:
1. The setup job is commented out (lines 21-84)
2. The remote repository might not be properly configured
3. The service account might not have access to read from this remote repo

### Issue 3: CONSUMER_INVALID Error
This specific error indicates:
- The project ID might be incorrect or inaccessible
- The service account doesn't have permission to access the specified project
- The Artifact Registry service might not be enabled for this project

## Solutions

### Option 1: Fix Permissions (Keep GHCR + AR Remote Repo approach)

1. **Enable Required APIs**:
   ```bash
   gcloud services enable artifactregistry.googleapis.com --project=YOUR_PROJECT_ID
   gcloud services enable run.googleapis.com --project=YOUR_PROJECT_ID
   ```

2. **Grant Service Account Permissions**:
   ```bash
   # Get your project ID
   PROJECT_ID="YOUR_PROJECT_ID"
   SERVICE_ACCOUNT="college-platform-deployment@nith-website.iam.gserviceaccount.com"
   
   # Grant Artifact Registry Reader
   gcloud projects add-iam-policy-binding $PROJECT_ID \
     --member="serviceAccount:$SERVICE_ACCOUNT" \
     --role="roles/artifactregistry.reader"
   
   # Grant Cloud Run Admin (or Developer)
   gcloud projects add-iam-policy-binding $PROJECT_ID \
     --member="serviceAccount:$SERVICE_ACCOUNT" \
     --role="roles/run.admin"
   
   # Grant Service Account User (to act as the runtime service account)
   gcloud projects add-iam-policy-binding $PROJECT_ID \
     --member="serviceAccount:$SERVICE_ACCOUNT" \
     --role="roles/iam.serviceAccountUser"
   ```

3. **Uncomment and Run the Setup Job** (lines 21-84 in cd-server.yml):
   - This creates the remote repository properly
   - Sets up GHCR authentication via Secret Manager

### Option 2: Simplify - Deploy Directly from GHCR (RECOMMENDED)

Instead of using GCP Artifact Registry as a proxy, deploy directly from GHCR:

```yaml
- name: 🚀 Deploy to Cloud Run
  if: steps.server-changed.outputs.server_changed == 'true'
  run: |
    # Determine tag based on branch
    if [ "${{ github.ref_name }}" == "main" ]; then
      TAG="latest"
    else
      TAG="${{ github.ref_name }}"
    fi
    
    GHCR_IMAGE="ghcr.io/${{ github.repository }}/${{ vars.SERVICE_NAME_SERVER}}:${TAG}"
    
    echo "Deploying: ${GHCR_IMAGE}"
    
    gcloud run deploy ${{ vars.SERVICE_NAME_SERVER }} \
      --image "${GHCR_IMAGE}" \
      --platform managed \
      --region ${{ vars.GCP_SERVING_REGION }} \
      --allow-unauthenticated \
      --project ${{ secrets.GCP_PROJECT_ID }}
```

**But you'll need to authenticate Cloud Run to pull from GHCR**:
- Make the GHCR image public, OR
- Configure Cloud Run to use credentials for GHCR

### Option 3: Use Source Deployment (Like deploy-servers.yml)

Simplest approach - just use source deployment:

```yaml
- name: 🚀 Deploy to Cloud Run (from source)
  if: steps.server-changed.outputs.server_changed == 'true'
  run: |
    gcloud run deploy ${{ vars.SERVICE_NAME_SERVER }} \
      --source ./apps/server \
      --region ${{ vars.GCP_SERVING_REGION }} \
      --platform managed \
      --allow-unauthenticated \
      --project ${{ secrets.GCP_PROJECT_ID }}
```

### Option 4: Push to GCP Artifact Registry Directly (Traditional Approach)

Skip GHCR entirely and push directly to GCP AR:

```yaml
- name: 🔑 Authenticate to Google Cloud
  uses: google-github-actions/auth@v2
  with:
    credentials_json: ${{ secrets.GCP_CREDENTIALS }}

- name: 🐳 Set up Docker for GCP
  run: |
    gcloud auth configure-docker ${{ vars.GCP_REPO_REGION }}-docker.pkg.dev

- name: 🏗️ Build and Push to Artifact Registry
  run: |
    IMAGE_NAME="${{ vars.GCP_REPO_REGION }}-docker.pkg.dev/${{ secrets.GCP_PROJECT_ID }}/YOUR_REPO_NAME/${{ vars.SERVICE_NAME_SERVER }}:latest"
    docker build -t "${IMAGE_NAME}" ./apps/server
    docker push "${IMAGE_NAME}"

- name: 🚀 Deploy to Cloud Run
  run: |
    gcloud run deploy ${{ vars.SERVICE_NAME_SERVER }} \
      --image "${IMAGE_NAME}" \
      --platform managed \
      --region ${{ vars.GCP_SERVING_REGION }} \
      --allow-unauthenticated \
      --project ${{ secrets.GCP_PROJECT_ID }}
```

## Recommended Action Plan

**For your use case (moving to GHCR)**, I recommend **Option 2** with public images:

1. Make your GHCR images public (or configure authentication)
2. Modify `cd-server.yml` to deploy directly from GHCR without the AR remote repo
3. This gives you:
   - ✅ Images stored in GitHub (free, integrated with your repo)
   - ✅ Simpler workflow (no AR remote repo complexity)
   - ✅ Better visibility (images alongside code)

**If you want to keep images private**, use **Option 4** (traditional GCP AR approach) as it's more straightforward than setting up remote repositories.

## Quick Fix to Test

To quickly test if permissions are the issue, try using the same credentials as `deploy-servers.yml`:

```yaml
credentials_json: ${{ secrets.CREDENTIALS_JSON }}  # Instead of GCP_CREDENTIALS
```

And temporarily switch to source deployment to verify the service account works:

```yaml
--source ./apps/server  # Instead of --image
```

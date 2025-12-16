# Deployment Guide

## Deploying Microservices

This project uses GitHub Actions for continuous deployment of its microservices. Each microservice has its own deployment workflow defined in the `.github/workflows` directory.

### Steps to Deploy

#### 1. Go to Google Cloud Console

- Go to GCP ([Google Cloud Console](https://console.cloud.google.com/)) and create a new Project named `College Ecosystem <YOUR_COLLEGE_NAME>`.
- In Left Menu, go to `IAM & Admin` -> `Service Accounts`.
- Click on `+ CREATE SERVICE ACCOUNT` at the top.
- Enter `github-actions` as the Service account name and click `CREATE AND CONTINUE`.
- In the next step, assign the role in `Basic` -> `Editor` to the service account and click `CONTINUE`.
- Click `DONE` to finish creating the service account.
- Click on the created service account to open its details.
- Go to the `KEYS` tab and click on `ADD KEY` -> `Create new key`.
- Select `JSON` as the key type and click `CREATE`. A JSON file will be downloaded to your computer as `CREDENTIALS_JSON.json`. Keep it safe as it contains sensitive information.
<!-- get project details - GCP_PROJECT_ID,GCP_PROJECT_NUMBER -->
- In the Google Cloud Console, go to the `Dashboard` of your project to find the `Project ID` and `Project Number`. Note these down as they will be needed later.

<!-- Add note for enabling required APIs -->
### Enable required APIs

Before deploying, enable the Google Cloud APIs used by the workflows.

Via Cloud Console:

- Open APIs & Services → Library in your project.
- Search for and enable:
    - Cloud Run API (run.googleapis.com)
    - Cloud Build API (cloudbuild.googleapis.com)
    - Artifact Registry API (artifactregistry.googleapis.com) — or Container Registry (containerregistry.googleapis.com) if you use it
    - IAM Service Account Credentials API (iamcredentials.googleapis.com)
    - Secret Manager API (secretmanager.googleapis.com) — if you store secrets in Secret Manager
    - Cloud Resource Manager API (cloudresourcemanager.googleapis.com)

Or enable them with gcloud (replace YOUR_PROJECT_ID):

```
gcloud config set project YOUR_PROJECT_ID
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com containerregistry.googleapis.com iamcredentials.googleapis.com secretmanager.googleapis.com cloudresourcemanager.googleapis.com
```

Note: API activation can take a minute. Ensure the project selected matches your GCP_PROJECT_ID.

#### 2. Set up GitHub Secrets

- Go to your GitHub repository and navigate to `Settings` -> `Secrets and variables` -> `Actions`.
- Click on `New repository secret` and add the following secrets:

  - `GCP_CREDENTIALS`: Copy the entire content of the downloaded `CREDENTIALS_JSON.json` file and paste it as the value.
  - `GCP_PROJECT_ID`: The Project ID of your GCP project.
  - `GCP_PROJECT_NUMBER`: The Project Number of your GCP project.
  <!-- - `GITHUB_TOKEN`: A GitHub Personal Access Token with `read:packages` scope to access GitHub Container Registry. -->
- Now click on `Variables` tab and add a new variable:
  - `REMOTE_REPO_NAME`: Set its value to `ghcr-remote`.
  <!-- - `REGISTRY`: Set its value to `ghcr-io`. -->
  - `SERVICE_NAME_SERVER`: Set its value to `college-ecosystem-server` (or your desired service name with convention `<YOUR_REPO>-server`).
  - `GCP_REPO_REGION`: Set its value to your desired GCP region (close to your user location), e.g., `us-central1`.
  - `GCP_SERVING_REGION` : Set its value to your desired GCP region (close to your user location), e.g., `asia-southeast1`.

#### 3. Create Cloud Run Services

- Go to the Cloud Run section in the Google Cloud Console.
- Click on `Create Service`.
- Select `Deploy one revision from an existing container image`.
- For the container image, you can use a placeholder image like `gcr.io/cloudrun/hello`.
- Set the service name to `college-ecosystem-server` (as set in the `SERVICE_NAME_SERVER` variable).
- Choose the region you set in the `GCP_SERVING_REGION` variable.
- Click on `Create` to create the service.

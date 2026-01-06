# Rome Fine Finishes Website

This repository contains the Next.js source that drives the Rome Fine Finishes marketing site. Recent updates now keep the `public/DEPLOY-*` slideshows synchronized with whatever photos you add under `public/DEPLOY-cabinet-*` and `public/DEPLOY-decks`, thanks to the new API at `app/api/deploy-images`.

## Deployment Notes

We are pivoting away from the previous Vercel deployment because of the size constraints encountered **during proof of concept builds**. The next deployment target will be Google Cloud Platform under your client’s account, so the next step is preparing the project for GCP. Here’s what to do:

1. Install and authenticate the Google Cloud CLI (`gcloud auth login`) and select the target project (`gcloud config set project <PROJECT_ID>`).
2. Ensure any environment variables and secrets used by the Next.js app (if any) are defined in Secret Manager or passed via Cloud Run/Cloud Build configuration.
3. From the repo root, install dependencies and build the app:
   ```bash
   npm install
   npm run build
   ```
4. Create a container image via Cloud Build or a Dockerfile, for example:
   ```bash
   gcloud builds submit --tag gcr.io/<PROJECT_ID>/rome-fine-finishes
   ```
5. Deploy the image to Cloud Run (stateless) or App Engine (if covering routing) with the desired region and concurrency settings:
   ```bash
   gcloud run deploy rome-fine-finishes --image gcr.io/<PROJECT_ID>/rome-fine-finishes --platform managed --region us-central1 --allow-unauthenticated
   ```
6. Update DNS or load balancing (if applicable) to point to the new GCP service URL.

## How to Contribute

1. Run `npm run lint`/`npm run test` (if added) locally before pushing.
2. Add new photos to the `public/DEPLOY-*` folders; the UI now automatically picks them up via the `/api/deploy-images` endpoint.
3. Commit your changes and push. The next deployment should happen through GCP Cloud Build/Run, so make sure those pipelines point at this branch.

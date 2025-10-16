#!/bin/bash

# Build using Cloud Build configuration
gcloud builds submit --config cloudbuild.yaml

# Deploy to Cloud Run
gcloud run deploy digipalz-app \
  --image gcr.io/digipalz-dev/digipalz-app \
  --platform managed \
  --region northamerica-northeast1 \
  --allow-unauthenticated \
  --port 8080 
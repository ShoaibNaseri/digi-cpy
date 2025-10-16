# DigipalzApp Multi-Region Deployment Plan

## Overview

This document outlines the step-by-step plan to deploy DigipalzApp to multiple regions (US Central and UK) using Firebase Hosting. The current setup supports US Central, and this plan extends it to include UK regions for better global performance and compliance.

## Current Setup Analysis

- **Framework**: React + Vite
- **Hosting**: Firebase Hosting
- **Functions**: Firebase Functions (Node.js)
- **Database**: Firestore
- **Storage**: Firebase Storage
- **Authentication**: Firebase Auth
- **Current Region**: US Central (us-central1)
- **Build Tool**: Vite with optimized chunks

## Phase 1: Environment Configuration

### 1.1 Create UK Firebase Project

```bash
# Install Firebase CLI globally (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Create new Firebase project for UK
firebase projects:create digipalz-uk --display-name "Digipalz UK"
```

### 1.2 Set up Firebase Projects Structure

- **US Project**: `digipalz-us` (existing)
- **UK Project**: `digipalz-uk` (new)

### 1.3 Environment Variables Setup

Create separate environment files for each region:

#### `.env.us` (US Central)

```env
VITE_FIREBASE_API_KEY=your_us_api_key
VITE_FIREBASE_AUTH_DOMAIN=digipalz-us.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=digipalz-us
VITE_FIREBASE_STORAGE_BUCKET=digipalz-us.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_us_sender_id
VITE_FIREBASE_APP_ID=your_us_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_us_measurement_id
VITE_FIREBASE_FUNCTION_API_URL=https://us-central1-digipalz-us.cloudfunctions.net
VITE_FIREBASE_REGION=us-central1
VITE_APP_REGION=US
```

#### `.env.uk` (UK)

```env
VITE_FIREBASE_API_KEY=your_uk_api_key
VITE_FIREBASE_AUTH_DOMAIN=digipalz-uk.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=digipalz-uk
VITE_FIREBASE_STORAGE_BUCKET=digipalz-uk.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_uk_sender_id
VITE_FIREBASE_APP_ID=your_uk_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_uk_measurement_id
VITE_FIREBASE_FUNCTION_API_URL=https://europe-west2-digipalz-uk.cloudfunctions.net
VITE_FIREBASE_REGION=europe-west2
VITE_APP_REGION=UK
```

## Phase 2: Firebase Project Configuration

### 2.1 Initialize UK Firebase Project

```bash
# Navigate to project directory
cd /Users/shoaibnaseri/Desktop/digipalzApp

# Initialize Firebase for UK project
firebase use --add digipalz-uk
# Select alias: uk
# Select region: europe-west2

# Initialize hosting for UK
firebase init hosting --project digipalz-uk
```

### 2.2 Create Region-Specific Firebase Configurations

#### `firebase.us.json`

```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.js",
        "headers": [
          {
            "key": "Content-Type",
            "value": "application/javascript"
          },
          {
            "key": "Content-Encoding",
            "value": "identity"
          },
          {
            "key": "Cache-Control",
            "value": "public,max-age=3600"
          }
        ]
      }
    ]
  },
  "functions": [
    {
      "source": "functions",
      "codebase": "default",
      "ignore": [
        "node_modules",
        ".git",
        "firebase-debug.log",
        "firebase-debug.*.log",
        "*.local"
      ]
    }
  ]
}
```

#### `firebase.uk.json`

```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.js",
        "headers": [
          {
            "key": "Content-Type",
            "value": "application/javascript"
          },
          {
            "key": "Content-Encoding",
            "value": "identity"
          },
          {
            "key": "Cache-Control",
            "value": "public,max-age=3600"
          }
        ]
      }
    ]
  },
  "functions": [
    {
      "source": "functions",
      "codebase": "default",
      "ignore": [
        "node_modules",
        ".git",
        "firebase-debug.log",
        "firebase-debug.*.log",
        "*.local"
      ]
    }
  ]
}
```

## Phase 3: Build System Updates

### 3.1 Update Package.json Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:us": "vite build --mode us",
    "build:uk": "vite build --mode uk",
    "lint": "eslint .",
    "preview": "vite preview",
    "deploy:us": "npm run build:us && firebase use us && firebase deploy --only hosting",
    "deploy:uk": "npm run build:uk && firebase use uk && firebase deploy --only hosting",
    "deploy:all": "npm run deploy:us && npm run deploy:uk"
  }
}
```

### 3.2 Update Vite Configuration

```javascript
// vite.config.js
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    },
    optimizeDeps: {
      include: ['html2canvas', 'jspdf', 'pdfjs-dist']
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'pdf-generation': ['html2canvas', 'jspdf'],
            'pdf-processing': ['pdfjs-dist']
          }
        }
      }
    },
    define: {
      __APP_REGION__: JSON.stringify(env.VITE_APP_REGION || 'US')
    }
  }
})
```

## Phase 4: Deployment Scripts

### 4.1 Create Region-Specific Deploy Scripts

#### `deploy-us.sh`

```bash
#!/bin/bash
set -e

echo "🚀 Deploying to US Central..."

# Switch to US environment
cp .env.us .env

# Build for US
npm run build:us

# Switch to US Firebase project
firebase use us

# Deploy to US
firebase deploy --only hosting,functions

echo "✅ US deployment complete!"
```

#### `deploy-uk.sh`

```bash
#!/bin/bash
set -e

echo "🚀 Deploying to UK..."

# Switch to UK environment
cp .env.uk .env

# Build for UK
npm run build:uk

# Switch to UK Firebase project
firebase use uk

# Deploy to UK
firebase deploy --only hosting,functions

echo "✅ UK deployment complete!"
```

#### `deploy-all.sh`

```bash
#!/bin/bash
set -e

echo "🚀 Deploying to all regions..."

# Deploy to US
./deploy-us.sh

# Deploy to UK
./deploy-uk.sh

echo "✅ All deployments complete!"
```

### 4.2 Make Scripts Executable

```bash
chmod +x deploy-us.sh deploy-uk.sh deploy-all.sh
```

## Phase 5: Firebase Functions Configuration

### 5.1 Update Functions for Multi-Region Support

```javascript
// functions/index.js
const functions = require('firebase-functions')
const admin = require('firebase-admin')

// Initialize admin with project-specific config
const app = admin.initializeApp()

// Your existing functions here...
// Make sure they work with both US and UK projects

exports.yourFunction = functions.https.onRequest((req, res) => {
  // Function logic here
})
```

### 5.2 Deploy Functions to Both Regions

```bash
# Deploy to US
firebase use us
firebase deploy --only functions

# Deploy to UK
firebase use uk
firebase deploy --only functions
```

## Phase 6: Domain and DNS Configuration

### 6.1 Custom Domain Setup

- **US Domain**: `app.digipalz.com` or `us.digipalz.com`
- **UK Domain**: `uk.digipalz.com` or `app-uk.digipalz.com`

### 6.2 Firebase Hosting Custom Domain

```bash
# For US
firebase use us
firebase hosting:channel:deploy live --only hosting

# For UK
firebase use uk
firebase hosting:channel:deploy live --only hosting
```

### 6.3 SSL Certificate Configuration

Firebase automatically handles SSL certificates for custom domains.

## Phase 7: Testing and Validation

### 7.1 Pre-Deployment Checklist

- [ ] Environment variables configured for both regions
- [ ] Firebase projects created and configured
- [ ] Build scripts tested locally
- [ ] Functions deployed to both regions
- [ ] Custom domains configured (if applicable)

### 7.2 Post-Deployment Testing

- [ ] US deployment accessible and functional
- [ ] UK deployment accessible and functional
- [ ] Authentication working in both regions
- [ ] Database operations working correctly
- [ ] File uploads working in both regions
- [ ] Performance testing in both regions

## Phase 8: Monitoring and Maintenance

### 8.1 Firebase Console Monitoring

- Monitor both projects in Firebase Console
- Set up alerts for both regions
- Monitor function performance and errors

### 8.2 Analytics Setup

- Configure Google Analytics for both regions
- Set up region-specific tracking
- Monitor user behavior by region

### 8.3 Backup and Recovery

- Regular database backups for both regions
- Disaster recovery procedures
- Data synchronization between regions (if needed)

## Phase 9: CI/CD Pipeline (Optional)

### 9.1 GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to Multiple Regions

on:
  push:
    branches: [main]

jobs:
  deploy-us:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build:us
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT_US }}'
          channelId: live
          projectId: digipalz-us

  deploy-uk:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build:uk
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT_UK }}'
          channelId: live
          projectId: digipalz-uk
```

## Phase 10: Performance Optimization

### 10.1 CDN Configuration

- Firebase Hosting automatically provides global CDN
- Configure caching headers for optimal performance
- Use Firebase Hosting's edge caching features

### 10.2 Regional Optimization

- Optimize images and assets for each region
- Consider region-specific content delivery
- Monitor and optimize loading times

## Security Considerations

### 10.1 Data Residency

- Ensure UK data stays in UK (GDPR compliance)
- Configure Firestore location rules
- Set up proper data governance

### 10.2 Access Control

- Implement region-based access controls
- Configure Firebase Security Rules for both regions
- Set up proper authentication flows

## Cost Optimization

### 10.1 Firebase Pricing

- Monitor usage across both regions
- Optimize function execution time
- Use Firebase Hosting's free tier efficiently

### 10.2 Resource Management

- Set up billing alerts
- Monitor storage usage
- Optimize database queries

## Rollback Procedures

### 10.1 Emergency Rollback

```bash
# Rollback US deployment
firebase use us
firebase hosting:channel:rollback live

# Rollback UK deployment
firebase use uk
firebase hosting:channel:rollback live
```

### 10.2 Version Management

- Use Firebase Hosting channels for testing
- Implement proper version tagging
- Maintain rollback capabilities

## Conclusion

This deployment plan provides a comprehensive approach to deploying DigipalzApp across multiple regions using Firebase Hosting. The plan ensures:

1. **Scalability**: Easy addition of more regions in the future
2. **Performance**: Optimized delivery to users in different regions
3. **Compliance**: Proper data handling for different jurisdictions
4. **Maintainability**: Clear separation of concerns and easy management
5. **Reliability**: Proper testing and rollback procedures

Follow this plan step by step, and you'll have a robust multi-region deployment setup for your DigipalzApp.

# Environment Setup for GTM Integration

## 📋 **Required Environment Variables**

Add these variables to your environment files:

### **`.env.local` (Development)**

```env
# Google Tag Manager - Development (Vite format)
VITE_GTM_ID_DEV=GTM-XXXXXXX
```

### **`.env.staging` (Staging)**

```env
# Google Tag Manager - Staging (Vite format)
VITE_GTM_ID_STAGING=GTM-XXXXXXX
```

### **`.env.production` (Production)**

```env
# Google Tag Manager - Production (Vite format)
VITE_GTM_ID=GTM-XXXXXXX
```

## 🏷️ **How to Get GTM Container IDs**

### **Step 1: Access Google Tag Manager**

1. Go to: https://tagmanager.google.com/
2. Sign in with your Google account
3. Create a new account if needed

### **Step 2: Create Development Container**

1. Click **"Create Container"**
2. **Container Name**: `Digipalz - Development`
3. **Target Platform**: `Web`
4. Click **"Create"**
5. **Copy the Container ID** (looks like `GTM-XXXXXXX`)

### **Step 3: Create Staging Container**

1. Click **"Create Container"** again
2. **Container Name**: `Digipalz - Staging`
3. **Target Platform**: `Web`
4. Click **"Create"**
5. **Copy the Container ID**

### **Step 4: Create Production Container**

1. Click **"Create Container"** again
2. **Container Name**: `Digipalz - Production`
3. **Target Platform**: `Web`
4. Click **"Create"**
5. **Copy the Container ID**

## 🛠️ **Container Configuration**

For each container, you'll need to configure:

### **1. Variables**

- Page URL
- Page Path
- Page Title
- Custom Event
- Consent State Variables

### **2. Triggers**

- All Pages
- Consent Granted
- Custom Events

### **3. Tags**

- Google Analytics 4 Configuration
- Google Analytics 4 Event
- Custom HTML (if needed)

## 📊 **Example Container Setup**

### **Variables to Create:**

```
- Page URL (Built-in)
- Page Path (Built-in)
- Page Title (Built-in)
- Event (Built-in)
- GA4 Measurement ID (Constant: G-XXXXXXXXXX)
- Consent Mode - Analytics (Data Layer Variable: consent_mode.analytics_storage)
- Consent Mode - Marketing (Data Layer Variable: consent_mode.ad_storage)
```

### **Triggers to Create:**

```
- All Pages (Page View)
- Analytics Consent Granted (Custom Event: consent_granted)
- Marketing Consent Granted (Custom Event: consent_granted)
- Lesson Events (Custom Event: lesson_start, lesson_complete)
- Game Events (Custom Event: game_start, game_complete)
```

### **Tags to Create:**

```
- GA4 Configuration (Fires on: All Pages + Analytics Consent)
- GA4 Events (Fires on: Custom Events + Analytics Consent)
- Marketing Tags (Fires on: Marketing Events + Marketing Consent)
```

## 🔧 **Quick Setup Commands**

1. **Copy your GTM IDs from the containers**
2. **Add to your `.env.local` file:**

   ```bash
   echo "REACT_APP_GTM_ID_DEV=GTM-YOUR-DEV-ID" >> .env.local
   ```

3. **Test the integration:**

   ```bash
   npm run dev
   ```

4. **Check the GTM debug panel** (appears in development mode)

## ✅ **Verification Steps**

1. **Check Console Logs:**

   - Look for "GTM initialized successfully"
   - Check for consent mode updates

2. **Use GTM Preview Mode:**

   - Enable preview in your GTM container
   - Visit your development site
   - Verify events are firing

3. **Test Cookie Consent:**
   - Accept/reject cookies
   - Check that consent mode updates in GTM

## 🚨 **Important Notes**

- **Never commit GTM IDs to public repositories**
- **Use different containers for each environment**
- **Test thoroughly before deploying to production**
- **Monitor GTM debug console for errors**

## 📞 **Need Help?**

If you need assistance:

1. Check the GTM Test Panel in development mode
2. Review browser console for errors
3. Verify environment variables are loaded correctly
4. Test with different consent states

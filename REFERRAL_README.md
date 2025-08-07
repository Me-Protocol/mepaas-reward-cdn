# 🎯 Referral Tracking System - CDN Integration

This document explains how the simplified referral tracking system works in the `cdn.js` file.

## 📋 Overview

The referral tracking system automatically detects referral codes from URL parameters, stores them in sessionStorage, and passes them to the iframe via URL parameters and postMessage events.

## 🔧 How It Works

### 1. Referral Code Detection

When the script loads, it automatically checks for a `ref` parameter in the URL:

```javascript
// Example URL: https://yourstore.com?ref=JOHN123
const urlParams = new URLSearchParams(window.location.search);
const referralCode = urlParams.get("ref"); // Returns "JOHN123"
```

### 2. Session ID Generation

The system generates a session ID using browser fingerprinting:

```javascript
// Browser fingerprint-based session ID
"session_a1b2c3d4e5f6"; // Generated from browser characteristics
```

### 3. Data Storage

Referral data is stored in sessionStorage:

```javascript
const referralData = {
  referralCode: "JOHN123",
  sessionId: "session_a1b2c3d4e5f6",
  trackedAt: "2024-01-15T10:30:00.000Z",
};

sessionStorage.setItem("current_referral", JSON.stringify(referralData));
```

### 4. Iframe Integration

The referral data is passed to the iframe in two ways:

#### A. URL Parameters

```javascript
// The iframe URL includes referral parameters
const iframeUrl = `${baseUrl}?apiKey=${apiKey}&referralCode=${referralCode}&sessionId=${sessionId}`;
```

#### B. PostMessage Events

```javascript
// When iframe loads or modal opens
iframe.contentWindow.postMessage(
  {
    apiKey: apiKey,
    email: customerEmail,
    referralCode: referralCode,
    sessionId: sessionId,
  },
  "*"
);
```

## 🚀 Usage Examples

### Basic Implementation

```html
<!-- Load the script with referral tracking -->
<script
  id="mepaas-rewards"
  src="cdn.js"
  api-key="your-api-key"
  env="dev"
></script>
```

### With Customer Data

```html
<script
  id="mepaas-rewards"
  src="cdn.js"
  api-key="your-api-key"
  env="dev"
  customer-email="customer@example.com"
  customer-name="John Doe"
></script>
```

### Testing Referral Links

Visit your site with a referral code:

```
https://yourstore.com?ref=JOHN123
```

The system will automatically:

1. Detect the referral code
2. Generate a session ID
3. Store the data in sessionStorage
4. Pass it to the iframe

## 📊 Data Flow

```
1. User visits: yourstore.com?ref=JOHN123
   ↓
2. Script detects referral code
   ↓
3. Generates session ID (session_a1b2c3d4e5f6)
   ↓
4. Stores in sessionStorage
   ↓
5. Passes to iframe via URL + postMessage
   ↓
6. Iframe receives referral data for processing
```

## 🧪 Testing

Use the provided `test-referral.html` file to test the referral system:

1. **Test with Referral Code**: Simulates visiting with `?ref=JOHN123`
2. **Check Status**: Shows current referral state
3. **Clear Data**: Resets all referral data

## 🔧 Configuration

### Environment Settings

```javascript
// Different environments have different iframe URLs
env === "local"     → "http://localhost:3000"
env === "development" → "https://mepass-rewards-dev.vercel.app"
env === "staging"   → "https://mepass-rewards-staging.vercel.app"
env === "production" → "https://mepaas-rewards.vercel.app/"
```

### Session ID Format

```javascript
// Browser fingerprint-based session ID
"session_a1b2c3d4e5f6"; // Generated from browser characteristics
```

## 🚨 Troubleshooting

### Common Issues

1. **Referral not detected**

   - Check URL parameter is `ref` (not `referral` or `code`)
   - Ensure script loads before URL processing

2. **Session ID not persistent**

   - Verify not in incognito mode
   - Check sessionStorage is available

3. **Iframe not receiving data**
   - Check iframe URL includes referral parameters
   - Verify postMessage events are firing

### Debug Mode

```javascript
// Check session storage directly
console.log("Session ID:", sessionStorage.getItem("referral_session_id"));
console.log("Referral Data:", sessionStorage.getItem("current_referral"));
```

## 📝 API Integration Notes

The referral data is passed to the iframe, but the actual API calls for:

- Tracking referral visits
- Processing referrals
- Managing referral codes

Should be handled by the iframe application itself. This CDN script only handles:

- Detection and storage of referral data
- Passing data to the iframe

## 🎯 Complete Flow Example

```javascript
// 1. User visits: yourstore.com?ref=JOHN123
// 2. Script automatically detects and stores referral
// 3. Iframe receives: ?referralCode=JOHN123&sessionId=session_a1b2c3d4e5f6
// 4. Iframe processes referral data as needed
```

## 🔍 Available Functions

The system provides these internal functions:

```javascript
// Get current referral data
getCurrentReferral(); // Returns referral object or null

// Check if referral exists
hasPendingReferral(); // Returns boolean

// Get session ID
getSessionId(); // Returns current session ID

// Track referral from URL
trackReferralFromURL(); // Called automatically on script load
```

This simplified system provides a clean foundation for referral tracking that works with any platform!

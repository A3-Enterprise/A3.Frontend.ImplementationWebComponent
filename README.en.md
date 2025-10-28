# Genie Web Component - Implementation Guide

Complete guide to integrate the Genie identity verification and enrollment Web Component into your application.

## 📋 Table of Contents

- [Installation](#-installation)
- [Basic Usage](#-basic-usage)
- [React Integration](#-react-integration)
- [Vanilla HTML Integration](#-vanilla-html-integration)
- [Events and Responses](#-events-and-responses)
- [Error Messages](#-error-messages)
- [Complete Examples](#-complete-examples)
- [Troubleshooting](#-troubleshooting)

## 🚀 Installation

### Option 1: CDN (Recommended)

**Development:**
```html
<script type="module" src="https://id-webcomponent-dev-factory.s3.amazonaws.com/demo/demo.esm.js"></script>
```

**Sandbox:**
```html
<script type="module" src="https://id-webcomponent-sandbox-factory.s3.amazonaws.com/demo/demo.esm.js"></script>
```

**Production:**
```html
<script type="module" src="https://id-webcomponent-prod-factory.s3.amazonaws.com/demo/demo.esm.js"></script>
```

### Option 2: NPM (Coming Soon)

```bash
npm install @genie/web-component
```

## 📦 Basic Usage

The component requires two mandatory parameters:

| Parameter | Type | Description |
|-----------|------|-------------|
| `url` | string | Complete invitation URL (enrollment or verification) |
| `token` | string | JWT authentication token (without "Bearer" prefix) |

### URL Examples

**Enrollment:**
```
https://enrolldev.idfactory.me/enroll?SubCustomer=TestCustomer&key=abc123
```

**Verification:**
```
https://enrolldev.idfactory.me/verify?SubCustomer=TestCustomer&key=xyz789
```

## ⚛️ React Integration

### 1. Declare Component Type

```typescript
// src/types/genie.d.ts
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'genie-component-general': {
        url: string;
        token: string;
      };
    }
  }
}

export interface GenieEventDetail {
  status: 'Success' | 'Pending' | 'Failure';
  message: string;
  CSID: string;
  callback?: string;
  idTransaction?: string;
}
```

### 2. Load Script

```typescript
import { useEffect, useState } from 'react';

function App() {
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://id-webcomponent-sandbox-factory.s3.amazonaws.com/demo/demo.esm.js';
    script.onload = () => setScriptLoaded(true);
    document.head.appendChild(script);
  }, []);

  return scriptLoaded ? <YourComponent /> : <Loading />;
}
```

### 3. Use Component

```typescript
import { useEffect } from 'react';
import type { GenieEventDetail } from './types/genie';

function GenieComponent() {
  const url = 'https://enrolldev.idfactory.me/enroll?SubCustomer=Test&key=abc123';
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

  useEffect(() => {
    const handleGenieEvent = (event: Event) => {
      const customEvent = event as CustomEvent<GenieEventDetail>;
      const result = customEvent.detail;

      switch (result.status) {
        case 'Success':
          console.log('✅ Process completed:', result.CSID);
          // Redirect or show success message
          break;

        case 'Pending':
          console.log('⏳ Pending approval:', result.idTransaction);
          // Implement polling to check status
          break;

        case 'Failure':
          console.error('❌ Error:', result.message);
          // Show error message to user
          break;
      }
    };

    document.addEventListener('genieEventGeneral', handleGenieEvent);

    return () => {
      document.removeEventListener('genieEventGeneral', handleGenieEvent);
    };
  }, []);

  return <genie-component-general url={url} token={token} />;
}
```

## 🌐 Vanilla HTML Integration

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Genie Web Component</title>
  
  <!-- Load Web Component -->
  <script type="module" src="https://id-webcomponent-sandbox-factory.s3.amazonaws.com/demo/demo.esm.js"></script>
</head>
<body>
  <!-- Use component -->
  <genie-component-general
    url="https://enrolldev.idfactory.me/enroll?SubCustomer=TestCustomer&key=abc123"
    token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...">
  </genie-component-general>

  <script>
    // Listen to events
    document.addEventListener('genieEventGeneral', (event) => {
      const result = event.detail;
      console.log('Result:', result);

      if (result.status === 'Success') {
        alert('Process completed successfully!');
        window.location.href = '/success';
      } else if (result.status === 'Failure') {
        alert('Error: ' + result.message);
      }
    });
  </script>
</body>
</html>
```

## 📡 Events and Responses

### Main Event: `genieEventGeneral`

**⚠️ IMPORTANT:** You only need to listen to this event. It contains all responses for both enrollment and verification.

### Response Structure

```typescript
{
  status: 'Success' | 'Pending' | 'Failure',
  message: string,
  CSID: string,
  callback?: string,
  idTransaction?: string  // Only in 'Pending' status
}
```

### Possible Status

#### ✅ Success - Process Completed

User successfully completed the entire flow.

```json
{
  "status": "Success",
  "message": "Process completed successfully",
  "CSID": "abc123-def456-ghi789",
  "callback": "https://your-callback-url.com"
}
```

**Recommended actions:**
- Save CSID in your database
- Redirect user to success page
- Send confirmation notification

#### ⏳ Pending - Manual Review Required

Process requires manual review by operations team.

```json
{
  "status": "Pending",
  "message": "Manual review required",
  "CSID": "abc123-def456-ghi789",
  "idTransaction": "txn-123456",
  "callback": "https://your-callback-url.com"
}
```

**Recommended actions:**
- Implement polling to check status changes
- Show user message indicating wait time
- Save idTransaction for tracking

**Polling Example:**

```typescript
async function checkTransactionStatus(idTransaction: string) {
  const response = await fetch(`/api/transaction/${idTransaction}/status`);
  const data = await response.json();
  
  if (data.status === 'Success') {
    // Process approved
  } else if (data.status === 'Failure') {
    // Process rejected
  } else {
    // Keep waiting, retry in 30 seconds
    setTimeout(() => checkTransactionStatus(idTransaction), 30000);
  }
}
```

#### ❌ Failure - Process Error

An error occurred during the process.

```json
{
  "status": "Failure",
  "message": "Unauthorized",
  "CSID": ""
}
```

**Recommended actions:**
- Show specific error message to user
- Allow process retry
- Log error for analysis

## 🚨 Error Messages

### Authentication Errors

#### Invalid or Expired Token

```json
{
  "status": "Failure",
  "message": "Unauthorized",
  "CSID": ""
}
```

**Cause:** JWT token is invalid, expired, or lacks permissions.

**Solution:**
- Verify token hasn't expired
- Generate new token
- Confirm token has necessary permissions

#### Invalid Invitation Key

```json
{
  "status": "Failure",
  "message": "Invitation key isn't valid",
  "CSID": ""
}
```

**Cause:** Invitation key doesn't exist, was already used, or has expired.

**Solution:**
- Generate new invitation key
- Verify key hasn't been used previously
- Confirm key hasn't expired

#### User Rejects Consent

```json
{
  "status": "Failure",
  "message": "Deny consent",
  "CSID": "",
  "callback": "..."
}
```

**Cause:** User explicitly rejected consent.

**Solution:**
- User must accept consent to continue
- Explain to user why consent is necessary

### Liveness Errors

#### Liveness Detection Error

```json
{
  "status": "Failure",
  "message": "Internal Server Error Liveness",
  "CSID": ""
}
```

**Cause:** Problems during selfie capture or biometric validation.

**Solution:**
- Allow user to retry process
- Check lighting conditions
- Ensure camera works correctly

### Configuration Errors

#### Missing HTML Screen

```json
{
  "status": "Failure",
  "msg": " Html Error => Screen front does not exist"
}
```

**Cause:** SubCustomer doesn't have necessary HTML screens configured for the flow.

**Solution:**
- Verify SubCustomer has all screens configured
- Contact administrator to configure missing screens
- Use test SubCustomer that's fully configured

### Permission Errors

> **⚠️ IMPORTANT:** Camera and geolocation permission errors **DO NOT emit events**. Component shows internal screen with instructions and "Retry" button.

**Camera Permissions Denied:**
- Component shows instructions to enable camera
- User must enable permissions and press "Retry"
- No `genieEventGeneral` event is emitted

**Location Permissions Denied:**
- Only if geolocation is mandatory
- Component shows instructions to enable location
- User must enable permissions and press "Retry"
- No `genieEventGeneral` event is emitted

## 💡 Complete Examples

### React Example with Complete State Management

```typescript
import { useState, useEffect } from 'react';

function GenieIntegration() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [csid, setCsid] = useState('');

  useEffect(() => {
    const handleGenieEvent = (event: Event) => {
      const customEvent = event as CustomEvent;
      const result = customEvent.detail;

      switch (result.status) {
        case 'Success':
          setStatus('success');
          setCsid(result.CSID);
          // Save to database
          saveToDatabase(result.CSID);
          break;

        case 'Pending':
          setStatus('loading');
          // Start polling
          startPolling(result.idTransaction);
          break;

        case 'Failure':
          setStatus('error');
          setErrorMessage(getErrorMessage(result.message));
          break;
      }
    };

    document.addEventListener('genieEventGeneral', handleGenieEvent);
    return () => document.removeEventListener('genieEventGeneral', handleGenieEvent);
  }, []);

  const getErrorMessage = (message: string): string => {
    if (message === 'Unauthorized') {
      return 'Your session has expired. Please log in again.';
    }
    if (message.includes('Invitation key')) {
      return 'The invitation link is invalid or has expired.';
    }
    if (message === 'Deny consent') {
      return 'You must accept consent to continue.';
    }
    if (message.includes('Liveness')) {
      return 'There was a problem with facial verification. Please try again.';
    }
    return 'An unexpected error occurred. Please try again.';
  };

  const saveToDatabase = async (csid: string) => {
    await fetch('/api/save-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ csid })
    });
  };

  const startPolling = async (idTransaction: string) => {
    // Implement polling logic
  };

  if (status === 'success') {
    return (
      <div className="success-screen">
        <h2>Verification Completed!</h2>
        <p>Your identity has been successfully verified.</p>
        <p>Session ID: {csid}</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="error-screen">
        <h2>Verification Error</h2>
        <p>{errorMessage}</p>
        <button onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <genie-component-general
      url="https://enrolldev.idfactory.me/enroll?SubCustomer=Test&key=abc123"
      token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    />
  );
}
```

### HTML Example with Automatic Redirection

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Identity Verification</title>
  <script type="module" src="https://id-webcomponent-sandbox-factory.s3.amazonaws.com/demo/demo.esm.js"></script>
  <style>
    body { margin: 0; font-family: Arial, sans-serif; }
    .loading { text-align: center; padding: 2rem; }
  </style>
</head>
<body>
  <genie-component-general
    url="https://enrolldev.idfactory.me/verify?SubCustomer=MyCompany&key=xyz789"
    token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...">
  </genie-component-general>

  <script>
    document.addEventListener('genieEventGeneral', (event) => {
      const result = event.detail;

      if (result.status === 'Success') {
        // Save CSID in sessionStorage
        sessionStorage.setItem('verificationCSID', result.CSID);
        
        // Redirect to success page
        window.location.href = '/verification-success';
      } 
      else if (result.status === 'Pending') {
        // Save transaction ID
        sessionStorage.setItem('transactionId', result.idTransaction);
        
        // Redirect to pending page
        window.location.href = '/verification-pending';
      }
      else if (result.status === 'Failure') {
        // Save error message
        sessionStorage.setItem('errorMessage', result.message);
        
        // Redirect to error page
        window.location.href = '/verification-error';
      }
    });
  </script>
</body>
</html>
```

## 🔧 Troubleshooting

### Component doesn't load

**Problem:** Component doesn't appear on page.

**Solutions:**
1. Verify script is loaded correctly
2. Open browser console and look for errors
3. Confirm CDN URL is correct
4. Check for active content blockers

### No events received

**Problem:** Listener doesn't capture component events.

**Solutions:**
1. Confirm listener is registered **before** component initializes
2. Verify event name is exactly `genieEventGeneral`
3. Check console for JavaScript errors
4. Ensure listener hasn't been accidentally removed

### Token constantly invalid

**Problem:** Always receiving "Unauthorized" error.

**Solutions:**
1. Verify token doesn't include "Bearer " prefix (component adds it automatically)
2. Confirm token hasn't expired
3. Validate token has correct permissions
4. Generate new token from backend

### Component closes unexpectedly

**Problem:** Component disappears without emitting event.

**Solutions:**
1. Check browser console for errors
2. Verify invitation URL is correct
3. Confirm SubCustomer exists in system
4. Validate invitation key hasn't expired

## 📞 Support

For technical support or additional queries:

- **Email:** support@idfactory.me
- **Documentation:** https://docs.idfactory.me
- **Developer Portal:** https://developers.idfactory.me

## 📝 Important Notes

1. **Security:** Never expose tokens in client code. Generate tokens dynamically from your backend.

2. **HTTPS:** Component requires HTTPS in production to access camera.

3. **Compatibility:** Component works in modern browsers (Chrome, Firefox, Safari, Edge).

4. **Permissions:** User must grant camera and location permissions (if required).

5. **Tokens:** Tokens have expiration time. Implement automatic renewal if necessary.

## 🔄 Changelog

### Latest version
- ✅ Liveness oval correction
- ✅ Loader z-index optimization
- ✅ Automatic process detection improvements
- ✅ Event unification under `genieEventGeneral`
- ✅ Response simplification (removal of `token` field)
- ✅ Error handling improvements

---

**Last update:** January 2025  
**© ID Factory LLC**
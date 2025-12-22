# Gemini API Setup Guide

## ⚠️ IMPORTANT: Google AI Studio vs GCP Vertex AI

**The `@google/generative-ai` SDK uses Google AI Studio API, NOT Vertex AI!**

Even if you enabled Gemini API in Google Cloud Platform (GCP), you still need an API key from **Google AI Studio** (makersuite.google.com). These are two different services:

- **Google AI Studio** (makersuite.google.com) - Used by this SDK
- **GCP Vertex AI** - Different API, requires different setup

## Issue: Model Not Available

If you're seeing "Model not available" errors, it's likely because:
1. You're using a GCP Vertex AI API key instead of a Google AI Studio API key
2. Your API key doesn't have access to Gemini 1.5 models

## Solution: Get Google AI Studio API Key

### Step 1: Get API Key from Google AI Studio (NOT GCP)

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key" or use an existing one
4. Copy the API key (starts with `AIza...`)

### Step 2: Add API Key to Your Project

1. Create a `.env.local` file in your project root (same directory as `package.json`)
2. Add your API key:
   ```
   GEMINI_API_KEY=AIza...your_key_here
   ```
3. **Restart your development server** (important!)

### Step 3: Available Models

The application will automatically try these models in order:
- `gemini-1.5-pro-latest` (preferred)
- `gemini-1.5-flash-latest` (alternative)
- `gemini-1.5-pro`
- `gemini-1.5-flash`
- `gemini-pro-vision` (fallback)

**Note:** Google AI Studio API keys typically have access to these models by default. No additional setup needed!

### Step 4: Alternative - Use Manual Selection

If you can't access Gemini 1.5 models immediately, you can still use the Virtual Design Assistant:

1. Upload your image
2. When you see the error, use the **manual selection buttons**:
   - Cabinet Refinishing
   - Fireplace Remodeling
   - Deck Restoration
   - Full Room Refinishing
3. Click the appropriate button to proceed

The manual selection will work even if auto-detection fails!

## Testing Your Setup

1. **Check API Key**:
   ```bash
   # In your .env.local file
   GEMINI_API_KEY=your_key_here
   ```

2. **Restart Dev Server**:
   ```bash
   npm run dev
   ```

3. **Test Upload**:
   - Upload a kitchen/cabinet image
   - Check if auto-detection works
   - If not, use manual selection

## Troubleshooting

### Error: "404 Not Found" or "Model not found"

**Cause**: Your API key doesn't have access to Gemini 1.5 models.

**Solutions**:
1. Request access to Gemini 1.5 in Google Cloud Console
2. Wait for approval (may take time)
3. Use manual selection in the meantime

### Error: "API key invalid"

**Solutions**:
1. Verify your API key in `.env.local`
2. Make sure there are no extra spaces
3. Regenerate the key in Google AI Studio if needed

### Error: "Quota exceeded"

**Solutions**:
1. Check your API usage limits
2. Wait for quota reset
3. Upgrade your API plan if needed

## Current Status

The application will:
1. ✅ Try `gemini-1.5-pro` first (best for images)
2. ✅ Fall back to `gemini-1.5-flash` if available
3. ✅ Try `gemini-pro-vision` as last resort
4. ✅ Show manual selection if all models fail

**You can always use manual selection to continue!**

## Need Help?

- Check the [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) file
- Review error messages in the browser console (F12)
- Check server logs in your terminal


# Virtual Design Assistant - Troubleshooting Guide

## Common Issues

### "Failed to detect surface type" Error

This error typically occurs due to one of the following reasons:

#### 1. Missing API Key (Most Common)

**Symptom**: Error message shows "API configuration error" or "Failed to detect surface type"

**Solution**:
1. Get a Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a `.env.local` file in the root directory (same level as `package.json`)
3. Add the following line:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   ```
4. Restart your development server:
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```

**Important**: 
- The file must be named `.env.local` (not `.env`)
- Never commit this file to git (it's already in `.gitignore`)
- Restart the dev server after adding/changing environment variables

#### 2. Invalid API Key

**Symptom**: Error mentions "API_KEY" or "authentication"

**Solution**:
- Verify your API key is correct
- Check if the API key has expired or been revoked
- Generate a new API key if needed

#### 3. API Rate Limits

**Symptom**: Error mentions "quota" or "rate limit"

**Solution**:
- Wait a few minutes and try again
- Check your Gemini API usage limits
- Consider upgrading your API plan if needed

#### 4. Network Issues

**Symptom**: Timeout errors or connection failures

**Solution**:
- Check your internet connection
- Verify firewall settings aren't blocking API calls
- Try again after a moment

## Manual Surface Selection

If auto-detection fails, you can manually select the surface type:
1. When you see the error message, look for the "Or select manually:" section
2. Click on the appropriate surface type button:
   - Cabinet Refinishing
   - Fireplace Remodeling
   - Deck Restoration
   - Full Room Refinishing

## Testing the Setup

1. **Check Environment Variable**:
   ```bash
   # In your terminal, verify the variable is loaded (this won't show the actual key)
   node -e "console.log(process.env.GEMINI_API_KEY ? 'API key is set' : 'API key is missing')"
   ```

2. **Test API Route Directly**:
   - Open browser dev tools (F12)
   - Go to Network tab
   - Upload an image
   - Check the `/api/detect-surface-type` request
   - Look at the response for detailed error messages

3. **Check Server Logs**:
   - Look at your terminal where `npm run dev` is running
   - Check for any error messages or stack traces

## Still Having Issues?

1. **Verify File Structure**:
   ```
   rome-fine-finishes-website-main/
   ├── .env.local          ← Should be here
   ├── package.json
   ├── app/
   │   └── api/
   │       └── detect-surface-type/
   │           └── route.ts
   ```

2. **Check Node Version**:
   ```bash
   node --version  # Should be 18.x or higher
   ```

3. **Reinstall Dependencies**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Clear Next.js Cache**:
   ```bash
   rm -rf .next
   npm run dev
   ```

## Getting Help

If you continue to experience issues:
1. Check the browser console for client-side errors
2. Check the server terminal for server-side errors
3. Verify your API key is valid and has proper permissions
4. Review the error message details - they now include more specific information


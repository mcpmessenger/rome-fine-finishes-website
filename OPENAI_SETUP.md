# OpenAI Vision API Setup

## Why OpenAI Vision?

We've switched from Gemini to OpenAI Vision API (GPT-4 Vision) because:
- ✅ More reliable and stable
- ✅ Better documentation and support
- ✅ More predictable rate limits
- ✅ Excellent image analysis capabilities
- ✅ Easier to set up

## Setup Instructions

### Step 1: Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to [API Keys](https://platform.openai.com/api-keys)
4. Click "Create new secret key"
5. Copy the key (starts with `sk-...`)
6. **Important**: Save it immediately - you won't see it again!

### Step 2: Add to Environment Variables

1. Open your `.env.local` file (or create it if it doesn't exist)
2. Add your OpenAI API key:
   ```
   OPENAI_API_KEY=sk-your_key_here
   ```
3. **Restart your development server** (important!)

### Step 3: Test

1. Go to `/virtual-design-assistant`
2. Upload an image
3. The system will use GPT-4 Vision to detect the surface type

## Pricing

OpenAI Vision API pricing (as of 2024):
- **GPT-4o (Vision)**: ~$2.50-$10 per 1M input tokens (images are tokenized)
- **Free tier**: $5 free credit when you sign up
- **Pay-as-you-go**: No monthly commitment

For surface detection, each request is very small (~$0.001-0.01 per image).

## Model Used

- **Model**: `gpt-4o` (GPT-4 Omni with vision)
- **Capabilities**: Excellent at image analysis and understanding
- **Speed**: Fast response times

## Troubleshooting

### Error: "API key is not configured"
- Make sure `.env.local` exists in the project root
- Verify the key starts with `sk-`
- Restart your dev server after adding the key

### Error: "Insufficient quota"
- Add credits to your OpenAI account
- Check your usage at [OpenAI Usage](https://platform.openai.com/usage)

### Error: "Rate limit exceeded"
- You've hit the rate limit for your tier
- Wait a few minutes or upgrade your plan
- Use manual selection as a fallback

## Migration from Gemini

If you were using Gemini before:
1. Remove `GEMINI_API_KEY` from `.env.local` (optional)
2. Add `OPENAI_API_KEY` to `.env.local`
3. Restart your server

The code automatically uses OpenAI now - no other changes needed!


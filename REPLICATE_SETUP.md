# Replicate API Setup for Image-to-Image Transformation

## Why Replicate?

We've switched from DALL-E 3 to Replicate's Stable Diffusion because:
- ✅ **Image-to-image support** - Takes the original image as input
- ✅ **Better structure preservation** - Maintains layout and composition
- ✅ **More control** - Can adjust similarity strength
- ✅ **Photorealistic results** - Better at maintaining realism

## Setup Instructions

### Step 1: Get Replicate API Token

1. Go to [Replicate](https://replicate.com/)
2. Sign up or log in
3. Navigate to [Account Settings > API Tokens](https://replicate.com/account/api-tokens)
4. Click "Create token"
5. Copy the token (starts with `r8_...`)

### Step 2: Add to Environment Variables

1. Open your `.env.local` file
2. Add your Replicate API token:
   ```
   REPLICATE_API_TOKEN=r8_your_token_here
   ```
3. **Restart your development server** (important!)

### Step 3: Test

1. Go to `/virtual-design-assistant`
2. Upload an image
3. The system will use Stable Diffusion image-to-image for transformation

## Pricing

Replicate pricing (as of 2024):
- **Stable Diffusion XL**: ~$0.002-0.01 per image
- **Pay-as-you-go**: No monthly commitment
- **Free tier**: Limited credits available

Much cheaper than DALL-E 3!

## How It Works

1. **GPT-4 Vision** analyzes the original image
2. **Stable Diffusion image-to-image** transforms it using the original image as input
3. The `strength` parameter (0.6) controls how much to change:
   - Lower (0.3-0.5) = More similar to original
   - Higher (0.7-0.9) = More transformation

## Troubleshooting

### Error: "API token is not configured"
- Make sure `REPLICATE_API_TOKEN` is in `.env.local`
- Restart your dev server after adding it

### Error: "Insufficient credits"
- Add credits to your Replicate account
- Check usage at [Replicate Dashboard](https://replicate.com/account)

### Results too similar/different
- Adjust the `strength` parameter in the code (currently 0.6)
- Lower = more similar, Higher = more transformation



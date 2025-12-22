# Virtual Design Assistant - Setup Guide

## Overview

The Virtual Design Assistant is an AI-powered tool that helps customers visualize refinishing transformations for cabinets, fireplaces, decks, and rooms.

## Environment Setup

1. **Get a Gemini API Key**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy the API key

2. **Configure Environment Variables**
   - Create a `.env.local` file in the root directory
   - Add your Gemini API key:
     ```
     GEMINI_API_KEY=your_actual_api_key_here
     ```

## Important Notes

### Image Transformation Limitation

**Current Status**: The MVP uses Gemini 1.5 Flash for surface detection and analysis. However, Gemini 1.5 Flash does not generate new images - it's designed for understanding and analyzing images, not creating them.

**For Full Image Transformation**:
- Option 1: Integrate with Google's Imagen API for actual image generation
- Option 2: Use a different image generation service (e.g., Replicate, Stability AI)
- Option 3: Use image editing libraries with AI-guided transformations

**Current MVP Behavior**:
- Surface detection works fully (cabinets, fireplaces, decks, rooms)
- AI generates detailed transformation descriptions
- Currently shows original image as placeholder for transformed result
- Full image transformation requires additional API integration

## Development

### Running Locally

```bash
npm run dev
```

Visit `http://localhost:3000/virtual-design-assistant`

### Testing

1. Test with various cabinet images
2. Test with fireplace photos
3. Test with deck images
4. Verify surface detection accuracy
5. Test error handling (invalid files, oversized images)

## API Routes

### POST `/api/detect-surface-type`
- Detects surface type from uploaded image
- Returns: `{ surfaceType: "cabinets" | "fireplace" | "deck" | "room" }`

### POST `/api/transform-image`
- Transforms image based on detected surface type
- Returns: `{ transformedImage: string (base64), mimeType: string, description: string }`
- Note: Currently returns original image with AI description (see limitation above)

## Next Steps for Production

1. **Integrate Image Generation API**
   - Research and integrate Google Imagen API or alternative
   - Update `/api/transform-image` route to use image generation service

2. **Enhance Surface Detection**
   - Add manual surface selection fallback
   - Improve detection accuracy with more training examples

3. **Performance Optimization**
   - Add image caching
   - Optimize API response times
   - Implement request rate limiting

4. **Analytics**
   - Track transformation success rate
   - Monitor API usage and costs
   - Measure conversion from visualization to consultation

## File Structure

```
app/
  api/
    detect-surface-type/
      route.ts          # Surface detection API
    transform-image/
      route.ts          # Image transformation API
  virtual-design-assistant/
    page.tsx            # Main page component

components/
  virtual-design-assistant/
    ImageUploader.tsx           # Drag & drop image upload
    SurfaceTypeDetector.tsx      # Auto surface detection
    TransformationViewer.tsx    # Before/after comparison
    ServiceCTA.tsx              # Contextual service CTA
    VirtualDesignAssistant.tsx   # Main component
```

## Support

For issues or questions, refer to the main project documentation or contact the development team.


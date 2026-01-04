import { createCanvas, loadImage } from 'canvas';

export interface AIResult {
  status: 'HABIS' | 'SISA_SEDIKIT' | 'SISA_BANYAK';
  confidence: number;
}

/**
 * Detect food waste in plate image
 * Uses simple image analysis (in production, use trained ML model)
 */
export const detectFoodWaste = async (imageBuffer: Buffer): Promise<AIResult> => {
  try {
    const image = await loadImage(imageBuffer);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    
    let foodPixels = 0;
    let totalPixels = pixels.length / 4;

    // Analyze pixels to detect food (non-white/non-gray areas)
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      
      // Calculate brightness
      const brightness = (r + g + b) / 3;
      
      // Food typically has lower brightness than white plate
      // Also check for color variance (food has more color variation)
      const colorVariance = Math.sqrt(
        Math.pow(r - brightness, 2) +
        Math.pow(g - brightness, 2) +
        Math.pow(b - brightness, 2)
      );
      
      if (brightness < 200 || colorVariance > 30) {
        foodPixels++;
      }
    }

    const foodRatio = foodPixels / totalPixels;
    
    // Classification based on food ratio
    let status: 'HABIS' | 'SISA_SEDIKIT' | 'SISA_BANYAK';
    let confidence = 0.8;

    if (foodRatio <= 0.15) {
      status = 'HABIS';
      confidence = 0.90;
    } else if (foodRatio <= 0.40) {
      status = 'SISA_SEDIKIT';
      confidence = 0.75;
    } else {
      status = 'SISA_BANYAK';
      confidence = 0.85;
    }

    return { status, confidence };
  } catch (error) {
    console.error('AI Detection Error:', error);
    // Return default if error
    return { 
      status: 'PENDING_VERIFICATION' as any, 
      confidence: 0.5 
    };
  }
};

/**
 * Alternative: Use Google Cloud Vision API for better accuracy
 * Uncomment and configure if you have GCP credentials
 */
/*
import { ImageAnnotatorClient } from '@google-cloud/vision';

const visionClient = new ImageAnnotatorClient({
  keyFilename: process.env.GCP_KEY_FILE,
});

export const detectFoodWasteWithVisionAPI = async (imageBuffer: Buffer): Promise<AIResult> => {
  try {
    const [result] = await visionClient.objectLocalization({
      image: { content: imageBuffer },
    });

    // Process Vision API results
    // This is a simplified example - adjust based on your model
    
    return { status: 'HABIS', confidence: 0.8 };
  } catch (error) {
    console.error('Vision API Error:', error);
    return { status: 'PENDING_VERIFICATION' as any, confidence: 0.5 };
  }
};
*/


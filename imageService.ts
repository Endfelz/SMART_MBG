import { v2 as cloudinary } from 'cloudinary';
import sharp from 'sharp';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  url: string;
  thumbnailUrl: string;
  publicId: string;
}

/**
 * Upload image to Cloudinary with automatic face cropping
 */
export const uploadImage = async (imageBuffer: Buffer, folder: string): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    // Upload main image
    cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [
          { width: 1200, height: 1200, crop: 'limit' },
          { quality: 'auto' },
          { fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error) return reject(error);
        
        if (!result) {
          return reject(new Error('Upload failed'));
        }

        // Generate thumbnail
        cloudinary.uploader.upload_stream(
          {
            folder: `${folder}/thumbnails`,
            resource_type: 'image',
            transformation: [
              { width: 300, height: 300, crop: 'thumb' },
              { quality: 'auto' },
              { fetch_format: 'auto' },
            ],
          },
          (thumbError, thumbResult) => {
            if (thumbError) {
              // If thumbnail fails, still return main image
              return resolve({
                url: result.secure_url,
                thumbnailUrl: result.secure_url,
                publicId: result.public_id,
              });
            }
            
            resolve({
              url: result.secure_url,
              thumbnailUrl: thumbResult!.secure_url,
              publicId: result.public_id,
            });
          }
        ).end(imageBuffer);
      }
    ).end(imageBuffer);
  });
};

/**
 * Crop image to remove top portion (where face usually is)
 */
export const cropImage = async (imageBuffer: Buffer): Promise<Buffer> => {
  try {
    const metadata = await sharp(imageBuffer).metadata();
    
    // Remove top 30% of image (usually where face is)
    const cropTop = Math.floor(metadata.height! * 0.3);
    const cropHeight = metadata.height! - cropTop;
    
    return sharp(imageBuffer)
      .extract({
        left: 0,
        top: cropTop,
        width: metadata.width!,
        height: cropHeight,
      })
      .resize(800, 800, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 85 })
      .toBuffer();
  } catch (error) {
    console.error('Image cropping error:', error);
    // Return original if cropping fails
    return imageBuffer;
  }
};

/**
 * Validate image dimensions and content
 */
export const validateImage = async (imageBuffer: Buffer): Promise<{ valid: boolean; message?: string }> => {
  try {
    const metadata = await sharp(imageBuffer).metadata();
    
    // Check minimum dimensions
    if (metadata.width! < 200 || metadata.height! < 200) {
      return { valid: false, message: 'Gambar terlalu kecil. Minimal 200x200 pixel' };
    }
    
    // Check maximum dimensions
    if (metadata.width! > 4000 || metadata.height! > 4000) {
      return { valid: false, message: 'Gambar terlalu besar. Maksimal 4000x4000 pixel' };
    }
    
    return { valid: true };
  } catch (error) {
    return { valid: false, message: 'File bukan gambar yang valid' };
  }
};


import { v2 as cloudinary } from 'cloudinary';
import { logger } from '../utils/logger.js';

// Configure Cloudinary from process environment settings
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'golden_fisheries_fallback_cloud',
  api_key: process.env.CLOUDINARY_API_KEY || '123456789012345',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'abcdefghijklmnopqrstuvwxyz0123'
});

class CloudinaryService {
  /**
   * Uploads a memory buffer stream directly to Cloudinary.
   * Eliminates the need for local file staging to prevent disk storage bloat.
   * 
   * @param {Buffer} fileBuffer - The multer-provided file buffer
   * @param {string} folder - Destination folder on Cloudinary (e.g. 'pod', 'signatures', 'receipts')
   * @param {string} originalName - Original filename
   * @returns {Promise<{url: string, publicId: string}>}
   */
  async uploadStream(fileBuffer, folder = 'general', originalName = 'upload') {
    let retries = 3;
    let delay = 1000;

    const sanitizeFileName = originalName.replace(/[^a-zA-Z0-9]/g, '_');
    const publicId = `${folder}/${Date.now()}_${sanitizeFileName}`;

    while (retries > 0) {
      try {
        const uploadPromise = new Promise((resolve, reject) => {
          const uploadStreamInstance = cloudinary.uploader.upload_stream(
            {
              folder: `golden_fisheries/${folder}`,
              public_id: publicId,
              resource_type: 'auto',
              quality: 'auto:good', // Built-in intelligent compression
              fetch_format: 'auto' // Serves WebP/AVIF to modern browsers automatically
            },
            (error, result) => {
              if (error) {
                return reject(error);
              }
              resolve({
                url: result.secure_url,
                publicId: result.public_id
              });
            }
          );

          // Write buffer to stream and end
          uploadStreamInstance.end(fileBuffer);
        });

        const result = await uploadPromise;
        logger.info(`[Cloudinary Service]: File ${originalName} uploaded successfully. Public ID: ${result.publicId}`);
        return result;
      } catch (err) {
        retries--;
        logger.warn(`[Cloudinary Service]: Upload failed for ${originalName}. Retries remaining: ${retries}. Error: ${err.message}`);
        
        if (retries === 0) {
          throw new Error(`Cloudinary upload failed after multiple attempts: ${err.message}`);
        }

        // Exponential backoff
        await new Promise(res => setTimeout(res, delay));
        delay *= 2;
      }
    }
  }

  /**
   * Safe check to generate secure signed URL for restricted files
   * @param {string} publicId 
   * @returns {string}
   */
  getSignedUrl(publicId) {
    // Generate secure CDN-ready signed URL valid for 1 hour
    return cloudinary.url(publicId, {
      sign_url: true,
      secure: true,
      expires_at: Math.floor(Date.now() / 1000) + 3600
    });
  }

  /**
   * Delete asset from Cloudinary
   * @param {string} publicId 
   */
  async deleteAsset(publicId) {
    try {
      const response = await cloudinary.uploader.destroy(publicId);
      logger.info(`[Cloudinary Service]: Destroy asset result for ${publicId}: ${response.result}`);
      return response.result === 'ok';
    } catch (err) {
      logger.error(`[Cloudinary Service Error]: Unable to destroy asset ${publicId}: ${err.message}`);
      return false;
    }
  }
}

export const cloudinaryService = new CloudinaryService();
export default cloudinaryService;

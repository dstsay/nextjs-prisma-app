import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary with admin credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

/**
 * Delete an image from Cloudinary
 * @param publicId - The public ID of the image to delete
 * @returns Promise with deletion result
 */
export async function deleteCloudinaryImage(publicId: string) {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    return { success: result.result === 'ok', result }
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error)
    return { success: false, error }
  }
}

/**
 * Delete multiple images from Cloudinary
 * @param publicIds - Array of public IDs to delete
 * @returns Promise with deletion results
 */
export async function deleteCloudinaryImages(publicIds: string[]) {
  try {
    const deletePromises = publicIds.map(publicId => deleteCloudinaryImage(publicId))
    const results = await Promise.all(deletePromises)
    return results
  } catch (error) {
    console.error('Error deleting images from Cloudinary:', error)
    throw error
  }
}

/**
 * Upload an image to Cloudinary (server-side)
 * @param file - File buffer or base64 string
 * @param options - Upload options
 * @returns Promise with upload result
 */
export async function uploadToCloudinary(
  file: Buffer | string,
  options: {
    folder?: string
    public_id?: string
    transformation?: any[]
  } = {}
) {
  try {
    // Convert Buffer to base64 data URL if needed
    const uploadData = file instanceof Buffer 
      ? `data:image/jpeg;base64,${file.toString('base64')}`
      : file

    const result = await cloudinary.uploader.upload(uploadData as string, {
      folder: options.folder,
      public_id: options.public_id,
      transformation: options.transformation,
      resource_type: 'image',
    })
    return { success: true, result }
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error)
    return { success: false, error }
  }
}

export { cloudinary }
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloudinary = exports.defaultTransformations = void 0;
exports.uploadImage = uploadImage;
exports.uploadImageFromUrl = uploadImageFromUrl;
exports.deleteImage = deleteImage;
exports.getOptimizedUrl = getOptimizedUrl;
exports.getResponsiveUrls = getResponsiveUrls;
exports.getPlaceholderUrl = getPlaceholderUrl;
exports.isValidImageType = isValidImageType;
exports.isValidFileSize = isValidFileSize;
exports.generatePublicId = generatePublicId;
exports.createUploadSignature = createUploadSignature;
exports.getImageMetadata = getImageMetadata;
const cloudinary_1 = require("cloudinary");
Object.defineProperty(exports, "cloudinary", { enumerable: true, get: function () { return cloudinary_1.v2; } });
// Configure Cloudinary
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
// Default transformations for different use cases
exports.defaultTransformations = {
    portfolio: {
        quality: 'auto',
        format: 'auto',
        crop: 'limit',
        width: 1200,
        dpr: 'auto',
        fetch_format: 'auto',
        flags: ['progressive'],
    },
    profilePicture: {
        quality: 'auto',
        format: 'auto',
        crop: 'thumb',
        gravity: 'face',
        width: 400,
        height: 400,
        dpr: 'auto',
    },
    thumbnail: {
        quality: 'auto:eco',
        format: 'auto',
        crop: 'fill',
        width: 200,
        height: 200,
        effect: 'blur:1000',
    },
    mobile: {
        quality: 'auto:eco',
        format: 'auto',
        crop: 'limit',
        width: 600,
        flags: ['progressive', 'lossy'],
    },
};
// Upload image to Cloudinary
async function uploadImage(imagePath, options = {}) {
    try {
        const result = await cloudinary_1.v2.uploader.upload(imagePath, {
            folder: options.folder || 'goldiegrace',
            public_id: options.public_id,
            tags: options.tags,
            transformation: options.transformation,
            resource_type: 'auto',
        });
        return result;
    }
    catch (error) {
        console.error('Cloudinary upload error:', error);
        throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
// Upload image from URL
async function uploadImageFromUrl(imageUrl, options = {}) {
    return uploadImage(imageUrl, options);
}
// Delete image from Cloudinary
async function deleteImage(publicId) {
    try {
        const result = await cloudinary_1.v2.uploader.destroy(publicId);
        return result.result === 'ok';
    }
    catch (error) {
        console.error('Cloudinary delete error:', error);
        return false;
    }
}
// Generate optimized URL for an image
function getOptimizedUrl(publicId, transformation = exports.defaultTransformations.portfolio) {
    return cloudinary_1.v2.url(publicId, {
        secure: true,
        transformation: [transformation],
    });
}
// Generate responsive image URLs
function getResponsiveUrls(publicId, baseTransformation = {}) {
    const widths = [320, 640, 768, 1024, 1280, 1536];
    const srcSet = widths
        .map((width) => {
        const url = cloudinary_1.v2.url(publicId, {
            secure: true,
            transformation: [{ ...baseTransformation, width, crop: 'limit' }],
        });
        return `${url} ${width}w`;
    })
        .join(', ');
    const sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
    const src = getOptimizedUrl(publicId, { ...baseTransformation, width: 1024 });
    return { srcSet, sizes, src };
}
// Generate blur placeholder URL
function getPlaceholderUrl(publicId) {
    return cloudinary_1.v2.url(publicId, {
        secure: true,
        transformation: [
            {
                width: 30,
                quality: 10,
                effect: 'blur:1000',
                format: 'auto',
            },
        ],
    });
}
// Validate file type
function isValidImageType(filename) {
    const validTypes = /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i;
    return validTypes.test(filename);
}
// Validate file size (in bytes)
function isValidFileSize(sizeInBytes, maxSizeMB = 10) {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return sizeInBytes <= maxSizeBytes;
}
// Generate unique public ID
function generatePublicId(prefix = 'img') {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    return `${prefix}_${timestamp}_${random}`;
}
// Create signed upload parameters
async function createUploadSignature(folder = 'goldiegrace') {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const paramsToSign = {
        timestamp,
        folder,
    };
    const signature = cloudinary_1.v2.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET);
    return {
        signature,
        timestamp,
        api_key: process.env.CLOUDINARY_API_KEY,
        folder,
    };
}
// Get image metadata
async function getImageMetadata(publicId) {
    try {
        const result = await cloudinary_1.v2.api.resource(publicId);
        return {
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
            created_at: result.created_at,
            public_id: result.public_id,
            secure_url: result.secure_url,
        };
    }
    catch (error) {
        console.error('Error fetching image metadata:', error);
        return null;
    }
}
exports.default = cloudinary_1.v2;

"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultTransformations = void 0;
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
var cloudinary_1 = require("cloudinary");
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
function uploadImage(imagePath_1) {
    return __awaiter(this, arguments, void 0, function (imagePath, options) {
        var result, error_1;
        if (options === void 0) { options = {}; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, cloudinary_1.v2.uploader.upload(imagePath, {
                            folder: options.folder || 'goldiegrace',
                            public_id: options.public_id,
                            tags: options.tags,
                            transformation: options.transformation,
                            resource_type: 'auto',
                        })];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, result];
                case 2:
                    error_1 = _a.sent();
                    console.error('Cloudinary upload error:', error_1);
                    throw new Error("Failed to upload image: ".concat(error_1 instanceof Error ? error_1.message : 'Unknown error'));
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Upload image from URL
function uploadImageFromUrl(imageUrl_1) {
    return __awaiter(this, arguments, void 0, function (imageUrl, options) {
        if (options === void 0) { options = {}; }
        return __generator(this, function (_a) {
            return [2 /*return*/, uploadImage(imageUrl, options)];
        });
    });
}
// Delete image from Cloudinary
function deleteImage(publicId) {
    return __awaiter(this, void 0, void 0, function () {
        var result, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, cloudinary_1.v2.uploader.destroy(publicId)];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, result.result === 'ok'];
                case 2:
                    error_2 = _a.sent();
                    console.error('Cloudinary delete error:', error_2);
                    return [2 /*return*/, false];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Generate optimized URL for an image
function getOptimizedUrl(publicId, transformation) {
    if (transformation === void 0) { transformation = exports.defaultTransformations.portfolio; }
    return cloudinary_1.v2.url(publicId, {
        secure: true,
        transformation: [transformation],
    });
}
// Generate responsive image URLs
function getResponsiveUrls(publicId, baseTransformation) {
    if (baseTransformation === void 0) { baseTransformation = {}; }
    var widths = [320, 640, 768, 1024, 1280, 1536];
    var srcSet = widths
        .map(function (width) {
        var url = cloudinary_1.v2.url(publicId, {
            secure: true,
            transformation: [__assign(__assign({}, baseTransformation), { width: width, crop: 'limit' })],
        });
        return "".concat(url, " ").concat(width, "w");
    })
        .join(', ');
    var sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
    var src = getOptimizedUrl(publicId, __assign(__assign({}, baseTransformation), { width: 1024 }));
    return { srcSet: srcSet, sizes: sizes, src: src };
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
    var validTypes = /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i;
    return validTypes.test(filename);
}
// Validate file size (in bytes)
function isValidFileSize(sizeInBytes, maxSizeMB) {
    if (maxSizeMB === void 0) { maxSizeMB = 10; }
    var maxSizeBytes = maxSizeMB * 1024 * 1024;
    return sizeInBytes <= maxSizeBytes;
}
// Generate unique public ID
function generatePublicId(prefix) {
    if (prefix === void 0) { prefix = 'img'; }
    var timestamp = Date.now();
    var random = Math.random().toString(36).substring(2, 9);
    return "".concat(prefix, "_").concat(timestamp, "_").concat(random);
}
// Create signed upload parameters
function createUploadSignature() {
    return __awaiter(this, arguments, void 0, function (folder) {
        var timestamp, paramsToSign, signature;
        if (folder === void 0) { folder = 'goldiegrace'; }
        return __generator(this, function (_a) {
            timestamp = Math.round(new Date().getTime() / 1000);
            paramsToSign = {
                timestamp: timestamp,
                folder: folder,
            };
            signature = cloudinary_1.v2.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET);
            return [2 /*return*/, {
                    signature: signature,
                    timestamp: timestamp,
                    api_key: process.env.CLOUDINARY_API_KEY,
                    folder: folder,
                }];
        });
    });
}
// Get image metadata
function getImageMetadata(publicId) {
    return __awaiter(this, void 0, void 0, function () {
        var result, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, cloudinary_1.v2.api.resource(publicId)];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, {
                            width: result.width,
                            height: result.height,
                            format: result.format,
                            bytes: result.bytes,
                            created_at: result.created_at,
                            public_id: result.public_id,
                            secure_url: result.secure_url,
                        }];
                case 2:
                    error_3 = _a.sent();
                    console.error('Error fetching image metadata:', error_3);
                    return [2 /*return*/, null];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.default = cloudinary_1.v2;

"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.migrateToCloudinary = migrateToCloudinary;
var client_1 = require("@prisma/client");
var cloudinary_1 = require("../lib/cloudinary");
var readline = __importStar(require("readline"));
// Artists and their portfolio images from our seed data
var artistPortfolioImages = [
    {
        username: 'sarah_beauty',
        portfolioImages: [
            'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=800',
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
            'https://images.unsplash.com/photo-1521146764736-56c929d59c83?w=800',
            'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=800'
        ]
    },
    {
        username: 'maria_glam',
        portfolioImages: [
            'https://images.unsplash.com/photo-1506863530036-1efeddceb993?w=800',
            'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800',
            'https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=800',
            'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=800'
        ]
    },
    {
        username: 'jessica_artistry',
        portfolioImages: [
            'https://images.unsplash.com/photo-1520872024865-3ff2805d8bb3?w=800',
            'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=800',
            'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800',
            'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800'
        ]
    },
    {
        username: 'alex_pro',
        portfolioImages: [
            'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=800',
            'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800',
            'https://images.unsplash.com/photo-1523264653568-d3d4032d1476?w=800',
            'https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=800'
        ]
    },
    {
        username: 'taylor_mua',
        portfolioImages: [
            'https://images.unsplash.com/photo-1506863530036-1efeddceb993?w=800',
            'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800',
            'https://images.unsplash.com/photo-1521146764736-56c929d59c83?w=800',
            'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=800'
        ]
    },
    {
        username: 'nina_beauty',
        portfolioImages: [
            'https://images.unsplash.com/photo-1523264653568-d3d4032d1476?w=800',
            'https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=800',
            'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=800',
            'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800'
        ]
    },
    {
        username: 'rachel_glow',
        portfolioImages: [
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
            'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=800',
            'https://images.unsplash.com/photo-1520872024865-3ff2805d8bb3?w=800',
            'https://images.unsplash.com/photo-1521146764736-56c929d59c83?w=800'
        ]
    },
    {
        username: 'lisa_transform',
        portfolioImages: [
            'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=800',
            'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800',
            'https://images.unsplash.com/photo-1506863530036-1efeddceb993?w=800',
            'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800'
        ]
    },
    {
        username: 'monica_style',
        portfolioImages: [
            'https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=800',
            'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=800',
            'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800',
            'https://images.unsplash.com/photo-1523264653568-d3d4032d1476?w=800'
        ]
    },
    {
        username: 'diana_luxe',
        portfolioImages: [
            'https://images.unsplash.com/photo-1523264653568-d3d4032d1476?w=800',
            'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=800',
            'https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=800',
            'https://images.unsplash.com/photo-1506863530036-1efeddceb993?w=800'
        ]
    },
    {
        username: 'kim_minimal',
        portfolioImages: [
            'https://images.unsplash.com/photo-1520872024865-3ff2805d8bb3?w=800',
            'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=800',
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
            'https://images.unsplash.com/photo-1521146764736-56c929d59c83?w=800'
        ]
    },
    {
        username: 'amanda_vintage',
        portfolioImages: [
            'https://images.unsplash.com/photo-1506863530036-1efeddceb993?w=800',
            'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=800',
            'https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=800',
            'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800'
        ]
    }
];
function migrateToCloudinary() {
    return __awaiter(this, void 0, void 0, function () {
        var rl, prisma, prompt_1, isProduction, artists, proceed, backup, backupFilename, _loop_1, _i, artists_1, artist, updatedArtists, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    prisma = new client_1.PrismaClient();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 10, 11, 13]);
                    console.log('🚀 Starting Cloudinary Migration\n');
                    // Check if Cloudinary is configured
                    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
                        console.error('❌ Cloudinary credentials not found in environment variables.');
                        console.log('\nPlease set up your Cloudinary account and add credentials to .env.local:');
                        console.log('- CLOUDINARY_CLOUD_NAME');
                        console.log('- CLOUDINARY_API_KEY');
                        console.log('- CLOUDINARY_API_SECRET\n');
                        console.log('See CLOUDINARY_SETUP.md for detailed instructions.\n');
                        process.exit(1);
                    }
                    // Create readline interface for user prompts
                    rl = readline.createInterface({
                        input: process.stdin,
                        output: process.stdout
                    });
                    prompt_1 = function (question) {
                        return new Promise(function (resolve) { return rl.question(question, resolve); });
                    };
                    return [4 /*yield*/, prompt_1('Are you migrating the PRODUCTION database? (yes/no): ')];
                case 2:
                    isProduction = _a.sent();
                    if (isProduction.toLowerCase() !== 'yes' && isProduction.toLowerCase() !== 'no') {
                        console.log('Please answer yes or no');
                        process.exit(1);
                    }
                    console.log("\n\uD83D\uDCCA Checking ".concat(isProduction.toLowerCase() === 'yes' ? 'PRODUCTION' : 'development', " database...\n"));
                    return [4 /*yield*/, prisma.makeupArtist.findMany({
                            select: {
                                id: true,
                                username: true,
                                name: true,
                                portfolioImages: true,
                                profileImage: true
                            }
                        })];
                case 3:
                    artists = _a.sent();
                    if (artists.length === 0) {
                        console.log('❌ No makeup artists found in database.');
                        process.exit(1);
                    }
                    console.log("Found ".concat(artists.length, " makeup artists\n"));
                    // Show migration plan
                    console.log('📋 Migration Plan:');
                    console.log('1. Upload all portfolio images to Cloudinary');
                    console.log('2. Upload profile images to Cloudinary');
                    console.log('3. Update database with Cloudinary URLs');
                    console.log('4. Create backup of original URLs\n');
                    return [4 /*yield*/, prompt_1('Proceed with migration? (yes/no): ')];
                case 4:
                    proceed = _a.sent();
                    if (proceed.toLowerCase() !== 'yes') {
                        console.log('Migration cancelled.');
                        process.exit(0);
                    }
                    console.log('\n🔄 Starting migration...\n');
                    backup = artists.map(function (artist) { return ({
                        id: artist.id,
                        username: artist.username,
                        originalPortfolioImages: artist.portfolioImages,
                        originalProfileImage: artist.profileImage
                    }); });
                    backupFilename = "cloudinary-migration-backup-".concat(Date.now(), ".json");
                    require('fs').writeFileSync(backupFilename, JSON.stringify(backup, null, 2));
                    console.log("\u2705 Backup saved to ".concat(backupFilename, "\n"));
                    _loop_1 = function (artist) {
                        var artistData, portfolioUrls, newPortfolioImages, i, imageUrl, publicId, result, error_2, newProfileImage, publicId, result, error_3;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    console.log("\n\uD83D\uDC64 Migrating ".concat(artist.name, " (").concat(artist.username, ")..."));
                                    artistData = artistPortfolioImages.find(function (a) { return a.username === artist.username; });
                                    portfolioUrls = (artistData === null || artistData === void 0 ? void 0 : artistData.portfolioImages) || artist.portfolioImages;
                                    newPortfolioImages = [];
                                    i = 0;
                                    _b.label = 1;
                                case 1:
                                    if (!(i < portfolioUrls.length)) return [3 /*break*/, 6];
                                    imageUrl = portfolioUrls[i];
                                    publicId = (0, cloudinary_1.generatePublicId)("portfolio_".concat(artist.username, "_").concat(i + 1));
                                    _b.label = 2;
                                case 2:
                                    _b.trys.push([2, 4, , 5]);
                                    console.log("  \uD83D\uDCF8 Uploading portfolio image ".concat(i + 1, "/").concat(portfolioUrls.length, "..."));
                                    return [4 /*yield*/, (0, cloudinary_1.uploadImageFromUrl)(imageUrl, {
                                            folder: "goldiegrace/portfolio/".concat(artist.username),
                                            public_id: publicId
                                        })];
                                case 3:
                                    result = _b.sent();
                                    newPortfolioImages.push(result.public_id);
                                    console.log("  \u2705 Uploaded: ".concat(result.public_id));
                                    return [3 /*break*/, 5];
                                case 4:
                                    error_2 = _b.sent();
                                    console.error("  \u274C Failed to upload portfolio image ".concat(i + 1, ":"), error_2);
                                    return [3 /*break*/, 5];
                                case 5:
                                    i++;
                                    return [3 /*break*/, 1];
                                case 6:
                                    newProfileImage = artist.profileImage;
                                    if (!(artist.profileImage && artist.profileImage.includes('unsplash.com'))) return [3 /*break*/, 10];
                                    _b.label = 7;
                                case 7:
                                    _b.trys.push([7, 9, , 10]);
                                    console.log("  \uD83D\uDC64 Uploading profile image...");
                                    publicId = (0, cloudinary_1.generatePublicId)("profile_".concat(artist.username));
                                    return [4 /*yield*/, (0, cloudinary_1.uploadImageFromUrl)(artist.profileImage, {
                                            folder: "goldiegrace/profile-images/artists",
                                            public_id: publicId
                                        })];
                                case 8:
                                    result = _b.sent();
                                    newProfileImage = result.public_id;
                                    console.log("  \u2705 Uploaded profile: ".concat(result.public_id));
                                    return [3 /*break*/, 10];
                                case 9:
                                    error_3 = _b.sent();
                                    console.error("  \u274C Failed to upload profile image:", error_3);
                                    return [3 /*break*/, 10];
                                case 10:
                                    if (!(newPortfolioImages.length > 0 || newProfileImage !== artist.profileImage)) return [3 /*break*/, 12];
                                    return [4 /*yield*/, prisma.makeupArtist.update({
                                            where: { id: artist.id },
                                            data: {
                                                portfolioImages: newPortfolioImages.length > 0 ? newPortfolioImages : artist.portfolioImages,
                                                profileImage: newProfileImage
                                            }
                                        })];
                                case 11:
                                    _b.sent();
                                    console.log("  \u2705 Updated database for ".concat(artist.name));
                                    _b.label = 12;
                                case 12: return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, artists_1 = artists;
                    _a.label = 5;
                case 5:
                    if (!(_i < artists_1.length)) return [3 /*break*/, 8];
                    artist = artists_1[_i];
                    return [5 /*yield**/, _loop_1(artist)];
                case 6:
                    _a.sent();
                    _a.label = 7;
                case 7:
                    _i++;
                    return [3 /*break*/, 5];
                case 8:
                    console.log('\n✨ Migration completed successfully!\n');
                    return [4 /*yield*/, prisma.makeupArtist.findMany({
                            select: {
                                name: true,
                                portfolioImages: true
                            }
                        })];
                case 9:
                    updatedArtists = _a.sent();
                    console.log('📊 Migration Summary:');
                    console.log("- Total artists migrated: ".concat(updatedArtists.length));
                    console.log("- Backup saved to: ".concat(backupFilename));
                    console.log('\n🎉 All portfolio images are now hosted on Cloudinary!');
                    return [3 /*break*/, 13];
                case 10:
                    error_1 = _a.sent();
                    console.error('\n❌ Migration failed:', error_1);
                    process.exit(1);
                    return [3 /*break*/, 13];
                case 11:
                    if (rl) {
                        rl.close();
                    }
                    return [4 /*yield*/, prisma.$disconnect()];
                case 12:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 13: return [2 /*return*/];
            }
        });
    });
}
// Run migration only if this is the main module
if (require.main === module) {
    migrateToCloudinary().catch(function (error) {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

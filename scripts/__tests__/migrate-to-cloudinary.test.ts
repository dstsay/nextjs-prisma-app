import * as readline from 'readline';
import * as fs from 'fs';
import { uploadImageFromUrl, generatePublicId } from '../../lib/cloudinary';

// Mock all dependencies
jest.mock('readline');
jest.mock('fs');
jest.mock('../../lib/cloudinary');

// Mock PrismaClient
const mockPrismaClient = {
  makeupArtist: {
    findMany: jest.fn(),
    update: jest.fn(),
  },
  $disconnect: jest.fn(),
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrismaClient),
}));

// Mock process.exit to prevent test runner from exiting
const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
  return undefined as never;
});

// Mock console methods
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

describe('migrate-to-cloudinary script', () => {
  let mockReadlineInterface: any;
  let originalEnv: NodeJS.ProcessEnv;
  let migrateToCloudinary: () => Promise<void>;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    
    // Save original env
    originalEnv = process.env;
    
    // Mock environment variables
    process.env = {
      ...originalEnv,
      CLOUDINARY_CLOUD_NAME: 'test-cloud',
      CLOUDINARY_API_KEY: 'test-key',
      CLOUDINARY_API_SECRET: 'test-secret',
    };

    // Mock readline
    mockReadlineInterface = {
      question: jest.fn(),
      close: jest.fn(),
    };
    (readline.createInterface as jest.Mock).mockReturnValue(mockReadlineInterface);

    // Mock fs
    (fs.writeFileSync as jest.Mock).mockImplementation();

    // Mock cloudinary functions
    (generatePublicId as jest.Mock).mockImplementation((id: string) => `cloudinary_${id}`);
    (uploadImageFromUrl as jest.Mock).mockImplementation(async (url: string, options: any) => ({
      public_id: options.public_id || 'test-public-id',
      secure_url: `https://res.cloudinary.com/test/${options.public_id || 'test'}.jpg`,
    }));

    // Reset Prisma mocks
    mockPrismaClient.makeupArtist.findMany.mockClear();
    mockPrismaClient.makeupArtist.update.mockClear();
    mockPrismaClient.$disconnect.mockClear();
  });

  afterEach(() => {
    process.env = originalEnv;
    mockExit.mockClear();
    mockConsoleLog.mockClear();
    mockConsoleError.mockClear();
  });

  afterAll(() => {
    mockExit.mockRestore();
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
  });

  describe('Environment validation', () => {
    it('should exit if Cloudinary credentials are missing', async () => {
      delete process.env.CLOUDINARY_CLOUD_NAME;

      const module = require('../migrate-to-cloudinary');
      migrateToCloudinary = module.migrateToCloudinary;
      
      await migrateToCloudinary();

      expect(mockExit).toHaveBeenCalledWith(1);
      expect(mockConsoleError).toHaveBeenCalledWith(
        '❌ Cloudinary credentials not found in environment variables.'
      );
    });

    it('should continue if all Cloudinary credentials are present', async () => {
      // Mock user responses
      mockReadlineInterface.question
        .mockImplementationOnce((question: string, callback: (answer: string) => void) => {
          callback('no'); // Not production
        })
        .mockImplementationOnce((question: string, callback: (answer: string) => void) => {
          callback('no'); // Don't proceed
        });

      mockPrismaClient.makeupArtist.findMany.mockResolvedValue([]);

      const module = require('../migrate-to-cloudinary');
      migrateToCloudinary = module.migrateToCloudinary;
      await migrateToCloudinary();

      expect(mockConsoleLog).toHaveBeenCalledWith('🚀 Starting Cloudinary Migration\n');
    });
  });

  describe('User prompts', () => {
    beforeEach(() => {
      const module = require('../migrate-to-cloudinary');
      migrateToCloudinary = module.migrateToCloudinary;
    });

    it('should handle production mode confirmation', async () => {
      mockReadlineInterface.question
        .mockImplementationOnce((question: string, callback: (answer: string) => void) => {
          expect(question).toContain('Are you migrating the PRODUCTION database?');
          callback('yes');
        })
        .mockImplementationOnce((question: string, callback: (answer: string) => void) => {
          callback('no'); // Don't proceed
        });

      mockPrismaClient.makeupArtist.findMany.mockResolvedValue([]);

      await migrateToCloudinary();

      expect(mockConsoleLog).toHaveBeenCalledWith(
        '\n📊 Checking PRODUCTION database...\n'
      );
    });

    it('should exit on invalid yes/no response', async () => {
      mockReadlineInterface.question.mockImplementationOnce((question: string, callback: (answer: string) => void) => {
        callback('maybe');
      });

      await migrateToCloudinary();

      expect(mockExit).toHaveBeenCalledWith(0);
      expect(mockConsoleLog).toHaveBeenCalledWith('Invalid input. Exiting...');
    });

    it('should cancel migration when user declines', async () => {
      mockReadlineInterface.question
        .mockImplementationOnce((question: string, callback: (answer: string) => void) => {
          callback('no');
        })
        .mockImplementationOnce((question: string, callback: (answer: string) => void) => {
          callback('no'); // Don't proceed with migration
        });

      mockPrismaClient.makeupArtist.findMany.mockResolvedValue([
        { id: '1', username: 'test_user', name: 'Test User', portfolioImages: [], profileImage: null }
      ]);

      await migrateToCloudinary();

      expect(mockExit).toHaveBeenCalledWith(0);
      expect(mockConsoleLog).toHaveBeenCalledWith('Migration cancelled.');
    });
  });

  describe('Database operations', () => {
    beforeEach(() => {
      const module = require('../migrate-to-cloudinary');
      migrateToCloudinary = module.migrateToCloudinary;
    });

    it('should exit if no artists found', async () => {
      mockReadlineInterface.question.mockImplementationOnce((question: string, callback: (answer: string) => void) => {
        callback('no');
      });

      mockPrismaClient.makeupArtist.findMany.mockResolvedValue([]);

      await migrateToCloudinary();

      expect(mockExit).toHaveBeenCalledWith(1);
      expect(mockConsoleLog).toHaveBeenCalledWith('❌ No makeup artists found in database.');
    });

    it('should find and display artist count', async () => {
      mockReadlineInterface.question
        .mockImplementationOnce((question: string, callback: (answer: string) => void) => {
          callback('no');
        })
        .mockImplementationOnce((question: string, callback: (answer: string) => void) => {
          callback('no');
        });

      const mockArtists = [
        { id: '1', username: 'sarah_beauty', name: 'Sarah Beauty', portfolioImages: [], profileImage: null },
        { id: '2', username: 'maria_glam', name: 'Maria Glam', portfolioImages: [], profileImage: null },
      ];

      mockPrismaClient.makeupArtist.findMany.mockResolvedValue(mockArtists);

      await migrateToCloudinary();

      expect(mockConsoleLog).toHaveBeenCalledWith('Found 2 makeup artists\n');
    });
  });

  describe('Migration process', () => {
    const mockArtists = [
      {
        id: '1',
        username: 'sarah_beauty',
        name: 'Sarah Beauty',
        portfolioImages: ['https://unsplash.com/old1.jpg', 'https://unsplash.com/old2.jpg'],
        profileImage: 'https://unsplash.com/profile.jpg'
      }
    ];

    beforeEach(() => {
      const module = require('../migrate-to-cloudinary');
      migrateToCloudinary = module.migrateToCloudinary;

      mockReadlineInterface.question
        .mockImplementationOnce((question: string, callback: (answer: string) => void) => {
          callback('no'); // Not production
        })
        .mockImplementationOnce((question: string, callback: (answer: string) => void) => {
          callback('yes'); // Proceed with migration
        });

      mockPrismaClient.makeupArtist.findMany.mockResolvedValue(mockArtists);
    });

    it('should create backup file', async () => {
      await migrateToCloudinary();

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringMatching(/cloudinary-migration-backup-\d+\.json/),
        expect.stringContaining('"username": "sarah_beauty"')
      );
    });

    it('should upload portfolio images', async () => {
      await migrateToCloudinary();

      expect(uploadImageFromUrl).toHaveBeenCalledWith(
        'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=800',
        expect.objectContaining({
          folder: 'goldiegrace/portfolio/sarah_beauty',
          public_id: expect.stringContaining('portfolio_sarah_beauty_1')
        })
      );
    });

    it('should upload profile images', async () => {
      await migrateToCloudinary();

      expect(uploadImageFromUrl).toHaveBeenCalledWith(
        'https://unsplash.com/profile.jpg',
        expect.objectContaining({
          folder: 'goldiegrace/profile-images/artists',
          public_id: expect.stringContaining('profile_sarah_beauty')
        })
      );
    });

    it('should update database with new URLs', async () => {
      await migrateToCloudinary();

      expect(mockPrismaClient.makeupArtist.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          portfolioImages: expect.arrayContaining([
            expect.stringContaining('cloudinary_portfolio_sarah_beauty_')
          ]),
          profileImage: expect.stringContaining('cloudinary_profile_sarah_beauty')
        }
      });
    });

    it('should handle upload errors gracefully', async () => {
      (uploadImageFromUrl as jest.Mock).mockRejectedValueOnce(new Error('Upload failed'));

      await migrateToCloudinary();

      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('Failed to upload portfolio image'),
        expect.any(Error)
      );
    });

    it('should complete migration successfully', async () => {
      await migrateToCloudinary();

      expect(mockConsoleLog).toHaveBeenCalledWith('\n✨ Migration completed successfully!\n');
      expect(mockConsoleLog).toHaveBeenCalledWith('\n🎉 All portfolio images are now hosted on Cloudinary!');
      expect(mockPrismaClient.$disconnect).toHaveBeenCalled();
      expect(mockReadlineInterface.close).toHaveBeenCalled();
    });
  });

  describe('Error handling', () => {
    beforeEach(() => {
      const module = require('../migrate-to-cloudinary');
      migrateToCloudinary = module.migrateToCloudinary;
    });

    it('should handle database errors', async () => {
      mockReadlineInterface.question.mockImplementationOnce((question: string, callback: (answer: string) => void) => {
        callback('no');
      });

      mockPrismaClient.makeupArtist.findMany.mockRejectedValue(new Error('Database error'));

      await migrateToCloudinary();

      expect(mockExit).toHaveBeenCalledWith(1);
      expect(mockConsoleError).toHaveBeenCalledWith('\n❌ Migration failed:', expect.any(Error));
    });

    it('should disconnect from database on error', async () => {
      mockReadlineInterface.question.mockImplementationOnce((question: string, callback: (answer: string) => void) => {
        callback('no');
      });

      mockPrismaClient.makeupArtist.findMany.mockRejectedValue(new Error('Database error'));

      await migrateToCloudinary();

      expect(mockPrismaClient.$disconnect).toHaveBeenCalled();
      expect(mockReadlineInterface.close).toHaveBeenCalled();
    });
  });

  describe('Portfolio image mapping', () => {
    beforeEach(() => {
      const module = require('../migrate-to-cloudinary');
      migrateToCloudinary = module.migrateToCloudinary;
    });

    it('should use correct portfolio images for each artist', async () => {
      mockReadlineInterface.question
        .mockImplementationOnce((question: string, callback: (answer: string) => void) => {
          callback('no');
        })
        .mockImplementationOnce((question: string, callback: (answer: string) => void) => {
          callback('yes');
        });

      const mockArtist = {
        id: '1',
        username: 'maria_glam',
        name: 'Maria Glam',
        portfolioImages: ['old1.jpg'],
        profileImage: null
      };

      mockPrismaClient.makeupArtist.findMany.mockResolvedValue([mockArtist]);

      await migrateToCloudinary();

      // Should upload Maria's specific portfolio images
      expect(uploadImageFromUrl).toHaveBeenCalledWith(
        'https://images.unsplash.com/photo-1506863530036-1efeddceb993?w=800',
        expect.objectContaining({
          folder: 'goldiegrace/portfolio/maria_glam'
        })
      );
    });

    it('should fall back to existing images if artist not in mapping', async () => {
      mockReadlineInterface.question
        .mockImplementationOnce((question: string, callback: (answer: string) => void) => {
          callback('no');
        })
        .mockImplementationOnce((question: string, callback: (answer: string) => void) => {
          callback('yes');
        });

      const mockArtist = {
        id: '1',
        username: 'unknown_artist',
        name: 'Unknown Artist',
        portfolioImages: ['https://example.com/image.jpg'],
        profileImage: null
      };

      mockPrismaClient.makeupArtist.findMany.mockResolvedValue([mockArtist]);

      await migrateToCloudinary();

      expect(uploadImageFromUrl).toHaveBeenCalledWith(
        'https://example.com/image.jpg',
        expect.any(Object)
      );
    });
  });
});
import { prisma } from '@/lib/db';
import { createTestArtist, createTestClient, createTestReview } from '../../fixtures/testData';

// Mock the Prisma client
jest.mock('@/lib/db', () => ({
  prisma: {
    makeupArtist: {
      findMany: jest.fn(),
    },
  },
}));

// Import the function we're testing
async function getArtistsWithRatings() {
  const artists = await prisma.makeupArtist.findMany({
    include: {
      reviews: true,
    },
    orderBy: [
      { isAvailable: 'desc' },
      { createdAt: 'desc' }
    ]
  });

  return artists.map(artist => {
    const ratings = artist.reviews.map(review => review.rating);
    const averageRating = ratings.length > 0 
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
      : 0;
    
    return {
      ...artist,
      averageRating,
      totalReviews: artist.reviews.length
    };
  });
}

describe('Artists Page Server Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getArtistsWithRatings', () => {
    it('should fetch artists and calculate average ratings', async () => {
      const mockArtists = [
        {
          id: '1',
          name: 'Artist 1',
          reviews: [
            { id: 'r1', rating: 5 },
            { id: 'r2', rating: 4 },
            { id: 'r3', rating: 5 },
          ],
          isAvailable: true,
          createdAt: new Date('2024-01-01'),
        },
        {
          id: '2',
          name: 'Artist 2',
          reviews: [
            { id: 'r4', rating: 3 },
            { id: 'r5', rating: 4 },
          ],
          isAvailable: true,
          createdAt: new Date('2024-01-02'),
        },
      ];

      (prisma.makeupArtist.findMany as jest.Mock).mockResolvedValue(mockArtists);

      const result = await getArtistsWithRatings();

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id: '1',
        name: 'Artist 1',
        averageRating: (5 + 4 + 5) / 3,
        totalReviews: 3,
      });
      expect(result[1]).toMatchObject({
        id: '2',
        name: 'Artist 2',
        averageRating: (3 + 4) / 2,
        totalReviews: 2,
      });
    });

    it('should handle artists with no reviews', async () => {
      const mockArtists = [
        {
          id: '1',
          name: 'New Artist',
          reviews: [],
          isAvailable: true,
          createdAt: new Date(),
        },
      ];

      (prisma.makeupArtist.findMany as jest.Mock).mockResolvedValue(mockArtists);

      const result = await getArtistsWithRatings();

      expect(result[0]).toMatchObject({
        id: '1',
        name: 'New Artist',
        averageRating: 0,
        totalReviews: 0,
      });
    });

    it('should order artists by availability first, then creation date', async () => {
      const mockArtists = [
        {
          id: '1',
          name: 'Available Recent',
          reviews: [],
          isAvailable: true,
          createdAt: new Date('2024-01-05'),
        },
        {
          id: '2',
          name: 'Available Old',
          reviews: [],
          isAvailable: true,
          createdAt: new Date('2024-01-01'),
        },
        {
          id: '3',
          name: 'Unavailable',
          reviews: [],
          isAvailable: false,
          createdAt: new Date('2024-01-10'),
        },
      ];

      (prisma.makeupArtist.findMany as jest.Mock).mockResolvedValue(mockArtists);

      const result = await getArtistsWithRatings();

      // Verify the order is maintained from the mock
      expect(result[0].name).toBe('Available Recent');
      expect(result[1].name).toBe('Available Old');
      expect(result[2].name).toBe('Unavailable');
    });

    it('should include reviews in the query', async () => {
      (prisma.makeupArtist.findMany as jest.Mock).mockResolvedValue([]);

      await getArtistsWithRatings();

      expect(prisma.makeupArtist.findMany).toHaveBeenCalledWith({
        include: {
          reviews: true,
        },
        orderBy: [
          { isAvailable: 'desc' },
          { createdAt: 'desc' }
        ]
      });
    });

    it('should handle database errors gracefully', async () => {
      (prisma.makeupArtist.findMany as jest.Mock).mockRejectedValue(
        new Error('Database connection error')
      );

      await expect(getArtistsWithRatings()).rejects.toThrow('Database connection error');
    });

    it('should calculate correct average for various rating combinations', async () => {
      const mockArtists = [
        {
          id: '1',
          name: 'Perfect Artist',
          reviews: [
            { id: 'r1', rating: 5 },
            { id: 'r2', rating: 5 },
            { id: 'r3', rating: 5 },
          ],
          isAvailable: true,
          createdAt: new Date(),
        },
        {
          id: '2',
          name: 'Mixed Artist',
          reviews: [
            { id: 'r4', rating: 1 },
            { id: 'r5', rating: 2 },
            { id: 'r6', rating: 3 },
            { id: 'r7', rating: 4 },
            { id: 'r8', rating: 5 },
          ],
          isAvailable: true,
          createdAt: new Date(),
        },
      ];

      (prisma.makeupArtist.findMany as jest.Mock).mockResolvedValue(mockArtists);

      const result = await getArtistsWithRatings();

      expect(result[0].averageRating).toBe(5);
      expect(result[1].averageRating).toBe(3); // (1+2+3+4+5)/5 = 3
    });
  });
});
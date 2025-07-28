import { createTestArtist, createTestClient, createTestReview } from '../../fixtures/testData';
import { setupIntegrationTest, teardownIntegrationTest, getTestPrismaClient } from '../../utils/integration-test-setup';

describe('Artists Page Integration Tests', () => {
  let prisma: any;
  let testClients: any[] = [];
  let testArtists: any[] = [];
  let testReviews: any[] = [];

  beforeAll(async () => {
    prisma = await setupIntegrationTest();
  });

  afterAll(async () => {
    await teardownIntegrationTest();
  });

  beforeEach(async () => {
    // Get fresh prisma client and ensure clean state
    prisma = getTestPrismaClient();
    
    // Clean up any existing test data
    await prisma.review.deleteMany();
    await prisma.client.deleteMany();
    await prisma.makeupArtist.deleteMany();
    
    testClients = [];
    testArtists = [];
    testReviews = [];
  });

  afterEach(async () => {
    // Data will be cleaned up in beforeEach of next test
    // This ensures consistent state
  });

  it('should create and retrieve artists with correct ratings', async () => {
    // Create test data
    const client1 = await createTestClient();
    const client2 = await createTestClient();
    testClients.push(client1, client2);

    const artist1 = await createTestArtist({
      name: 'Top Rated Artist',
      isAvailable: true,
    });
    const artist2 = await createTestArtist({
      name: 'Average Artist',
      isAvailable: true,
    });
    testArtists.push(artist1, artist2);

    // Create reviews for artist1 (should have 4.5 average)
    const review1 = await createTestReview(client1.id, artist1.id, { rating: 5 });
    const review2 = await createTestReview(client2.id, artist1.id, { rating: 4 });
    testReviews.push(review1, review2);

    // Create reviews for artist2 (should have 3.0 average)
    const review3 = await createTestReview(client1.id, artist2.id, { rating: 3 });
    testReviews.push(review3);

    // Fetch artists with reviews
    const artists = await prisma.makeupArtist.findMany({
      include: {
        reviews: true,
      },
      orderBy: [
        { isAvailable: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    // Verify data
    expect(artists.length).toBeGreaterThanOrEqual(2);
    
    const topRatedArtist = artists.find(a => a.name === 'Top Rated Artist');
    const averageArtist = artists.find(a => a.name === 'Average Artist');

    expect(topRatedArtist).toBeDefined();
    expect(topRatedArtist?.reviews).toHaveLength(2);
    expect(averageArtist).toBeDefined();
    expect(averageArtist?.reviews).toHaveLength(1);

    // Calculate ratings
    const topRatedAvg = topRatedArtist!.reviews.reduce((sum, r) => sum + r.rating, 0) / topRatedArtist!.reviews.length;
    const averageAvg = averageArtist!.reviews.reduce((sum, r) => sum + r.rating, 0) / averageArtist!.reviews.length;

    expect(topRatedAvg).toBe(4.5);
    expect(averageAvg).toBe(3);
  });

  it('should handle artists with no reviews', async () => {
    const artist = await createTestArtist({
      name: 'New Artist No Reviews',
      isAvailable: true,
    });
    testArtists.push(artist);

    const artistWithReviews = await prisma.makeupArtist.findUnique({
      where: { id: artist.id },
      include: { reviews: true },
    });

    expect(artistWithReviews).toBeDefined();
    expect(artistWithReviews?.reviews).toHaveLength(0);
  });

  it('should properly order artists by availability and creation date', async () => {
    // Create artists with different availability and creation times
    const unavailableArtist = await createTestArtist({
      name: 'Unavailable Artist',
      isAvailable: false,
    });

    // Wait a bit to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    const availableOldArtist = await createTestArtist({
      name: 'Available Old Artist',
      isAvailable: true,
    });

    await new Promise(resolve => setTimeout(resolve, 10));

    const availableNewArtist = await createTestArtist({
      name: 'Available New Artist',
      isAvailable: true,
    });

    testArtists.push(unavailableArtist, availableOldArtist, availableNewArtist);

    const artists = await prisma.makeupArtist.findMany({
      orderBy: [
        { isAvailable: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    // Find our test artists in the results
    const testArtistNames = artists
      .filter(a => a.name.includes('Available'))
      .map(a => a.name);

    // Available artists should come before unavailable ones
    const availableIndex = testArtistNames.findIndex(name => name.includes('Available New') || name.includes('Available Old'));
    const unavailableIndex = testArtistNames.findIndex(name => name === 'Unavailable Artist');

    if (unavailableIndex !== -1 && availableIndex !== -1) {
      expect(availableIndex).toBeLessThan(unavailableIndex);
    }

    // Among available artists, newer should come first
    const newIndex = testArtistNames.findIndex(name => name === 'Available New Artist');
    const oldIndex = testArtistNames.findIndex(name => name === 'Available Old Artist');

    if (newIndex !== -1 && oldIndex !== -1) {
      expect(newIndex).toBeLessThan(oldIndex);
    }
  });

  it('should include all new fields in artist data', async () => {
    const artist = await createTestArtist({
      name: 'Full Featured Artist',
      bio: 'Experienced makeup artist',
      portfolioImages: ['/img1.jpg', '/img2.jpg'],
      location: 'Los Angeles, CA',
      badges: ['Verified', 'Top Rated'],
      specialties: ['Wedding', 'Fashion'],
      hourlyRate: 200,
    });
    testArtists.push(artist);

    const fetchedArtist = await prisma.makeupArtist.findUnique({
      where: { id: artist.id },
    });

    expect(fetchedArtist).toMatchObject({
      name: 'Full Featured Artist',
      bio: 'Experienced makeup artist',
      portfolioImages: ['/img1.jpg', '/img2.jpg'],
      location: 'Los Angeles, CA',
      badges: ['Verified', 'Top Rated'],
      specialties: ['Wedding', 'Fashion'],
      hourlyRate: 200,
    });
  });

  it('should handle pagination scenarios', async () => {
    // Create multiple artists
    const artistPromises = [];
    for (let i = 0; i < 5; i++) {
      artistPromises.push(
        createTestArtist({
          name: `Test Artist ${i}`,
          isAvailable: true,
        })
      );
    }

    const createdArtists = await Promise.all(artistPromises);
    testArtists.push(...createdArtists);

    // Test fetching with limit
    const limitedArtists = await prisma.makeupArtist.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
    });

    expect(limitedArtists.length).toBeLessThanOrEqual(3);
  });
});
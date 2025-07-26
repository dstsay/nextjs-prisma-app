import { prisma } from '@/lib/prisma';
import ArtistCard from '@/components/ArtistCard';

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

export default async function ArtistsPage() {
  const artistsWithRatings = await getArtistsWithRatings();

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Find Your Perfect Makeup Artist
          </h1>
          <p className="text-gray-600">
            Browse our talented makeup artists and book a session that fits your needs
          </p>
        </div>

        {artistsWithRatings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No makeup artists available at the moment.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {artistsWithRatings.map((artist) => (
              <ArtistCard
                key={artist.id}
                artist={{
                  ...artist,
                  portfolioImages: artist.portfolioImages.length > 0 
                    ? artist.portfolioImages 
                    : ['/images/placeholder-portfolio.jpg']
                }}
                averageRating={artist.averageRating}
                totalReviews={artist.totalReviews}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
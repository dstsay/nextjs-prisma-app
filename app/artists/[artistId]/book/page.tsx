import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { BookingCalendar } from '../../../../components/booking/BookingCalendar';
import { ArtistBookingProfile } from '../../../../components/booking/ArtistBookingProfile';

export default async function BookingPage({ params }: { params: Promise<{ artistId: string }> }) {
  const { artistId } = await params;
  const artist = await prisma.makeupArtist.findUnique({
    where: { id: artistId },
    include: {
      reviews: true
    }
  });

  if (!artist || !artist.isAvailable) {
    notFound();
  }

  const ratings = artist.reviews.map(review => review.rating);
  const averageRating = ratings.length > 0 
    ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          <div className="lg:col-span-1 flex">
            <ArtistBookingProfile 
              artist={artist}
              averageRating={averageRating}
              totalReviews={artist.reviews.length}
            />
          </div>
          
          <div className="lg:col-span-2 flex">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full">
              <h2 className="text-2xl font-bold mb-6">Select a Date & Time</h2>
              <BookingCalendar artistId={artist.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
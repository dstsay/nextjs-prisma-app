import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAvailableSlots, AvailabilityData } from '../../../../../lib/availability-utils';
import { startOfDay } from '../../../../../lib/date-utils';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ artistId: string }> }
) {
  const params = await context.params;
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');

    if (!dateParam) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      );
    }

    const date = new Date(dateParam);
    if (isNaN(date.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    // Check if the date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const requestedDate = new Date(date);
    requestedDate.setHours(0, 0, 0, 0);
    
    if (requestedDate < today) {
      return NextResponse.json({
        date: date.toISOString(),
        availableSlots: [],
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      });
    }

    const artist = await prisma.makeupArtist.findUnique({
      where: { id: params.artistId },
      select: { id: true }
    });

    if (!artist) {
      return NextResponse.json(
        { error: 'Artist not found' },
        { status: 404 }
      );
    }

    const [regularSchedule, exceptions, appointments] = await Promise.all([
      prisma.availability.findMany({
        where: { artistId: params.artistId }
      }),
      prisma.availabilityException.findMany({
        where: {
          artistId: params.artistId,
          date: startOfDay(date)
        }
      }),
      prisma.appointment.findMany({
        where: {
          artistId: params.artistId,
          scheduledAt: {
            gte: startOfDay(date),
            lt: new Date(startOfDay(date).getTime() + 24 * 60 * 60 * 1000)
          }
        }
      })
    ]);

    const availabilityData: AvailabilityData = {
      regularSchedule,
      exceptions,
      appointments
    };

    const availableSlots = getAvailableSlots(date, availabilityData);

    return NextResponse.json({
      date: date.toISOString(),
      availableSlots,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
  } catch (error) {
    console.error('Error fetching availability:', error);
    return NextResponse.json(
      { error: 'Failed to fetch availability' },
      { status: 500 }
    );
  }
}
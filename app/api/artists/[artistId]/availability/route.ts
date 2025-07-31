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
    const clientTimezone = searchParams.get('timezone') || 'UTC';

    if (!dateParam) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      );
    }

    // Parse date as local date (not UTC)
    const [year, month, day] = dateParam.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed
    
    if (isNaN(date.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }
    
    // DEBUG: Log date parsing
    console.log('[availability API] Date param:', dateParam);
    console.log('[availability API] Parsed date components:', { year, month, day });
    console.log('[availability API] Parsed date:', date.toISOString());
    console.log('[availability API] Local date string:', date.toDateString());


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

    const availableSlots = getAvailableSlots(date, availabilityData, clientTimezone);

    return NextResponse.json({
      date: date.toISOString(),
      availableSlots,
      timezone: clientTimezone
    });
  } catch (error) {
    console.error('Error fetching availability:', error);
    return NextResponse.json(
      { error: 'Failed to fetch availability' },
      { status: 500 }
    );
  }
}
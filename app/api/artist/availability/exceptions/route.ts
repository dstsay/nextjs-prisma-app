import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { validateTimeFormat, validateTimeRange } from '../../../../../lib/booking-validation';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.userType || session.user.userType !== 'artist') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const artist = await prisma.makeupArtist.findUnique({
      where: { id: session.user.id },
      select: { id: true }
    });

    if (!artist) {
      return NextResponse.json({ error: 'Artist not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const whereClause: any = { artistId: artist.id };
    
    if (startDate && endDate) {
      whereClause.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const exceptions = await prisma.availabilityException.findMany({
      where: whereClause,
      orderBy: { date: 'asc' }
    });

    return NextResponse.json(exceptions);
  } catch (error) {
    console.error('Error fetching exceptions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exceptions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.userType || session.user.userType !== 'artist') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const artist = await prisma.makeupArtist.findUnique({
      where: { id: session.user.id },
      select: { id: true }
    });

    if (!artist) {
      return NextResponse.json({ error: 'Artist not found' }, { status: 404 });
    }

    const body = await request.json();
    const { date, type, startTime, endTime, reason } = body;

    if (!date || !type) {
      return NextResponse.json(
        { error: 'Date and type are required' },
        { status: 400 }
      );
    }

    if (type !== 'UNAVAILABLE' && type !== 'CUSTOM_HOURS') {
      return NextResponse.json(
        { error: 'Invalid exception type' },
        { status: 400 }
      );
    }

    if (type === 'CUSTOM_HOURS') {
      if (!startTime || !endTime) {
        return NextResponse.json(
          { error: 'Start and end times required for custom hours' },
          { status: 400 }
        );
      }
      if (!validateTimeFormat(startTime) || !validateTimeFormat(endTime)) {
        return NextResponse.json(
          { error: 'Invalid time format' },
          { status: 400 }
        );
      }
      if (!validateTimeRange(startTime, endTime)) {
        return NextResponse.json(
          { error: 'End time must be after start time' },
          { status: 400 }
        );
      }
    }

    const existingException = await prisma.availabilityException.findFirst({
      where: {
        artistId: artist.id,
        date: new Date(date)
      }
    });

    if (existingException) {
      const updated = await prisma.availabilityException.update({
        where: { id: existingException.id },
        data: {
          type,
          startTime: type === 'CUSTOM_HOURS' ? startTime : null,
          endTime: type === 'CUSTOM_HOURS' ? endTime : null,
          reason
        }
      });
      return NextResponse.json(updated);
    }

    const exception = await prisma.availabilityException.create({
      data: {
        artistId: artist.id,
        date: new Date(date),
        type,
        startTime: type === 'CUSTOM_HOURS' ? startTime : null,
        endTime: type === 'CUSTOM_HOURS' ? endTime : null,
        reason
      }
    });

    return NextResponse.json(exception);
  } catch (error) {
    console.error('Error creating exception:', error);
    return NextResponse.json(
      { error: 'Failed to create exception' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.userType || session.user.userType !== 'artist') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const artist = await prisma.makeupArtist.findUnique({
      where: { id: session.user.id },
      select: { id: true }
    });

    if (!artist) {
      return NextResponse.json({ error: 'Artist not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Exception ID required' },
        { status: 400 }
      );
    }

    const exception = await prisma.availabilityException.findFirst({
      where: { id, artistId: artist.id }
    });

    if (!exception) {
      return NextResponse.json(
        { error: 'Exception not found' },
        { status: 404 }
      );
    }

    await prisma.availabilityException.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting exception:', error);
    return NextResponse.json(
      { error: 'Failed to delete exception' },
      { status: 500 }
    );
  }
}
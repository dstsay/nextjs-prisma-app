import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { validateCSRFToken } from '@/lib/csrf';
import { availabilityScheduleSchema, availabilityUpdateSchema } from '@/lib/validations/availability';
import { z } from 'zod';

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

    const availability = await prisma.availability.findMany({
      where: { artistId: artist.id },
      orderBy: { dayOfWeek: 'asc' }
    });

    return NextResponse.json(availability);
  } catch (error) {
    console.error('Error fetching availability:', error);
    return NextResponse.json(
      { error: 'Failed to fetch availability' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const isValidCSRF = await validateCSRFToken(request);
    if (!isValidCSRF) {
      return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
    }

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
    
    let validatedData;
    try {
      validatedData = availabilityScheduleSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Validation error', details: error.flatten() },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    const { schedule } = validatedData;

    await prisma.availability.deleteMany({
      where: { artistId: artist.id }
    });

    const newAvailability = await prisma.availability.createMany({
      data: schedule.map(slot => ({
        artistId: artist.id,
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isActive: slot.isActive ?? true
      }))
    });

    const updatedAvailability = await prisma.availability.findMany({
      where: { artistId: artist.id },
      orderBy: { dayOfWeek: 'asc' }
    });

    return NextResponse.json(updatedAvailability);
  } catch (error) {
    console.error('Error saving availability:', error);
    return NextResponse.json(
      { error: 'Failed to save availability' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const isValidCSRF = await validateCSRFToken(request);
    if (!isValidCSRF) {
      return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
    }

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
    
    let validatedData;
    try {
      validatedData = availabilityUpdateSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Validation error', details: error.flatten() },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    const { id, ...updateData } = validatedData;

    const availability = await prisma.availability.findFirst({
      where: { id, artistId: artist.id }
    });

    if (!availability) {
      return NextResponse.json(
        { error: 'Availability not found' },
        { status: 404 }
      );
    }

    const updated = await prisma.availability.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating availability:', error);
    return NextResponse.json(
      { error: 'Failed to update availability' },
      { status: 500 }
    );
  }
}
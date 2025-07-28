import { AppointmentStatus } from '@prisma/client';
import { createTestClient, createTestArtist } from '../../fixtures/testData';
import { setupIntegrationTest, teardownIntegrationTest, getTestPrismaClient } from '../../utils/integration-test-setup';

describe('Booking Workflow Integration', () => {
  let prisma: any;

  beforeAll(async () => {
    prisma = await setupIntegrationTest();
  });

  afterAll(async () => {
    await teardownIntegrationTest();
  });

  beforeEach(async () => {
    // Get fresh prisma client and ensure clean state
    prisma = getTestPrismaClient();
    // Delete in correct order to avoid foreign key constraints
    await prisma.consultation.deleteMany();
    await prisma.appointment.deleteMany();
    await prisma.availability.deleteMany();
    await prisma.review.deleteMany();
    await prisma.quizResponse.deleteMany();
    await prisma.quiz.deleteMany();
    await prisma.client.deleteMany();
    await prisma.makeupArtist.deleteMany();
  });

  it('should complete full booking workflow from start to finish', async () => {
    // 1. Create artist and client
    const artist = await createTestArtist({
      name: 'Sarah Johnson',
      specialties: ['Bridal', 'Natural'],
      hourlyRate: 150,
    });
    
    const client = await createTestClient({
      name: 'Jane Doe',
      email: 'jane@example.com',
    });

    expect(artist).toBeDefined();
    expect(artist.id).toBeDefined();
    expect(client).toBeDefined();
    expect(client.id).toBeDefined();

    // 2. Set up artist availability
    const availability = await prisma.availability.create({
      data: {
        artistId: artist.id,
        dayOfWeek: 1, // Monday
        startTime: '09:00',
        endTime: '17:00',
      },
    });

    expect(availability.artistId).toBe(artist.id);

    // 3. Create appointment (booking)
    const appointmentDate = new Date('2024-12-30T10:00:00Z'); // Monday
    const appointment = await prisma.appointment.create({
      data: {
        clientId: client.id,
        artistId: artist.id,
        scheduledAt: appointmentDate,
        duration: 60,
        status: AppointmentStatus.PENDING,
        notes: 'First time client, looking for natural everyday look',
      },
    });

    expect(appointment.status).toBe(AppointmentStatus.PENDING);
    expect(appointment.duration).toBe(60);

    // 4. Confirm appointment
    const confirmedAppointment = await prisma.appointment.update({
      where: { id: appointment.id },
      data: { status: AppointmentStatus.CONFIRMED },
    });

    expect(confirmedAppointment.status).toBe(AppointmentStatus.CONFIRMED);

    // 5. Create consultation session
    const consultation = await prisma.consultation.create({
      data: {
        appointmentId: appointment.id,
        clientId: client.id,
        artistId: artist.id,
        videoRoomUrl: 'https://video.goldiegrace.com/room/abc123',
        notes: 'Initial consultation notes',
      },
    });

    expect(consultation.appointmentId).toBe(appointment.id);
    expect(consultation.videoRoomUrl).toBe('https://video.goldiegrace.com/room/abc123');

    // 6. Start consultation
    const consultationStartTime = new Date('2024-12-30T10:00:00Z');
    const startedConsultation = await prisma.consultation.update({
      where: { id: consultation.id },
      data: {
        startedAt: consultationStartTime,
      },
    });

    expect(startedConsultation.startedAt).toEqual(consultationStartTime);

    // 7. Update appointment status to in progress
    await prisma.appointment.update({
      where: { id: appointment.id },
      data: { status: AppointmentStatus.IN_PROGRESS },
    });

    // 8. Complete consultation with recommendations
    const consultationEndTime = new Date('2024-12-30T11:00:00Z');
    const completedConsultation = await prisma.consultation.update({
      where: { id: consultation.id },
      data: {
        endedAt: consultationEndTime,
        notes: 'Client has hooded eyes, recommended neutral palette. Taught basic contouring techniques.',
        recommendations: {
          products: [
            'Urban Decay Naked Palette',
            'NARS Orgasm Blush',
            'Maybelline Fit Me Foundation'
          ],
          techniques: [
            'Eyeshadow blending for hooded eyes',
            'Natural contouring',
            'Color correction basics'
          ],
          nextSteps: 'Practice techniques learned today, follow up in 2 weeks'
        },
        followUpDate: new Date('2025-01-13T10:00:00Z'), // 2 weeks later
      },
    });

    expect(completedConsultation.endedAt).toEqual(consultationEndTime);
    expect(completedConsultation.recommendations).toBeDefined();
    expect((completedConsultation.recommendations as any).products).toHaveLength(3);

    // 9. Mark appointment as completed
    const completedAppointment = await prisma.appointment.update({
      where: { id: appointment.id },
      data: { status: AppointmentStatus.COMPLETED },
    });

    expect(completedAppointment.status).toBe(AppointmentStatus.COMPLETED);

    // 10. Client leaves a review
    const review = await prisma.review.create({
      data: {
        clientId: client.id,
        artistId: artist.id,
        rating: 5,
        comment: 'Sarah was fantastic! She really understood my needs and taught me so much. The techniques she showed me were perfect for my eye shape.',
      },
    });

    expect(review.rating).toBe(5);
    expect(review.comment).toContain('Sarah was fantastic');

    // 11. Verify the complete workflow by querying all related data
    const finalAppointment = await prisma.appointment.findUnique({
      where: { id: appointment.id },
      include: {
        client: true,
        artist: {
          include: {
            reviews: true,
            availability: true,
          },
        },
        consultation: true,
      },
    });

    // Verify all data is properly connected
    expect(finalAppointment).toBeDefined();
    expect(finalAppointment!.status).toBe(AppointmentStatus.COMPLETED);
    expect(finalAppointment!.client.name).toBe('Jane Doe');
    expect(finalAppointment!.artist.name).toBe('Sarah Johnson');
    expect(finalAppointment!.artist.reviews).toHaveLength(1);
    expect(finalAppointment!.artist.reviews[0].rating).toBe(5);
    expect(finalAppointment!.artist.availability).toHaveLength(1);
    expect(finalAppointment!.consultation).toBeDefined();
    expect(finalAppointment!.consultation!.startedAt).toBeDefined();
    expect(finalAppointment!.consultation!.endedAt).toBeDefined();

    // Verify consultation duration
    const duration = finalAppointment!.consultation!.endedAt!.getTime() - 
                    finalAppointment!.consultation!.startedAt!.getTime();
    expect(duration).toBe(60 * 60 * 1000); // 1 hour in milliseconds
  });

  it('should handle appointment cancellation workflow', async () => {
    const client = await createTestClient();
    const artist = await createTestArtist();

    // Create confirmed appointment
    const appointment = await prisma.appointment.create({
      data: {
        clientId: client.id,
        artistId: artist.id,
        scheduledAt: new Date('2024-12-25T10:00:00Z'),
        status: AppointmentStatus.CONFIRMED,
        duration: 60,
      },
    });

    // Cancel appointment with reason
    const cancelledAppointment = await prisma.appointment.update({
      where: { id: appointment.id },
      data: {
        status: AppointmentStatus.CANCELLED,
        cancelReason: 'Client had a family emergency',
      },
    });

    expect(cancelledAppointment.status).toBe(AppointmentStatus.CANCELLED);
    expect(cancelledAppointment.cancelReason).toBe('Client had a family emergency');

    // Verify no consultation was created for cancelled appointment
    const consultation = await prisma.consultation.findUnique({
      where: { appointmentId: appointment.id },
    });

    expect(consultation).toBeNull();
  });

  it('should handle quiz completion before booking workflow', async () => {
    const client = await createTestClient();
    
    // Create and complete intake quiz
    const quiz = await prisma.quiz.create({
      data: {
        title: 'Client Intake',
        category: 'intake',
        questions: {
          create: [
            {
              questionText: 'What is your skin type?',
              questionType: 'MULTIPLE_CHOICE',
              order: 1,
              answerOptions: {
                create: [
                  { optionText: 'Dry', optionValue: 'dry', order: 1 },
                  { optionText: 'Oily', optionValue: 'oily', order: 2 },
                ],
              },
            },
            {
              questionText: 'Describe your goals',
              questionType: 'TEXT',
              order: 2,
            },
          ],
        },
      },
      include: { questions: { include: { answerOptions: true } } },
    });

    // Client completes quiz
    const quizResponse = await prisma.quizResponse.create({
      data: {
        clientId: client.id,
        quizId: quiz.id,
        completedAt: new Date(),
        answers: {
          create: [
            {
              questionId: quiz.questions[0].id,
              answerOptionId: quiz.questions[0].answerOptions[0].id, // Dry skin
            },
            {
              questionId: quiz.questions[1].id,
              textAnswer: 'I want to learn everyday makeup that looks natural but polished',
            },
          ],
        },
      },
      include: { answers: { include: { answerOption: true } } },
    });

    expect(quizResponse.completedAt).toBeDefined();
    expect(quizResponse.answers).toHaveLength(2);
    expect(quizResponse.answers[0].answerOption!.optionValue).toBe('dry');
    expect(quizResponse.answers[1].textAnswer).toContain('everyday makeup');

    // Now book appointment with an artist who specializes in natural looks
    const artist = await createTestArtist({
      specialties: ['Natural', 'Everyday'],
    });

    const appointment = await prisma.appointment.create({
      data: {
        clientId: client.id,
        artistId: artist.id,
        scheduledAt: new Date('2024-12-25T10:00:00Z'),
        notes: 'Client completed intake quiz - has dry skin, wants natural everyday look',
      },
    });

    // Verify client has both quiz responses and appointments
    const clientWithData = await prisma.client.findUnique({
      where: { id: client.id },
      include: {
        quizResponses: {
          include: { answers: { include: { answerOption: true } } },
        },
        appointments: {
          include: { artist: true },
        },
      },
    });

    expect(clientWithData!.quizResponses).toHaveLength(1);
    expect(clientWithData!.appointments).toHaveLength(1);
    expect(clientWithData!.appointments[0].artist.specialties).toContain('Natural');
  });
});
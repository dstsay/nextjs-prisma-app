import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting database seed...')

  // Clear existing data
  await prisma.$transaction([
    prisma.answer.deleteMany(),
    prisma.quizResponse.deleteMany(),
    prisma.answerOption.deleteMany(),
    prisma.question.deleteMany(),
    prisma.quiz.deleteMany(),
    prisma.consultation.deleteMany(),
    prisma.appointment.deleteMany(),
    prisma.review.deleteMany(),
    prisma.availability.deleteMany(),
    prisma.client.deleteMany(),
    prisma.makeupArtist.deleteMany(),
  ])

  // Create sample makeup artists
  const artist1 = await prisma.makeupArtist.create({
    data: {
      username: 'sarah_beauty',
      password: await bcrypt.hash('password123', 10),
      email: 'sarah@goldiegrace.com',
      name: 'Sarah Johnson',
      bio: 'Professional makeup artist with 10 years experience specializing in bridal and editorial looks.',
      specialties: ['Bridal', 'Editorial', 'Natural Glam'],
      yearsExperience: 10,
      hourlyRate: 150,
      profileImage: '/images/artists/sarah.jpg',
      availability: {
        create: [
          { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' }, // Monday
          { dayOfWeek: 2, startTime: '09:00', endTime: '17:00' }, // Tuesday
          { dayOfWeek: 3, startTime: '09:00', endTime: '17:00' }, // Wednesday
          { dayOfWeek: 4, startTime: '09:00', endTime: '17:00' }, // Thursday
          { dayOfWeek: 5, startTime: '09:00', endTime: '15:00' }, // Friday
        ]
      }
    }
  })

  const artist2 = await prisma.makeupArtist.create({
    data: {
      username: 'maria_glam',
      password: await bcrypt.hash('password123', 10),
      email: 'maria@goldiegrace.com',
      name: 'Maria Rodriguez',
      bio: 'Celebrity makeup artist known for glamorous red carpet looks and creative editorial work.',
      specialties: ['Glam', 'Red Carpet', 'Creative', 'Special Effects'],
      yearsExperience: 15,
      hourlyRate: 250,
      profileImage: '/images/artists/maria.jpg',
      availability: {
        create: [
          { dayOfWeek: 1, startTime: '10:00', endTime: '18:00' },
          { dayOfWeek: 3, startTime: '10:00', endTime: '18:00' },
          { dayOfWeek: 5, startTime: '10:00', endTime: '18:00' },
          { dayOfWeek: 6, startTime: '10:00', endTime: '16:00' }, // Saturday
        ]
      }
    }
  })

  // Create sample client
  const client1 = await prisma.client.create({
    data: {
      username: 'jane_doe',
      password: await bcrypt.hash('password123', 10),
      email: 'jane@example.com',
      name: 'Jane Doe',
      phone: '+1234567890',
      profileImage: '/images/clients/jane.jpg'
    }
  })

  // Create intake quiz
  const intakeQuiz = await prisma.quiz.create({
    data: {
      title: 'Beauty Profile Questionnaire',
      description: 'Help us understand your beauty preferences and needs',
      category: 'intake',
      order: 1,
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
                { optionText: 'Combination', optionValue: 'combination', order: 3 },
                { optionText: 'Normal', optionValue: 'normal', order: 4 },
                { optionText: 'Sensitive', optionValue: 'sensitive', order: 5 }
              ]
            }
          },
          {
            questionText: 'What is your preferred makeup style?',
            questionType: 'MULTIPLE_CHOICE',
            order: 2,
            answerOptions: {
              create: [
                { 
                  optionText: 'Natural/No-Makeup', 
                  optionValue: 'natural',
                  optionImage: '/images/quiz/style-natural.jpg',
                  imageAlt: 'Natural makeup look example',
                  order: 1 
                },
                { 
                  optionText: 'Glam/Full Coverage', 
                  optionValue: 'glam',
                  optionImage: '/images/quiz/style-glam.jpg',
                  imageAlt: 'Glamorous makeup look example',
                  order: 2 
                },
                { 
                  optionText: 'Editorial/Creative', 
                  optionValue: 'editorial',
                  optionImage: '/images/quiz/style-editorial.jpg',
                  imageAlt: 'Editorial makeup look example',
                  order: 3 
                },
                { 
                  optionText: 'Classic/Timeless', 
                  optionValue: 'classic',
                  optionImage: '/images/quiz/style-classic.jpg',
                  imageAlt: 'Classic makeup look example',
                  order: 4 
                }
              ]
            }
          },
          {
            questionText: 'Which eye shape best matches yours?',
            questionType: 'MULTIPLE_CHOICE',
            questionImage: '/images/quiz/eye-shapes-guide.jpg',
            helpText: 'Compare your eyes to the reference image above',
            order: 3,
            answerOptions: {
              create: [
                { 
                  optionText: 'Almond', 
                  optionValue: 'almond',
                  optionImage: '/images/quiz/eye-almond.jpg',
                  imageAlt: 'Almond eye shape',
                  order: 1 
                },
                { 
                  optionText: 'Round', 
                  optionValue: 'round',
                  optionImage: '/images/quiz/eye-round.jpg',
                  imageAlt: 'Round eye shape',
                  order: 2 
                },
                { 
                  optionText: 'Hooded', 
                  optionValue: 'hooded',
                  optionImage: '/images/quiz/eye-hooded.jpg',
                  imageAlt: 'Hooded eye shape',
                  order: 3 
                },
                { 
                  optionText: 'Monolid', 
                  optionValue: 'monolid',
                  optionImage: '/images/quiz/eye-monolid.jpg',
                  imageAlt: 'Monolid eye shape',
                  order: 4 
                },
                { 
                  optionText: 'Downturned', 
                  optionValue: 'downturned',
                  optionImage: '/images/quiz/eye-downturned.jpg',
                  imageAlt: 'Downturned eye shape',
                  order: 5 
                }
              ]
            }
          },
          {
            questionText: 'What is your makeup experience level?',
            questionType: 'MULTIPLE_CHOICE',
            order: 4,
            answerOptions: {
              create: [
                { optionText: 'Beginner - Just starting out', optionValue: 'beginner', order: 1 },
                { optionText: 'Intermediate - Know the basics', optionValue: 'intermediate', order: 2 },
                { optionText: 'Advanced - Comfortable with most techniques', optionValue: 'advanced', order: 3 },
                { optionText: 'Expert - Professional level', optionValue: 'expert', order: 4 }
              ]
            }
          },
          {
            questionText: 'What occasions do you need makeup guidance for? (Check all that apply)',
            questionType: 'CHECKBOX',
            order: 5,
            answerOptions: {
              create: [
                { optionText: 'Daily/Work', optionValue: 'daily', order: 1 },
                { optionText: 'Special Events', optionValue: 'events', order: 2 },
                { optionText: 'Date Night', optionValue: 'date', order: 3 },
                { optionText: 'Professional Photos', optionValue: 'photos', order: 4 },
                { optionText: 'Wedding/Bridal', optionValue: 'wedding', order: 5 },
                { optionText: 'Video Calls/Zoom', optionValue: 'video', order: 6 }
              ]
            }
          },
          {
            questionText: 'How would you rate your current satisfaction with your makeup routine?',
            questionType: 'RATING',
            helpText: 'Rate from 1 (very unsatisfied) to 5 (very satisfied)',
            order: 6,
            isRequired: true
          },
          {
            questionText: 'What specific areas would you like help with?',
            questionType: 'TEXT',
            helpText: 'Please describe any specific concerns or goals',
            order: 7,
            isRequired: false
          }
        ]
      }
    }
  })

  // Create a style preferences quiz
  const styleQuiz = await prisma.quiz.create({
    data: {
      title: 'Style Preferences',
      description: 'Let us know your favorite looks and inspirations',
      category: 'style',
      order: 2,
      questions: {
        create: [
          {
            questionText: 'Which celebrity makeup style inspires you?',
            questionType: 'MULTIPLE_CHOICE',
            order: 1,
            answerOptions: {
              create: [
                { 
                  optionText: 'Zendaya - Fresh and versatile', 
                  optionValue: 'zendaya',
                  optionImage: '/images/quiz/celeb-zendaya.jpg',
                  imageAlt: 'Zendaya makeup style',
                  order: 1 
                },
                { 
                  optionText: 'Rihanna - Bold and trendsetting', 
                  optionValue: 'rihanna',
                  optionImage: '/images/quiz/celeb-rihanna.jpg',
                  imageAlt: 'Rihanna makeup style',
                  order: 2 
                },
                { 
                  optionText: 'Blake Lively - Classic elegance', 
                  optionValue: 'blake',
                  optionImage: '/images/quiz/celeb-blake.jpg',
                  imageAlt: 'Blake Lively makeup style',
                  order: 3 
                },
                { 
                  optionText: 'Lupita Nyong\'o - Radiant and colorful', 
                  optionValue: 'lupita',
                  optionImage: '/images/quiz/celeb-lupita.jpg',
                  imageAlt: 'Lupita Nyong\'o makeup style',
                  order: 4 
                }
              ]
            }
          }
        ]
      }
    }
  })

  // Create sample appointment with consultation
  const appointment = await prisma.appointment.create({
    data: {
      clientId: client1.id,
      artistId: artist1.id,
      scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      duration: 60,
      status: 'CONFIRMED',
      type: 'CONSULTATION',
      notes: 'First consultation - looking for daily makeup routine guidance'
    }
  })

  // Create a sample review
  await prisma.review.create({
    data: {
      clientId: client1.id,
      artistId: artist1.id,
      rating: 5,
      comment: 'Sarah was amazing! She really understood my style and taught me techniques I can actually use every day.'
    }
  })

  console.log('Database seeded successfully!')
  console.log('Sample users created:')
  console.log('- Artist: sarah_beauty / password123')
  console.log('- Artist: maria_glam / password123')  
  console.log('- Client: jane_doe / password123')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
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
      bio: 'Professional makeup artist with 10 years experience specializing in bridal and editorial looks. I believe in enhancing natural beauty and creating timeless, elegant makeup that photographs beautifully. My approach is personalized to each client\'s unique features and style preferences.',
      specialties: ['Bridal', 'Editorial', 'Natural Glam'],
      yearsExperience: 10,
      hourlyRate: 150,
      profileImage: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=400',
      portfolioImages: [
        'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800',
        'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=800',
        'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=800',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800'
      ],
      location: 'New York, NY',
      badges: ['Certified Pro', 'Best of Beauty 2024'],
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
      bio: 'Celebrity makeup artist known for glamorous red carpet looks and creative editorial work. With 15 years in the industry, I\'ve worked with A-list celebrities and top fashion magazines. My signature style combines bold glamour with innovative techniques.',
      specialties: ['Glam', 'Red Carpet', 'Creative', 'Special Effects'],
      yearsExperience: 15,
      hourlyRate: 250,
      profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
      portfolioImages: [
        'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800',
        'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800',
        'https://images.unsplash.com/photo-1512361436605-a484bdb34b5f?w=800',
        'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800'
      ],
      location: 'Los Angeles, CA',
      badges: ['Celebrity Artist', 'Sponsored'],
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

  // Create additional makeup artists
  const artist3 = await prisma.makeupArtist.create({
    data: {
      username: 'jessica_artistry',
      password: await bcrypt.hash('password123', 10),
      email: 'jessica@goldiegrace.com',
      name: 'Jessica Chen',
      bio: 'Specializing in Asian beauty techniques and K-beauty inspired looks. I focus on achieving that perfect "glass skin" glow and subtle enhancements that bring out your best features.',
      specialties: ['K-Beauty', 'Natural Glow', 'Asian Techniques', 'Skincare Focus'],
      yearsExperience: 7,
      hourlyRate: 120,
      profileImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400',
      portfolioImages: [
        'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800',
        'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=800',
        'https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=800',
        'https://images.unsplash.com/photo-1620065416784-2e16cd14cf0f?w=800'
      ],
      location: 'San Francisco, CA',
      badges: ['Rising Star', 'Skincare Expert'],
      isAvailable: true,
      availability: {
        create: [
          { dayOfWeek: 2, startTime: '11:00', endTime: '19:00' },
          { dayOfWeek: 3, startTime: '11:00', endTime: '19:00' },
          { dayOfWeek: 4, startTime: '11:00', endTime: '19:00' },
          { dayOfWeek: 5, startTime: '11:00', endTime: '19:00' },
          { dayOfWeek: 6, startTime: '09:00', endTime: '17:00' },
        ]
      }
    }
  })

  const artist4 = await prisma.makeupArtist.create({
    data: {
      username: 'alex_pro',
      password: await bcrypt.hash('password123', 10),
      email: 'alex@goldiegrace.com',
      name: 'Alexandra Thompson',
      bio: 'Fashion week veteran with expertise in avant-garde and editorial makeup. I push boundaries while ensuring wearable, camera-ready looks.',
      specialties: ['Fashion', 'Avant-garde', 'Editorial', 'Runway'],
      yearsExperience: 12,
      hourlyRate: 200,
      profileImage: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400',
      portfolioImages: [
        'https://images.unsplash.com/photo-1503185912284-5271ff81b9a8?w=800',
        'https://images.unsplash.com/photo-1562572159-4efc207f5aff?w=800',
        'https://images.unsplash.com/photo-1583147610149-781ac108dfc6?w=800',
        'https://images.unsplash.com/photo-1597586124394-fbd6ef244026?w=800'
      ],
      location: 'New York, NY',
      badges: ['Fashion Week Regular', 'Editorial Expert', 'Sponsored'],
      isAvailable: true,
      availability: {
        create: [
          { dayOfWeek: 1, startTime: '08:00', endTime: '16:00' },
          { dayOfWeek: 2, startTime: '08:00', endTime: '16:00' },
          { dayOfWeek: 3, startTime: '08:00', endTime: '16:00' },
          { dayOfWeek: 4, startTime: '08:00', endTime: '16:00' },
        ]
      }
    }
  })

  const artist5 = await prisma.makeupArtist.create({
    data: {
      username: 'taylor_mua',
      password: await bcrypt.hash('password123', 10),
      email: 'taylor@goldiegrace.com',
      name: 'Taylor Williams',
      bio: 'Your go-to artist for everyday glam and special occasions. I believe makeup should be fun, accessible, and empowering for everyone!',
      specialties: ['Everyday Glam', 'Special Occasions', 'Tutorials', 'Teen Makeup'],
      yearsExperience: 5,
      hourlyRate: 90,
      profileImage: 'https://images.unsplash.com/photo-1530785602389-07594beb8b73?w=400',
      portfolioImages: [
        'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800',
        'https://images.unsplash.com/photo-1481214110143-ed630356e1bb?w=800',
        'https://images.unsplash.com/photo-1512310604669-443f26c35f52?w=800',
        'https://images.unsplash.com/photo-1576828831022-ca41d3905fb7?w=800'
      ],
      location: 'Chicago, IL',
      badges: ['Budget Friendly', 'Teen Specialist'],
      isAvailable: false, // Currently unavailable
      availability: {
        create: [
          { dayOfWeek: 0, startTime: '10:00', endTime: '18:00' }, // Sunday
          { dayOfWeek: 6, startTime: '10:00', endTime: '18:00' }, // Saturday
        ]
      }
    }
  })

  // Create sample clients
  const client1 = await prisma.client.create({
    data: {
      username: 'jane_doe',
      password: await bcrypt.hash('password123', 10),
      email: 'jane@example.com',
      name: 'Jane Doe',
      phone: '+1234567890',
      profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400'
    }
  })

  const client2 = await prisma.client.create({
    data: {
      username: 'emily_client',
      password: await bcrypt.hash('password123', 10),
      email: 'emily@example.com',
      name: 'Emily Watson',
      phone: '+1234567891',
      profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400'
    }
  })

  const client3 = await prisma.client.create({
    data: {
      username: 'sophia_m',
      password: await bcrypt.hash('password123', 10),
      email: 'sophia@example.com',
      name: 'Sophia Martinez',
      phone: '+1234567892',
      profileImage: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=400'
    }
  })

  const client4 = await prisma.client.create({
    data: {
      username: 'olivia_j',
      password: await bcrypt.hash('password123', 10),
      email: 'olivia@example.com',
      name: 'Olivia Johnson',
      phone: '+1234567893',
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
            questionText: 'When it comes to style, what\'s important to you?',
            questionType: 'MULTIPLE_CHOICE',
            order: 1,
            answerOptions: {
              create: [
                { optionText: 'Having my own Stylist', optionValue: 'stylist', order: 1 },
                { optionText: 'Find my best fit', optionValue: 'best_fit', order: 2 },
                { optionText: 'A fun surprise', optionValue: 'surprise', order: 3 },
                { optionText: 'Unique pieces', optionValue: 'unique', order: 4 },
                { optionText: 'Update my look', optionValue: 'update_look', order: 5 },
                { optionText: 'Save time shopping', optionValue: 'save_time', order: 6 },
                { optionText: 'Try new trends', optionValue: 'new_trends', order: 7 },
                { optionText: 'Browse a personalized shop', optionValue: 'personalized', order: 8 }
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
            questionText: 'What\'s your biggest makeup challenge?',
            questionType: 'MULTIPLE_CHOICE',
            order: 3,
            answerOptions: {
              create: [
                { optionText: 'Finding the right products', optionValue: 'products', order: 1 },
                { optionText: 'Application techniques', optionValue: 'techniques', order: 2 },
                { optionText: 'Color matching', optionValue: 'color_matching', order: 3 },
                { optionText: 'Making it last all day', optionValue: 'longevity', order: 4 },
                { optionText: 'Creating different looks', optionValue: 'variety', order: 5 },
                { optionText: 'Time constraints', optionValue: 'time', order: 6 }
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
            questionText: 'What specific areas would you like help with?',
            questionType: 'MULTIPLE_CHOICE',
            helpText: 'Select your primary concern',
            order: 6,
            isRequired: false,
            answerOptions: {
              create: [
                { optionText: 'Foundation matching & application', optionValue: 'foundation', order: 1 },
                { optionText: 'Eye makeup techniques', optionValue: 'eyes', order: 2 },
                { optionText: 'Contouring & highlighting', optionValue: 'contouring', order: 3 },
                { optionText: 'Lip color selection', optionValue: 'lips', order: 4 },
                { optionText: 'Skincare prep for makeup', optionValue: 'skincare', order: 5 },
                { optionText: 'Complete makeup routine', optionValue: 'complete', order: 6 },
                { optionText: 'Special occasion looks', optionValue: 'special', order: 7 },
                { optionText: 'Quick everyday looks', optionValue: 'everyday', order: 8 }
              ]
            }
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
                },
                { 
                  optionText: 'Beyoncé - Glamorous and flawless', 
                  optionValue: 'beyonce',
                  optionImage: '/images/quiz/celeb-beyonce.jpg',
                  imageAlt: 'Beyoncé makeup style',
                  order: 5 
                },
                { 
                  optionText: 'Ariana Grande - Youthful and polished', 
                  optionValue: 'ariana',
                  optionImage: '/images/quiz/celeb-ariana.jpg',
                  imageAlt: 'Ariana Grande makeup style',
                  order: 6 
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

  // Create varied reviews for different ratings
  // Sarah - High rating (4.7 average)
  await prisma.review.createMany({
    data: [
      {
        clientId: client1.id,
        artistId: artist1.id,
        rating: 5,
        comment: 'Sarah was amazing! She really understood my style and taught me techniques I can actually use every day.'
      },
      {
        clientId: client2.id,
        artistId: artist1.id,
        rating: 5,
        comment: 'Best makeup artist I\'ve ever worked with. My wedding makeup was flawless!'
      },
      {
        clientId: client3.id,
        artistId: artist1.id,
        rating: 4,
        comment: 'Great experience, very professional. Would definitely recommend.'
      }
    ]
  })

  // Maria - Perfect rating (5.0 average)
  await prisma.review.createMany({
    data: [
      {
        clientId: client1.id,
        artistId: artist2.id,
        rating: 5,
        comment: 'Maria is a true artist! My red carpet look was absolutely stunning.'
      },
      {
        clientId: client4.id,
        artistId: artist2.id,
        rating: 5,
        comment: 'Celebrity treatment from start to finish. Worth every penny!'
      }
    ]
  })

  // Jessica - Good rating (4.3 average)
  await prisma.review.createMany({
    data: [
      {
        clientId: client2.id,
        artistId: artist3.id,
        rating: 5,
        comment: 'Jessica\'s K-beauty techniques gave me the glass skin I\'ve always wanted!'
      },
      {
        clientId: client3.id,
        artistId: artist3.id,
        rating: 4,
        comment: 'Love the natural glow she achieved. Very knowledgeable about skincare too.'
      },
      {
        clientId: client4.id,
        artistId: artist3.id,
        rating: 4,
        comment: 'Good session, learned a lot about Korean beauty trends.'
      }
    ]
  })

  // Alexandra - High rating (4.5 average)
  await prisma.review.createMany({
    data: [
      {
        clientId: client1.id,
        artistId: artist4.id,
        rating: 5,
        comment: 'Alex created the most incredible editorial look for my photoshoot!'
      },
      {
        clientId: client2.id,
        artistId: artist4.id,
        rating: 4,
        comment: 'Very creative and professional. Perfect for fashion events.'
      }
    ]
  })

  // Taylor - New artist, one review (3.0 average)
  await prisma.review.create({
    data: {
      clientId: client3.id,
      artistId: artist5.id,
      rating: 3,
      comment: 'Good for beginners, but I was expecting more advanced techniques.'
    }
  })

  // Verify seeded data
  const quizCount = await prisma.quiz.count()
  const questionCount = await prisma.question.count()
  const artistCount = await prisma.makeupArtist.count()
  const clientCount = await prisma.client.count()
  const reviewCount = await prisma.review.count()
  
  console.log('Database seeded successfully!')
  console.log(`- ${quizCount} quizzes created`)
  console.log(`- ${questionCount} questions created`)
  console.log(`- ${artistCount} makeup artists created`)
  console.log(`- ${clientCount} clients created`)
  console.log(`- ${reviewCount} reviews created`)
  console.log('\nSample users created:')
  console.log('\nMakeup Artists:')
  console.log('- sarah_beauty / password123 (4.7★ rating)')
  console.log('- maria_glam / password123 (5.0★ rating)')
  console.log('- jessica_artistry / password123 (4.3★ rating)')
  console.log('- alex_pro / password123 (4.5★ rating)')
  console.log('- taylor_mua / password123 (3.0★ rating)')
  console.log('\nClients:')
  console.log('- jane_doe / password123')
  console.log('- emily_client / password123')
  console.log('- sophia_m / password123')
  console.log('- olivia_j / password123')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
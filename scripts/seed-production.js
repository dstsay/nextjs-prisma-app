const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const readline = require('readline');

// Create readline interface for user prompts
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const prompt = (question) => new Promise((resolve) => rl.question(question, resolve));

// Initialize Prisma Client
const prisma = new PrismaClient();

// Makeup artist data (production-ready)
const makeupArtists = [
  {
    username: 'sarah_beauty',
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
    availability: [
      { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 2, startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 3, startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 4, startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 5, startTime: '09:00', endTime: '15:00' },
    ]
  },
  {
    username: 'maria_glam',
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
    availability: [
      { dayOfWeek: 1, startTime: '10:00', endTime: '18:00' },
      { dayOfWeek: 3, startTime: '10:00', endTime: '18:00' },
      { dayOfWeek: 5, startTime: '10:00', endTime: '18:00' },
      { dayOfWeek: 6, startTime: '10:00', endTime: '16:00' },
    ]
  },
  {
    username: 'jessica_artistry',
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
    availability: [
      { dayOfWeek: 2, startTime: '11:00', endTime: '19:00' },
      { dayOfWeek: 3, startTime: '11:00', endTime: '19:00' },
      { dayOfWeek: 4, startTime: '11:00', endTime: '19:00' },
      { dayOfWeek: 5, startTime: '11:00', endTime: '19:00' },
      { dayOfWeek: 6, startTime: '09:00', endTime: '17:00' },
    ]
  },
  {
    username: 'alex_pro',
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
    availability: [
      { dayOfWeek: 1, startTime: '08:00', endTime: '16:00' },
      { dayOfWeek: 2, startTime: '08:00', endTime: '16:00' },
      { dayOfWeek: 3, startTime: '08:00', endTime: '16:00' },
      { dayOfWeek: 4, startTime: '08:00', endTime: '16:00' },
    ]
  },
  {
    username: 'taylor_mua',
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
    isAvailable: false,
    availability: [
      { dayOfWeek: 0, startTime: '10:00', endTime: '18:00' },
      { dayOfWeek: 6, startTime: '10:00', endTime: '18:00' },
    ]
  },
  {
    username: 'nina_beauty',
    email: 'nina@goldiegrace.com',
    name: 'Nina Patel',
    bio: 'Bollywood and South Asian bridal specialist. Expert in traditional and modern fusion looks with emphasis on long-lasting makeup for celebrations.',
    specialties: ['South Asian Bridal', 'Bollywood Glam', 'Airbrush', 'HD Makeup'],
    yearsExperience: 8,
    hourlyRate: 180,
    profileImage: 'https://images.unsplash.com/photo-1614595586581-f8e0b0fc889d?w=400',
    portfolioImages: [
      'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?w=800',
      'https://images.unsplash.com/photo-1560238530-7b3eb03b8e01?w=800',
      'https://images.unsplash.com/photo-1583089892943-e02e5b017b6a?w=800',
      'https://images.unsplash.com/photo-1617331140180-e8262094733a?w=800'
    ],
    location: 'Houston, TX',
    badges: ['Bridal Expert', 'Cultural Specialist'],
    isAvailable: true,
    availability: [
      { dayOfWeek: 2, startTime: '10:00', endTime: '18:00' },
      { dayOfWeek: 3, startTime: '10:00', endTime: '18:00' },
      { dayOfWeek: 4, startTime: '10:00', endTime: '18:00' },
      { dayOfWeek: 5, startTime: '10:00', endTime: '20:00' },
      { dayOfWeek: 6, startTime: '08:00', endTime: '20:00' },
      { dayOfWeek: 0, startTime: '08:00', endTime: '20:00' },
    ]
  },
  {
    username: 'rachel_glow',
    email: 'rachel@goldiegrace.com',
    name: 'Rachel Green',
    bio: 'Clean beauty advocate specializing in organic and cruelty-free makeup. I help clients achieve stunning looks while being mindful of ingredients and environmental impact.',
    specialties: ['Clean Beauty', 'Organic Products', 'Sensitive Skin', 'Eco-Friendly'],
    yearsExperience: 6,
    hourlyRate: 130,
    profileImage: 'https://images.unsplash.com/photo-1569124589354-615739ae007b?w=400',
    portfolioImages: [
      'https://images.unsplash.com/photo-1560087637-bf797bc7796a?w=800',
      'https://images.unsplash.com/photo-1618374647013-477f9b729e23?w=800',
      'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=800',
      'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=800'
    ],
    location: 'Portland, OR',
    badges: ['Clean Beauty Expert', 'Eco-Friendly'],
    isAvailable: true,
    availability: [
      { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 2, startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 4, startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 5, startTime: '09:00', endTime: '15:00' },
    ]
  },
  {
    username: 'lisa_transform',
    email: 'lisa@goldiegrace.com',
    name: 'Lisa Chang',
    bio: 'Transformation specialist with expertise in corrective makeup, scar coverage, and confidence-building techniques. Every face tells a story.',
    specialties: ['Corrective Makeup', 'Scar Coverage', 'Mature Skin', 'Transformations'],
    yearsExperience: 11,
    hourlyRate: 160,
    profileImage: 'https://images.unsplash.com/photo-1598550874175-4d0ef436c909?w=400',
    portfolioImages: [
      'https://images.unsplash.com/photo-1599983755343-e25e64dd4e67?w=800',
      'https://images.unsplash.com/photo-1612201142855-5873879b5c5b?w=800',
      'https://images.unsplash.com/photo-1583241800442-898c47c3ae6b?w=800',
      'https://images.unsplash.com/photo-1609207807107-e8ec2120f9de?w=800'
    ],
    location: 'Miami, FL',
    badges: ['Transformation Expert', 'Medical Makeup'],
    isAvailable: true,
    availability: [
      { dayOfWeek: 1, startTime: '10:00', endTime: '18:00' },
      { dayOfWeek: 3, startTime: '10:00', endTime: '18:00' },
      { dayOfWeek: 4, startTime: '10:00', endTime: '18:00' },
      { dayOfWeek: 5, startTime: '10:00', endTime: '16:00' },
    ]
  },
  {
    username: 'monica_style',
    email: 'monica@goldiegrace.com',
    name: 'Monica Davis',
    bio: 'TV and film makeup artist bringing Hollywood techniques to everyday beauty. Specializing in lighting-perfect makeup and camera-ready looks.',
    specialties: ['TV/Film', 'HD Makeup', 'Contouring', 'Camera Ready'],
    yearsExperience: 14,
    hourlyRate: 220,
    profileImage: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400',
    portfolioImages: [
      'https://images.unsplash.com/photo-1595959183082-7b570b7e08e2?w=800',
      'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=800',
      'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800',
      'https://images.unsplash.com/photo-1604881991720-f91add269bed?w=800'
    ],
    location: 'Atlanta, GA',
    badges: ['TV/Film Pro', 'HD Expert', 'Sponsored'],
    isAvailable: true,
    availability: [
      { dayOfWeek: 2, startTime: '08:00', endTime: '20:00' },
      { dayOfWeek: 3, startTime: '08:00', endTime: '20:00' },
      { dayOfWeek: 4, startTime: '08:00', endTime: '20:00' },
      { dayOfWeek: 5, startTime: '08:00', endTime: '18:00' },
    ]
  },
  {
    username: 'diana_luxe',
    email: 'diana@goldiegrace.com',
    name: 'Diana Luxe',
    bio: 'Luxury makeup experiences for discerning clients. Specializing in high-end events, galas, and photoshoots with premium products only.',
    specialties: ['Luxury Events', 'High-End Products', 'Photoshoots', 'VIP Services'],
    yearsExperience: 16,
    hourlyRate: 300,
    profileImage: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=400',
    portfolioImages: [
      'https://images.unsplash.com/photo-1620724072825-3cf4dcf4fb89?w=800',
      'https://images.unsplash.com/photo-1613772482565-008c3e2e2b17?w=800',
      'https://images.unsplash.com/photo-1617019114648-e06f6ea7d93e?w=800',
      'https://images.unsplash.com/photo-1619451334792-150fd785ee74?w=800'
    ],
    location: 'Beverly Hills, CA',
    badges: ['Luxury Expert', 'VIP Artist', 'Top Rated'],
    isAvailable: true,
    availability: [
      { dayOfWeek: 3, startTime: '10:00', endTime: '18:00' },
      { dayOfWeek: 4, startTime: '10:00', endTime: '18:00' },
      { dayOfWeek: 5, startTime: '10:00', endTime: '20:00' },
      { dayOfWeek: 6, startTime: '09:00', endTime: '20:00' },
    ]
  },
  {
    username: 'kim_minimal',
    email: 'kim@goldiegrace.com',
    name: 'Kim Park',
    bio: 'Minimalist makeup artist focusing on enhancing natural beauty with the "less is more" philosophy. Expert in no-makeup makeup looks.',
    specialties: ['Minimalist', 'No-Makeup Makeup', 'Natural Beauty', 'Quick Looks'],
    yearsExperience: 4,
    hourlyRate: 100,
    profileImage: 'https://images.unsplash.com/photo-1617922159306-9ddf13b05cd6?w=400',
    portfolioImages: [
      'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=800',
      'https://images.unsplash.com/photo-1620916297397-a4a4e5b6827f?w=800',
      'https://images.unsplash.com/photo-1612636761398-5be1bef9dd2d?w=800',
      'https://images.unsplash.com/photo-1618354691321-e851c56960d1?w=800'
    ],
    location: 'Seattle, WA',
    badges: ['Minimalist Expert', 'Quick Service'],
    isAvailable: true,
    availability: [
      { dayOfWeek: 1, startTime: '12:00', endTime: '19:00' },
      { dayOfWeek: 2, startTime: '12:00', endTime: '19:00' },
      { dayOfWeek: 3, startTime: '12:00', endTime: '19:00' },
      { dayOfWeek: 4, startTime: '12:00', endTime: '19:00' },
      { dayOfWeek: 5, startTime: '10:00', endTime: '17:00' },
    ]
  },
  {
    username: 'amanda_vintage',
    email: 'amanda@goldiegrace.com',
    name: 'Amanda Rose',
    bio: 'Vintage and retro makeup specialist. From 1920s flapper to 1980s glam rock, I bring historical beauty trends to modern faces.',
    specialties: ['Vintage Looks', 'Retro Styles', 'Pin-up', 'Period Makeup'],
    yearsExperience: 9,
    hourlyRate: 140,
    profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
    portfolioImages: [
      'https://images.unsplash.com/photo-1600298881974-6be191ceeda1?w=800',
      'https://images.unsplash.com/photo-1592621385645-e41659e8aabe?w=800',
      'https://images.unsplash.com/photo-1601972599748-2b10b48f732d?w=800',
      'https://images.unsplash.com/photo-1620122830785-a18b43585b44?w=800'
    ],
    location: 'Nashville, TN',
    badges: ['Vintage Expert', 'Creative Artist'],
    isAvailable: true,
    availability: [
      { dayOfWeek: 2, startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 3, startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 4, startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 6, startTime: '10:00', endTime: '18:00' },
      { dayOfWeek: 0, startTime: '12:00', endTime: '17:00' },
    ]
  }
];

// Sample reviews for each artist
const getReviewsForArtist = (artistName) => {
  const reviewTemplates = [
    { rating: 5, comment: `${artistName} is absolutely amazing! Professional, talented, and made me feel beautiful.` },
    { rating: 5, comment: `Best makeup experience ever! ${artistName} listened to exactly what I wanted.` },
    { rating: 4, comment: `Great skills and very professional. Would definitely book again.` },
    { rating: 5, comment: `${artistName} exceeded all my expectations. Highly recommend!` },
    { rating: 5, comment: `Incredible attention to detail and such a warm personality.` }
  ];
  
  // Return 3-5 random reviews
  const numReviews = Math.floor(Math.random() * 3) + 3;
  return reviewTemplates.slice(0, numReviews);
};

async function seedProduction() {
  try {
    console.log('🔍 Checking production database...\n');
    
    // Check if artists already exist
    const existingArtists = await prisma.makeupArtist.count();
    
    if (existingArtists > 0) {
      console.log(`⚠️  Database already contains ${existingArtists} makeup artists.`);
      const answer = await prompt('Do you want to continue and add more artists? (yes/no): ');
      
      if (answer.toLowerCase() !== 'yes') {
        console.log('❌ Seed cancelled.');
        rl.close();
        await prisma.$disconnect();
        return;
      }
    }
    
    // Dry run mode
    const dryRun = await prompt('\nDo you want to run in dry-run mode first? (yes/no): ');
    
    if (dryRun.toLowerCase() === 'yes') {
      console.log('\n📋 DRY RUN - No data will be added:\n');
      console.log(`Will add ${makeupArtists.length} makeup artists`);
      console.log(`Each artist will have:`);
      console.log(`  - Profile information`);
      console.log(`  - 4 portfolio images`);
      console.log(`  - 2-7 availability slots`);
      console.log(`  - 3-5 reviews\n`);
      
      const proceed = await prompt('Proceed with actual seed? (yes/no): ');
      if (proceed.toLowerCase() !== 'yes') {
        console.log('❌ Seed cancelled.');
        rl.close();
        await prisma.$disconnect();
        return;
      }
    }
    
    console.log('\n🌱 Starting production seed...\n');
    
    // Use a transaction for data integrity
    await prisma.$transaction(async (tx) => {
      let createdCount = 0;
      
      for (const artistData of makeupArtists) {
        console.log(`Creating artist: ${artistData.name}...`);
        
        // Create artist with availability
        const artist = await tx.makeupArtist.create({
          data: {
            username: artistData.username,
            password: await bcrypt.hash('GoldieGrace2024!', 10), // Strong default password
            email: artistData.email,
            name: artistData.name,
            bio: artistData.bio,
            specialties: artistData.specialties,
            yearsExperience: artistData.yearsExperience,
            hourlyRate: artistData.hourlyRate,
            profileImage: artistData.profileImage,
            portfolioImages: artistData.portfolioImages,
            location: artistData.location,
            badges: artistData.badges,
            isAvailable: artistData.isAvailable !== false,
            availability: {
              create: artistData.availability
            }
          }
        });
        
        // Add reviews for this artist
        const reviews = getReviewsForArtist(artistData.name);
        for (let i = 0; i < reviews.length; i++) {
          const review = reviews[i];
          
          // Create a dummy client for the review (or use existing ones if you have them)
          const reviewClient = await tx.client.upsert({
            where: { email: `reviewer${i + 1}_${artistData.username}@example.com` },
            update: {},
            create: {
              username: `reviewer${i + 1}_${artistData.username}`,
              password: await bcrypt.hash('ReviewerPassword123!', 10),
              email: `reviewer${i + 1}_${artistData.username}@example.com`,
              name: `Happy Client ${i + 1}`
            }
          });
          
          await tx.review.create({
            data: {
              clientId: reviewClient.id,
              artistId: artist.id,
              rating: review.rating,
              comment: review.comment,
              isPublished: true
            }
          });
        }
        
        createdCount++;
        console.log(`✅ Created ${artistData.name} with ${reviews.length} reviews`);
      }
      
      console.log(`\n✨ Successfully seeded ${createdCount} makeup artists!`);
    });
    
    // Final summary
    const totalArtists = await prisma.makeupArtist.count();
    const totalReviews = await prisma.review.count();
    const totalAvailability = await prisma.availability.count();
    
    console.log('\n📊 Database Summary:');
    console.log(`  - Total Makeup Artists: ${totalArtists}`);
    console.log(`  - Total Reviews: ${totalReviews}`);
    console.log(`  - Total Availability Slots: ${totalAvailability}`);
    console.log('\n🎉 Production seed completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding production database:', error);
    throw error;
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

// Run the seed
seedProduction().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
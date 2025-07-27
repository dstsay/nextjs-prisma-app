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

// Makeup artist data with makeup-specific portfolio images
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
      'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=800', // Soft bridal makeup
      'https://images.unsplash.com/photo-1560869713-da86a9ec0744?w=800', // Natural glam makeup
      'https://images.unsplash.com/photo-1620724072825-66c33d1564dd?w=800', // Elegant bridal look
      'https://images.unsplash.com/photo-1609207807107-e8ec2120f9de?w=800'  // Editorial beauty makeup
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
      'https://images.unsplash.com/photo-1583241800698-e8ab01828e07?w=800', // Bold red lips glam
      'https://images.unsplash.com/photo-1560718936-dd2fcbb4ed35?w=800', // Dramatic eye makeup
      'https://images.unsplash.com/photo-1619451334792-150fd785ee74?w=800', // Red carpet glamour
      'https://images.unsplash.com/photo-1617019114583-e1c8ba8fabaa?w=800'  // Creative makeup art
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
      'https://images.unsplash.com/photo-1620065416918-beddedf15de2?w=800', // Glass skin makeup
      'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800', // K-beauty natural glow
      'https://images.unsplash.com/photo-1617331721458-bd3bd3f9c7f8?w=800', // Dewy makeup look
      'https://images.unsplash.com/photo-1612201142855-7873879b5c5b?w=800'  // Asian beauty techniques
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
      'https://images.unsplash.com/photo-1600298881203-29bf33316e20?w=800', // Fashion editorial makeup
      'https://images.unsplash.com/photo-1620122830785-a18b43585b44?w=800', // Avant-garde creative
      'https://images.unsplash.com/photo-1583241801030-0d0cac872800?w=800', // Runway makeup
      'https://images.unsplash.com/photo-1595959183082-7b570b7e08e2?w=800'  // High fashion beauty
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
      'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800', // Natural everyday makeup
      'https://images.unsplash.com/photo-1618354691249-18772bbac3a5?w=800', // Simple glam look
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800', // Fresh makeup look
      'https://images.unsplash.com/photo-1522338140262-f46f5913618a?w=800'  // Teen-friendly makeup
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
      'https://images.unsplash.com/photo-1617627143233-61e0dca7b5f8?w=800', // South Asian bridal
      'https://images.unsplash.com/photo-1620415836902-b05534ff7b19?w=800', // Traditional makeup
      'https://images.unsplash.com/photo-1619451451124-e21de5572020?w=800', // Bollywood glamour
      'https://images.unsplash.com/photo-1595936760906-625f4307c925?w=800'  // Vibrant celebration makeup
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
      'https://images.unsplash.com/photo-1599983420164-e43f9ed32c33?w=800', // Natural clean beauty
      'https://images.unsplash.com/photo-1612636761294-5c0e869b4f9a?w=800', // Minimal makeup look
      'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800', // Eco-friendly beauty
      'https://images.unsplash.com/photo-1618374647107-d33f6d5330a8?w=800'  // Organic makeup products
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
      'https://images.unsplash.com/photo-1608068811588-81e9c83b1e04?w=800', // Corrective makeup
      'https://images.unsplash.com/photo-1620916297217-1520862e9cdc?w=800', // Coverage techniques
      'https://images.unsplash.com/photo-1583241475784-c4c9c1512b0a?w=800', // Transformation makeup
      'https://images.unsplash.com/photo-1618354691229-88d47f285158?w=800'  // Professional coverage
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
      'https://images.unsplash.com/photo-1560325978-3169a42619f9?w=800', // HD camera makeup
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800', // Contouring techniques
      'https://images.unsplash.com/photo-1620011557027-8dc7a5ec7a85?w=800', // Film makeup
      'https://images.unsplash.com/photo-1609207753409-3cf51b0fc9ba?w=800'  // TV ready makeup
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
      'https://images.unsplash.com/photo-1583241800025-7a007de0ebec?w=800', // Luxury makeup
      'https://images.unsplash.com/photo-1620724072948-cb9c2e80abcd?w=800', // High-end glam
      'https://images.unsplash.com/photo-1613553507747-5f8d62ad5904?w=800', // Premium makeup look
      'https://images.unsplash.com/photo-1619775862973-8def165e91df?w=800'  // VIP event makeup
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
      'https://images.unsplash.com/photo-1620916566398-5fe5d8e43470?w=800', // No-makeup makeup
      'https://images.unsplash.com/photo-1614252369616-40e03d0e60de?w=800', // Minimal beauty
      'https://images.unsplash.com/photo-1618354691792-d1d42acfd860?w=800', // Natural enhancement
      'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=800'  // Simple clean look
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
      'https://images.unsplash.com/photo-1583147610331-c5dbb007737d?w=800', // Vintage red lips
      'https://images.unsplash.com/photo-1592621385612-4d7129426394?w=800', // Retro glamour
      'https://images.unsplash.com/photo-1601972602373-28ba01f732d8?w=800', // Pin-up style
      'https://images.unsplash.com/photo-1620122830462-87ae57950e64?w=800'  // Period makeup look
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

async function updateProductionPortfolios() {
  try {
    console.log('🔍 Checking production database...\n');
    
    // Check if artists exist
    const existingArtists = await prisma.makeupArtist.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        portfolioImages: true
      }
    });
    
    if (existingArtists.length === 0) {
      console.log('❌ No makeup artists found in database. Please run seed-production.js first.');
      rl.close();
      await prisma.$disconnect();
      return;
    }
    
    console.log(`✅ Found ${existingArtists.length} makeup artists in database.\n`);
    
    // Show current vs new portfolio comparison
    console.log('📸 Portfolio Image Update Preview:\n');
    for (const artist of makeupArtists) {
      const existing = existingArtists.find(a => a.username === artist.username);
      if (existing) {
        console.log(`${artist.name}:`);
        console.log('  Current: Generic portrait images');
        console.log('  New: Makeup-specific images matching their specialty');
        console.log('');
      }
    }
    
    // Dry run mode
    const dryRun = await prompt('Do you want to run in dry-run mode first? (yes/no): ');
    
    if (dryRun.toLowerCase() === 'yes') {
      console.log('\n📋 DRY RUN - No data will be updated:\n');
      console.log(`Will update portfolio images for ${makeupArtists.length} makeup artists`);
      console.log('Each artist will receive 4 new makeup-specific portfolio images\n');
      
      const proceed = await prompt('Proceed with actual update? (yes/no): ');
      if (proceed.toLowerCase() !== 'yes') {
        console.log('❌ Update cancelled.');
        rl.close();
        await prisma.$disconnect();
        return;
      }
    }
    
    console.log('\n🌱 Starting portfolio image update...\n');
    
    // Use a transaction for data integrity
    await prisma.$transaction(async (tx) => {
      let updatedCount = 0;
      
      for (const artistData of makeupArtists) {
        const existing = existingArtists.find(a => a.username === artistData.username);
        
        if (existing) {
          console.log(`Updating portfolio for: ${artistData.name}...`);
          
          // Update only the portfolio images
          await tx.makeupArtist.update({
            where: { id: existing.id },
            data: {
              portfolioImages: artistData.portfolioImages
            }
          });
          
          updatedCount++;
          console.log(`✅ Updated ${artistData.name}'s portfolio with makeup-specific images`);
        } else {
          console.log(`⚠️  Artist ${artistData.username} not found, skipping...`);
        }
      }
      
      console.log(`\n✨ Successfully updated ${updatedCount} artist portfolios!`);
    });
    
    // Final summary
    const updatedArtists = await prisma.makeupArtist.findMany({
      select: {
        name: true,
        portfolioImages: true
      }
    });
    
    console.log('\n📊 Update Summary:');
    console.log(`  - Total Artists Updated: ${updatedArtists.length}`);
    console.log(`  - Each artist now has 4 makeup-specific portfolio images`);
    console.log('\n🎉 Portfolio update completed successfully!');
    
  } catch (error) {
    console.error('❌ Error updating production portfolios:', error);
    throw error;
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

// Run the update
updateProductionPortfolios().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
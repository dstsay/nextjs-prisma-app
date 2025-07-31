const { PrismaClient } = require('@prisma/client');

// Production database URL
const PRODUCTION_DATABASE_URL = "postgres://e3cef5fc121209ad0bc230a343d1422ea01c241e8f495e47b3c3288e4656cfaf:sk_UwGDNfwGoTpr5rpzpo4ZN@db.prisma.io:5432/?sslmode=require";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: PRODUCTION_DATABASE_URL
    }
  }
});

async function checkSarahAvailability() {
  try {
    console.log('🔍 Checking Sarah Beauty availability...\n');
    
    // Get Sarah's info and availability
    const sarah = await prisma.makeupArtist.findUnique({
      where: { username: 'sarah_beauty' },
      include: {
        availability: true,
        appointments: {
          where: {
            scheduledAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
              lt: new Date(new Date().setHours(23, 59, 59, 999))
            }
          }
        }
      }
    });

    if (!sarah) {
      console.log('❌ Sarah Beauty not found!');
      return;
    }

    console.log('Artist Info:');
    console.log(`- Name: ${sarah.name}`);
    console.log(`- Username: ${sarah.username}`);
    console.log(`- Available: ${sarah.isAvailable}`);
    console.log(`- Hourly Rate: $${sarah.hourlyRate}`);
    
    const today = new Date();
    const dayOfWeek = today.getDay();
    console.log(`\nToday is: ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek]}`);
    console.log(`Current time: ${today.toLocaleTimeString()}`);
    
    console.log('\nRegular Availability:');
    sarah.availability.forEach(slot => {
      const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][slot.dayOfWeek];
      console.log(`- ${dayName}: ${slot.startTime} - ${slot.endTime} (Active: ${slot.isActive})`);
    });
    
    const todayAvailability = sarah.availability.find(a => a.dayOfWeek === dayOfWeek);
    if (todayAvailability) {
      console.log(`\n✅ Sarah works today: ${todayAvailability.startTime} - ${todayAvailability.endTime}`);
    } else {
      console.log('\n❌ Sarah does not work today!');
    }
    
    console.log(`\nToday's appointments (${sarah.appointments.length}):`);
    sarah.appointments.forEach(apt => {
      console.log(`- ${new Date(apt.scheduledAt).toLocaleTimeString()} - Status: ${apt.status}`);
    });

    // Check for exceptions today
    const exceptions = await prisma.availabilityException.findMany({
      where: {
        artistId: sarah.id,
        date: new Date(new Date().setHours(0, 0, 0, 0))
      }
    });
    
    if (exceptions.length > 0) {
      console.log('\n⚠️  Exceptions for today:');
      exceptions.forEach(exc => {
        console.log(`- Type: ${exc.type}, Reason: ${exc.reason || 'None'}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSarahAvailability();
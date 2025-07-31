const { PrismaClient } = require('@prisma/client');
const { getAvailableSlots, AvailabilityData } = require('../lib/availability-utils');

// Use local database for testing
const prisma = new PrismaClient();

async function testLocalAvailability() {
  try {
    console.log('🔍 Testing availability logic locally...\n');
    
    // Get Sarah's data
    const sarah = await prisma.makeupArtist.findFirst({
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
      console.log('❌ Sarah not found in local database');
      return;
    }

    const today = new Date();
    console.log(`Testing for date: ${today.toDateString()}`);
    console.log(`Current time: ${today.toLocaleTimeString()}`);
    console.log(`Day of week: ${today.getDay()}`);
    
    // Get availability data
    const availabilityData = {
      regularSchedule: sarah.availability,
      exceptions: [],
      appointments: sarah.appointments
    };
    
    console.log('\nRegular schedule:', sarah.availability);
    console.log('Today\'s appointments:', sarah.appointments.length);
    
    // Test the getAvailableSlots function
    const slots = getAvailableSlots(today, availabilityData);
    
    console.log(`\nTotal slots generated: ${slots.length}`);
    console.log(`Available slots: ${slots.filter(s => s.available).length}`);
    
    // Show current and future slots
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    console.log(`\nSlots around current time (${currentHour}:${currentMinute}):`);
    slots.forEach(slot => {
      const [hour, minute] = slot.time.split(':').map(Number);
      if (hour >= currentHour - 1 && hour <= currentHour + 2) {
        console.log(`- ${slot.time} (${slot.displayTime}) - Available: ${slot.available}`);
      }
    });
    
    // Check the logic step by step
    const testSlot = slots.find(s => s.time === '21:30');
    if (testSlot) {
      console.log(`\nTesting slot 21:30:`);
      console.log(`- Available: ${testSlot.available}`);
      
      const slotTime = new Date(today);
      slotTime.setHours(21, 30, 0, 0);
      console.log(`- Slot time: ${slotTime.toLocaleTimeString()}`);
      console.log(`- Current time: ${now.toLocaleTimeString()}`);
      console.log(`- Is past? ${slotTime < now}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLocalAvailability();
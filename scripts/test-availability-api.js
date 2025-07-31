const fetch = require('node-fetch');

async function testAvailabilityAPI() {
  try {
    const today = new Date();
    const sarahId = 'clzjfxczi000108l36xm7gxna'; // Sarah's ID from production
    
    console.log('🔍 Testing availability API...\n');
    console.log(`Today's date: ${today.toISOString()}`);
    console.log(`Current time: ${today.toLocaleTimeString()}\n`);
    
    // Test production API
    const prodUrl = `https://goldiegrace.vercel.app/api/artists/${sarahId}/availability?date=${today.toISOString()}`;
    console.log(`Calling: ${prodUrl}\n`);
    
    const response = await fetch(prodUrl);
    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (data.availableSlots) {
      console.log(`\nFound ${data.availableSlots.length} available slots`);
      
      // Show first 5 and last 5 slots
      if (data.availableSlots.length > 0) {
        console.log('\nFirst few slots:');
        data.availableSlots.slice(0, 5).forEach(slot => {
          console.log(`- ${slot.displayTime} (${slot.time}) - Available: ${slot.available}`);
        });
        
        if (data.availableSlots.length > 10) {
          console.log('\n...\n\nLast few slots:');
          data.availableSlots.slice(-5).forEach(slot => {
            console.log(`- ${slot.displayTime} (${slot.time}) - Available: ${slot.available}`);
          });
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testAvailabilityAPI();
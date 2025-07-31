const { formatTime } = require('../lib/date-utils');

function debugTimeSlots() {
  const now = new Date();
  const date = new Date(); // Today
  
  console.log('🔍 Debugging time slot filtering...\n');
  console.log(`Current time: ${now.toLocaleTimeString()}`);
  console.log(`Current timestamp: ${now.getTime()}`);
  console.log(`Current hours: ${now.getHours()}`);
  console.log(`Current minutes: ${now.getMinutes()}\n`);
  
  // Test some time slots
  const testSlots = ['20:00', '20:30', '21:00', '21:30', '22:00', '22:30'];
  
  testSlots.forEach(slot => {
    const [slotHour, slotMinute] = slot.split(':').map(Number);
    const slotTime = new Date(date);
    slotTime.setHours(slotHour, slotMinute, 0, 0);
    
    console.log(`\nSlot: ${slot}`);
    console.log(`  Slot time: ${slotTime.toLocaleTimeString()}`);
    console.log(`  Slot timestamp: ${slotTime.getTime()}`);
    console.log(`  Is past? ${slotTime < now} (${slotTime.getTime()} < ${now.getTime()})`);
    console.log(`  Difference: ${(slotTime.getTime() - now.getTime()) / 1000 / 60} minutes`);
  });
  
  // Check the exact comparison
  console.log('\n\nTesting the exact logic from availability-utils.ts:');
  const testTime = '21:30';
  const [slotHour, slotMinute] = testTime.split(':').map(Number);
  const slotTime = new Date(date);
  slotTime.setHours(slotHour, slotMinute, 0, 0);
  const isPast = slotTime < now;
  
  console.log(`For slot ${testTime}:`);
  console.log(`  slotTime: ${slotTime}`);
  console.log(`  now: ${now}`);
  console.log(`  isPast: ${isPast}`);
}

debugTimeSlots();
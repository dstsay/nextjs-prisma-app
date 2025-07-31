function debugTimeSlots() {
  const now = new Date();
  const date = new Date(); // Today
  
  console.log('🔍 Debugging time slot filtering...\n');
  console.log(`Current time: ${now.toLocaleTimeString()}`);
  console.log(`Current hours: ${now.getHours()}`);
  console.log(`Current minutes: ${now.getMinutes()}\n`);
  
  // Test some time slots
  const testSlots = ['20:00', '20:30', '21:00', '21:30', '22:00', '22:30'];
  
  testSlots.forEach(slot => {
    const [slotHour, slotMinute] = slot.split(':').map(Number);
    const slotTime = new Date(date);
    slotTime.setHours(slotHour, slotMinute, 0, 0);
    
    const isPast = slotTime < now;
    console.log(`Slot ${slot}: isPast = ${isPast} (${slotTime.toLocaleTimeString()} < ${now.toLocaleTimeString()})`);
  });
}

debugTimeSlots();
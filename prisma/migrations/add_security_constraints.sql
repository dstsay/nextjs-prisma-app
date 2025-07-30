-- Add unique constraint to prevent duplicate availability slots for same artist/day
ALTER TABLE "Availability" ADD CONSTRAINT "unique_artist_day_time" 
  UNIQUE ("artistId", "dayOfWeek", "startTime", "endTime");

-- Add check constraint for valid day of week
ALTER TABLE "Availability" ADD CONSTRAINT "valid_day_of_week" 
  CHECK ("dayOfWeek" >= 0 AND "dayOfWeek" <= 6);

-- Add check constraint for time format
ALTER TABLE "Availability" ADD CONSTRAINT "valid_time_format" 
  CHECK ("startTime" ~ '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$' AND "endTime" ~ '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$');

-- Add check constraint to ensure end time is after start time
ALTER TABLE "Availability" ADD CONSTRAINT "end_after_start" 
  CHECK ("endTime" > "startTime");

-- Add unique constraint to prevent double bookings
ALTER TABLE "Appointment" ADD CONSTRAINT "unique_artist_time_slot" 
  UNIQUE ("artistId", "scheduledAt");

-- Add check constraint for appointment duration
ALTER TABLE "Appointment" ADD CONSTRAINT "valid_duration" 
  CHECK ("duration" > 0 AND "duration" <= 480); -- Max 8 hours

-- Add check constraint for valid appointment status transitions
-- This is more complex and might need a trigger, but basic constraint:
ALTER TABLE "Appointment" ADD CONSTRAINT "valid_status" 
  CHECK ("status" IN ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'));

-- Add constraint for availability exceptions
ALTER TABLE "AvailabilityException" ADD CONSTRAINT "unique_artist_exception_date" 
  UNIQUE ("artistId", "date");

-- Add check constraint for exception type
ALTER TABLE "AvailabilityException" ADD CONSTRAINT "valid_exception_type" 
  CHECK ("type" IN ('UNAVAILABLE', 'CUSTOM_HOURS'));

-- Add check constraint for custom hours
ALTER TABLE "AvailabilityException" ADD CONSTRAINT "custom_hours_check" 
  CHECK (
    ("type" = 'UNAVAILABLE' AND "startTime" IS NULL AND "endTime" IS NULL) OR
    ("type" = 'CUSTOM_HOURS' AND "startTime" IS NOT NULL AND "endTime" IS NOT NULL AND "endTime" > "startTime")
  );

-- Add constraint for user emails
ALTER TABLE "Client" ADD CONSTRAINT "valid_email_format" 
  CHECK ("email" ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE "MakeupArtist" ADD CONSTRAINT "artist_valid_email_format" 
  CHECK ("email" ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Add constraint for hourly rate
ALTER TABLE "MakeupArtist" ADD CONSTRAINT "valid_hourly_rate" 
  CHECK ("hourlyRate" IS NULL OR ("hourlyRate" >= 0 AND "hourlyRate" <= 10000));

-- Add constraint for years of experience
ALTER TABLE "MakeupArtist" ADD CONSTRAINT "valid_years_experience" 
  CHECK ("yearsExperience" IS NULL OR ("yearsExperience" >= 0 AND "yearsExperience" <= 50));
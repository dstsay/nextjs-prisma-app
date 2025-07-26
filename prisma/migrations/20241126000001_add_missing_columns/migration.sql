-- AlterTable - Add missing columns to MakeupArtist
ALTER TABLE "MakeupArtist" 
ADD COLUMN IF NOT EXISTS "specialties" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS "portfolioImages" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS "badges" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS "yearsExperience" INTEGER,
ADD COLUMN IF NOT EXISTS "hourlyRate" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "location" TEXT,
ADD COLUMN IF NOT EXISTS "bio" TEXT,
ADD COLUMN IF NOT EXISTS "isAvailable" BOOLEAN DEFAULT true;

-- AlterTable - Add missing columns to Client
ALTER TABLE "Client" 
ADD COLUMN IF NOT EXISTS "phone" TEXT,
ADD COLUMN IF NOT EXISTS "profileImage" TEXT;

-- AlterTable - Add missing columns to Question
ALTER TABLE "Question" 
ADD COLUMN IF NOT EXISTS "helpText" TEXT,
ADD COLUMN IF NOT EXISTS "questionImage" TEXT;

-- AlterTable - Add missing columns to AnswerOption
ALTER TABLE "AnswerOption" 
ADD COLUMN IF NOT EXISTS "optionImage" TEXT,
ADD COLUMN IF NOT EXISTS "imageAlt" TEXT;

-- AlterTable - Add missing columns to Appointment
ALTER TABLE "Appointment" 
ADD COLUMN IF NOT EXISTS "duration" INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS "type" "AppointmentType" DEFAULT 'CONSULTATION',
ADD COLUMN IF NOT EXISTS "notes" TEXT,
ADD COLUMN IF NOT EXISTS "cancelReason" TEXT;

-- AlterTable - Add missing columns to Consultation
ALTER TABLE "Consultation" 
ADD COLUMN IF NOT EXISTS "startedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "endedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "videoRoomUrl" TEXT,
ADD COLUMN IF NOT EXISTS "recordingUrl" TEXT,
ADD COLUMN IF NOT EXISTS "notes" TEXT,
ADD COLUMN IF NOT EXISTS "recommendations" JSONB,
ADD COLUMN IF NOT EXISTS "followUpDate" TIMESTAMP(3);

-- AlterTable - Add missing columns to Review
ALTER TABLE "Review" 
ADD COLUMN IF NOT EXISTS "comment" TEXT,
ADD COLUMN IF NOT EXISTS "isPublished" BOOLEAN DEFAULT true;

-- AlterTable - Add missing columns to Quiz
ALTER TABLE "Quiz" 
ADD COLUMN IF NOT EXISTS "description" TEXT,
ADD COLUMN IF NOT EXISTS "category" TEXT,
ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS "order" INTEGER DEFAULT 0;

-- AlterTable - Add missing columns to QuizResponse
ALTER TABLE "QuizResponse" 
ADD COLUMN IF NOT EXISTS "completedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "startedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- AlterTable - Add missing columns to Answer
ALTER TABLE "Answer" 
ADD COLUMN IF NOT EXISTS "textAnswer" TEXT,
ADD COLUMN IF NOT EXISTS "numberAnswer" INTEGER;
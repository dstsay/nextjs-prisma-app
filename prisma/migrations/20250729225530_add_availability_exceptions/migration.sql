-- CreateTable
CREATE TABLE "AvailabilityException" (
    "id" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "type" TEXT NOT NULL,
    "startTime" TEXT,
    "endTime" TEXT,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AvailabilityException_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AvailabilityException_artistId_date_idx" ON "AvailabilityException"("artistId", "date");

-- AddForeignKey
ALTER TABLE "AvailabilityException" ADD CONSTRAINT "AvailabilityException_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "MakeupArtist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable: Update default appointment duration from 30 to 60 minutes
ALTER TABLE "Appointment" ALTER COLUMN "duration" SET DEFAULT 60;

-- Update existing appointments from 30 to 60 minutes
UPDATE "Appointment" SET "duration" = 60 WHERE "duration" = 30;
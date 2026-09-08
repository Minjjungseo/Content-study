-- CreateTable
CREATE TABLE "StudyAttachment" (
    "id" TEXT NOT NULL,
    "studyId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT,
    "fileSize" INTEGER,
    "extractedText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudyAttachment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "StudyAttachment" ADD CONSTRAINT "StudyAttachment_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "Study"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "Study" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "studyType" TEXT NOT NULL,
    "sourceName" TEXT,
    "url" TEXT,
    "imageUrl" TEXT,
    "memo" TEXT,
    "account" TEXT NOT NULL DEFAULT 'COMMON',
    "category" TEXT,
    "importance" TEXT NOT NULL DEFAULT 'MEDIUM',
    "tags" TEXT,
    "keyContent" TEXT,
    "applicableElements" TEXT,
    "oneThing" TEXT,
    "refHook" TEXT,
    "refPromise" TEXT,
    "refStructure" TEXT,
    "refEmotion" TEXT,
    "refVisual" TEXT,
    "refPayoff" TEXT,
    "refWhyItWorks" TEXT,
    "learnedWhat" TEXT,
    "learnedWhy" TEXT,
    "learnedWhere" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Study_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Idea" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "account" TEXT NOT NULL DEFAULT 'HEYELIA',
    "contentIP" TEXT,
    "coreMessage" TEXT,
    "memo" TEXT,
    "myPriority" TEXT NOT NULL DEFAULT 'P3',
    "aiPriority" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'IDEA',
    "shootDifficulty" TEXT NOT NULL DEFAULT 'MEDIUM',
    "needsShoot" BOOLEAN NOT NULL DEFAULT true,
    "hasExistingFootage" BOOLEAN NOT NULL DEFAULT false,
    "brandValue" TEXT NOT NULL DEFAULT 'MEDIUM',
    "sourceStudyId" TEXT,
    "oneThing" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Idea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyIdeaLink" (
    "id" TEXT NOT NULL,
    "studyId" TEXT NOT NULL,
    "ideaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudyIdeaLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Experiment" (
    "id" TEXT NOT NULL,
    "ideaId" TEXT NOT NULL,
    "oneThingToTest" TEXT,
    "hook" TEXT,
    "coreMessage" TEXT,
    "structureSteps" TEXT,
    "neededShooting" TEXT,
    "existingFootage" TEXT,
    "cta" TEXT,
    "thumbnailNote" TEXT,
    "thumbnailImageUrl" TEXT,
    "captionMemo" TEXT,
    "hypothesis" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Experiment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublishedContent" (
    "id" TEXT NOT NULL,
    "experimentId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "actualHook" TEXT,
    "actualThumbnailUrl" TEXT,
    "videoLength" INTEGER,
    "url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PublishedContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Performance" (
    "id" TEXT NOT NULL,
    "publishedContentId" TEXT NOT NULL,
    "views" INTEGER,
    "reach" INTEGER,
    "avgWatchTime" DOUBLE PRECISION,
    "retention3s" DOUBLE PRECISION,
    "completionRate" DOUBLE PRECISION,
    "likes" INTEGER,
    "comments" INTEGER,
    "saves" INTEGER,
    "shares" INTEGER,
    "profileVisits" INTEGER,
    "followsGained" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Performance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "experimentId" TEXT NOT NULL,
    "whatWentWell" TEXT,
    "whatWasLacking" TEXT,
    "unexpected" TEXT,
    "feelings" TEXT,
    "whatToChange" TEXT,
    "oneLearning" TEXT,
    "result" TEXT,
    "whatWeLearned" TEXT,
    "nextOneThing" TEXT,
    "nextExperimentNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlaybookRule" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'OTHER',
    "description" TEXT,
    "appliedAccounts" TEXT,
    "appliedContentIP" TEXT,
    "memo" TEXT,
    "status" TEXT NOT NULL DEFAULT 'CANDIDATE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlaybookRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlaybookEvidence" (
    "id" TEXT NOT NULL,
    "playbookRuleId" TEXT NOT NULL,
    "experimentId" TEXT NOT NULL,
    "reviewId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlaybookEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudyIdeaLink_studyId_ideaId_key" ON "StudyIdeaLink"("studyId", "ideaId");

-- CreateIndex
CREATE UNIQUE INDEX "Performance_publishedContentId_key" ON "Performance"("publishedContentId");

-- CreateIndex
CREATE UNIQUE INDEX "Review_experimentId_key" ON "Review"("experimentId");

-- CreateIndex
CREATE UNIQUE INDEX "PlaybookEvidence_playbookRuleId_experimentId_key" ON "PlaybookEvidence"("playbookRuleId", "experimentId");

-- AddForeignKey
ALTER TABLE "Idea" ADD CONSTRAINT "Idea_sourceStudyId_fkey" FOREIGN KEY ("sourceStudyId") REFERENCES "Study"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyIdeaLink" ADD CONSTRAINT "StudyIdeaLink_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "Study"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyIdeaLink" ADD CONSTRAINT "StudyIdeaLink_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "Idea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Experiment" ADD CONSTRAINT "Experiment_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "Idea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublishedContent" ADD CONSTRAINT "PublishedContent_experimentId_fkey" FOREIGN KEY ("experimentId") REFERENCES "Experiment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Performance" ADD CONSTRAINT "Performance_publishedContentId_fkey" FOREIGN KEY ("publishedContentId") REFERENCES "PublishedContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_experimentId_fkey" FOREIGN KEY ("experimentId") REFERENCES "Experiment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaybookEvidence" ADD CONSTRAINT "PlaybookEvidence_playbookRuleId_fkey" FOREIGN KEY ("playbookRuleId") REFERENCES "PlaybookRule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaybookEvidence" ADD CONSTRAINT "PlaybookEvidence_experimentId_fkey" FOREIGN KEY ("experimentId") REFERENCES "Experiment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaybookEvidence" ADD CONSTRAINT "PlaybookEvidence_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE SET NULL ON UPDATE CASCADE;

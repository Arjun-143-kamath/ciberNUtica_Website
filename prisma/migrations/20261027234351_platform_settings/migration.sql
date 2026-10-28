-- CreateTable
CREATE TABLE "PlatformSettings" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "isScoreboardFrozen" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PlatformSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "homeownerName" TEXT NOT NULL,
    "homeownerEmail" TEXT NOT NULL,
    "homeownerPhone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "roofType" TEXT,
    "damageType" TEXT,
    "notes" TEXT,
    "aiAnalysis" TEXT,
    "squareFootage" REAL,
    "quoteAmount" REAL,
    "quoteDetails" TEXT,
    "quoteSentAt" DATETIME,
    "quoteViewedAt" DATETIME,
    "quoteStatus" TEXT NOT NULL DEFAULT 'pending',
    "photoUrls" TEXT NOT NULL DEFAULT '[]'
);

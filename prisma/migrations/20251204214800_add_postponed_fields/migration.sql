-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Report" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobId" TEXT NOT NULL,
    "workSummary" TEXT NOT NULL,
    "photos" TEXT NOT NULL,
    "startTime" TEXT,
    "finishTime" TEXT,
    "requiresFollowUp" BOOLEAN NOT NULL DEFAULT false,
    "postponed" BOOLEAN NOT NULL DEFAULT false,
    "postponedDate" TEXT,
    "postponedReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Report_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Report" ("createdAt", "finishTime", "id", "jobId", "photos", "requiresFollowUp", "startTime", "workSummary") SELECT "createdAt", "finishTime", "id", "jobId", "photos", "requiresFollowUp", "startTime", "workSummary" FROM "Report";
DROP TABLE "Report";
ALTER TABLE "new_Report" RENAME TO "Report";
CREATE UNIQUE INDEX "Report_jobId_key" ON "Report"("jobId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

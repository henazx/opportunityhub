-- AlterTable
ALTER TABLE "opportunities" ADD COLUMN     "lastLinkCheck" TIMESTAMP(3),
ADD COLUMN     "linkResponseCode" INTEGER,
ADD COLUMN     "linkStatus" TEXT,
ADD COLUMN     "overallRank" INTEGER DEFAULT 0,
ADD COLUMN     "qualityScore" INTEGER DEFAULT 0,
ADD COLUMN     "trustScore" INTEGER DEFAULT 0;

-- CreateIndex
CREATE INDEX "opportunities_trustScore_idx" ON "opportunities"("trustScore");

-- CreateIndex
CREATE INDEX "opportunities_overallRank_idx" ON "opportunities"("overallRank");

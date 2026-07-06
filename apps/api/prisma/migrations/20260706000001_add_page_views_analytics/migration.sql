-- CreateTable
CREATE TABLE "page_views" (
    "id" UUID NOT NULL,
    "path" TEXT NOT NULL,
    "userId" UUID,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "referrer" TEXT,
    "countryCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "page_views_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "page_views_path_idx" ON "page_views"("path");

-- CreateIndex
CREATE INDEX "page_views_userId_idx" ON "page_views"("userId");

-- CreateIndex
CREATE INDEX "page_views_createdAt_idx" ON "page_views"("createdAt");

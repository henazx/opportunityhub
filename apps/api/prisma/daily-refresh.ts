import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function validateLink(url: string): Promise<{ status: string; responseCode: number }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const response = await fetch(url, {
      method: 'HEAD',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; OpportunityHub/1.0)' },
      signal: controller.signal,
      redirect: 'follow',
    });
    clearTimeout(timeout);
    return { status: response.ok ? 'valid' : 'broken', responseCode: response.status };
  } catch (error: any) {
    if (error.name === 'AbortError') return { status: 'timeout', responseCode: 0 };
    return { status: 'broken', responseCode: 0 };
  }
}

function calculateTrustScore(opp: any, linkStatus: string): number {
  let score = 50;
  if (linkStatus === 'valid') score += 30;
  else if (linkStatus === 'broken') score -= 20;
  else if (linkStatus === 'timeout') score += 5;
  if (opp.organization?.isVerified) score += 15;
  if (opp.applicationUrl) score += 10;
  if (opp.salaryMin && opp.salaryMax) score += 5;
  return Math.max(0, Math.min(100, score));
}

function calculateQualityScore(opp: any): number {
  let score = 0;
  if (opp.description.length > 500) score += 20;
  else if (opp.description.length > 200) score += 15;
  else if (opp.description.length > 50) score += 10;
  else score += 5;
  if (opp.summary) score += 10;
  if (opp.tags?.length > 0) score += Math.min(10, opp.tags.length * 3);
  if (opp.locations?.length > 0) score += 10;
  if (opp.applicationDeadline) score += 10;
  if (opp.salaryMin) score += 10;
  if (opp.organizationId) score += 10;
  if (opp.categoryId) score += 10;
  return Math.max(0, Math.min(100, score));
}

async function main() {
  const startTime = Date.now();
  console.log('🔄 OpportunityHub Ethiopia - Daily Refresh\n');

  // Step 1: Remove expired opportunities
  console.log('📅 Step 1: Removing expired opportunities...');
  const now = new Date();
  const expired = await prisma.opportunity.updateMany({
    where: {
      deletedAt: null,
      applicationDeadline: { not: null, lt: now },
    },
    data: { deletedAt: now, isActive: false },
  });
  console.log(`   Deactivated ${expired.count} expired opportunities\n`);

  // Step 2: Validate all active links
  console.log('🔗 Step 2: Validating links...');
  const opportunities = await prisma.opportunity.findMany({
    where: { deletedAt: null, isActive: true },
    include: { source: true, organization: true, category: true, tags: true, locations: true },
  });

  let valid = 0, broken = 0, timeout = 0;
  let trustSum = 0, qualitySum = 0;

  for (let i = 0; i < opportunities.length; i++) {
    const opp = opportunities[i];
    const url = opp.applicationUrl || opp.url;
    const progress = `[${i + 1}/${opportunities.length}]`;

    let linkStatus = 'unknown';
    let responseCode = 0;

    if (url) {
      process.stdout.write(`  ${progress} ${opp.title.substring(0, 50)}... `);
      const result = await validateLink(url);
      linkStatus = result.status;
      responseCode = result.responseCode;
      if (linkStatus === 'valid') valid++;
      else if (linkStatus === 'broken') broken++;
      else timeout++;
      console.log(linkStatus === 'valid' ? '✅' : linkStatus === 'broken' ? '❌' : '⏱️');
    }

    const trustScore = calculateTrustScore(opp, linkStatus);
    const qualityScore = calculateQualityScore(opp);
    const overallRank = Math.round((trustScore * 0.6) + (qualityScore * 0.4));

    trustSum += trustScore;
    qualitySum += qualityScore;

    await prisma.opportunity.update({
      where: { id: opp.id },
      data: {
        linkStatus,
        lastLinkCheck: now,
        linkResponseCode: responseCode,
        trustScore,
        qualityScore,
        overallRank,
      },
    });

    await new Promise(resolve => setTimeout(resolve, 300));
  }

  const duration = Math.round((Date.now() - startTime) / 1000);
  const avgTrust = Math.round(trustSum / opportunities.length) || 0;
  const avgQuality = Math.round(qualitySum / opportunities.length) || 0;

  console.log('\n' + '='.repeat(60));
  console.log('📋 DAILY REFRESH REPORT');
  console.log('='.repeat(60));
  console.log(`  Total processed:  ${opportunities.length}`);
  console.log(`  ✅ Valid links:    ${valid}`);
  console.log(`  ❌ Broken links:   ${broken}`);
  console.log(`  ⏱️  Timed out:     ${timeout}`);
  console.log(`  📅 Expired:        ${expired.count}`);
  console.log(`  ⭐ Avg Trust:      ${avgTrust}/100`);
  console.log(`  ⭐ Avg Quality:    ${avgQuality}/100`);
  console.log(`  ⏱️  Duration:       ${duration}s`);
  console.log('='.repeat(60));
  console.log('\n✅ Daily refresh complete!');
}

main()
  .catch((e) => { console.error('❌ Refresh failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());

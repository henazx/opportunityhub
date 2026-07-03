import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ValidationResult {
  id: string;
  title: string;
  url: string;
  status: string;
  responseCode: number;
  trustScore: number;
  qualityScore: number;
  overallRank: number;
  issues: string[];
}

async function validateLink(url: string): Promise<{ status: string; responseCode: number }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; OpportunityHub/1.0)',
      },
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

function getIssues(opp: any, linkStatus: string): string[] {
  const issues: string[] = [];
  if (linkStatus === 'broken') issues.push('❌ Link is broken');
  if (linkStatus === 'timeout') issues.push('⏱️ Link timed out');
  if (!opp.applicationUrl) issues.push('⚠️ No application URL');
  if (!opp.summary) issues.push('⚠️ Missing summary');
  if (!opp.applicationDeadline) issues.push('⚠️ No deadline');
  if (!opp.salaryMin) issues.push('⚠️ No salary info');
  if (!opp.organizationId) issues.push('⚠️ No organization');
  if (!opp.categoryId) issues.push('⚠️ No category');
  if (opp.description.length < 100) issues.push('⚠️ Short description');
  return issues;
}

async function main() {
  console.log('🔍 OpportunityHub Ethiopia - Link Validator & Scorer\n');

  const opportunities = await prisma.opportunity.findMany({
    where: { deletedAt: null, isActive: true },
    include: {
      source: true,
      organization: true,
      category: true,
      tags: true,
      locations: true,
    },
  });

  console.log(`Found ${opportunities.length} opportunities to validate\n`);

  const results: ValidationResult[] = [];

  for (const opp of opportunities) {
    const url = opp.applicationUrl || opp.url;
    let linkStatus = 'unknown';
    let responseCode = 0;

    if (url) {
      process.stdout.write(`  Checking: ${opp.title.substring(0, 50)}... `);
      const result = await validateLink(url);
      linkStatus = result.status;
      responseCode = result.responseCode;
      console.log(`${linkStatus} (${responseCode})`);
    }

    const trustScore = calculateTrustScore(opp, linkStatus);
    const qualityScore = calculateQualityScore(opp);
    const overallRank = Math.round((trustScore * 0.6) + (qualityScore * 0.4));
    const issues = getIssues(opp, linkStatus);

    await prisma.opportunity.update({
      where: { id: opp.id },
      data: {
        linkStatus,
        lastLinkCheck: new Date(),
        linkResponseCode: responseCode,
        trustScore,
        qualityScore,
        overallRank,
      },
    });

    results.push({
      id: opp.id,
      title: opp.title,
      url: url || '',
      status: linkStatus,
      responseCode,
      trustScore,
      qualityScore,
      overallRank,
      issues,
    });

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Sort by rank
  results.sort((a, b) => b.overallRank - a.overallRank);

  console.log('\n' + '='.repeat(80));
  console.log('📊 VALIDATION RESULTS');
  console.log('='.repeat(80));

  const valid = results.filter(r => r.status === 'valid').length;
  const broken = results.filter(r => r.status === 'broken').length;
  const timeout = results.filter(r => r.status === 'timeout').length;
  const unknown = results.filter(r => r.status === 'unknown').length;

  console.log(`\n✅ Valid: ${valid} | ❌ Broken: ${broken} | ⏱️ Timeout: ${timeout} | ❓ Unknown: ${unknown}`);
  console.log(`\n📈 Average Trust Score: ${Math.round(results.reduce((a, b) => a + b.trustScore, 0) / results.length)}`);
  console.log(`📈 Average Quality Score: ${Math.round(results.reduce((a, b) => a + b.qualityScore, 0) / results.length)}`);

  console.log('\n🏆 TOP RANKED OPPORTUNITIES:');
  console.log('-'.repeat(80));

  for (let i = 0; i < Math.min(10, results.length); i++) {
    const r = results[i];
    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`;
    console.log(`${medal} ${r.title}`);
    console.log(`   Rank: ${r.overallRank}/100 | Trust: ${r.trustScore} | Quality: ${r.qualityScore} | Status: ${r.status}`);
    if (r.issues.length > 0) {
      console.log(`   Issues: ${r.issues.join(', ')}`);
    }
    console.log('');
  }

  console.log('='.repeat(80));
}

main()
  .catch((error) => {
    console.error('❌ Validation failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

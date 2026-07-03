import { PrismaClient, OpportunityType } from '@prisma/client';
import * as cheerio from 'cheerio';

const prisma = new PrismaClient();

interface ScrapedJob {
  title: string;
  description: string;
  url: string;
  organization?: string;
  location?: string;
  deadline?: Date;
  type: string;
  source: string;
}

async function fetchEthioJobs(): Promise<ScrapedJob[]> {
  const jobs: ScrapedJob[] = [];

  try {
    console.log('  📡 Scraping EthioJobs.net...');
    const response = await fetch('https://www.ethiojobs.net/jobs-in-ethiopia/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: AbortSignal.timeout(20000),
    });

    if (!response.ok) {
      console.log(`  ⚠️  Status: ${response.status}`);
      return jobs;
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Try multiple selectors for job listings
    const jobSelectors = [
      '.job-listing',
      '.job-item',
      '.listing-item',
      'article',
      '.card',
      '[class*="job"]',
      '.entry',
    ];

    for (const selector of jobSelectors) {
      $(selector).each((_, el) => {
        const $el = $(el);
        const titleEl = $el.find('h2 a, h3 a, .title a, a[href*="job"], a[href*="vacancy"]').first();
        const title = titleEl.text().trim();
        let url = titleEl.attr('href') || '';

        if (!title || title.length < 5) return;

        // Fix relative URLs
        if (url && !url.startsWith('http')) {
          url = `https://www.ethiojobs.net${url}`;
        }

        const desc = $el.find('p, .description, .snippet, .summary').first().text().trim();
        const company = $el.find('.company, .employer, [class*="company"]').first().text().trim();
        const location = $el.find('.location, [class*="location"]').first().text().trim();

        if (title && url) {
          jobs.push({
            title: title.substring(0, 200),
            description: desc.substring(0, 2000) || `Job opening: ${title}`,
            url,
            organization: company || undefined,
            location: location || 'Addis Ababa, Ethiopia',
            source: 'EthioJobs',
            type: 'JOB',
          });
        }
      });

      if (jobs.length > 0) break;
    }

    console.log(`  ✅ EthioJobs: Found ${jobs.length} jobs`);
  } catch (error: any) {
    console.log(`  ❌ EthioJobs error: ${error.message}`);
  }

  return jobs;
}

async function fetchUNJobsEthiopia(): Promise<ScrapedJob[]> {
  const jobs: ScrapedJob[] = [];

  try {
    console.log('  📡 Scraping UN Jobs Ethiopia...');
    const response = await fetch('https://unjobs.org/countries/ethiopia', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html',
      },
      signal: AbortSignal.timeout(20000),
    });

    if (!response.ok) {
      console.log(`  ⚠️  Status: ${response.status}`);
      return jobs;
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    $('a[href*="/jobs/"], .job-title a, h2 a').each((_, el) => {
      const $el = $(el);
      const title = $el.text().trim();
      let url = $el.attr('href') || '';

      if (!title || title.length < 10) return;

      if (url && !url.startsWith('http')) {
        url = `https://unjobs.org${url}`;
      }

      const parent = $el.closest('.card, article, li, tr, div');
      const org = parent.find('.company, .organization, [class*="org"]').first().text().trim();

      jobs.push({
        title: title.substring(0, 200),
        description: `UN job opportunity in Ethiopia: ${title}`,
        url,
        organization: org || undefined,
        location: 'Ethiopia',
        source: 'UN Jobs',
        type: 'JOB',
      });
    });

    console.log(`  ✅ UN Jobs: Found ${jobs.length} jobs`);
  } catch (error: any) {
    console.log(`  ❌ UN Jobs error: ${error.message}`);
  }

  return jobs;
}

async function fetchReliefWebEthiopia(): Promise<ScrapedJob[]> {
  const jobs: ScrapedJob[] = [];

  try {
    console.log('  📡 Scraping ReliefWeb Ethiopia...');
    const response = await fetch('https://reliefweb.int/jobs?advanced-search=%28F5%29%20AND%20%28S1%29%20AND%20%28C36%29&format=json', {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0',
      },
      signal: AbortSignal.timeout(20000),
    });

    if (!response.ok) {
      console.log(`  ⚠️  Status: ${response.status}`);
      return jobs;
    }

    const data = await response.json();

    if (data.data) {
      for (const item of data.data) {
        const attrs = item.fields;
        if (attrs && attrs.title) {
          const desc = attrs.body ? attrs.body.replace(/<[^>]*>/g, '').substring(0, 2000) : '';
          const url = attrs.url?.[0]?.url || `https://reliefweb.int/jobs/${item.id}`;

          jobs.push({
            title: attrs.title.substring(0, 200),
            description: desc || `Humanitarian job in Ethiopia: ${attrs.title}`,
            url,
            organization: attrs.organization?.[0]?.name,
            source: 'ReliefWeb',
            type: 'JOB',
          });
        }
      }
    }

    console.log(`  ✅ ReliefWeb: Found ${jobs.length} jobs`);
  } catch (error: any) {
    console.log(`  ❌ ReliefWeb error: ${error.message}`);
  }

  return jobs;
}

async function importJobs(jobs: ScrapedJob[]) {
  const source = await prisma.source.findFirst({
    where: { name: 'EthioJobs' },
  });

  if (!source) {
    console.log('❌ No source found');
    return { imported: 0, skipped: 0, failed: 0 };
  }

  let imported = 0;
  let skipped = 0;
  let failed = 0;

  for (const job of jobs) {
    try {
      const existing = await prisma.opportunity.findFirst({
        where: { url: job.url },
      });

      if (existing) {
        skipped++;
        continue;
      }

      const slug = job.title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 200);

      const uniqueSlug = `${slug}-${Date.now()}-${Math.random().toString(36).substring(7)}`;

      let orgId: string | undefined;
      if (job.organization) {
        const orgSlug = job.organization
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '')
          .substring(0, 100);

        if (orgSlug) {
          const org = await prisma.organization.upsert({
            where: { slug: orgSlug },
            update: {},
            create: {
              name: job.organization,
              slug: orgSlug,
              isVerified: false,
            },
          });
          orgId = org.id;
        }
      }

      let locationId: string | undefined;
      if (job.location) {
        const locSlug = job.location
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '')
          .substring(0, 100);

        if (locSlug) {
          const loc = await prisma.location.upsert({
            where: { slug: locSlug },
            update: {},
            create: {
              name: job.location,
              slug: locSlug,
              country: job.location.includes('Ethiopia') ? 'Ethiopia' : 'Global',
              countryCode: 'ET',
            },
          });
          locationId = loc.id;
        }
      }

      await prisma.opportunity.create({
        data: {
          title: job.title,
          slug: uniqueSlug,
          description: job.description,
          type: job.type as OpportunityType,
          url: job.url,
          applicationUrl: job.url,
          applicationDeadline: job.deadline,
          sourceId: source.id,
          organizationId: orgId,
          isRemote: job.type === 'REMOTE_WORK',
          importedAt: new Date(),
          lastCheckedAt: new Date(),
        },
      });

      imported++;
    } catch (error: any) {
      failed++;
    }
  }

  await prisma.source.update({
    where: { id: source.id },
    data: {
      totalImported: { increment: imported },
      totalFailed: { increment: failed },
      lastRunAt: new Date(),
      lastSuccessAt: new Date(),
    },
  }).catch(() => {});

  return { imported, skipped, failed };
}

async function main() {
  console.log('🔍 OpportunityHub Ethiopia - Live Job Collector\n');
  console.log('Fetching real opportunities from live sources...\n');

  const allJobs: ScrapedJob[] = [];

  const [ethioJobs, unJobs, reliefWeb] = await Promise.all([
    fetchEthioJobs(),
    fetchUNJobsEthiopia(),
    fetchReliefWebEthiopia(),
  ]);

  allJobs.push(...ethioJobs, ...unJobs, ...reliefWeb);

  console.log(`\n📊 Total live jobs found: ${allJobs.length}\n`);

  if (allJobs.length > 0) {
    console.log('💾 Importing to database...\n');
    const result = await importJobs(allJobs);

    console.log(`\n🎉 Import complete!`);
    console.log(`   ✅ Imported: ${result.imported}`);
    console.log(`   ⏭️  Skipped: ${result.skipped}`);
    console.log(`   ❌ Failed: ${result.failed}`);
  } else {
    console.log('ℹ️  No live jobs could be scraped right now.');
    console.log('    The platform already has Ethiopian opportunities from the seed data.');
    console.log('    You can run this script again later to fetch new listings.\n');
  }

  // Show total opportunities in database
  const total = await prisma.opportunity.count({ where: { deletedAt: null } });
  console.log(`\n📈 Total opportunities in database: ${total}`);
}

main()
  .catch((error) => {
    console.error('❌ Collector failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

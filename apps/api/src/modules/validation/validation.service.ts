import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface ValidationResult {
  opportunityId: string;
  url: string;
  status: 'valid' | 'broken' | 'timeout' | 'unknown';
  responseCode?: number;
  trustScore: number;
  qualityScore: number;
  overallRank: number;
  issues: string[];
}

@Injectable()
export class ValidationService {
  private readonly logger = new Logger(ValidationService.name);

  constructor(private prisma: PrismaService) {}

  async validateLink(url: string): Promise<{ status: string; responseCode: number }> {
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

      return {
        status: response.ok ? 'valid' : 'broken',
        responseCode: response.status,
      };
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return { status: 'timeout', responseCode: 0 };
      }
      return { status: 'broken', responseCode: 0 };
    }
  }

  async validateOpportunity(opportunityId: string): Promise<ValidationResult> {
    const opportunity = await this.prisma.opportunity.findUnique({
      where: { id: opportunityId },
      include: {
        source: true,
        organization: true,
        category: true,
        tags: true,
        locations: true,
      },
    });

    if (!opportunity) {
      throw new Error('Opportunity not found');
    }

    const url = opportunity.applicationUrl || opportunity.url;
    let linkStatus = 'unknown';
    let responseCode = 0;

    if (url) {
      const result = await this.validateLink(url);
      linkStatus = result.status;
      responseCode = result.responseCode;
    }

    const trustScore = this.calculateTrustScore(opportunity, linkStatus, responseCode);
    const qualityScore = this.calculateQualityScore(opportunity);
    const overallRank = Math.round((trustScore * 0.6) + (qualityScore * 0.4));

    // Update opportunity with scores
    await this.prisma.opportunity.update({
      where: { id: opportunityId },
      data: {
        linkStatus,
        lastLinkCheck: new Date(),
        linkResponseCode: responseCode,
        trustScore,
        qualityScore,
        overallRank,
      },
    });

    return {
      opportunityId,
      url: url || '',
      status: linkStatus as any,
      responseCode,
      trustScore,
      qualityScore,
      overallRank,
      issues: this.getIssues(opportunity, linkStatus),
    };
  }

  async validateAllOpportunities(): Promise<{ validated: number; valid: number; broken: number }> {
    const opportunities = await this.prisma.opportunity.findMany({
      where: { deletedAt: null, isActive: true },
      select: { id: true },
    });

    let valid = 0;
    let broken = 0;

    // Validate in batches of 5
    for (let i = 0; i < opportunities.length; i += 5) {
      const batch = opportunities.slice(i, i + 5);
      const results = await Promise.all(
        batch.map(opp => this.validateOpportunity(opp.id).catch(() => null))
      );

      for (const result of results) {
        if (result) {
          if (result.status === 'valid') valid++;
          else broken++;
        }
      }

      // Small delay between batches
      if (i + 5 < opportunities.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    this.logger.log(`Validated ${opportunities.length} opportunities: ${valid} valid, ${broken} broken`);

    return { validated: opportunities.length, valid, broken };
  }

  async getValidationDashboard() {
    const [total, valid, broken, unknown, recentlyChecked] = await Promise.all([
      this.prisma.opportunity.count({ where: { deletedAt: null, isActive: true } }),
      this.prisma.opportunity.count({ where: { linkStatus: 'valid', deletedAt: null } }),
      this.prisma.opportunity.count({ where: { linkStatus: 'broken', deletedAt: null } }),
      this.prisma.opportunity.count({ where: { linkStatus: null, deletedAt: null } }),
      this.prisma.opportunity.findMany({
        where: { lastLinkCheck: { not: null }, deletedAt: null },
        orderBy: { lastLinkCheck: 'desc' },
        take: 10,
        select: {
          id: true,
          title: true,
          linkStatus: true,
          trustScore: true,
          lastLinkCheck: true,
          organization: { select: { name: true } },
        },
      }),
    ]);

    return {
      stats: { total, valid, broken, unknown },
      recentlyChecked,
      validPercentage: total > 0 ? Math.round((valid / total) * 100) : 0,
    };
  }

  async getDeadlineReport() {
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const [expired, expiringSoon, expiringThisWeek, expiringThisMonth, noDeadline] = await Promise.all([
      this.prisma.opportunity.count({
        where: { applicationDeadline: { lt: now }, deletedAt: null, isActive: true },
      }),
      this.prisma.opportunity.count({
        where: { applicationDeadline: { gte: now, lte: threeDaysFromNow }, deletedAt: null, isActive: true },
      }),
      this.prisma.opportunity.count({
        where: { applicationDeadline: { gt: threeDaysFromNow, lte: sevenDaysFromNow }, deletedAt: null, isActive: true },
      }),
      this.prisma.opportunity.count({
        where: { applicationDeadline: { gt: sevenDaysFromNow, lte: thirtyDaysFromNow }, deletedAt: null, isActive: true },
      }),
      this.prisma.opportunity.count({
        where: { applicationDeadline: null, deletedAt: null, isActive: true },
      }),
    ]);

    const urgentDeadlines = await this.prisma.opportunity.findMany({
      where: {
        applicationDeadline: { gte: now, lte: sevenDaysFromNow },
        deletedAt: null,
        isActive: true,
      },
      orderBy: { applicationDeadline: 'asc' },
      take: 20,
      include: {
        organization: { select: { name: true, logoUrl: true } },
        category: { select: { name: true } },
      },
    });

    return {
      stats: { expired, expiringSoon, expiringThisWeek, expiringThisMonth, noDeadline },
      urgentDeadlines: urgentDeadlines.map(opp => ({
        ...opp,
        daysLeft: opp.applicationDeadline
          ? Math.max(0, Math.ceil((opp.applicationDeadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
          : null,
        isUrgent: opp.applicationDeadline
          ? opp.applicationDeadline.getTime() - now.getTime() < 3 * 24 * 60 * 60 * 1000
          : false,
      })),
    };
  }

  async getRecommendations(userId?: string) {
    const now = new Date();

    // Get top opportunities by rank
    const topRanked = await this.prisma.opportunity.findMany({
      where: {
        deletedAt: null,
        isActive: true,
        overallRank: { gt: 0 },
        OR: [
          { applicationDeadline: null },
          { applicationDeadline: { gte: now } },
        ],
      },
      orderBy: { overallRank: 'desc' },
      take: 10,
      include: {
        organization: { select: { name: true, logoUrl: true, isVerified: true } },
        category: { select: { name: true, slug: true } },
        tags: { include: { tag: { select: { name: true } } } },
        locations: { include: { location: { select: { name: true, country: true } } } },
      },
    });

    // Get fresh opportunities (recently imported)
    const freshOpps = await this.prisma.opportunity.findMany({
      where: {
        deletedAt: null,
        isActive: true,
        OR: [
          { applicationDeadline: null },
          { applicationDeadline: { gte: now } },
        ],
      },
      orderBy: { importedAt: 'desc' },
      take: 10,
      include: {
        organization: { select: { name: true, logoUrl: true, isVerified: true } },
        category: { select: { name: true, slug: true } },
        tags: { include: { tag: { select: { name: true } } } },
        locations: { include: { location: { select: { name: true, country: true } } } },
      },
    });

    // Get deadline-sensitive recommendations
    const deadlineOpps = await this.prisma.opportunity.findMany({
      where: {
        deletedAt: null,
        isActive: true,
        applicationDeadline: { gte: now },
      },
      orderBy: { applicationDeadline: 'asc' },
      take: 10,
      include: {
        organization: { select: { name: true, logoUrl: true, isVerified: true } },
        category: { select: { name: true, slug: true } },
      },
    });

    // Get verified organization opportunities
    const verifiedOpps = await this.prisma.opportunity.findMany({
      where: {
        deletedAt: null,
        isActive: true,
        organization: { isVerified: true },
        OR: [
          { applicationDeadline: null },
          { applicationDeadline: { gte: now } },
        ],
      },
      orderBy: { trustScore: 'desc' },
      take: 10,
      include: {
        organization: { select: { name: true, logoUrl: true, isVerified: true } },
        category: { select: { name: true, slug: true } },
        tags: { include: { tag: { select: { name: true } } } },
      },
    });

    // Personalized recommendations if user is logged in
    let personalized: any[] = [];
    if (userId) {
      const [bookmarks, searches, views] = await Promise.all([
        this.prisma.bookmark.findMany({
          where: { userId },
          include: { opportunity: { select: { categoryId: true, type: true } } },
          take: 20,
        }),
        this.prisma.searchHistory.findMany({
          where: { userId },
          orderBy: { searchedAt: 'desc' },
          take: 10,
        }),
        this.prisma.opportunityView.findMany({
          where: { userId },
          include: { opportunity: { select: { categoryId: true, type: true } } },
          take: 20,
        }),
      ]);

      // Extract user preferences
      const preferredCategories = [...new Set([
        ...bookmarks.map(b => b.opportunity.categoryId).filter(Boolean),
        ...views.map(v => v.opportunity.categoryId).filter(Boolean),
      ])].slice(0, 3);

      const preferredTypes = [...new Set([
        ...bookmarks.map(b => b.opportunity.type),
        ...views.map(v => v.opportunity.type),
      ])].slice(0, 3);

      if (preferredCategories.length > 0 || preferredTypes.length > 0) {
        const categoryFilter = preferredCategories.filter(Boolean) as string[];
        personalized = await this.prisma.opportunity.findMany({
          where: {
            deletedAt: null,
            isActive: true,
            OR: [
              { applicationDeadline: null },
              { applicationDeadline: { gte: now } },
            ],
            AND: [
              ...(categoryFilter.length > 0 ? [{ categoryId: { in: categoryFilter } }] : []),
              ...(preferredTypes.length > 0 ? [{ type: { in: preferredTypes as any } }] : []),
            ],
          },
          orderBy: { overallRank: 'desc' },
          take: 10,
          include: {
            organization: { select: { name: true, logoUrl: true, isVerified: true } },
            category: { select: { name: true, slug: true } },
            tags: { include: { tag: { select: { name: true } } } },
          },
        });
      }
    }

    return {
      topRanked,
      freshOpps,
      deadlineOpps: deadlineOpps.map(opp => ({
        ...opp,
        daysLeft: opp.applicationDeadline
          ? Math.max(0, Math.ceil((opp.applicationDeadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
          : null,
      })),
      verifiedOpps,
      personalized,
    };
  }

  private calculateTrustScore(opportunity: any, linkStatus: string, responseCode: number): number {
    let score = 50; // Base score

    // Link validity (up to 30 points)
    if (linkStatus === 'valid') score += 30;
    else if (linkStatus === 'broken') score -= 20;
    else if (linkStatus === 'timeout') score += 5;

    // Organization verification (up to 15 points)
    if (opportunity.organization?.isVerified) score += 15;

    // Has application URL (up to 10 points)
    if (opportunity.applicationUrl) score += 10;

    // Has salary info (up to 5 points)
    if (opportunity.salaryMin && opportunity.salaryMax) score += 5;

    return Math.max(0, Math.min(100, score));
  }

  private calculateQualityScore(opportunity: any): number {
    let score = 0;

    // Description length (up to 20 points)
    if (opportunity.description.length > 500) score += 20;
    else if (opportunity.description.length > 200) score += 15;
    else if (opportunity.description.length > 50) score += 10;
    else score += 5;

    // Has summary (up to 10 points)
    if (opportunity.summary) score += 10;

    // Has tags (up to 10 points)
    if (opportunity.tags?.length > 0) score += Math.min(10, opportunity.tags.length * 3);

    // Has locations (up to 10 points)
    if (opportunity.locations?.length > 0) score += 10;

    // Has deadline (up to 10 points)
    if (opportunity.applicationDeadline) score += 10;

    // Has salary (up to 10 points)
    if (opportunity.salaryMin) score += 10;

    // Has organization (up to 10 points)
    if (opportunity.organizationId) score += 10;

    // Has category (up to 10 points)
    if (opportunity.categoryId) score += 10;

    return Math.max(0, Math.min(100, score));
  }

  private getIssues(opportunity: any, linkStatus: string): string[] {
    const issues: string[] = [];

    if (linkStatus === 'broken') issues.push('Link is broken or unreachable');
    if (linkStatus === 'timeout') issues.push('Link timed out');
    if (!opportunity.applicationUrl) issues.push('No application URL provided');
    if (!opportunity.summary) issues.push('Missing summary');
    if (!opportunity.applicationDeadline) issues.push('No deadline specified');
    if (!opportunity.salaryMin && !opportunity.salaryMax) issues.push('No salary information');
    if (!opportunity.organizationId) issues.push('No organization linked');
    if (!opportunity.categoryId) issues.push('No category assigned');
    if (opportunity.tags?.length === 0) issues.push('No tags assigned');
    if (opportunity.description.length < 100) issues.push('Description is too short');

    return issues;
  }
}

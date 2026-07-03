import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CollectorResult, NormalizedOpportunity } from '../../common/interfaces/collector.interface';

export interface CollectorPlugin {
  name: string;
  collect(source: any): Promise<NormalizedOpportunity[]>;
}

@Injectable()
export class CollectorsService {
  private readonly logger = new Logger(CollectorsService.name);
  private collectors: Map<string, CollectorPlugin> = new Map();

  constructor(private prisma: PrismaService) {}

  registerCollector(collector: CollectorPlugin) {
    this.collectors.set(collector.name, collector);
    this.logger.log(`Registered collector: ${collector.name}`);
  }

  getCollector(name: string): CollectorPlugin | undefined {
    return this.collectors.get(name);
  }

  getAvailableCollectors(): string[] {
    return Array.from(this.collectors.keys());
  }

  async runCollector(sourceId: string): Promise<CollectorResult> {
    const source = await this.prisma.source.findUnique({ where: { id: sourceId } });
    if (!source) {
      throw new Error(`Source not found: ${sourceId}`);
    }

    const collector = this.collectors.get(source.collectorType);
    if (!collector) {
      throw new Error(`Collector not found: ${source.collectorType}`);
    }

    const run = await this.prisma.collectorRun.create({
      data: {
        sourceId,
        status: 'RUNNING',
        startedAt: new Date(),
      },
    });

    const startTime = Date.now();

    try {
      await this.prisma.source.update({
        where: { id: sourceId },
        data: { status: 'ACTIVE', lastRunAt: new Date() },
      });

      const opportunities = await collector.collect(source);
      const duration = Date.now() - startTime;

      let itemsImported = 0;
      let itemsFailed = 0;
      const errors: string[] = [];

      for (const opp of opportunities) {
        try {
          await this.importOpportunity(opp, sourceId);
          itemsImported++;
        } catch (error) {
          itemsFailed++;
          errors.push(error.message);
        }
      }

      await this.prisma.collectorRun.update({
        where: { id: run.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          duration,
          itemsFound: opportunities.length,
          itemsImported,
          itemsFailed,
          errors: errors.length > 0 ? errors : undefined,
        },
      });

      await this.prisma.source.update({
        where: { id: sourceId },
        data: {
          totalImported: { increment: itemsImported },
          totalFailed: { increment: itemsFailed },
          lastSuccessAt: new Date(),
        },
      });

      this.logger.log(`Collector completed for source ${sourceId}: ${itemsImported} imported, ${itemsFailed} failed`);

      return {
        success: true,
        itemsFound: opportunities.length,
        itemsImported,
        itemsFailed,
        errors,
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;

      await this.prisma.collectorRun.update({
        where: { id: run.id },
        data: {
          status: 'FAILED',
          completedAt: new Date(),
          duration,
          errors: [error.message],
        },
      });

      await this.prisma.source.update({
        where: { id: sourceId },
        data: {
          status: 'ERROR',
          lastErrorAt: new Date(),
          lastError: error.message,
        },
      });

      this.logger.error(`Collector failed for source ${sourceId}: ${error.message}`);

      return {
        success: false,
        itemsFound: 0,
        itemsImported: 0,
        itemsFailed: 0,
        errors: [error.message],
        duration,
      };
    }
  }

  async runAllActiveCollectors(): Promise<Map<string, CollectorResult>> {
    const results = new Map<string, CollectorResult>();

    const activeSources = await this.prisma.source.findMany({
      where: { status: 'ACTIVE', isActive: true, deletedAt: null },
    });

    for (const source of activeSources) {
      try {
        const result = await this.runCollector(source.id);
        results.set(source.id, result);
      } catch (error) {
        this.logger.error(`Failed to run collector for source ${source.id}: ${error.message}`);
      }
    }

    return results;
  }

  private async importOpportunity(opp: NormalizedOpportunity, sourceId: string) {
    const slug = opp.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const existing = await this.prisma.opportunity.findFirst({
      where: {
        sourceId,
        title: { contains: opp.title, mode: 'insensitive' },
      },
    });

    if (existing) {
      await this.prisma.opportunity.update({
        where: { id: existing.id },
        data: { lastCheckedAt: new Date() },
      });
      return existing;
    }

    return this.prisma.opportunity.create({
      data: {
        title: opp.title,
        slug: `${slug}-${Date.now()}`,
        description: opp.description,
        type: opp.type as any,
        url: opp.url,
        applicationUrl: opp.applicationUrl,
        applicationDeadline: opp.deadline,
        startDate: opp.startDate,
        endDate: opp.endDate,
        salaryMin: opp.salary?.min,
        salaryMax: opp.salary?.max,
        salaryCurrency: opp.salary?.currency,
        isRemote: opp.isRemote || false,
        sourceId,
        importedAt: new Date(),
      },
    });
  }
}

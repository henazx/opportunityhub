export interface CollectorResult {
  success: boolean;
  itemsFound: number;
  itemsImported: number;
  itemsFailed: number;
  errors: string[];
  duration: number;
}

export interface NormalizedOpportunity {
  title: string;
  description: string;
  url?: string;
  applicationUrl?: string;
  type: string;
  organization?: string;
  location?: string[];
  tags?: string[];
  category?: string;
  salary?: { min?: number; max?: number; currency?: string };
  deadline?: Date;
  startDate?: Date;
  endDate?: Date;
  isRemote?: boolean;
  metadata?: Record<string, unknown>;
}

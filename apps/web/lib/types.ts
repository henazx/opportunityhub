export type OpportunityType = 'JOB' | 'SCHOLARSHIP' | 'INTERNSHIP' | 'GRANT' | 'COMPETITION' | 'TRAINING' | 'EVENT' | 'VOLUNTEER' | 'REMOTE_WORK';

export interface Opportunity {
  id: string;
  title: string;
  slug: string;
  description: string;
  summary?: string;
  type: OpportunityType;
  url?: string;
  applicationUrl?: string;
  applicationDeadline?: string;
  startDate?: string;
  endDate?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  isRemote: boolean;
  isFeatured: boolean;
  viewCount: number;
  applyCount: number;
  importedAt: string;
  organization?: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string;
    isVerified?: boolean;
  };
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  tags?: Array<{
    tag: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
  locations?: Array<{
    location: {
      id: string;
      name: string;
      country: string;
      city?: string;
    };
  }>;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface SearchFilters {
  query?: string;
  type?: OpportunityType;
  categoryId?: string;
  locationId?: string;
  isRemote?: boolean;
  page?: number;
  limit?: number;
}

export const OPPORTUNITY_TYPE_LABELS: Record<string, string> = {
  JOB: 'Job',
  SCHOLARSHIP: 'Scholarship',
  INTERNSHIP: 'Internship',
  GRANT: 'Grant',
  COMPETITION: 'Competition',
  TRAINING: 'Training',
  EVENT: 'Event',
  VOLUNTEER: 'Volunteer',
  REMOTE_WORK: 'Remote Work',
};

export const OPPORTUNITY_TYPE_COLORS: Record<string, string> = {
  JOB: 'bg-blue-100 text-blue-800',
  SCHOLARSHIP: 'bg-purple-100 text-purple-800',
  INTERNSHIP: 'bg-green-100 text-green-800',
  GRANT: 'bg-yellow-100 text-yellow-800',
  COMPETITION: 'bg-red-100 text-red-800',
  TRAINING: 'bg-indigo-100 text-indigo-800',
  EVENT: 'bg-pink-100 text-pink-800',
  VOLUNTEER: 'bg-teal-100 text-teal-800',
  REMOTE_WORK: 'bg-cyan-100 text-cyan-800',
};

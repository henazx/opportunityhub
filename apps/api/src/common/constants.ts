export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export const CACHE_TTL = {
  SHORT: 60,
  MEDIUM: 300,
  LONG: 3600,
} as const;

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

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrator',
  MODERATOR: 'Moderator',
  ORGANIZATION: 'Organization',
  RECRUITER: 'Recruiter',
  USER: 'User',
};

import { PAGINATION_DEFAULTS } from './constants';

export function calculatePagination(page: number, limit: number, total: number) {
  const validPage = Math.max(1, page);
  const validLimit = Math.min(Math.max(1, limit), PAGINATION_DEFAULTS.MAX_LIMIT);
  const totalPages = Math.ceil(total / validLimit);

  return {
    total,
    page: validPage,
    limit: validLimit,
    totalPages,
    hasNext: validPage < totalPages,
    hasPrevious: validPage > 1,
  };
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function sanitizeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

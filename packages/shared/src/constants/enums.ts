export enum UserRole {
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
  ORGANIZATION = 'ORGANIZATION',
  RECRUITER = 'RECRUITER',
  USER = 'USER',
}

export enum OpportunityType {
  JOB = 'JOB',
  SCHOLARSHIP = 'SCHOLARSHIP',
  INTERNSHIP = 'INTERNSHIP',
  GRANT = 'GRANT',
  COMPETITION = 'COMPETITION',
  TRAINING = 'TRAINING',
  EVENT = 'EVENT',
  VOLUNTEER = 'VOLUNTEER',
  REMOTE_WORK = 'REMOTE_WORK',
}

export enum SourceStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ERROR = 'ERROR',
  PENDING = 'PENDING',
}

export enum CollectorStatus {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum NotificationType {
  IN_APP = 'IN_APP',
  EMAIL = 'EMAIL',
  PUSH = 'PUSH',
  TELEGRAM = 'TELEGRAM',
  SMS = 'SMS',
}

export enum NotificationStatus {
  UNREAD = 'UNREAD',
  READ = 'READ',
  ARCHIVED = 'ARCHIVED',
}

export enum BookmarkFolder {
  DEFAULT = 'DEFAULT',
  INTERESTED = 'INTERESTED',
  APPLIED = 'APPLIED',
  SAVED_LATER = 'SAVED_LATER',
}

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  IMPORT = 'IMPORT',
  EXPORT = 'EXPORT',
  ADMIN_ACTION = 'ADMIN_ACTION',
}

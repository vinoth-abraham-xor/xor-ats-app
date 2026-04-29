// User Types
export type UserRole = 'TMG' | 'MANAGER' | 'HR' | 'EMPLOYEE';

export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

// Bench Resource Types
export type BenchStatus = 'AVAILABLE' | 'IN_INTERVIEW' | 'ALLOCATED' | 'UNAVAILABLE' | 'ARCHIVED';

export interface Skill {
  name: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
}

export interface BenchResource {
  id: string;
  name: string;
  email: string;
  phone: string;
  designation: string;
  experience: number;
  skills: Skill[];
  status: BenchStatus;
  availability: string;
  location: string;
  preferredLocation: string[];
  noticePeriod: number;
  domain?: string;
  resumeUrl?: string;
  resume?: string; // Alias for resumeUrl
  notes?: string;
  archivedAt?: string;
  archiveReason?: string;
  archivedBy?: string;
  createdAt: string;
  updatedAt: string;
}

// Job Requirement Types (IATS Spec)
export type RequirementStatus =
  | 'DRAFT'
  | 'OPEN'
  | 'ON_HOLD'
  | 'CLOSED_FILLED'
  | 'CLOSED_CANCELLED';

export type RequirementPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface JobRequirement {
  id: string;
  title: string;
  description: string;
  skills: string[];
  experience: {
    min: number;
    max: number;
  };
  positions: number;
  location: string;
  projectInfo: string;
  status: RequirementStatus;
  priority: RequirementPriority;
  interviewPipeline?: string[]; // Custom interview stages for this requirement (e.g., ['AI_SCREENING', 'INTERVIEW_L1', 'HR_ROUND'])
  holdReason?: string;
  holdBy?: string;
  holdAt?: string;
  reviewDate?: string;
  deadline?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Application Types (IATS Spec - Unified for Assigned & Self-Apply)
export type ApplicationSource = 'ASSIGNED' | 'SELF_APPLY';

export type ApplicationStatus =
  | 'ASSIGNED'
  | 'APPLIED'
  | 'SHORTLISTED'
  | 'AI_SCREENING'
  | 'INTERVIEW_L1'
  | 'INTERVIEW_L2'
  | 'HR_ROUND'
  | 'SELECTED'
  | 'ONBOARDING'
  | 'COMPLETED'
  | 'REJECTED'
  | 'WITHDRAWN'
  | 'ON_HOLD';

export interface Application {
  id: string;
  requirementId: string;
  employeeId: string;
  source: ApplicationSource;
  status: ApplicationStatus;
  currentStage: string;
  aiScore?: number;
  acceptedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  holdReason?: string;
  holdBy?: string;
  holdAt?: string;
  reviewDate?: string;
  applicationNote?: string;
  createdAt: string;
  updatedAt: string;
}

// Interview Stage Types
export type InterviewOutcome = 'PASS' | 'FAIL' | 'HOLD' | 'PENDING';

export interface InterviewStage {
  id: string;
  applicationId: string;
  name: string;
  sequence: number;
  interviewer?: string;
  scheduledAt?: string;
  completedAt?: string;
  outcome: InterviewOutcome;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
}

// Audit Trail Types
export interface AuditEvent {
  id: string;
  entityType: 'REQUIREMENT' | 'APPLICATION' | 'INTERVIEW' | 'USER';
  entityId: string;
  fromStatus?: string;
  toStatus: string;
  actorRole: UserRole;
  actorId: string;
  actorName: string;
  reason?: string;
  timestamp: string;
}

// Notification Types
export type NotificationType =
  | 'ASSIGNMENT'
  | 'APPLICATION'
  | 'SHORTLIST'
  | 'REJECTION'
  | 'HOLD'
  | 'RESUME'
  | 'INTERVIEW_SCHEDULE'
  | 'DECISION';

export interface Notification {
  id: string;
  type: NotificationType;
  recipientId: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

// Login Types
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

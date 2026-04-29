import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { calculateAIScore } from '@/utils/aiRanking';
import type {
  User,
  BenchResource,
  JobRequirement,
  Application,
  ApplicationStatus,
  InterviewStage,
  AuditEvent,
  Notification,
  AuthState
} from '@/types';

// Initial seed data
// All users have password: password (except admin/admin shortcut)
const seedUsers: User[] = [
  {
    id: '1',
    email: 'admin@xoriant.com',
    name: 'Admin',
    role: 'TMG',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    email: 'Archana.Hubballi@Xoriant.Com',
    name: 'Archana Hubballi',
    role: 'TMG',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    email: 'PankajK.Jain@Xoriant.Com',
    name: 'Pankaj K. Jain',
    role: 'MANAGER',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    email: 'Jaydeep.Rijiya@Xoriant.Com',
    name: 'Jaydeep Rijiya',
    role: 'HR',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const seedBenchResources: BenchResource[] = [
  {
    id: 'bench-1',
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@xoriant.com',
    phone: '+91-9876543210',
    designation: 'Senior Full Stack Developer',
    experience: 5,
    skills: [
      { name: 'React', level: 'EXPERT' },
      { name: 'Node.js', level: 'ADVANCED' },
      { name: 'TypeScript', level: 'ADVANCED' },
      { name: 'MongoDB', level: 'INTERMEDIATE' },
    ],
    status: 'AVAILABLE',
    availability: '2024-02-01',
    location: 'Pune',
    preferredLocation: ['Pune', 'Mumbai', 'Bangalore'],
    noticePeriod: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'bench-2',
    name: 'Priya Sharma',
    email: 'priya.sharma@xoriant.com',
    phone: '+91-9876543211',
    designation: 'Python Backend Developer',
    experience: 4,
    skills: [
      { name: 'Python', level: 'EXPERT' },
      { name: 'Django', level: 'ADVANCED' },
      { name: 'PostgreSQL', level: 'ADVANCED' },
      { name: 'REST API', level: 'ADVANCED' },
    ],
    status: 'AVAILABLE',
    availability: '2024-02-15',
    location: 'Bangalore',
    preferredLocation: ['Bangalore', 'Hyderabad'],
    noticePeriod: 15,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'bench-3',
    name: 'Amit Patel',
    email: 'amit.patel@xoriant.com',
    phone: '+91-9876543212',
    designation: 'DevOps Engineer',
    experience: 6,
    skills: [
      { name: 'Docker', level: 'EXPERT' },
      { name: 'Kubernetes', level: 'EXPERT' },
      { name: 'AWS', level: 'ADVANCED' },
      { name: 'Terraform', level: 'ADVANCED' },
    ],
    status: 'IN_INTERVIEW',
    availability: '2024-01-20',
    location: 'Mumbai',
    preferredLocation: ['Mumbai', 'Pune'],
    noticePeriod: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'bench-4',
    name: 'Sneha Desai',
    email: 'sneha.desai@xoriant.com',
    phone: '+91-9876543213',
    designation: 'UI/UX Designer',
    experience: 3,
    skills: [
      { name: 'Figma', level: 'EXPERT' },
      { name: 'Adobe XD', level: 'ADVANCED' },
      { name: 'HTML/CSS', level: 'ADVANCED' },
      { name: 'React', level: 'INTERMEDIATE' },
    ],
    status: 'AVAILABLE',
    availability: '2024-02-10',
    location: 'Pune',
    preferredLocation: ['Pune', 'Mumbai'],
    noticePeriod: 30,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'bench-5',
    name: 'Karthik Reddy',
    email: 'karthik.reddy@xoriant.com',
    phone: '+91-9876543214',
    designation: 'Java Backend Developer',
    experience: 7,
    skills: [
      { name: 'Java', level: 'EXPERT' },
      { name: 'Spring Boot', level: 'EXPERT' },
      { name: 'Microservices', level: 'ADVANCED' },
      { name: 'MySQL', level: 'ADVANCED' },
    ],
    status: 'AVAILABLE',
    availability: '2024-01-25',
    location: 'Hyderabad',
    preferredLocation: ['Hyderabad', 'Bangalore', 'Chennai'],
    noticePeriod: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'bench-6',
    name: 'Ananya Iyer',
    email: 'ananya.iyer@xoriant.com',
    phone: '+91-9876543215',
    designation: 'Data Scientist',
    experience: 4,
    skills: [
      { name: 'Python', level: 'EXPERT' },
      { name: 'Machine Learning', level: 'ADVANCED' },
      { name: 'TensorFlow', level: 'ADVANCED' },
      { name: 'SQL', level: 'INTERMEDIATE' },
    ],
    status: 'AVAILABLE',
    availability: '2024-02-05',
    location: 'Bangalore',
    preferredLocation: ['Bangalore', 'Chennai'],
    noticePeriod: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'bench-7',
    name: 'Vikram Singh',
    email: 'vikram.singh@xoriant.com',
    phone: '+91-9876543216',
    designation: 'QA Automation Engineer',
    experience: 5,
    skills: [
      { name: 'Selenium', level: 'EXPERT' },
      { name: 'Java', level: 'ADVANCED' },
      { name: 'Cypress', level: 'ADVANCED' },
      { name: 'API Testing', level: 'ADVANCED' },
    ],
    status: 'AVAILABLE',
    availability: '2024-02-20',
    location: 'Pune',
    preferredLocation: ['Pune', 'Mumbai', 'Nagpur'],
    noticePeriod: 30,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'bench-8',
    name: 'Meera Nair',
    email: 'meera.nair@xoriant.com',
    phone: '+91-9876543217',
    designation: 'Angular Developer',
    experience: 3,
    skills: [
      { name: 'Angular', level: 'EXPERT' },
      { name: 'TypeScript', level: 'ADVANCED' },
      { name: 'RxJS', level: 'ADVANCED' },
      { name: 'HTML/CSS', level: 'EXPERT' },
    ],
    status: 'AVAILABLE',
    availability: '2024-02-12',
    location: 'Chennai',
    preferredLocation: ['Chennai', 'Bangalore'],
    noticePeriod: 15,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const seedJobRequirements: JobRequirement[] = [
  {
    id: '1',
    title: 'Senior Full Stack Developer',
    description: 'Looking for an experienced full stack developer with React and Node.js expertise for our client project',
    projectInfo: 'TechCorp Solutions - Enterprise Web Application',
    skills: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'AWS'],
    experience: { min: 5, max: 8 },
    positions: 2,
    location: 'Pune',
    status: 'OPEN',
    priority: 'HIGH',
    deadline: '2026-06-15',
    createdBy: '3',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Python Backend Developer',
    description: 'Python developer with experience in Django and financial applications',
    projectInfo: 'FinTech Innovations - Payment Gateway System',
    skills: ['Python', 'Django', 'PostgreSQL', 'REST API', 'Docker'],
    experience: { min: 3, max: 6 },
    positions: 3,
    location: 'Bangalore',
    status: 'OPEN',
    priority: 'URGENT',
    deadline: '2026-05-28',
    createdBy: '3',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'DevOps Engineer',
    description: 'DevOps engineer with strong Kubernetes and AWS experience',
    projectInfo: 'CloudScale Systems - Infrastructure Modernization',
    skills: ['Kubernetes', 'Docker', 'AWS', 'Terraform', 'CI/CD'],
    experience: { min: 4, max: 7 },
    positions: 1,
    location: 'Mumbai',
    status: 'ON_HOLD',
    priority: 'MEDIUM',
    holdReason: 'Budget approval pending',
    holdBy: '1',
    holdAt: new Date().toISOString(),
    reviewDate: '2026-05-15',
    deadline: '2026-07-01',
    createdBy: '3',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const seedApplications: Application[] = [
  {
    id: 'app-1',
    requirementId: '1', // Senior Full Stack Developer
    employeeId: 'bench-1', // Rajesh Kumar - Full Stack Dev
    source: 'ASSIGNED',
    status: 'INTERVIEW_L1',
    currentStage: 'Interview L1',
    aiScore: 92,
    acceptedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'app-2',
    requirementId: '2', // Python Backend Developer
    employeeId: 'bench-2', // Priya Sharma - Python Dev
    source: 'SELF_APPLY',
    status: 'AI_SCREENING',
    currentStage: 'AI Screening',
    aiScore: 88,
    applicationNote: 'Very interested in this role. I have 4 years of Python and Django experience. Worked on fintech projects.',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'app-3',
    requirementId: '1', // Senior Full Stack Developer
    employeeId: 'bench-8', // Meera Nair - Angular Developer
    source: 'SELF_APPLY',
    status: 'SHORTLISTED',
    currentStage: 'Shortlisted',
    aiScore: 75,
    applicationNote: 'I have strong frontend skills with Angular and TypeScript. Eager to learn React.',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'app-4',
    requirementId: '2', // Python Backend Developer
    employeeId: 'bench-6', // Ananya Iyer - Data Scientist
    source: 'ASSIGNED',
    status: 'INTERVIEW_L2',
    currentStage: 'Interview L2',
    aiScore: 85,
    acceptedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'app-5',
    requirementId: '1', // Senior Full Stack Developer
    employeeId: 'bench-4', // Sneha Desai - UI/UX Designer
    source: 'SELF_APPLY',
    status: 'APPLIED',
    currentStage: 'Applied',
    aiScore: 65,
    applicationNote: 'I can contribute to UI/UX and frontend development. I know React basics.',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'app-6',
    requirementId: '2', // Python Backend Developer
    employeeId: 'bench-5', // Karthik Reddy - Java Developer
    source: 'ASSIGNED',
    status: 'HR_ROUND',
    currentStage: 'HR Round',
    aiScore: 70,
    acceptedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'app-7',
    requirementId: '1', // Senior Full Stack Developer
    employeeId: 'bench-7', // Vikram Singh - QA Automation
    source: 'SELF_APPLY',
    status: 'REJECTED',
    currentStage: 'Rejected',
    aiScore: 45,
    applicationNote: 'Interested in transitioning to development role.',
    rejectedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    rejectionReason: 'Skill mismatch - QA background, looking for dev experience',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const seedInterviewStages: InterviewStage[] = [];
const seedAuditEvents: AuditEvent[] = [];
const seedNotifications: Notification[] = [];

interface AppStore {
  // Auth
  auth: AuthState;
  login: (email: string, password: string) => User | null;
  logout: () => void;

  // Users
  users: User[];
  addUser: (user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;
  ensureSeedUsers: () => void;

  // Resources (All employees in the organization - on bench, in projects, available for next projects, etc.)
  resources: BenchResource[];
  addResource: (resource: Omit<BenchResource, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateResource: (id: string, resource: Partial<BenchResource>) => void;
  deleteResource: (id: string) => void;
  archiveResource: (id: string, reason: string, userId: string) => void;
  unarchiveResource: (id: string, userId: string) => void;

  // Job Requirements
  jobRequirements: JobRequirement[];
  addJobRequirement: (requirement: Omit<JobRequirement, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateJobRequirement: (id: string, requirement: Partial<JobRequirement>) => void;
  deleteJobRequirement: (id: string) => void;
  holdRequirement: (id: string, reason: string, reviewDate: string, userId: string) => void;
  resumeRequirement: (id: string, userId: string) => void;

  // Applications
  applications: Application[];
  addApplication: (app: Omit<Application, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateApplication: (id: string, app: Partial<Application>) => void;
  deleteApplication: (id: string) => void;
  assignCandidate: (requirementId: string, employeeId: string, userId: string) => void;
  shortlistApplication: (id: string, userId: string) => void;
  rejectApplication: (id: string, reason: string, userId: string) => void;
  holdApplication: (id: string, reason: string, reviewDate: string, userId: string) => void;
  resumeApplication: (id: string, userId: string) => void;
  moveApplicationToStage: (id: string, status: ApplicationStatus, stage: string, userId: string, reason?: string) => void;

  // Interview Stages
  interviewStages: InterviewStage[];
  addInterviewStage: (stage: Omit<InterviewStage, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateInterviewStage: (id: string, stage: Partial<InterviewStage>) => void;

  // Audit Trail
  auditEvents: AuditEvent[];
  addAuditEvent: (event: Omit<AuditEvent, 'id' | 'timestamp'>) => void;

  // Notifications
  notifications: Notification[];
  addNotification: (notif: Omit<Notification, 'id' | 'createdAt'>) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
}

export const useStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Auth
      auth: {
        user: null,
        isAuthenticated: false,
      },
      login: (email: string, password: string) => {
        // Get current users from store (not hardcoded seedUsers)
        let currentUsers = get().users;

        // IMPORTANT: Ensure Admin user always exists (for first-time setup or after clearing localStorage)
        if (currentUsers.length === 0 || !currentUsers.find(u => u.email.toLowerCase() === 'admin@xoriant.com')) {
          // Re-initialize with seed data
          currentUsers = [...seedUsers];
          set({ users: currentUsers });
        }

        // Normalize email to lowercase for case-insensitive comparison
        const emailLower = email.toLowerCase();

        // Default admin login: admin / admin (shortcut)
        if (emailLower === 'admin' && password === 'admin') {
          const adminUser = currentUsers.find(u => u.email.toLowerCase() === 'admin@xoriant.com');
          if (adminUser) {
            set({
              auth: {
                user: adminUser,
                isAuthenticated: true,
              },
            });
            return adminUser;
          }
        }

        // Check system users (TMG, MANAGER, HR) - password: "password" (case-insensitive email)
        const systemUser = currentUsers.find(u => u.email.toLowerCase() === emailLower && u.status === 'ACTIVE');
        if (systemUser && password === 'password') {
          set({
            auth: {
              user: systemUser,
              isAuthenticated: true,
            },
          });
          return systemUser;
        }

        // Check resources (all employees) - password: "password" (case-insensitive email)
        const resource = get().resources.find((r: BenchResource) => r.email.toLowerCase() === emailLower);
        if (resource && password === 'password') {
          // Create a User object from Resource for authentication
          const resourceUser: User = {
            id: resource.id,
            email: resource.email,
            name: resource.name,
            role: 'EMPLOYEE', // All resources are employees
            status: 'ACTIVE',
            createdAt: resource.createdAt,
            updatedAt: resource.updatedAt,
          };

          set({
            auth: {
              user: resourceUser,
              isAuthenticated: true,
            },
          });
          return resourceUser;
        }

        return null;
      },
      logout: () => {
        set({
          auth: {
            user: null,
            isAuthenticated: false,
          },
        });
      },

      // Users
      users: seedUsers,
      addUser: (user) => {
        const newUser: User = {
          ...user,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          users: [...state.users, newUser],
        }));
      },
      updateUser: (id, user) => {
        set((state) => ({
          users: state.users.map((u) =>
            u.id === id ? { ...u, ...user, updatedAt: new Date().toISOString() } : u
          ),
        }));
      },
      deleteUser: (id) => {
        set((state) => ({
          users: state.users.filter((u) => u.id !== id),
        }));
      },
      ensureSeedUsers: () => {
        const currentUsers = get().users;
        const missingUsers = seedUsers.filter(
          seedUser => !currentUsers.find(u => u.email.toLowerCase() === seedUser.email.toLowerCase())
        );
        if (missingUsers.length > 0) {
          set((state) => ({
            users: [...state.users, ...missingUsers],
          }));
        }
      },

      // Resources (All employees in the organization)
      resources: seedBenchResources,
      addResource: (resource) => {
        const newResource: BenchResource = {
          ...resource,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          resources: [...state.resources, newResource],
        }));
      },
      updateResource: (id, resource) => {
        set((state) => ({
          resources: state.resources.map((r) =>
            r.id === id ? { ...r, ...resource, updatedAt: new Date().toISOString() } : r
          ),
        }));
      },
      deleteResource: (id) => {
        set((state) => ({
          resources: state.resources.filter((r) => r.id !== id),
        }));
      },
      archiveResource: (id, reason, userId) => {
        set((state) => ({
          resources: state.resources.map((r) =>
            r.id === id
              ? {
                  ...r,
                  status: 'ARCHIVED' as const,
                  archivedAt: new Date().toISOString(),
                  archiveReason: reason,
                  archivedBy: userId,
                  updatedAt: new Date().toISOString(),
                }
              : r
          ),
        }));

        // Add audit event
        const state = get();
        const resource = state.resources.find(r => r.id === id);
        if (resource) {
          state.addAuditEvent({
            entityType: 'USER',
            entityId: id,
            fromStatus: resource.status,
            toStatus: 'ARCHIVED',
            actorRole: state.auth.user?.role || 'TMG',
            actorId: userId,
            actorName: state.auth.user?.name || 'System',
            reason: reason,
          });
        }
      },
      unarchiveResource: (id, userId) => {
        set((state) => ({
          resources: state.resources.map((r) =>
            r.id === id
              ? {
                  ...r,
                  status: 'AVAILABLE' as const,
                  archivedAt: undefined,
                  archiveReason: undefined,
                  archivedBy: undefined,
                  updatedAt: new Date().toISOString(),
                }
              : r
          ),
        }));

        // Add audit event
        const state = get();
        state.addAuditEvent({
          entityType: 'USER',
          entityId: id,
          toStatus: 'AVAILABLE',
          actorRole: state.auth.user?.role || 'TMG',
          actorId: userId,
          actorName: state.auth.user?.name || 'System',
        });
      },

      // Job Requirements
      jobRequirements: seedJobRequirements,
      addJobRequirement: (requirement) => {
        const newRequirement: JobRequirement = {
          ...requirement,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          jobRequirements: [...state.jobRequirements, newRequirement],
        }));
      },
      updateJobRequirement: (id, requirement) => {
        set((state) => ({
          jobRequirements: state.jobRequirements.map((r) =>
            r.id === id ? { ...r, ...requirement, updatedAt: new Date().toISOString() } : r
          ),
        }));
      },
      deleteJobRequirement: (id) => {
        set((state) => ({
          jobRequirements: state.jobRequirements.filter((r) => r.id !== id),
        }));
      },
      holdRequirement: (id, reason, reviewDate, userId) => {
        set((state) => ({
          jobRequirements: state.jobRequirements.map((r) =>
            r.id === id
              ? {
                  ...r,
                  status: 'ON_HOLD',
                  holdReason: reason,
                  holdBy: userId,
                  holdAt: new Date().toISOString(),
                  reviewDate,
                  updatedAt: new Date().toISOString(),
                }
              : r
          ),
        }));
      },
      resumeRequirement: (id, _userId) => {
        set((state) => ({
          jobRequirements: state.jobRequirements.map((r) =>
            r.id === id
              ? {
                  ...r,
                  status: 'OPEN',
                  holdReason: undefined,
                  holdBy: undefined,
                  holdAt: undefined,
                  reviewDate: undefined,
                  updatedAt: new Date().toISOString(),
                }
              : r
          ),
        }));
      },

      // Applications
      applications: seedApplications,
	      addApplication: (app) => {
	        const state = get();
	        const requirement = state.jobRequirements.find(r => r.id === app.requirementId);
	        const candidate = state.resources.find(r => r.id === app.employeeId);
	        const aiScore = candidate && requirement
	          ? calculateAIScore(candidate, requirement)
	          : undefined;

	        const newApp: Application = {
	          ...app,
	          id: Date.now().toString(),
	          aiScore,
	          createdAt: new Date().toISOString(),
	          updatedAt: new Date().toISOString(),
	        };
	        set((state) => ({
	          applications: [...state.applications, newApp],
	        }));
	      },
      updateApplication: (id, app) => {
        set((state) => ({
          applications: state.applications.map((a) =>
            a.id === id ? { ...a, ...app, updatedAt: new Date().toISOString() } : a
          ),
        }));
      },
      deleteApplication: (id) => {
        set((state) => ({
          applications: state.applications.filter((a) => a.id !== id),
        }));
      },
	      assignCandidate: (requirementId, employeeId, _userId) => {
	        const state = get();
	        const requirement = state.jobRequirements.find(r => r.id === requirementId);
	        const candidate = state.resources.find(r => r.id === employeeId);
	        const aiScore = candidate && requirement
	          ? calculateAIScore(candidate, requirement)
	          : undefined;

	        const newApp: Application = {
	          id: Date.now().toString(),
	          requirementId,
	          employeeId,
	          source: 'ASSIGNED',
	          status: 'ASSIGNED',
	          currentStage: 'Assigned',
	          aiScore,
	          createdAt: new Date().toISOString(),
	          updatedAt: new Date().toISOString(),
	        };
	        set((state) => ({
	          applications: [...state.applications, newApp],
	        }));
	      },
      shortlistApplication: (id, _userId) => {
        set((state) => ({
          applications: state.applications.map((a) =>
            a.id === id
              ? {
                  ...a,
                  status: 'SHORTLISTED',
                  currentStage: 'Shortlisted',
                  updatedAt: new Date().toISOString(),
                }
              : a
          ),
        }));
      },
      rejectApplication: (id, reason, _userId) => {
        set((state) => ({
          applications: state.applications.map((a) =>
            a.id === id
              ? {
                  ...a,
                  status: 'REJECTED',
                  currentStage: 'Rejected',
                  rejectionReason: reason,
                  rejectedAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                }
              : a
          ),
        }));
      },
      holdApplication: (id, reason, reviewDate, userId) => {
        set((state) => ({
          applications: state.applications.map((a) =>
            a.id === id
              ? {
                  ...a,
                  status: 'ON_HOLD',
                  holdReason: reason,
                  holdBy: userId,
                  holdAt: new Date().toISOString(),
                  reviewDate,
                  updatedAt: new Date().toISOString(),
                }
              : a
          ),
        }));
      },
      resumeApplication: (id, _userId) => {
        set((state) => ({
          applications: state.applications.map((a) =>
            a.id === id
              ? {
                  ...a,
                  status: 'SHORTLISTED',
                  holdReason: undefined,
                  holdBy: undefined,
                  holdAt: undefined,
                  reviewDate: undefined,
                  updatedAt: new Date().toISOString(),
                }
              : a
          ),
        }));
      },
      moveApplicationToStage: (id, status, stage, userId, reason) => {
        const state = get();
        const app = state.applications.find(a => a.id === id);
        const oldStatus = app?.status;

        set({
          applications: state.applications.map((a) =>
            a.id === id
              ? {
                  ...a,
                  status,
                  currentStage: stage,
                  updatedAt: new Date().toISOString(),
                }
              : a
          ),
        });

        // Add audit event
        if (oldStatus) {
          state.addAuditEvent({
            entityType: 'APPLICATION',
            entityId: id,
            fromStatus: oldStatus,
            toStatus: status,
            actorRole: state.auth.user?.role || 'TMG',
            actorId: userId,
            actorName: state.auth.user?.name || 'System',
            reason,
          });
        }
      },

      // Interview Stages
      interviewStages: seedInterviewStages,
      addInterviewStage: (stage) => {
        const newStage: InterviewStage = {
          ...stage,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          interviewStages: [...state.interviewStages, newStage],
        }));
      },
      updateInterviewStage: (id, stage) => {
        set((state) => ({
          interviewStages: state.interviewStages.map((s) =>
            s.id === id ? { ...s, ...stage, updatedAt: new Date().toISOString() } : s
          ),
        }));
      },

      // Audit Trail
      auditEvents: seedAuditEvents,
      addAuditEvent: (event) => {
        const newEvent: AuditEvent = {
          ...event,
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
        };
        set((state) => ({
          auditEvents: [...state.auditEvents, newEvent],
        }));
      },

      // Notifications
      notifications: seedNotifications,
      addNotification: (notif) => {
        const newNotif: Notification = {
          ...notif,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          notifications: [...state.notifications, newNotif],
        }));
      },
      markNotificationRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        }));
      },
      clearNotifications: () => {
        set({ notifications: [] });
      },
    }),
    {
      name: 'xor-ats-storage',
    }
  )
);

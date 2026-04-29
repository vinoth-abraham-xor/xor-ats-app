# XOR-ATS - Applicant Tracking System

A modern, full-stack Applicant Tracking System (ATS) built with React and TypeScript for managing employee resources and job requirements.

## 🚀 Features

### Core Capabilities
- ✅ **Multi-Role Dashboards**: Customized views for TMG, Manager, HR, and Employees
- ✅ **Resource Management**: Track all employees (available, in projects, in interviews)
- ✅ **Job Requirements**: Create and manage job requirements with detailed specs
- ✅ **Applications Pipeline**: Complete interview pipeline with manual stage control
- ✅ **AI Screening**: Automated candidate ranking and scoring
- ✅ **Search & Filter**: Searchable dropdowns and advanced filtering
- ✅ **Authentication**: Secure login with case-insensitive emails
- ✅ **Persistent State**: All data persists in browser localStorage

### Role-Based Features
- **TMG/Admin**: Full system access, resource allocation, requirement management
- **Manager**: Create requirements, manage applications, view pipeline
- **HR**: Track all applications, manage interviews, generate reports
- **Employee**: Browse jobs, apply for positions, track application status

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - UI component library
- **TanStack Table** - Data grid with advanced features
- **Zustand** - State management with persistence
- **React Router** - Client-side routing
- **Lucide React** - Icon library
- **Axios** - HTTP client (ready for API integration)

### Backend (Planned - See `docs/backend/`)
- Python FastAPI
- SQLAlchemy ORM
- SQLite/PostgreSQL
- Microsoft Graph API
- ReportLab for PDF generation

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm/yarn

### Setup Steps

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔐 Login Credentials

### Quick Admin Access
```
Username: admin
Password: admin
```

### All System Users
```
Email: [any user email]
Password: password
```

### Example Logins
```
admin@xoriant.com              / password  (TMG)
Archana.Hubballi@Xoriant.Com   / password  (TMG)
PankajK.Jain@Xoriant.Com       / password  (Manager)
Jaydeep.Rijiya@Xoriant.Com     / password  (HR)
rajesh.kumar@xoriant.com       / password  (Employee)
```

**Note**: All emails are case-insensitive

## 📂 Project Structure

```
xor-ats-app/
├── src/
│   ├── components/
│   │   ├── core/              # Reusable UI components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── label.tsx
│   │   └── layout/
│   │       └── DashboardLayout.tsx
│   ├── features/              # Feature modules
│   │   ├── auth/
│   │   │   └── LoginPage.tsx
│   │   ├── users/
│   │   │   └── UserManagementPage.tsx
│   │   ├── resources/
│   │   │   └── ResourcesPage.tsx
│   │   ├── requirements/
│   │   │   └── RequirementsPage.tsx
│   │   ├── applications/
│   │   │   └── ApplicationsPage.tsx
│   │   ├── dashboards/
│   │   │   ├── TMGDashboard.tsx
│   │   │   ├── ManagerDashboard.tsx
│   │   │   └── HRDashboard.tsx
│   │   └── employee/
│   │       └── EmployeeDashboard.tsx
│   ├── store/                 # Zustand store with persistence
│   │   └── index.ts
│   ├── services/              # API service layer
│   │   └── api.ts
│   ├── types/                 # TypeScript type definitions
│   │   └── index.ts
│   ├── lib/
│   │   └── utils.ts           # Utility functions
│   ├── App.tsx                # Main app component
│   ├── main.tsx               # Entry point
│   └── index.css              # Global styles with theme
├── public/
├── index.html
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
├── docs/                       # Documentation
│   ├── backend/                # Backend development docs
│   ├── guides/                 # User guides
│   └── changes/                # Recent changes
└── README.md
```

## 🎨 Theme & Design

The application uses a professional green accent theme inspired by the provided design references:
- **Primary Color**: Green (#22c55e)
- **Dark Sidebar**: Dark gray background with white text
- **Clean Layout**: Modern, spacious design with high usability

## 🔄 State Management

All data is persisted to `localStorage` using Zustand's persist middleware. The following data is stored:
- Users
- Bench Resources
- Job Requirements
- Authentication state

## 📝 Pre-seeded Data

### Users
- Admin: vinothabraham.p@xoriant.com
- TMG: john.doe@xoriant.com
- Recruiter: jane.smith@xoriant.com

### Bench Resources (5 mock resources)
- Full Stack Developer, Python Developer, DevOps Engineer, UI/UX Designer, Java Developer

### Job Requirements (3 mock requirements)
- Senior Full Stack Developer, Python Backend Developer, DevOps Engineer

## 🚀 Next Steps (Phase 2)

1. Implement Python FastAPI backend (see `BACKEND_PROMPT.md`)
2. Connect frontend to backend APIs
3. Add file upload for resumes
4. Implement PDF/DOCX generation
5. Microsoft Graph API integration
6. Advanced search and filtering
7. Analytics and reporting

## 📄 License

Proprietary - XOR-ATS Platform

## 👥 Developer

Developed by Vinoth Abraham P for Xoriant Corporation

---

## 📚 Additional Documentation

See `docs/` folder for:
- Backend development guide (`docs/backend/`)
- User guides and testing (`docs/guides/`)
- Recent changes and updates (`docs/changes/`)

---

**Built with ❤️ using React + TypeScript + Vite**

# 🎯 Bench Resources = Portal Users Implementation

## Key Clarifications

### 1. User Types
- **Bench Resources** = Employees (portal users who can be assigned/apply to jobs)
  - Default password: `Password@123`
  - Role: EMPLOYEE (auto-set)
  - Can login to portal
  - Can view own profile, applications, interviews
  - Can upload resume
  
- **User Management** = System users (TMG, Managers, HR, Delegates)
  - Password: `password`
  - Roles: TMG, MANAGER, HR
  - System administrators
  - Manage requirements and bench

### 2. Login System
```typescript
// Bench Resource Login
Email: rajesh.kumar@xoriant.com (from bench resource)
Password: Password@123 (default for all bench)
Role: EMPLOYEE (auto-assigned)
Redirects to: /employee/dashboard

// System User Login  
Email: john.manager@xoriant.com (from users table)
Password: password
Role: MANAGER
Redirects to: /dashboard
```

---

## Implementation Status

### ✅ Already Implemented
1. Login system updated to support bench resource login
2. Store function checks both users and benchResources
3. Employee dashboard created
4. Self-apply flow working

### ❌ Still Needed
1. **Bench Resource Creation Dialog** - Add email field, show password info
2. **Employee Profile Page** - View/edit own profile
3. **Resume Upload** - Upload/update resume file
4. **Interview Tracking for Employee** - See own interview schedule
5. **Settings Page** - Configuration options

---

## Implementation Plan

### Phase 1: Fix Bench Resource Creation

**File**: `src/features/bench/BenchResourcesPage.tsx`

**Add to create dialog**:
- Email field (required) - Will be login username
- Display message: "Default password will be: Password@123"
- Auto-set status: AVAILABLE
- Auto-set role: EMPLOYEE (when creating user record)

**Code**:
```typescript
const handleAddResource = () => {
  addBenchResource({
    name: formData.name,
    email: formData.email, // ← Login credential
    designation: formData.designation,
    skills: formData.skills.split(',').map(s => s.trim()),
    experience: formData.experience,
    location: formData.location,
    status: 'AVAILABLE',
    availableFrom: new Date().toISOString(),
  });
  // Password@123 is handled in login logic
};
```

---

### Phase 2: Employee Profile Page

**Route**: `/employee/profile`

**Features**:
- View own bench resource details
- Edit: Name, Skills, Location, Domain
- Upload resume (file upload)
- View current status
- Cannot see other employees' data

**Code**:
```typescript
// Find logged-in employee's bench record
const myProfile = benchResources.find(r => r.email === auth.user.email);

// Update profile
updateBenchResource(myProfile.id, {
  skills: newSkills,
  resume: uploadedFileUrl,
  // ... other fields
});
```

---

### Phase 3: Interview Tracking View

**Component**: Part of Employee Dashboard

**Features**:
- Show all interviews for user's applications
- Display: Stage name, Date/Time, Interviewer, Status
- Show outcome (PENDING, PASS, FAIL, HOLD)
- Cannot modify (view-only)

**Data Source**:
```typescript
const myApplications = applications.filter(app => 
  app.employeeId === benchResource.id
);

const myInterviews = interviewStages.filter(stage =>
  myApplications.some(app => app.id === stage.applicationId)
);
```

---

### Phase 4: Settings Page

**Route**: `/settings`

**Sections**:
1. **Interview Pipeline Templates**
   - Default stages: AI Screening → Tech L1 → Tech L2 → HR Round
   - Add/Edit/Delete stages
   - Reorder stages

2. **Hold Reasons** (Dropdown presets)
   - Budget approval pending
   - Hiring freeze
   - Candidate comparison
   - Awaiting stakeholder input
   - Custom (add more)

3. **SLA Configuration**
   - Default review days for hold
   - Notification settings
   - Auto-close rules

4. **Application Settings**
   - Allow self-apply: Yes/No
   - Auto-shortlist threshold (AI score %)
   - Require application note: Yes/No

**Code**:
```typescript
interface Settings {
  pipelineTemplate: {
    stages: string[]; // Default interview stages
    customizable: boolean;
  };
  holdReasons: string[];
  sla: {
    holdReviewDays: number;
    requirementAgingDays: number;
  };
  applicationSettings: {
    allowSelfApply: boolean;
    autoShortlistThreshold: number;
    requireApplicationNote: boolean;
  };
}
```

---

## Login Credentials Summary

### Bench Resources (Employees)
```
1. rajesh.kumar@xoriant.com / Password@123
2. priya.sharma@xoriant.com / Password@123
3. amit.patel@xoriant.com / Password@123
4. sneha.desai@xoriant.com / Password@123
5. karthik.reddy@xoriant.com / Password@123
```

### System Users
```
1. admin / admin (TMG)
2. vinothabraham.p@xoriant.com / password (TMG)
3. john.manager@xoriant.com / password (MANAGER)
4. jane.hr@xoriant.com / password (HR)
```

---

## Data Flow

### Creating Bench Resource
```
TMG → Bench Resources Page → Add Resource Dialog
→ Enter: Name, Email, Designation, Skills, Experience, Location
→ System auto-sets: password=Password@123, status=AVAILABLE, role=EMPLOYEE
→ Resource created in benchResources table
→ Can now login with email/Password@123
```

### Bench Resource Login
```
Employee → Login Page → Enter email + Password@123
→ System checks benchResources table
→ Creates temp User object with role=EMPLOYEE
→ Redirects to /employee/dashboard
→ Can view own profile, applications, interviews
```

### Permission Matrix
| Action | TMG | MANAGER | HR | EMPLOYEE |
|--------|-----|---------|----|----|
| Create Bench Resource | ✅ | ❌ | ❌ | ❌ |
| View All Bench | ✅ | ✅ | ✅ | ❌ |
| View Own Profile | N/A | N/A | N/A | ✅ |
| Edit Own Profile | N/A | N/A | N/A | ✅ |
| Upload Resume | N/A | N/A | N/A | ✅ |
| View Own Applications | N/A | N/A | N/A | ✅ |
| View All Applications | ✅ | ✅ | ✅ | ❌ |
| Accept/Reject Assignment | N/A | N/A | N/A | ✅ |
| Self-Apply | N/A | N/A | N/A | ✅ |

---

## Next Steps

1. ✅ Login system (DONE)
2. ⬜ Fix Bench Resource creation dialog (add email, show password)
3. ⬜ Create Employee Profile page
4. ⬜ Add Resume upload functionality
5. ⬜ Create Settings page
6. ⬜ Test end-to-end flow

---

**Status**: Phase 1 complete, Phase 2-4 ready to implement

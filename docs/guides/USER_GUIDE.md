# XOR-ATS User Guide

## 🚀 Getting Started

### Login
1. Open http://localhost:5173
2. Enter credentials:
   - **Username**: `admin`
   - **Password**: `admin`
3. Click "Sign In"
4. You'll be logged in as **Vinoth Abraham P** (TMG role)

---

## 📋 Features Guide

### 1. Dashboard
**Navigation**: Click "Dashboard" in sidebar

**What you see**:
- 4 stat cards showing system overview
- Total users, bench resources, requirements, allocations
- Quick stats panel

---

### 2. Requirements Management
**Navigation**: Click "Requirements" in sidebar

**Features**:
- View all job requirements in a table
- **Search**: Type in search box to filter
- **Status Filter**: Click ALL, OPEN, ON_HOLD, CLOSED_FILLED buttons
- **Stats**: See Open (2), On Hold (1), Closed (0), Total Positions (6)

**Actions**:

**Hold a Requirement** (e.g., budget pending):
1. Find an OPEN requirement
2. Click the **Pause icon** (⏸️) in Actions column
3. Dialog opens: "Hold Requirement"
4. Enter reason: e.g., "Budget approval pending"
5. Select review date: e.g., 2026-06-15
6. Click "Hold Requirement"
7. ✅ Status changes to **ON_HOLD** (yellow badge)
8. Reason displays below status

**Resume a Requirement**:
1. Find an ON_HOLD requirement (e.g., "DevOps Engineer")
2. Click the **Play icon** (▶️) in Actions column
3. ✅ Status changes back to **OPEN** (green badge)

---

### 3. Applications Pipeline
**Navigation**: Click "Applications" in sidebar

**Features**:
- View all candidate applications
- 6 stat cards: Total (2), Assigned (1), Applied (1), Shortlisted (0), In Interview (1), Selected (0)
- **Search**: Filter applications
- **Requirement Filter**: Select specific requirement from dropdown
- **Status Filter**: Click ALL, ASSIGNED, APPLIED, SHORTLISTED, etc.

**Actions**:

**Assign a Candidate** (TMG only):
1. Click "Assign Candidate" button (top right)
2. Dialog opens
3. Select **Requirement**: e.g., "Python Backend Developer"
4. Select **Employee**: e.g., "Priya Sharma" (AVAILABLE)
5. Click "Assign"
6. ✅ New application created with status **ASSIGNED**

**Shortlist an Application**:
1. Find an application with status **APPLIED**
2. Click the **Green Check icon** (✓)
3. ✅ Status changes to **SHORTLISTED**

**Reject an Application**:
1. Find an APPLIED or SHORTLISTED application
2. Click the **Red X icon** (✗)
3. Dialog opens: "Reject Application"
4. Enter reason: e.g., "Skills not matching requirements"
5. Click "Reject"
6. ✅ Status changes to **REJECTED** (red badge)

**Hold an Application**:
1. Find any active application (not REJECTED or ON_HOLD)
2. Click the **Pause icon** (⏸️)
3. Dialog opens: "Hold Application"
4. Enter reason: e.g., "Awaiting candidate response"
5. Select review date: e.g., 2026-05-15
6. Click "Hold"
7. ✅ Status changes to **ON_HOLD** (yellow badge)

**Resume an Application**:
1. Find an ON_HOLD application
2. Click the **Play icon** (▶️)
3. ✅ Status changes to **SHORTLISTED** (continues from where it left off)

---

### 4. Bench Resources
**Navigation**: Click "Bench Resources" in sidebar

**Features**:
- View all available resources
- See skills, experience, status, availability
- **Search**: Filter resources by name, skills, location
- **Stats**: Total resources (5), Available (varies by status)

**What you see**:
- Name & designation
- Email
- Experience (in years)
- Skills (max 3 shown, +N more)
- Location
- Status badge (AVAILABLE, IN_INTERVIEW, ALLOCATED, UNAVAILABLE)
- Available from date

---

### 5. User Management
**Navigation**: Click "User Management" in sidebar

**Features**:
- View all system users
- **Search**: Filter users by name, email
- **Stats**: Total users, Active users

**Actions**:

**Add New User**:
1. Click "Add User" button
2. Dialog opens
3. Enter:
   - Name: e.g., "Sarah Developer"
   - Email: e.g., "sarah.dev@xoriant.com"
   - Role: Select from EMPLOYEE, HR, MANAGER, TMG
4. Click "Add User"
5. ✅ User added to table

**Deactivate User**:
1. Find an ACTIVE user
2. Click the **UserX icon** (user with X)
3. ✅ Status changes to **INACTIVE** (red badge)

**Activate User**:
1. Find an INACTIVE user
2. Click the **UserCheck icon** (user with check)
3. ✅ Status changes to **ACTIVE** (green badge)

**Delete User**:
1. Click the **Trash icon**
2. Confirm deletion in popup
3. ✅ User removed from system

---

## 🎯 Quick Test Scenarios

### Scenario 1: Complete Assignment Flow
1. Go to **Applications** page
2. Click "Assign Candidate"
3. Select: "Senior Full Stack Developer" + "Karthik Reddy"
4. Click "Assign"
5. ✅ New application appears with status ASSIGNED
6. Click **Green Check** to shortlist
7. ✅ Status changes to SHORTLISTED

### Scenario 2: Hold & Resume Workflow
1. Go to **Requirements** page
2. Find "Senior Full Stack Developer" (OPEN)
3. Click **Pause icon**
4. Enter reason: "Client needs time to finalize"
5. Set review date: Next month
6. Click "Hold Requirement"
7. ✅ Status: ON_HOLD
8. Click **Play icon**
9. ✅ Status: OPEN

### Scenario 3: Application Rejection
1. Go to **Applications** page
2. Filter: "APPLIED" status
3. Find any application
4. Click **Red X icon**
5. Enter reason: "Candidate withdrew"
6. Click "Reject"
7. ✅ Status: REJECTED

---

## 👥 User Roles

### TMG (Admin)
- **Full access** to all features
- Can assign candidates
- Can hold/resume requirements
- Can manage all applications
- Can add/edit users

### MANAGER
- View requirements
- View applications for their requirements
- Can shortlist/reject candidates
- Can hold/resume applications

### HR
- **View-only** access
- Can see all data
- Cannot modify (future: can handle onboarding)

### EMPLOYEE
- View available requirements (future: self-apply)
- View own applications
- Accept assignments

---

## 🔑 Default Credentials

**Login**: `admin` / `admin`  
**Logged in as**: vinothabraham.p@xoriant.com (TMG)

---

## 💡 Tips

1. **Persistence**: All data is saved in browser localStorage. Refresh page and data persists!
2. **Search**: Use global search on any page to quickly find items
3. **Filters**: Combine search + status filters for precise results
4. **Status Badges**: 
   - Green = Active/Open/Available
   - Yellow = Hold/Warning
   - Red = Rejected/Inactive
   - Blue = In Progress
5. **Actions**: Hover over action icons to see tooltips

---

## 🐛 Troubleshooting

**Can't login?**
- Use exactly: `admin` / `admin` (case sensitive)

**Data disappeared?**
- Check browser localStorage: Key is `xor-ats-storage`
- Clear and refresh to reset to seed data

**Build errors?**
- Run: `npm install`
- Run: `npm run build`

---

**Enjoy using XOR-ATS! 🚀**

# 🔑 Login Credentials - XOR-ATS

## All User Logins

### 1. TMG (Admin)
```
Email: admin
Password: admin
Role: TMG
Redirects to: /dashboard
```
**OR**
```
Email: vinothabraham.p@xoriant.com
Password: password
Role: TMG
Redirects to: /dashboard
```

### 2. Manager
```
Email: john.manager@xoriant.com
Password: password
Role: MANAGER
Redirects to: /dashboard
```

### 3. HR
```
Email: jane.hr@xoriant.com
Password: password
Role: HR
Redirects to: /dashboard
```

### 4. Employee ⭐ NEW
```
Email: employee1@xoriant.com
Password: password
Role: EMPLOYEE
Redirects to: /employee/dashboard ✨
Name: Rajesh Kumar
```

---

## Quick Test Scenarios

### Scenario 1: Employee Self-Apply
1. Login: `employee1@xoriant.com` / `password`
2. Click "Browse Open Roles"
3. Find "Senior Full Stack Developer"
4. Click "Apply Now"
5. Add note: "I have React + Node.js experience"
6. Submit
7. ✅ Application created with status: APPLIED

### Scenario 2: TMG Assign → Employee Accept
1. Login as TMG: `admin` / `admin`
2. Go to Applications page
3. Click "Assign Candidate"
4. Select requirement + employee
5. Click "Assign"
6. **Logout** (click logout in sidebar)
7. Login as Employee: `employee1@xoriant.com` / `password`
8. See assignment in "Pending Assignments"
9. Click "Accept"
10. ✅ Moves to AI_SCREENING

### Scenario 3: Employee Reject Assignment
1. Login as Employee
2. See pending assignment
3. Click "Reject"
4. Enter reason: "Not interested"
5. Submit
6. ✅ Status → WITHDRAWN
7. **Logout** and login as TMG
8. ✅ TMG sees notification

---

## Navigation Map

### TMG/Manager/HR Users:
```
/dashboard        → Generic dashboard
/requirements     → Manage requirements
/applications     → Manage applications
/bench            → Bench resources
/users            → User management
```

### Employee Users:
```
/employee/dashboard  → Employee dashboard
/employee/search     → Browse & apply to roles
/employee/applications → My applications (future)
```

---

## Seed Data Overview

### Users (4):
1. vinothabraham.p@xoriant.com - TMG
2. john.manager@xoriant.com - MANAGER
3. jane.hr@xoriant.com - HR
4. employee1@xoriant.com - EMPLOYEE (Rajesh Kumar) ⭐

### Requirements (3):
1. Senior Full Stack Developer - OPEN
2. Python Backend Developer - OPEN
3. DevOps Engineer - ON_HOLD

### Bench Resources (5):
- Rajesh Kumar (also user #4)
- Priya Sharma
- Amit Patel
- Sneha Desai
- Karthik Reddy

### Applications (2 initially):
1. Rajesh → Full Stack (ASSIGNED → AI_SCREENING after accept)
2. John Manager → Python (SELF_APPLY → APPLIED)

---

## Role Capabilities

| Feature | TMG | MANAGER | HR | EMPLOYEE |
|---------|-----|---------|----|----|
| Create Requirements | ✅ | ✅ | ❌ | ❌ |
| Assign Candidates | ✅ | ❌ | ❌ | ❌ |
| Shortlist/Reject | ✅ | ✅ | ❌ | ❌ |
| Manage Interviews | ✅ | ✅ | ❌ | ❌ |
| View Applications | ✅ | ✅ | ✅ | Own only |
| Accept/Reject Assignments | ❌ | ❌ | ❌ | ✅ |
| Self-Apply | ❌ | ❌ | ❌ | ✅ |
| Browse Open Roles | ❌ | ❌ | ❌ | ✅ |

---

**Current URL**: http://localhost:5173  
**All passwords**: `password` (except admin = `admin`)

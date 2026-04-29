# Complete IATS Implementation Plan

## 🎯 Missing Features Analysis

Based on the comprehensive IATS requirements document, here are the missing features:

### 1. ✅ Already Implemented
- [x] Login Page (TMG/Admin)
- [x] User Management (CRUD)
- [x] Bench Resources (listing)
- [x] Requirements Management (CRUD, Hold/Resume)
- [x] Applications Pipeline (Assign, Shortlist, Reject, Hold/Resume)
- [x] Interview Tracking (Multi-stage, outcomes)
- [x] Table Filters & Sorting
- [x] REQ-ID display
- [x] Multiple applications per candidate

### 2. ❌ Missing Critical Features

#### A. Employee Login & Dashboard
- [ ] **Employee role cannot login** - CRITICAL BUG
- [ ] Employee-specific dashboard
- [ ] View assignments (Accept/Reject flow)
- [ ] View my applications
- [ ] View interview schedule
- [ ] Update profile/resume

#### B. Self-Apply Flow (Employee as Applicant)
- [ ] Search open requirements (filter by skills, location, experience)
- [ ] Apply to requirement (with resume/note)
- [ ] Track application status
- [ ] Withdraw application (before interview)

#### C. Interview Configuration & Settings
- [ ] Admin settings page
- [ ] Configure pipeline templates (AI Screening, Tech L1/L2, HR Round)
- [ ] Configure hold reasons (dropdown)
- [ ] Configure SLA/review dates
- [ ] Manage permissions

#### D. AI Ranking/Screening
- [ ] Skill match scoring algorithm
- [ ] AI ranking cards with explainability
- [ ] Auto-score on application
- [ ] Rank candidates by match %

#### E. Notifications System
- [ ] Notification center UI
- [ ] Assignment notifications
- [ ] Status change alerts
- [ ] Interview schedule reminders
- [ ] Selection/rejection notifications
- [ ] Mark read/unread

#### F. Role-Based Dashboards
- [ ] TMG Dashboard (bench utilization, assignments, hold review)
- [ ] Manager Dashboard (my requirements, candidates by stage)
- [ ] HR Dashboard (funnel metrics, time-to-fill) - View only
- [ ] Employee Dashboard (assignments, applications, interviews)

#### G. Audit Trail & History
- [ ] Audit log viewer page
- [ ] Status history timeline
- [ ] Track all transitions (who, when, why)
- [ ] Export audit log

#### H. Candidate Acceptance Flow
- [ ] Accept/Reject assignment dialog
- [ ] Update profile on accept
- [ ] Notify TMG on reject
- [ ] Auto-move to next stage on accept

#### I. DOJ (Date of Joining) Tracking
- [ ] Capture DOJ for selected candidates
- [ ] Onboarding checklist
- [ ] Track joining status
- [ ] Auto-close requirement when positions filled

#### J. Requirements-Level Features
- [ ] Track positions filled vs open
- [ ] Auto-close when all positions filled
- [ ] Requirement aging/SLA tracking

---

## 📋 Implementation Priority

### **Phase 1: Critical Fixes** (Immediate)
1. Fix employee login (CRITICAL)
2. Create employee dashboard
3. Add accept/reject assignment flow
4. Add self-apply search page

### **Phase 2: Core Workflows** (High Priority)
5. Implement AI ranking/screening
6. Build notification center
7. Add interview configuration settings
8. Create audit trail viewer

### **Phase 3: Role-Based Experience** (Medium Priority)
9. Build TMG dashboard
10. Build Manager dashboard
11. Build HR dashboard (view-only)
12. Add DOJ tracking

### **Phase 4: Polish & Enhancements** (Lower Priority)
13. Add requirement aging/SLA
14. Export features
15. Advanced reporting
16. Profile/resume upload

---

## 🔧 Technical Implementation Details

### Employee Login Credentials
```
Email: employee1@xoriant.com (Rajesh Kumar)
Password: password
Role: EMPLOYEE
```

### Self-Apply Workflow
```
Employee → Search Requirements (filters) → Apply (resume/note) 
→ TMG/Manager Review → Shortlist/Reject 
→ If Shortlisted → Interview Pipeline
```

### AI Ranking Algorithm (Simple Version)
```typescript
function calculateSkillMatch(candidateSkills: string[], requiredSkills: string[]): number {
  const matches = requiredSkills.filter(skill => 
    candidateSkills.some(cs => cs.toLowerCase().includes(skill.toLowerCase()))
  );
  return (matches.length / requiredSkills.length) * 100;
}
```

### Notification Types
- ASSIGNMENT: "You have been assigned to [Requirement]"
- APPLICATION: "New application from [Employee] for [Requirement]"
- SHORTLIST: "You have been shortlisted for [Requirement]"
- REJECTION: "Your application for [Requirement] was not selected"
- HOLD: "Requirement/Application on hold - [Reason]"
- RESUME: "Requirement/Application resumed"
- INTERVIEW_SCHEDULE: "Interview scheduled: [Stage] on [Date]"
- DECISION: "You have been selected for [Requirement]"

---

## 🗂️ New Files to Create

1. `src/features/employee/EmployeeDashboard.tsx`
2. `src/features/employee/SearchRequirements.tsx`
3. `src/features/employee/MyApplications.tsx`
4. `src/features/employee/AcceptRejectDialog.tsx`
5. `src/features/settings/SettingsPage.tsx`
6. `src/features/settings/InterviewConfiguration.tsx`
7. `src/features/ai/RankingCards.tsx`
8. `src/features/notifications/NotificationCenter.tsx`
9. `src/features/audit/AuditTrailPage.tsx`
10. `src/features/dashboards/TMGDashboard.tsx`
11. `src/features/dashboards/ManagerDashboard.tsx`
12. `src/features/dashboards/HRDashboard.tsx`

---

## 🎯 Success Criteria

All features complete when:
- ✅ Employee can login and see dashboard
- ✅ Employee can accept/reject assignments
- ✅ Employee can search and apply to requirements
- ✅ AI ranking shows skill match scores
- ✅ Notifications work for all events
- ✅ Each role sees appropriate dashboard
- ✅ Interview stages configurable
- ✅ Audit trail shows complete history
- ✅ DOJ tracking for selected candidates
- ✅ Requirements auto-close when filled

---

**Status**: Ready to implement  
**Estimated Effort**: 8-10 hours full implementation  
**Current Progress**: 60% complete (core workflow done)

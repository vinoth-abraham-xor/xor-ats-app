# 📅 Interview Management Guide

## ✅ Interview Tracking System - Already Implemented!

The system already has a **complete interview management feature** that allows you to:
- Schedule interviews with date/time
- Assign interviewers
- Track outcomes (Pass/Fail/Hold)
- Add feedback/remarks
- Manage multiple interview rounds (L1, L2, HR, etc.)

---

## 📍 **Where to Manage Interviews**

### **Option 1: From Applications Page** (`/applications`)

1. **Login**: admin / admin
2. **Go to**: http://localhost:5173/applications
3. **Find**: The candidate you want to schedule an interview for
4. **Click**: 📅 Calendar icon (blue) in the Actions column
5. **Opens**: Interview Tracking Dialog

### **Option 2: From Requirement Details Page** (`/requirements/:id`)

1. **Login**: admin / admin
2. **Go to**: http://localhost:5173/requirements
3. **Click**: 👁️ Eye icon on any requirement
4. **Find**: The candidate in the list
5. **Click**: 📅 "Interviews" button
6. **Opens**: Interview Tracking Dialog

---

## 🎯 **How to Schedule an Interview**

### **Step 1: Open Interview Dialog**
Click the 📅 Calendar icon next to any candidate

### **Step 2: Add Interview Stage**
1. Click **"Add Stage"** button (top right)
2. Fill in the form:
   - **Stage Name**: e.g., "Technical Round 1", "Level 1 Interview", "HR Round"
   - **Interviewer**: e.g., "John Smith", "Sarah Manager"
   - **Scheduled Date**: Pick date and time
3. Click **"Add"**

### **Step 3: Interview Conducted**
After the interview is completed:
1. Add **Feedback/Remarks** in the text box
2. Click one of:
   - ✅ **Pass** - Candidate cleared this round
   - ❌ **Fail** - Candidate did not clear
   - ⏸️ **Hold** - Need more evaluation

### **Step 4: Add More Rounds**
Repeat for L2, HR, or any additional rounds

---

## 📊 **What Information is Tracked**

For each interview stage:
- ✅ **Stage Name** - L1, L2, HR Round, etc.
- ✅ **Interviewer Name** - Who will conduct/conducted
- ✅ **Scheduled Date/Time** - When it's happening
- ✅ **Outcome** - PENDING/PASS/FAIL/HOLD
- ✅ **Completed Date** - When it was completed
- ✅ **Feedback** - Interviewer remarks/comments
- ✅ **Sequence** - Order of rounds (1, 2, 3...)

---

## 📝 **Example: Complete Interview Workflow**

### **Scenario**: Candidate "Rajesh Kumar" for "Senior React Developer" position

**Step 1: Move to Interview Stage**
1. Go to Applications page
2. Click purple arrow (→) on Rajesh's application
3. Select "INTERVIEW_L1" from dropdown
4. Click "Move to Stage"
5. ✅ Status changed to "Interview L1"

**Step 2: Schedule L1 Interview**
1. Click 📅 Calendar icon on Rajesh's application
2. Click "Add Stage"
3. Fill form:
   - **Stage Name**: "Level 1 - Technical"
   - **Interviewer**: "John Smith"
   - **Scheduled Date**: Select tomorrow at 2 PM
4. Click "Add"
5. ✅ L1 interview scheduled

**Step 3: After L1 Interview**
1. Open interview dialog again
2. Under "Level 1 - Technical" stage:
3. Enter feedback: "Good knowledge of React hooks. Needs improvement in state management."
4. Click ✅ **Pass** button
5. ✅ L1 marked as PASS with feedback

**Step 4: Move to L2**
1. Click purple arrow (→) again
2. Select "INTERVIEW_L2"
3. Click "Move to Stage"
4. ✅ Status changed to "Interview L2"

**Step 5: Schedule L2 Interview**
1. Click 📅 Calendar icon
2. Click "Add Stage"
3. Fill form:
   - **Stage Name**: "Level 2 - System Design"
   - **Interviewer**: "Sarah Manager"
   - **Scheduled Date**: Select next week at 3 PM
4. Click "Add"
5. ✅ L2 interview scheduled

**Step 6: After L2 Interview**
1. Open interview dialog
2. Under "Level 2 - System Design":
3. Enter feedback: "Excellent system design skills. Recommended for HR round."
4. Click ✅ **Pass**
5. ✅ L2 marked as PASS

**Step 7: HR Round**
1. Move to "HR_ROUND" status
2. Schedule HR interview
3. After interview, mark outcome
4. If passed, move to "SELECTED"

---

## 👁️ **Employee View**

Employees can see their interview schedule in **My Applications** page:

1. **Login as employee**: rajesh.kumar@xoriant.com / Password@123
2. **Click**: "My Applications" in sidebar
3. **See**: For each application:
   - Visual timeline showing current stage
   - **Interview Schedule section** showing:
     * All scheduled interviews
     * Interview name (L1, L2, HR)
     * Date and time
     * Interviewer name
     * Outcome (if completed)

---

## 🎨 **Visual Indicators**

**In Applications Page**:
- 📅 **Calendar icon (blue)** - Click to manage interviews

**In Interview Dialog**:
- 🟢 **Green badge** - PASS
- 🔴 **Red badge** - FAIL
- 🟡 **Yellow badge** - HOLD
- ⚪ **Gray badge** - PENDING

**In Employee View**:
- ✅ Green timeline checkmarks - Completed stages
- 🔵 Blue pulsing dot - Current stage
- ⚪ Gray circles - Future stages

---

## 🚀 **Quick Test**

### **Test Interview Scheduling**:

```bash
1. Login: admin / admin
2. Go to: /applications
3. Find any candidate with status "INTERVIEW_L1"
4. Click: 📅 Calendar icon (blue)
5. Click: "Add Stage"
6. Fill:
   - Stage Name: "Technical Round 1"
   - Interviewer: "John Smith"
   - Scheduled Date: Tomorrow 2 PM
7. Click: "Add"
8. ✅ Interview scheduled!

9. Enter feedback: "Candidate performed well"
10. Click: ✅ Pass button
11. ✅ Interview marked as PASS

12. Switch to employee view:
    - Logout
    - Login: rajesh.kumar@xoriant.com / Password@123
    - Go to: My Applications
    - ✅ See interview schedule with date/time/interviewer
```

---

## 📍 **Where Data is Stored**

**Interview Stages** are stored in:
- Store: `interviewStages` array
- Linked to: `applicationId`
- Persisted: In localStorage (zustand-persist)

**Each Interview Stage Contains**:
```typescript
{
  id: string,
  applicationId: string,
  name: string,              // "Level 1 - Technical"
  sequence: number,          // 1, 2, 3...
  interviewer?: string,      // "John Smith"
  scheduledAt?: string,      // "2026-04-30T14:00:00"
  completedAt?: string,      // "2026-04-30T15:30:00"
  outcome: 'PENDING' | 'PASS' | 'FAIL' | 'HOLD',
  feedback?: string,         // "Good performance, recommended"
  createdAt: string,
  updatedAt: string
}
```

---

## ✅ **Summary**

**Interview management is already fully implemented!**

**You can**:
- ✅ Schedule interviews with date/time
- ✅ Assign interviewers
- ✅ Add multiple rounds (L1, L2, HR, etc.)
- ✅ Track outcomes (Pass/Fail/Hold)
- ✅ Add feedback/remarks
- ✅ View interview history
- ✅ Employees can see their schedule

**Access it from**:
- Applications page → 📅 Calendar icon
- Requirement details page → 📅 Interviews button

**Test it now at**: http://localhost:5173/applications

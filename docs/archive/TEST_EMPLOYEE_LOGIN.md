# ✅ Employee Login Fix - Testing Guide

## 🔧 Issue Fixed!

**Problem**: Employee login was showing admin dashboard instead of employee dashboard

**Root Cause**: Mismatch in role checking
- Store sets `role: 'EMPLOYEE'` for bench resources
- But we were checking for absence of role (`!user.role`)

**Fix**: All three files now consistently check `user.role === 'EMPLOYEE'`

---

## 📊 Dev Server Status

✅ **Running at**: http://localhost:5173/

**Files Fixed**:
1. `src/features/auth/LoginPage.tsx` - Login redirect
2. `src/App.tsx` - Route guards
3. `src/components/layout/DashboardLayout.tsx` - Navigation

---

## 🚀 **TEST NOW!**

### **Test 1: Employee Login**

1. **Open browser**: http://localhost:5173/
2. **Logout** if currently logged in (click logout icon in sidebar)
3. **Login with employee credentials**:
   ```
   Email: rajesh.kumar@xoriant.com
   Password: Password@123
   ```
4. **✅ Expected Results**:
   - Redirects to: `/employee/dashboard`
   - Sidebar shows 4 employee links:
     * Dashboard
     * Browse Jobs
     * My Applications
     * My Profile
   - Shows employee name in sidebar header
   - Shows "My Applications" section with timeline tracker

5. **✅ Verify Protection**:
   - Try to go to: `http://localhost:5173/dashboard`
   - Should auto-redirect back to: `/employee/dashboard`
   - Try to go to: `http://localhost:5173/requirements`
   - Should auto-redirect back to: `/employee/dashboard`

---

### **Test 2: Admin Login**

1. **Logout** (click logout icon)
2. **Login with admin credentials**:
   ```
   Email: admin
   Password: admin
   ```
3. **✅ Expected Results**:
   - Redirects to: `/dashboard`
   - Sidebar shows 8 admin links:
     * Dashboard
     * Requirements
     * Applications
     * Pipeline
     * AI Screening
     * Bench Resources
     * User Management
     * Settings
   - Shows admin name in sidebar header

4. **✅ Verify Protection**:
   - Try to go to: `http://localhost:5173/employee/dashboard`
   - Should auto-redirect back to: `/dashboard`
   - Try to go to: `http://localhost:5173/employee/search`
   - Should auto-redirect back to: `/dashboard`

---

### **Test 3: Assignment Dialog (REQ-2 Visibility)**

1. **Login as admin**: admin / admin
2. **Go to**: http://localhost:5173/applications
3. **Click**: "Assign Candidate" button (top right)
4. **✅ Expected Results**:
   - Dialog opens
   - Requirement dropdown shows:
     * "Select a requirement" (default)
     * "REQ-xxxx – Senior Full Stack Developer"
     * "REQ-xxxx – Python Backend Developer"
   - Both REQ-1 and REQ-2 visible
   - REQ-3 (DevOps - ON_HOLD) should NOT show

5. **Select**: Python Backend Developer
6. **See**: Requirement details below dropdown
7. **Search**: Type "rajesh" or any candidate name
8. **Select**: A candidate from the list
9. **Click**: "Assign Candidate"
10. **✅ Expected**: Application created successfully

---

### **Test 4: Employee Application Tracking**

1. **Login as employee**: rajesh.kumar@xoriant.com / Password@123
2. **Go to**: My Applications (click in sidebar)
3. **✅ Expected Results**:
   - See statistics: Total, Active, In Interviews, Selected
   - See filter tabs: All, Active, Closed
   - See application cards with:
     * Requirement title
     * Visual timeline showing current stage
     * Green checkmarks for completed stages
     * Blue pulsing dot for current stage
     * Gray circles for future stages
     * Interview schedule if any
   - Can see AI match score if available

---

## 🔍 **If Something Doesn't Work**

### **Employee still sees admin dashboard**:
1. **Hard refresh**: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. **Clear local storage**:
   - Open browser console (F12)
   - Type: `localStorage.clear()`
   - Press Enter
   - Reload page
3. **Check dev server is running**: Should show "VITE ... ready in ..." in terminal

### **REQ-2 not showing in assignment dialog**:
1. **Check requirement status**:
   - Login as admin
   - Go to: /requirements
   - Find "Python Backend Developer"
   - Status should show "OPEN" (green badge)
   - If not, click edit (pencil icon) and change to OPEN

2. **Clear browser cache**:
   - Chrome: Ctrl+Shift+Delete → Clear cached images and files
   - Reload page

---

## 🎯 **Quick Verification Checklist**

### Employee Login:
- [ ] Redirects to `/employee/dashboard`
- [ ] Shows 4 employee nav links
- [ ] Shows "My Applications" with timeline
- [ ] Cannot access `/dashboard` (auto-redirected)
- [ ] Cannot access `/requirements` (auto-redirected)

### Admin Login:
- [ ] Redirects to `/dashboard`
- [ ] Shows 8 admin nav links
- [ ] Cannot access `/employee/dashboard` (auto-redirected)

### Assignment Dialog:
- [ ] Shows requirement dropdown
- [ ] REQ-1 visible (Senior Full Stack)
- [ ] REQ-2 visible (Python Backend)
- [ ] REQ-3 not visible (ON_HOLD)
- [ ] Can select requirement
- [ ] Can search/select candidate
- [ ] Can assign successfully

---

## ✅ **All Fixes Applied!**

The app is now running with all fixes. Test the employee login flow and let me know if you see any issues!

**Dev Server**: http://localhost:5173/
**Status**: ✅ Running
**Changes**: ✅ Applied (auto-reload enabled)

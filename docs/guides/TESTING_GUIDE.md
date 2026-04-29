# XOR-ATS Testing Guide

## 🧪 Manual Testing Checklist

### 1. Login & Authentication

**Test Case 1.1: Valid Login**
- [ ] Navigate to `http://localhost:5173`
- [ ] Enter username: `admin`
- [ ] Enter password: `admin`
- [ ] Click "Sign In"
- [ ] ✅ Expected: Redirect to `/dashboard` with user logged in

**Test Case 1.2: Invalid Login**
- [ ] Try logging in with wrong credentials
- [ ] ✅ Expected: Error message "Invalid credentials. Please try again."

**Test Case 1.3: Logout**
- [ ] Click the logout icon in sidebar
- [ ] ✅ Expected: Redirect to login page, session cleared

**Test Case 1.4: Protected Routes**
- [ ] Log out
- [ ] Try accessing `/dashboard` directly
- [ ] ✅ Expected: Redirect to login page

---

### 2. Dashboard

**Test Case 2.1: Dashboard Stats**
- [ ] Login and navigate to `/dashboard`
- [ ] ✅ Expected: See 4 stat cards:
  - Total Users: 3
  - Bench Resources: 5
  - Job Requirements: 3
  - Active Allocations: 1

**Test Case 2.2: Quick Stats Panel**
- [ ] Check the Quick Stats panel
- [ ] ✅ Expected: Displays active users, available resources, open requirements

---

### 3. User Management (`/users`)

**Test Case 3.1: View Users List**
- [ ] Navigate to `/users`
- [ ] ✅ Expected: See table with 3 users
- [ ] ✅ Verify columns: Name, Email, Role, Status, Created, Actions

**Test Case 3.2: Search Users**
- [ ] Type "vinoth" in search box
- [ ] ✅ Expected: Filters to show only Vinoth Abraham P

**Test Case 3.3: Add New User**
- [ ] Click "Add User" button
- [ ] Fill form:
  - Name: "Test User"
  - Email: "test.user@xoriant.com"
  - Role: "Recruiter"
- [ ] Click "Add User"
- [ ] ✅ Expected: User added to table, dialog closes
- [ ] ✅ Verify: Total count increases

**Test Case 3.4: Deactivate User**
- [ ] Click the UserX icon on an active user
- [ ] ✅ Expected: Status changes to INACTIVE
- [ ] ✅ Verify: Badge changes to red

**Test Case 3.5: Activate User**
- [ ] Click the UserCheck icon on inactive user
- [ ] ✅ Expected: Status changes to ACTIVE
- [ ] ✅ Verify: Badge changes to green

**Test Case 3.6: Delete User**
- [ ] Click trash icon on test user
- [ ] Confirm deletion
- [ ] ✅ Expected: User removed from table

**Test Case 3.7: Pagination**
- [ ] Add multiple users (if needed)
- [ ] ✅ Expected: Pagination controls work correctly
- [ ] Test "Next" and "Previous" buttons

**Test Case 3.8: Data Persistence**
- [ ] Add a new user
- [ ] Refresh the browser (F5)
- [ ] ✅ Expected: New user still appears in list

---

### 4. Bench Resources (`/bench`)

**Test Case 4.1: View Resources List**
- [ ] Navigate to `/bench`
- [ ] ✅ Expected: See table with 5 bench resources

**Test Case 4.2: Verify Resource Details**
- [ ] Check Rajesh Kumar's row
- [ ] ✅ Expected: 
  - Designation: "Senior Full Stack Developer"
  - Experience: "5 years"
  - Skills: React, Node.js, TypeScript (with +1 more)
  - Status: AVAILABLE (green badge)
  - Location: Pune

**Test Case 4.3: Search Resources**
- [ ] Type "Python" in search box
- [ ] ✅ Expected: Shows Priya Sharma (Python Developer)

**Test Case 4.4: Skills Display**
- [ ] Check skills column
- [ ] ✅ Expected: Shows max 3 skills + overflow badge (e.g., "+1")

**Test Case 4.5: Status Badges**
- [ ] Verify status badge colors:
  - ✅ AVAILABLE → Green
  - ✅ IN_INTERVIEW → Yellow/Warning
  - ✅ ALLOCATED → Blue/Info
  - ✅ UNAVAILABLE → Gray

---

### 5. Navigation & Layout

**Test Case 5.1: Sidebar Navigation**
- [ ] Click each menu item:
  - Dashboard
  - User Management
  - Bench Resources
  - Settings (if available)
- [ ] ✅ Expected: Routes change correctly
- [ ] ✅ Expected: Active menu item highlighted in green

**Test Case 5.2: User Info Display**
- [ ] Check sidebar footer
- [ ] ✅ Expected: Shows "Vinoth Abraham P" with avatar
- [ ] ✅ Expected: Shows "ADMIN" role

**Test Case 5.3: Logo & Branding**
- [ ] Check sidebar header
- [ ] ✅ Expected: Green shield icon with "XOR-ATS" branding

---

### 6. LocalStorage Persistence

**Test Case 6.1: Data Persists After Refresh**
- [ ] Add a new user
- [ ] Add/modify bench resource (when implemented)
- [ ] Refresh browser (F5)
- [ ] ✅ Expected: All changes persist

**Test Case 6.2: Auth State Persists**
- [ ] Log in
- [ ] Refresh browser
- [ ] ✅ Expected: Still logged in (no redirect to login)

**Test Case 6.3: Clear Storage**
- [ ] Open DevTools → Application → Local Storage
- [ ] Clear `xor-ats-storage` key
- [ ] Refresh
- [ ] ✅ Expected: Data resets to seed data

---

### 7. UI/UX & Responsiveness

**Test Case 7.1: Theme Consistency**
- [ ] Check all pages for consistent theming
- [ ] ✅ Expected: Green accent color (#22c55e) throughout
- [ ] ✅ Expected: Dark sidebar with white text

**Test Case 7.2: Button States**
- [ ] Hover over buttons
- [ ] ✅ Expected: Hover effects visible
- [ ] Click buttons
- [ ] ✅ Expected: Focus states work

**Test Case 7.3: Form Validation**
- [ ] Try adding user with empty fields
- [ ] ✅ Expected: HTML5 validation prevents submission

**Test Case 7.4: Modal Dialogs**
- [ ] Open "Add User" dialog
- [ ] Click outside or press ESC
- [ ] ✅ Expected: Dialog closes
- [ ] Click X button
- [ ] ✅ Expected: Dialog closes

---

## 🔍 Browser DevTools Checks

### Console
- [ ] Open browser console (F12)
- [ ] ✅ Expected: No errors or warnings
- [ ] ✅ Expected: No 404s or failed requests

### Network
- [ ] Check Network tab
- [ ] ✅ Expected: All assets load successfully
- [ ] ✅ Expected: No failed API calls (all data from localStorage)

### Application Storage
- [ ] DevTools → Application → Local Storage
- [ ] Check `xor-ats-storage` key
- [ ] ✅ Expected: JSON object with users, benchResources, jobRequirements, auth

---

## 📊 Performance Checks

**Test Case P.1: Initial Load**
- [ ] Open app in incognito/private window
- [ ] ✅ Expected: Loads in < 2 seconds

**Test Case P.2: Navigation Speed**
- [ ] Switch between pages
- [ ] ✅ Expected: Instant page transitions (no lag)

**Test Case P.3: Table Rendering**
- [ ] Open User Management with all users
- [ ] ✅ Expected: Table renders smoothly
- [ ] Search/filter/sort
- [ ] ✅ Expected: No lag on interactions

---

## ✅ Final Verification

After completing all tests above:

- [ ] All core features work as expected
- [ ] No console errors
- [ ] Data persists across refreshes
- [ ] Authentication flow works correctly
- [ ] All CRUD operations functional
- [ ] UI is responsive and accessible
- [ ] Theme is consistent

---

**Status**: Ready for Demo  
**Test Coverage**: Phase 1 Complete

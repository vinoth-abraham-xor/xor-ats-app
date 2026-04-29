# 🔧 Backend API Documentation - XOR-ATS IATS

## Overview

This document specifies the REST API endpoints needed for the XOR-ATS system. The frontend is currently using Zustand with localStorage. This will guide backend implementation.

**Frontend Status**: 100% Complete (all features implemented)
**Backend Status**: Ready for implementation
**API Version**: 1.0
**Updated**: April 29, 2026

---

## Authentication

### POST `/api/auth/login`
**Description**: Authenticate user (system users or bench resources)

**Request**:
```json
{
  "email": "string",
  "password": "string"
}
```

**Response** (Success - 200):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "email": "string",
      "name": "string",
      "role": "TMG | MANAGER | HR | EMPLOYEE",
      "status": "ACTIVE | INACTIVE"
    },
    "token": "jwt-token-here"
  }
}
```

**Response** (Error - 401):
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

**Logic**:
```typescript
// Check users table first (TMG, MANAGER, HR)
// If not found, check bench_resources table
// Bench resources: password = "Password@123" (default)
// System users: custom passwords
// Return role: EMPLOYEE for bench resources
```

---

### POST `/api/auth/logout`
**Description**: Logout current user

**Headers**: `Authorization: Bearer <token>`

**Response** (200):
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Users (System Users: TMG, MANAGER, HR)

### GET `/api/users`
**Description**: Get all system users

**Headers**: `Authorization: Bearer <token>`

**Query Params**:
- `role` (optional): TMG | MANAGER | HR
- `status` (optional): ACTIVE | INACTIVE
- `search` (optional): Search by name/email

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "email": "string",
      "name": "string",
      "role": "TMG | MANAGER | HR",
      "status": "ACTIVE | INACTIVE",
      "createdAt": "ISO8601",
      "updatedAt": "ISO8601"
    }
  ],
  "meta": {
    "total": 10,
    "page": 1,
    "pageSize": 20
  }
}
```

### POST `/api/users`
**Description**: Create system user

**Request**:
```json
{
  "email": "string",
  "name": "string",
  "role": "TMG | MANAGER | HR",
  "password": "string"
}
```

**Response** (201):
```json
{
  "success": true,
  "data": { /* User object */ }
}
```

### PUT `/api/users/:id`
**Description**: Update system user

**Request**:
```json
{
  "name": "string",
  "role": "TMG | MANAGER | HR",
  "status": "ACTIVE | INACTIVE"
}
```

### DELETE `/api/users/:id`
**Description**: Delete system user

**Response** (200):
```json
{
  "success": true,
  "message": "User deleted"
}
```

---

## Bench Resources (Employees)

### GET `/api/bench-resources`
**Description**: Get all bench resources

**Query Params**:
- `status` (optional): AVAILABLE | IN_INTERVIEW | ALLOCATED | UNAVAILABLE
- `skills` (optional): Filter by skill names (comma-separated)
- `location` (optional): Filter by location
- `search` (optional): Search by name/email

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "email": "string",
      "name": "string",
      "phone": "string",
      "designation": "string",
      "skills": [
        {
          "name": "string",
          "level": "BEGINNER | INTERMEDIATE | ADVANCED | EXPERT"
        }
      ],
      "experience": 5,
      "location": "string",
      "preferredLocation": ["string"],
      "noticePeriod": 30,
      "status": "AVAILABLE | IN_INTERVIEW | ALLOCATED | UNAVAILABLE",
      "availability": "ISO8601",
      "resume": "url | null",
      "domain": "string | null",
      "createdAt": "ISO8601",
      "updatedAt": "ISO8601"
    }
  ]
}
```

### POST `/api/bench-resources`
**Description**: Create bench resource

**Request**:
```json
{
  "email": "string",
  "name": "string",
  "phone": "string",
  "designation": "string",
  "skills": [
    {
      "name": "React",
      "level": "INTERMEDIATE"
    }
  ],
  "experience": 5,
  "location": "Pune",
  "preferredLocation": ["Pune", "Mumbai"],
  "noticePeriod": 0,
  "domain": "FinTech"
}
```

**Response** (201):
```json
{
  "success": true,
  "data": { /* Bench Resource object */ },
  "message": "Bench resource created. Default password: Password@123"
}
```

**Backend Logic**:
```sql
-- Auto-set fields
status = 'AVAILABLE'
availability = CURRENT_TIMESTAMP
password_hash = bcrypt('Password@123')
```

### PUT `/api/bench-resources/:id`
**Description**: Update bench resource

**Request**:
```json
{
  "name": "string",
  "designation": "string",
  "skills": [...],
  "experience": 6,
  "location": "string",
  "domain": "string"
}
```

### GET `/api/bench-resources/me`
**Description**: Get current logged-in employee's profile

**Headers**: `Authorization: Bearer <token>`

**Response** (200):
```json
{
  "success": true,
  "data": { /* Bench Resource object */ }
}
```

### PUT `/api/bench-resources/me`
**Description**: Update own profile (employees only)

**Request** (same as update, but restricted to own data)

---

## Job Requirements

### GET `/api/requirements`
**Description**: Get all job requirements

**Query Params**:
- `status` (optional): OPEN | ON_HOLD | CLOSED_FILLED | CANCELLED
- `priority` (optional): LOW | MEDIUM | HIGH | URGENT
- `location` (optional)
- `search` (optional)

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "string",
      "description": "string",
      "projectInfo": "string",
      "skills": ["string"],
      "experience": {
        "min": 3,
        "max": 5
      },
      "positions": 2,
      "location": "string",
      "priority": "LOW | MEDIUM | HIGH | URGENT",
      "status": "OPEN | ON_HOLD | CLOSED_FILLED | CANCELLED",
      "deadline": "ISO8601 | null",
      "holdReason": "string | null",
      "reviewDate": "ISO8601 | null",
      "createdBy": "user-id",
      "createdAt": "ISO8601",
      "updatedAt": "ISO8601"
    }
  ]
}
```

### POST `/api/requirements`
**Description**: Create job requirement

**Request**:
```json
{
  "title": "Senior Full Stack Developer",
  "description": "Looking for experienced developer",
  "projectInfo": "TechCorp Solutions",
  "skills": ["React", "Node.js", "TypeScript"],
  "experience": {
    "min": 3,
    "max": 5
  },
  "positions": 2,
  "location": "Pune",
  "priority": "HIGH",
  "deadline": "2026-05-31"
}
```

**Response** (201):
```json
{
  "success": true,
  "data": { /* Requirement object */ }
}
```

### PUT `/api/requirements/:id`
**Description**: Update requirement

### POST `/api/requirements/:id/hold`
**Description**: Put requirement on hold

**Request**:
```json
{
  "reason": "Budget approval pending",
  "reviewDate": "2026-05-15"
}
```

### POST `/api/requirements/:id/resume`
**Description**: Resume requirement from hold

---

## Applications

### GET `/api/applications`
**Description**: Get all applications

**Query Params**:
- `requirementId` (optional)
- `employeeId` (optional)
- `status` (optional)
- `source` (optional): ASSIGNED | SELF_APPLY

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "requirementId": "uuid",
      "employeeId": "uuid",
      "source": "ASSIGNED | SELF_APPLY",
      "status": "ASSIGNED | APPLIED | SHORTLISTED | ...",
      "currentStage": "string",
      "aiScore": 85 | null,
      "applicationNote": "string | null",
      "acceptedAt": "ISO8601 | null",
      "rejectedAt": "ISO8601 | null",
      "rejectionReason": "string | null",
      "createdAt": "ISO8601",
      "updatedAt": "ISO8601"
    }
  ]
}
```

### POST `/api/applications`
**Description**: Create application (assign or self-apply)

**Request**:
```json
{
  "requirementId": "uuid",
  "employeeId": "uuid",
  "source": "ASSIGNED | SELF_APPLY",
  "applicationNote": "string | null"
}
```

**Backend Logic**:
```typescript
// If source === ASSIGNED: status = 'ASSIGNED'
// If source === SELF_APPLY: status = 'APPLIED'
// Calculate AI score based on skill match
```

### PUT `/api/applications/:id`
**Description**: Update application (shortlist, reject, hold, resume)

**Request**:
```json
{
  "status": "SHORTLISTED | REJECTED | ON_HOLD | ...",
  "rejectionReason": "string | null",
  "holdReason": "string | null"
}
```

### POST `/api/applications/:id/accept`
**Description**: Employee accepts assignment

**Response** (200):
```json
{
  "success": true,
  "data": {
    "status": "AI_SCREENING",
    "acceptedAt": "ISO8601"
  }
}
```

### POST `/api/applications/:id/reject`
**Description**: Employee rejects assignment

**Request**:
```json
{
  "reason": "Not interested in this technology stack"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "status": "WITHDRAWN",
    "rejectedAt": "ISO8601",
    "rejectionReason": "string"
  }
}
```

---

## Interview Stages

### GET `/api/applications/:applicationId/interviews`
**Description**: Get all interview stages for an application

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "applicationId": "uuid",
      "name": "Technical Round 1",
      "interviewer": "John Manager",
      "scheduledAt": "ISO8601 | null",
      "outcome": "PENDING | PASS | FAIL | HOLD",
      "feedback": "string | null",
      "completedAt": "ISO8601 | null",
      "createdAt": "ISO8601"
    }
  ]
}
```

### POST `/api/applications/:applicationId/interviews`
**Description**: Add interview stage

**Request**:
```json
{
  "name": "Technical Round 1",
  "interviewer": "John Manager",
  "scheduledAt": "2026-05-01T14:00:00Z"
}
```

### PUT `/api/interviews/:id/outcome`
**Description**: Record interview outcome

**Request**:
```json
{
  "outcome": "PASS | FAIL | HOLD",
  "feedback": "Candidate performed well"
}
```

---

## Notifications

### GET `/api/notifications`
**Description**: Get notifications for current user

**Query Params**:
- `read` (optional): true | false

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "ASSIGNMENT | APPLICATION | SHORTLIST | REJECTION | INTERVIEW_SCHEDULE | DECISION",
      "recipientId": "uuid",
      "title": "string",
      "message": "string",
      "read": boolean,
      "metadata": {},
      "createdAt": "ISO8601"
    }
  ],
  "meta": {
    "unreadCount": 5
  }
}
```

### PUT `/api/notifications/:id/read`
**Description**: Mark notification as read

---

## Audit Logs

### GET `/api/audit-logs`
**Description**: Get audit trail

**Query Params**:
- `entityType` (optional): REQUIREMENT | APPLICATION | INTERVIEW
- `entityId` (optional)
- `actorId` (optional)
- `startDate` (optional)
- `endDate` (optional)

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "entityType": "APPLICATION",
      "entityId": "uuid",
      "action": "STATUS_CHANGE",
      "actorId": "uuid",
      "changes": {
        "status": {
          "from": "APPLIED",
          "to": "SHORTLISTED"
        }
      },
      "createdAt": "ISO8601"
    }
  ]
}
```

---

## File Upload

### POST `/api/upload/resume`
**Description**: Upload resume file

**Headers**: 
- `Content-Type: multipart/form-data`

**Request** (Form Data):
```
file: <binary>
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "url": "https://cdn.example.com/resumes/abc123.pdf",
    "filename": "John_Doe_Resume.pdf",
    "size": 102400
  }
}
```

---

## Status Enums

### Application Status
```
ASSIGNED
APPLIED
SHORTLISTED
AI_SCREENING
INTERVIEW_L1
INTERVIEW_L2
INTERVIEW_L3
MANAGER_ROUND
HR_ROUND
SELECTED
OFFER_EXTENDED
OFFER_ACCEPTED
JOINED
REJECTED
WITHDRAWN
ON_HOLD
```

### Priority
```
LOW
MEDIUM
HIGH
URGENT
```

### Skill Level
```
BEGINNER
INTERMEDIATE
ADVANCED
EXPERT
```

---

## Error Responses

All error responses follow this format:

**Response** (4xx/5xx):
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {} // optional
}
```

**Common Error Codes**:
- `AUTH_REQUIRED`: 401 - Authentication required
- `FORBIDDEN`: 403 - Insufficient permissions
- `NOT_FOUND`: 404 - Resource not found
- `VALIDATION_ERROR`: 400 - Invalid input
- `DUPLICATE_ENTRY`: 409 - Duplicate resource
- `SERVER_ERROR`: 500 - Internal server error

---

## Pagination

All list endpoints support pagination:

**Query Params**:
- `page`: Page number (default: 1)
- `pageSize`: Items per page (default: 20, max: 100)

**Response Meta**:
```json
{
  "meta": {
    "total": 150,
    "page": 1,
    "pageSize": 20,
    "totalPages": 8
  }
}
```

---

## Authentication

All protected endpoints require JWT token:

**Header**:
```
Authorization: Bearer <jwt-token>
```

**Token Payload**:
```json
{
  "userId": "uuid",
  "email": "string",
  "role": "TMG | MANAGER | HR | EMPLOYEE",
  "iat": 1234567890,
  "exp": 1234567890
}
```

---

**Status**: 🟢 Ready for Backend Implementation  
**Frontend**: Fully compatible with this API spec  
**Version**: 1.0  
**Date**: April 29, 2026

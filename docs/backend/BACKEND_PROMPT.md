# XOR-ATS Backend Development Prompt

## Role: Senior Python Backend Developer (FastAPI + SQLAlchemy Expert)

## Project Context
Develop the backend API for the XOR-ATS (Applicant Tracking System) platform. This backend must integrate seamlessly with the existing React frontend and provide robust, scalable APIs.

## Tech Stack Requirements
- **Framework**: Python FastAPI (latest stable version)
- **ORM**: SQLAlchemy 2.0+
- **Database**: SQLite (development) → PostgreSQL (production-ready)
- **Authentication**: JWT-based authentication with TMG integration support
- **External Integrations**:
  - Microsoft Graph API (for user management and email)
  - ReportLab (for PDF generation - resumes, reports)
  - python-docx (for Word document generation)
- **Additional Libraries**:
  - Pydantic v2 for data validation
  - Alembic for database migrations
  - python-jose for JWT tokens
  - passlib for password hashing
  - httpx for async HTTP requests

## Core Features to Implement

### 1. Authentication & Authorization
- JWT-based authentication
- Role-Based Access Control (RBAC)
  - TMG/ADMIN: Full system access
  - MANAGER: Create requirements, manage applications
  - HR: Track applications, manage interviews
  - EMPLOYEE: Browse and apply for jobs
- Default admin credentials: `admin / admin`
- All other users password: `password`
- Support for Microsoft Graph API integration for user sync

### 2. User Management Module
**Endpoints:**
- `POST /api/auth/login` - Authenticate user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh JWT token
- `GET /api/users` - List all users (with pagination, filtering)
- `POST /api/users` - Create new user
- `GET /api/users/{id}` - Get user by ID
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user
- `PATCH /api/users/{id}/status` - Activate/Deactivate user

**Models:**
```python
class User:
    id: UUID
    email: str (unique, indexed)
    name: str
    password_hash: str
    role: Enum[TMG, MANAGER, HR, EMPLOYEE]
    status: Enum[ACTIVE, INACTIVE]
    created_at: datetime
    updated_at: datetime
```

### 3. Resource Management (All Employees)
**Endpoints:**
- `GET /api/resources` - List all resources (employees)
- `POST /api/resources` - Add new resource
- `GET /api/resources/{id}` - Get resource by ID
- `PUT /api/resources/{id}` - Update resource
- `DELETE /api/resources/{id}` - Delete/Archive resource
- `GET /api/resources/available` - Get available resources
- `POST /api/resources/{id}/resume/upload` - Upload resume
- `GET /api/resources/{id}/resume/download` - Download resume
- `POST /api/resources/{id}/generate-profile` - Generate profile document

**Models:**
```python
class Resource:
    id: UUID
    name: str
    email: str (unique)
    phone: str
    designation: str
    experience: int (years)
    skills: List[Skill]  # JSON or separate table
    status: Enum[AVAILABLE, IN_INTERVIEW, ALLOCATED, UNAVAILABLE]
    availability: date
    location: str
    preferred_locations: List[str]
    notice_period: int (days)
    resume_url: str (optional)
    notes: text (optional)
    created_at: datetime
    updated_at: datetime

class Skill:
    id: UUID
    resource_id: UUID (FK)
    name: str
    level: Enum[BEGINNER, INTERMEDIATE, ADVANCED, EXPERT]
```

### 4. Job Requirements Management
**Endpoints:**
- `GET /api/job-requirements` - List all requirements
- `POST /api/job-requirements` - Create new requirement
- `GET /api/job-requirements/{id}` - Get requirement by ID
- `PUT /api/job-requirements/{id}` - Update requirement
- `DELETE /api/job-requirements/{id}` - Delete requirement
- `GET /api/job-requirements/{id}/matching-resources` - Get matching bench resources

**Models:**
```python
class JobRequirement:
    id: UUID
    title: str
    client: str
    description: text
    skills: List[str]
    experience_min: int
    experience_max: int
    positions: int
    location: str
    status: Enum[OPEN, IN_PROGRESS, CLOSED, ON_HOLD]
    priority: Enum[LOW, MEDIUM, HIGH, URGENT]
    budget_min: float (optional)
    budget_max: float (optional)
    deadline: date (optional)
    assigned_to: UUID (FK to User, optional)
    created_by: UUID (FK to User)
    created_at: datetime
    updated_at: datetime
```

### 5. Reporting & Document Generation
**Endpoints:**
- `POST /api/reports/bench-summary` - Generate bench summary report (PDF)
- `POST /api/reports/resource-profile/{id}` - Generate resource profile (PDF/DOCX)
- `POST /api/reports/requirement-summary/{id}` - Generate requirement summary (PDF)

**Features:**
- Use ReportLab for PDF generation
- Use python-docx for Word document generation
- Support custom templates
- Email reports via Microsoft Graph API

### 6. Microsoft Graph API Integration
**Features:**
- Sync users from Azure AD
- Send email notifications
- Calendar integration for interviews
- File storage for resumes and documents

**Endpoints:**
- `POST /api/integrations/graph/sync-users` - Sync users from Azure AD
- `POST /api/integrations/graph/send-email` - Send email via Graph API

### 7. Search & Filtering
Implement robust search and filtering capabilities:
- Full-text search for resources and requirements
- Filter by skills, location, experience, status
- Sort by multiple fields
- Pagination support (limit, offset)

## Database Schema Guidelines
1. Use UUID as primary keys for all tables
2. Add `created_at` and `updated_at` timestamps to all tables
3. Use proper indexing for frequently queried fields (email, status, etc.)
4. Implement soft deletes with `deleted_at` field where appropriate
5. Use foreign keys with CASCADE constraints appropriately

## API Design Standards
1. **REST Principles**: Follow RESTful conventions
2. **Response Format**:
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful",
  "timestamp": "2024-01-20T10:30:00Z"
}
```
3. **Error Format**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": []
  },
  "timestamp": "2024-01-20T10:30:00Z"
}
```
4. **HTTP Status Codes**:
   - 200: Success
   - 201: Created
   - 400: Bad Request
   - 401: Unauthorized
   - 403: Forbidden
   - 404: Not Found
   - 422: Validation Error
   - 500: Internal Server Error

## Security Requirements
1. **Password Security**:
   - Hash passwords using bcrypt (via passlib)
   - Minimum password length: 8 characters
   - Require password complexity

2. **JWT Authentication**:
   - Access token expiry: 1 hour
   - Refresh token expiry: 7 days
   - Store tokens securely (httpOnly cookies or localStorage)

3. **CORS Configuration**:
   - Allow frontend origin: `http://localhost:5173` (dev)
   - Configure for production domains

4. **Input Validation**:
   - Use Pydantic models for all request/response validation
   - Sanitize all user inputs
   - Prevent SQL injection (use SQLAlchemy ORM)

## Project Structure
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app initialization
│   ├── config.py               # Configuration management
│   ├── database.py             # Database connection
│   ├── models/                 # SQLAlchemy models
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── bench_resource.py
│   │   └── job_requirement.py
│   ├── schemas/                # Pydantic schemas
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── bench_resource.py
│   │   └── job_requirement.py
│   ├── api/                    # API routes
│   │   ├── __init__.py
│   │   ├── deps.py            # Dependencies (auth, db)
│   │   ├── auth.py
│   │   ├── users.py
│   │   ├── bench_resources.py
│   │   └── job_requirements.py
│   ├── services/               # Business logic
│   │   ├── __init__.py
│   │   ├── auth_service.py
│   │   ├── user_service.py
│   │   ├── bench_service.py
│   │   └── job_service.py
│   ├── integrations/           # External integrations
│   │   ├── __init__.py
│   │   ├── microsoft_graph.py
│   │   └── report_generator.py
│   └── utils/                  # Utilities
│       ├── __init__.py
│       ├── security.py
│       └── email.py
├── alembic/                    # Database migrations
├── tests/                      # Test files
├── requirements.txt
├── .env.example
└── README.md
```

## Environment Variables
```
# Database
DATABASE_URL=sqlite:///./xor_ats.db
# DATABASE_URL=postgresql://user:pass@localhost/xor_ats  # Production

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Microsoft Graph API
GRAPH_CLIENT_ID=your-client-id
GRAPH_CLIENT_SECRET=your-client-secret
GRAPH_TENANT_ID=your-tenant-id

# CORS
FRONTEND_URL=http://localhost:5173

# File Storage
UPLOAD_DIR=./uploads
MAX_UPLOAD_SIZE=10485760  # 10MB
```

## Testing Requirements
1. Unit tests for all services
2. Integration tests for API endpoints
3. Test coverage minimum: 80%
4. Use pytest for testing
5. Mock external services (Microsoft Graph API)

## Deliverables
1. Complete FastAPI backend with all endpoints
2. SQLAlchemy models with Alembic migrations
3. Pydantic schemas for validation
4. JWT authentication implementation
5. Microsoft Graph API integration
6. ReportLab PDF generation
7. python-docx document generation
8. Comprehensive API documentation (Swagger/ReDoc)
9. README with setup instructions
10. Docker configuration (optional but recommended)

## Getting Started Command
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Seed initial data (including admin user)
python -m app.seed

# Run development server
uvicorn app.main:app --reload --port 8000
```

## Notes
- Ensure all code is properly typed (use Python type hints)
- Follow PEP 8 style guide
- Add docstrings to all functions and classes
- Handle errors gracefully with proper logging
- Optimize database queries (use eager loading, avoid N+1 queries)
- Implement caching where appropriate (Redis optional)

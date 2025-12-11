# Technical Design Document (TDD)
# EduFlow - School Management System

---

## Document Control

| Field | Details |
|-------|---------|
| **Product Name** | EduFlow - School Management System |
| **TDD Version** | 1.0 |
| **Document Owner** | Technical Architecture Team |
| **Status** | Draft for Review |
| **Created** | December 9, 2024 |
| **Last Updated** | December 9, 2024 |
| **Related Documents** | School_Management_System_PRD.md v1.0 |
| **Target Deployment** | Multi-tenant SaaS Platform (Pakistan Market) |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Architecture](#2-system-architecture)
3. [Data Architecture](#3-data-architecture)
4. [API Design](#4-api-design)
5. [Component Design](#5-component-design)
6. [Integration Points](#6-integration-points)
7. [Security Design](#7-security-design)
8. [Performance & Scalability](#8-performance--scalability)
9. [Error Handling & Logging](#9-error-handling--logging)
10. [Testing Strategy](#10-testing-strategy)
11. [Deployment Strategy](#11-deployment-strategy)
12. [Monitoring & Maintenance](#12-monitoring--maintenance)
13. [Data Flow Diagrams](#13-data-flow-diagrams)
14. [Non-Functional Requirements](#14-non-functional-requirements)
15. [Assumptions & Constraints](#15-assumptions--constraints)
16. [Risks & Mitigation](#16-risks--mitigation)
17. [Development Phases](#17-development-phases)
18. [Data Migration Strategy](#18-data-migration-strategy)
19. [Open Questions](#19-open-questions)

---

## 1. Executive Summary

### 1.1 Project Overview

**EduFlow** is a modern, multi-tenant School Management System designed for the Pakistani education market, supporting 10 schools initially with scalability to 100+ schools. The platform addresses critical pain points in existing SMS solutions through a mobile-first, offline-capable PWA architecture with plans for native mobile apps.

**Key Characteristics:**
- Multi-tenant SaaS with tenant isolation at database level
- Hybrid deployment model (self-hosted for testing, cloud for production)
- Support for 500+ students, 50+ teachers, 5+ admin staff per school
- Target of 100+ concurrent users per school
- Real-time messaging and notifications
- Offline-first architecture for critical features
- Support for English UI with Urdu/Arabic data input

### 1.2 Key Technical Decisions

| Decision Area | Choice | Justification |
|--------------|--------|---------------|
| **Architecture Style** | Microservices-lite (Modular Monolith initially) | Easier deployment for self-hosted testing, can evolve to microservices |
| **Frontend Framework** | Next.js 14 (App Router) with TypeScript | SSR/SSG for performance, PWA support, SEO benefits |
| **Backend Framework** | NestJS with TypeScript | Scalable architecture, built-in DI, modular design |
| **Primary Database** | PostgreSQL 16 | ACID compliance for financial transactions, complex relational data |
| **Secondary Database** | MongoDB 7.0 | Flexible schema for logs, chat, notifications, analytics |
| **Caching Layer** | Redis 7.2 | Session management, real-time features, rate limiting |
| **Real-time Engine** | Socket.io | Bi-directional communication for messaging, live updates |
| **Message Queue** | BullMQ (Redis-based) | Background jobs, email sending, report generation |
| **File Storage** | AWS S3 / MinIO (self-hosted) | Scalable file storage for documents, images, backups |
| **API Architecture** | RESTful + GraphQL (hybrid) | REST for CRUD, GraphQL for complex queries |
| **Authentication** | JWT + Refresh Tokens | Stateless auth, mobile-friendly, scalable |

### 1.3 High-Level Timeline

| Phase | Duration | Key Deliverables |
|-------|----------|------------------|
| **Phase 1: Core MVP** | 3-4 months | User management, student/teacher/class management, basic attendance, grades |
| **Phase 2: Essential Features** | 2-3 months | Fee management, timetable, announcements, basic reporting |
| **Phase 3: Advanced Features** | 2-3 months | Real-time messaging, advanced analytics, offline support |
| **Phase 4: Polish & Scale** | 1-2 months | Performance optimization, security hardening, documentation |
| **Total** | 8-12 months | Full production-ready system |

### 1.4 Infrastructure Requirements

**Self-hosted Testing:**
- Windows Server (RTX 3060 Ti, 16GB RAM, 1TB) - ✅ Available
- Docker Desktop for Windows with WSL2
- Supports 10-15 concurrent users

**Cloud Production:**
- 2× EC2 t3.medium instances (auto-scaling)
- RDS PostgreSQL db.t3.medium (Multi-AZ)
- ElastiCache Redis cache.t3.micro
- MongoDB Atlas M10
- S3 Storage (1TB)
- CloudFront CDN
- **Estimated Cost**: $350-600/month for 10-50 schools

---

## 2. System Architecture

### 2.1 Architecture Overview

**Modular Monolith with Microservices Evolution Path**

Starting with a modular monolith that can be split into microservices as needed. This provides:
- Simplified deployment for self-hosted environments
- Faster initial development
- Clear module boundaries for future extraction
- Lower operational complexity

**Core Modules:**
- Authentication & Authorization
- User Management
- School Management
- Academic Module (Classes, Subjects, Timetable)
- Attendance Module
- Grade Management
- Fee Management
- Communication (Messaging, Announcements)
- Reporting & Analytics
- Notification Module
- File Management

### 2.2 Technology Stack Summary

**Frontend:**
- Next.js 14, React 18, TypeScript
- Tailwind CSS, shadcn/ui
- Zustand (state), React Query (server state)
- Socket.io client, Workbox (PWA)

**Backend:**
- NestJS, Node.js 20 LTS, TypeScript
- PostgreSQL 16, MongoDB 7.0, Redis 7.2
- BullMQ, Socket.io, Passport.js
- TypeORM, Mongoose

**Infrastructure:**
- Docker, Kubernetes (cloud) / Docker Compose (self-hosted)
- GitHub Actions (CI/CD)
- Prometheus, Grafana, ELK Stack
- AWS/GCP/Azure (cloud) or self-hosted

### 2.3 Multi-Tenancy Architecture

**Three-Tier Tenant Hierarchy**

EduFlow supports school chains (like Beaconhouse, City School) with multiple branches:

```
Platform (EduFlow SaaS)
└── Organization (School Chain, e.g., "Lahore Grammar School")
    ├── School: LGS Johar Town (Lahore)
    ├── School: LGS DHA (Lahore)
    ├── School: LGS Gulberg (Karachi)
    └── School: LGS F-7 (Islamabad)
```

**Role Hierarchy:**
| Role | Scope | Access |
|------|-------|--------|
| `super_admin` | Platform-wide | All organizations, all schools, system settings |
| `org_admin` | Organization-wide | All schools in organization, org-level settings |
| `school_admin` | Single school | Full access within their assigned school |
| All others | Single school | Role-specific access |

**Shared Database with Tenant Isolation**

Tables include `organization_id` and/or `school_id` for filtering:

```typescript
// Middleware injects tenant context from JWT
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const { organizationId, schoolId } = extractTenantFromToken(req);
    req['organizationId'] = organizationId;
    req['schoolId'] = schoolId;
    next();
  }
}
```

**Benefits:**
- Lower infrastructure costs
- Simplified deployments
- Easier maintenance
- Fast tenant provisioning
- School chain consolidation

**Tenant Identification:**
- Subdomain: `school-name.eduflow.pk`
- Custom domain: `sms.schoolname.edu.pk`
- JWT contains `organization_id` and `school_id`
- Header fallback: `X-Tenant-ID`

---

## 3. Data Architecture

### 3.1 Database Strategy

**Polyglot Persistence:**

1. **PostgreSQL 16** - Transactional data (users, students, fees, grades)
2. **MongoDB 7.0** - Flexible data (logs, chat, notifications, analytics)
3. **Redis 7.2** - Caching, sessions, queues, real-time

> [!NOTE]
> **Complete Schema Documentation**: See [Database_Schema.md](./Database_Schema.md) for full PostgreSQL schema with all tables, indexes, constraints, and NestJS entity mappings.

### 3.2 PostgreSQL Core Tables

**Organizations (NEW):**
- `organizations` - School chain/group records (e.g., "Beaconhouse School System")

**Core & Multi-tenancy:**
- `schools` - Individual school branches with `organization_id` reference
- `users` - All system users (role-based with soft delete)
- `refresh_tokens` - JWT refresh token storage
- `password_history` - Password reuse prevention

**Academic Structure:**
- `academic_years` - Academic sessions (e.g., 2024-2025)
- `terms` - Term/semester definitions (First Term, Mid-Year, Final)
- `classes` - Grade levels (Class 1-10)
- `sections` - Class sections (5-A, 5-B)
- `subjects` - Subject definitions
- `class_subjects` - Subject-class-teacher mapping
- `academic_events` - Calendar events and holidays

**Student Management:**
- `students` - Student records with soft delete, sibling tracking
- `parent_students` - Parent-child relationship (many-to-many)
- `student_documents` - Document attachments

**Attendance:**
- `attendance` - Daily attendance with offline sync support

**Grades & Assessments:**
- `grading_scales` - School-specific grading scales
- `assessments` - Exams, quizzes, assignments (linked to terms)
- `grades` - Individual student grades

**Fee Management:**
- `fee_structures` - Fee templates with late fee configuration
- `fees` - Assigned fees to students
- `payments` - Payment transactions

**Staff & HR (NEW):**
- `staff_profiles` - Extended employee information
- `leave_types` - Leave categories (casual, sick, annual)
- `leave_requests` - Leave applications with approval workflow

**Transport (NEW):**
- `transport_routes` - School bus/van routes with GPS-ready stops

**Timetables:**
- `timetable_slots` - Period definitions
- `timetables` - Class schedule entries

**Messaging & Notifications:**
- `messages` - Internal messaging and announcements
- `message_recipients` - Message delivery and read status
- `notifications` - System notifications

**Audit:**
- `audit_logs` - Complete audit trail for compliance

**Schema Conventions:**
- Tables: `snake_case`, plural
- Primary Keys: `id` (UUID v4)
- Foreign Keys: `{singular_table}_id`
- Soft Delete: `deleted_at` column on key tables
- Multi-tenancy: `school_id` on all tenant-scoped tables
- Always include: `created_at`, `updated_at`

### 3.3 MongoDB Collections

- `chat_messages` - Real-time messaging content
- `conversations` - Chat conversation threads
- `analytics_events` - User behavior analytics
- `activity_feed` - User activity streams

### 3.4 Data Retention

| Data Type | Retention | Strategy |
|-----------|-----------|----------|
| Active Students | Current + 2 years | Archive after graduation |
| Attendance | 10 years | Partition by year |
| Grades | 10 years | Maintain in database |
| Fee Transactions | 10 years | Audit compliance |
| Audit Logs | 2 years | Partition by month |
| Chat Messages | 1 year | MongoDB TTL index |
| Notifications | 90 days | Auto-deletion |
| Session Tokens | 30 days | Auto-cleanup |

---

## 4. API Design

### 4.1 API Architecture

**Hybrid: REST + GraphQL + WebSocket**

- **REST**: CRUD operations, file uploads
- **GraphQL**: Complex queries, nested data
- **WebSocket**: Real-time messaging, notifications

**Versioning:** `/api/v1/`, `/api/v2/`

### 4.2 Authentication

**JWT-based with Refresh Tokens**

**Flow:**
1. Login → Access Token (15 min) + Refresh Token (30 days)
2. API requests use Access Token
3. Expired token → Use Refresh Token to get new Access Token

**IMPORTANT: No Public Registration**

🚫 **EduFlow does NOT have a public registration page.** All user accounts are created by administrators in a hierarchical manner. There is no "Sign Up" button or self-registration flow.

**Hierarchical Admin Management:**

Administrators cannot self-register. All admin accounts are created by parent-level admins:

| Creator | Can Create |
|---------|------------|
| **Super Admin** | Org Admins, School Admins, Organizations, Schools |
| **Org Admin** | School Admins (within org), Other Org Admins (within org), Schools (within org) |
| **School Admin** | Staff (Principal, Teachers, Accountant, etc.) |

**Initial Setup:**
1. System seeds default Super Admin on first deployment
2. Super Admin creates Organizations and Org Admins
3. Org Admins create Schools and School Admins
4. School Admins create Staff members
5. Staff members (Teachers, etc.) create Students and Parents

**Token Structure:**
```json
{
  "sub": "user-uuid",
  "organization_id": "org-uuid",
  "school_id": "school-uuid",
  "role": "teacher",
  "permissions": ["read:students", "write:attendance"]
}
```

### 4.3 Authorization (RBAC)

**Roles (Hierarchical):**
- `super_admin` - Platform administrator (seeded, not created via UI)
- `org_admin` - Organization/school chain administrator
- `school_admin` - School administrator
- `principal` - School principal
- `vice_principal` - Assistant principal
- `teacher` - Teaching staff
- `accountant` - Finance staff
- `hr` - Human resources
- `librarian` - Library management
- `receptionist` - Front desk
- `parent` - Student guardian
- `student` - Enrolled student

**Data Scope by Role:**

| Role | Data Scope | Access Level |
|------|-----------|--------------|
| `super_admin` | **All organizations, all schools** | Full platform access |
| `org_admin` | **All schools in their organization** | Organization-wide access |
| `school_admin` | **Only their assigned school** | School-wide access |
| All others | **Only their assigned school** | Role-specific access |

**CRUD Permissions Matrix:**

See Section 4.3.1 below for complete CRUD permissions by role and entity.

### 4.3.1 CRUD Permissions Matrix

**Legend:**
- ✅ **Full Access** - Create, Read, Update, Delete
- 📖 **Read Only** - View only
- 📝 **Create & Read** - Can create new records and view
- ✏️ **Read & Update** - Can view and modify
- ❌ **No Access** - Cannot access

#### Organizations & Schools

| Role | Organizations | Schools | Academic Years | Classes/Sections |
|------|---------------|---------|----------------|------------------|
| **Super Admin** | ✅ Full | ✅ Full | ✅ Full (all schools) | ✅ Full (all schools) |
| **Org Admin** | 📖 Read Own | ✅ Full (within org) | ✅ Full (org schools) | ✅ Full (org schools) |
| **School Admin** | ❌ No Access | 📖 Read Own | ✅ Full (own school) | ✅ Full (own school) |
| **Principal** | ❌ No Access | 📖 Read Own | 📖 Read Only | ✏️ Read & Update |
| **Vice Principal** | ❌ No Access | 📖 Read Own | 📖 Read Only | ✏️ Read & Update |
| **Teacher** | ❌ No Access | 📖 Read Own | 📖 Read Only | 📖 Read Only |
| **Accountant** | ❌ No Access | 📖 Read Own | 📖 Read Only | 📖 Read Only |
| **HR** | ❌ No Access | 📖 Read Own | 📖 Read Only | 📖 Read Only |
| **Parent** | ❌ No Access | 📖 Read Own | 📖 Read Only | 📖 Read Only |
| **Student** | ❌ No Access | 📖 Read Own | 📖 Read Only | 📖 Read Only |

#### Users & Staff

| Role | Create Users | View Users | Update Users | Delete Users | Scope |
|------|-------------|-----------|--------------|--------------|-------|
| **Super Admin** | ✅ All roles | ✅ All | ✅ All | ✅ All | Platform-wide |
| **Org Admin** | ✅ School Admins, Org Admins | ✅ Org-wide | ✅ Org-wide | ✅ Org-wide | Organization only |
| **School Admin** | ✅ Staff (not admins) | ✅ School-wide | ✅ School-wide | ✅ School-wide | School only |
| **Principal** | ❌ No | ✅ School-wide | ✏️ Limited (own staff) | ❌ No | School only |
| **HR** | 📝 Create Staff | ✅ Staff only | ✏️ Staff only | ❌ No | School only |
| All others | ❌ No | 📖 Limited | ❌ No | ❌ No | - |

#### Students

| Role | Create | Read | Update | Delete | Notes |
|------|--------|------|--------|--------|-------|
| **Super Admin** | ✅ Yes | ✅ All schools | ✅ All | ✅ All | Platform-wide |
| **Org Admin** | ✅ Yes | ✅ Org schools | ✅ Org-wide | ✅ Org-wide | Organization only |
| **School Admin** | ✅ Yes | ✅ School-wide | ✅ School-wide | ✅ Soft delete | School only |
| **Principal** | ✅ Yes | ✅ School-wide | ✅ School-wide | ✅ Soft delete | School only |
| **Vice Principal** | ✅ Yes | ✅ School-wide | ✅ School-wide | ❌ No | School only |
| **Teacher** | ❌ No | 📖 Own classes | ✏️ Limited (contact info) | ❌ No | Assigned classes |
| **Accountant** | ❌ No | ✅ School-wide | ❌ No | ❌ No | For fee management |
| **HR** | ❌ No | 📖 Read Only | ❌ No | ❌ No | Staff records only |
| **Parent** | ❌ No | 📖 Own children | ❌ No | ❌ No | Own children only |
| **Student** | ❌ No | 📖 Self only | ✏️ Profile only | ❌ No | Own record only |

#### Attendance

| Role | Mark Attendance | View | Update/Correct | Delete | Scope |
|------|----------------|------|----------------|--------|-------|
| **Super Admin** | ✅ Yes | ✅ All | ✅ All | ✅ Yes | Platform-wide |
| **Org Admin** | ✅ Yes | ✅ Org-wide | ✅ Org-wide | ✅ Yes | Organization |
| **School Admin** | ✅ Yes | ✅ School-wide | ✅ School-wide | ✅ Yes | School only |
| **Principal** | ✅ Yes | ✅ School-wide | ✅ School-wide | ✅ Yes | School only |
| **Vice Principal** | ✅ Yes | ✅ School-wide | ✅ School-wide | ✅ Yes | School only |
| **Teacher** | ✅ Yes | 📖 Own classes | ✏️ Own classes (24h limit) | ❌ No | Assigned classes |
| **Accountant** | ❌ No | 📖 Read Only | ❌ No | ❌ No | For reports |
| **Parent** | ❌ No | 📖 Own children | ❌ No | ❌ No | Own children |
| **Student** | ❌ No | 📖 Self only | ❌ No | ❌ No | Own record |

#### Grades & Assessments

| Role | Create Assessments | Enter Grades | View | Update Grades | Delete | Publish |
|------|-------------------|--------------|------|---------------|--------|---------|
| **Super Admin** | ✅ Yes | ✅ Yes | ✅ All | ✅ All | ✅ Yes | ✅ Yes |
| **Org Admin** | ✅ Yes | ✅ Yes | ✅ Org-wide | ✅ Org-wide | ✅ Yes | ✅ Yes |
| **School Admin** | ✅ Yes | ✅ Yes | ✅ School-wide | ✅ School-wide | ✅ Yes | ✅ Yes |
| **Principal** | ✅ Yes | ✅ Yes | ✅ School-wide | ✅ School-wide | ✅ Yes | ✅ Yes |
| **Vice Principal** | ✅ Yes | ✅ Yes | ✅ School-wide | ✅ School-wide | ❌ No | ✏️ Recommend |
| **Teacher** | ✅ Own subjects | ✅ Own subjects | 📖 Own classes | ✏️ Own (before publish) | ❌ No | ❌ No |
| **Accountant** | ❌ No | ❌ No | 📖 Read Only | ❌ No | ❌ No | ❌ No |
| **Parent** | ❌ No | ❌ No | 📖 Own children (published) | ❌ No | ❌ No | ❌ No |
| **Student** | ❌ No | ❌ No | 📖 Self (published) | ❌ No | ❌ No | ❌ No |

#### Fees & Payments

| Role | Create Fee Structures | Assign Fees | View | Record Payments | Update | Delete |
|------|----------------------|-------------|------|-----------------|--------|--------|
| **Super Admin** | ✅ Yes | ✅ All | ✅ All | ✅ Yes | ✅ All | ✅ Yes |
| **Org Admin** | ✅ Yes | ✅ Org-wide | ✅ Org-wide | ✅ Yes | ✅ Org-wide | ✅ Yes |
| **School Admin** | ✅ Yes | ✅ School-wide | ✅ School-wide | ✅ Yes | ✅ School-wide | ✅ Yes |
| **Principal** | ✅ Yes | ✅ School-wide | ✅ School-wide | ✅ Yes | ✅ School-wide | ❌ No |
| **Accountant** | ✅ Yes | ✅ School-wide | ✅ School-wide | ✅ Yes | ✅ Fee-related | ✏️ Pending only |
| **Teacher** | ❌ No | ❌ No | 📖 Own classes | ❌ No | ❌ No | ❌ No |
| **Parent** | ❌ No | ❌ No | 📖 Own children | ✅ Pay online | ❌ No | ❌ No |
| **Student** | ❌ No | ❌ No | 📖 Self only | ❌ No | ❌ No | ❌ No |

#### Timetables

| Role | Create | View | Update | Delete | Scope |
|------|--------|------|--------|--------|-------|
| **Super Admin** | ✅ Yes | ✅ All | ✅ All | ✅ Yes | Platform-wide |
| **Org Admin** | ✅ Yes | ✅ Org-wide | ✅ Org-wide | ✅ Yes | Organization |
| **School Admin** | ✅ Yes | ✅ School-wide | ✅ School-wide | ✅ Yes | School only |
| **Principal** | ✅ Yes | ✅ School-wide | ✅ School-wide | ✅ Yes | School only |
| **Vice Principal** | ✏️ Draft | ✅ School-wide | ✏️ Draft only | ❌ No | School only |
| **Teacher** | ❌ No | 📖 Own schedule | ❌ No | ❌ No | Own schedule |
| **Student** | ❌ No | 📖 Own class | ❌ No | ❌ No | Own class |
| **Parent** | ❌ No | 📖 Children's classes | ❌ No | ❌ No | Children |

#### Messages & Announcements

| Role | Send Announcements | Send Direct Messages | View | Reply | Delete |
|------|-------------------|---------------------|------|-------|--------|
| **Super Admin** | ✅ Platform-wide | ✅ All | ✅ All | ✅ Yes | ✅ Yes |
| **Org Admin** | ✅ Org-wide | ✅ Org-wide | ✅ Org-wide | ✅ Yes | ✅ Yes |
| **School Admin** | ✅ School-wide | ✅ School-wide | ✅ School-wide | ✅ Yes | ✅ Yes |
| **Principal** | ✅ School-wide | ✅ School-wide | ✅ School-wide | ✅ Yes | ✅ Own |
| **Teacher** | ✅ Own classes | ✅ Students/Parents | 📖 Received | ✅ Yes | ✅ Own |
| **Parent** | ❌ No | ✅ Teachers only | 📖 Received | ✅ Yes | ✅ Own |
| **Student** | ❌ No | ✅ Teachers only | 📖 Received | ✅ Yes | ✅ Own |

#### Reports & Analytics

| Role | View Reports | Export Data | Analytics Dashboard | Custom Reports |
|------|-------------|-------------|-----------------------|----------------|
| **Super Admin** | ✅ All | ✅ All | ✅ Platform-wide | ✅ Yes |
| **Org Admin** | ✅ Org-wide | ✅ Org-wide | ✅ Organization | ✅ Yes |
| **School Admin** | ✅ School-wide | ✅ School-wide | ✅ School | ✅ Yes |
| **Principal** | ✅ School-wide | ✅ School-wide | ✅ School | ✅ Yes |
| **Vice Principal** | ✅ School-wide | ✅ School-wide | ✅ School | ✏️ Limited |
| **Teacher** | 📖 Own classes | 📖 Own classes | ❌ No | ❌ No |
| **Accountant** | ✅ Financial | ✅ Financial | ✅ Financial | ✅ Financial |
| **Parent** | 📖 Own children | 📖 Own children | ❌ No | ❌ No |
| **Student** | 📖 Self only | 📖 Self only | ❌ No | ❌ No |

**Implementation Notes:**

1. **Row-Level Security**: All database queries automatically filter by `organization_id` and/or `school_id` based on JWT claims
2. **Permission Checks**: Every API endpoint validates user role and data scope before processing
3. **Audit Logging**: All CRUD operations logged with user, timestamp, and changes
4. **Soft Deletes**: Critical entities (students, staff) use soft delete (`deleted_at`) instead of hard delete
5. **Time-Based Restrictions**: Some operations (e.g., attendance correction) have time limits enforced at API level

### 4.4 Core API Endpoints

**Authentication:**
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/forgot-password`
- `GET /api/v1/auth/me`

**User Management (Hierarchical):**
- `POST /api/v1/users` - Create user (role-restricted)
- `GET /api/v1/users` - List users (filtered by scope)
- `PATCH /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Deactivate user

**Students:**
- `GET /api/v1/students` - List students (filtered by role)
- `POST /api/v1/students` - Create student
- `GET /api/v1/students/:id` - Get student details
- `PATCH /api/v1/students/:id` - Update student
- `DELETE /api/v1/students/:id` - Soft delete

**Attendance:**
- `POST /api/v1/attendance/bulk` - Mark attendance for class
- `GET /api/v1/attendance` - Get attendance records
- `GET /api/v1/attendance/report` - Generate report

**Grades:**
- `POST /api/v1/assessments` - Create assessment
- `POST /api/v1/grades/bulk` - Bulk grade entry
- `GET /api/v1/students/:id/report-card` - Get report card

**Fees:**
- `POST /api/v1/fees/assign` - Assign fees to students
- `POST /api/v1/fees/payment` - Record payment
- `GET /api/v1/fees/pending` - Get pending fees

### 4.5 Rate Limiting

- **Per User**: 100 requests/minute
- **Per IP**: 300 requests/minute
- **Payment APIs**: 10 requests/minute

---

## 5. Component Design

### 5.1 Frontend Architecture

**Next.js App Structure:**
```
/app
  /(auth)
    /login              # ONLY login page (no registration)
    /forgot-password    # Password reset flow
  /(dashboard)
    /students
    /attendance
    /grades
    /fees
    /reports
    /users              # Admin creates users here
  /api (API routes for BFF pattern)
/components
  /ui (shadcn/ui components)
  /features
    /user-management  # User creation forms by role
/lib
  /api (API client)
  /hooks
  /utils
/store (Zustand stores)
```

**Note**: There is NO `/register` route. All user creation happens through admin dashboards.

**Key Frontend Components:**
- Authentication System
- Student Management Module
- Attendance Marking (Quick bulk entry UI)
- Grade Entry System
- Fee Management Dashboard
- Real-time Messaging Component
- Report Generator
- Offline Sync Manager

### 5.2 Backend Architecture

**NestJS Module Structure:**
```
/src
  /auth (Authentication module)
  /users (User management)
  /students (Student CRUD)
  /teachers (Teacher CRUD)
  /attendance (Attendance logic)
  /grades (Grade management)
  /fees (Fee management + payments)
  /communication (Messaging, announcements)
  /reports (Report generation)
  /notifications (Notification service)
  /common (Shared utilities, guards, interceptors)
```

**Key Backend Services:**
- Auth Service (JWT, sessions)
- Tenant Service (Multi-tenancy logic)
- Student Service (CRUD + business logic)
- Attendance Service (Bulk marking, validation)
- Grade Service (Assessment management)
- Fee Service (Payment processing)
- Notification Service (Multi-channel delivery)
- Report Service (PDF generation)
- Email Service (Transactional emails)
- Background Jobs (BullMQ workers)

---

## 6. Integration Points

### 6.1 Payment Gateways

**JazzCash Integration:**
- Sandbox: `https://sandbox.jazzcash.com.pk/`
- API: Mobile Account API
- Currency: PKR
- Features: Mobile wallet payments

**Bank Transfer:**
- Manual verification
- Upload receipt
- Admin approval flow

**Stripe Integration:**
- API: `https://api.stripe.com/v1/`
- Currency: USD (for international payments)
- Features: Card payments, subscriptions

### 6.2 Email Service

**Transactional Emails (Free tier initially):**
- **Options**: SendGrid Free, AWS SES, Mailgun
- **Use cases**: Verification, password reset, receipts, announcements

### 6.3 SMS Service (Future)

**Local SMS Providers (Pakistan):**
- JazzCash SMS API
- Telenor SMS API
- Third-party aggregators

### 6.4 File Storage

**S3-Compatible Storage:**
- **Production**: AWS S3
- **Self-hosted**: MinIO
- **Features**: Pre-signed URLs, CDN integration

---

## 7. Security Design

### 7.1 Authentication Security

- Bcrypt password hashing (salt rounds: 12)
- JWT with RS256 signing
- Refresh token rotation
- Session management in Redis
- 2FA support (TOTP)

### 7.2 Data Encryption

- **At Rest**: AES-256 (database encryption)
- **In Transit**: TLS 1.3 (all API communication)
- **Sensitive Fields**: Application-level encryption (SSN, account numbers)

### 7.3 Input Validation

- Joi/Class-validator for all inputs
- SQL injection prevention (ORM parameterized queries)
- XSS prevention (sanitization)
- CSRF protection

### 7.4 Access Control

- Row-level security (tenant_id filtering)
- Role-based permissions
- JWT permission claims
- Rate limiting (Redis-based)

### 7.5 Audit Logging

- All data mutations logged
- Login/logout tracking
- Financial transaction trail
- 2-year retention

### 7.6 OWASP Top 10 Mitigation

| Vulnerability | Mitigation |
|---------------|------------|
| Injection | Parameterized queries, input validation |
| Broken Authentication | JWT, 2FA, session management |
| Sensitive Data Exposure | Encryption at rest/transit |
| XXE | Disable XML external entities |
| Broken Access Control | RBAC, tenant isolation |
| Security Misconfiguration | Security headers, regular audits |
| XSS | Content sanitization, CSP headers |
| Insecure Deserialization | Validate all inputs |
| Using Components with Vulnerabilities | Automated dependency scanning |
| Insufficient Logging | Comprehensive audit logs |

---

## 8. Performance & Scalability

### 8.1 Performance Targets

- Page load: < 2 seconds
- API response: < 500ms
- Attendance marking: < 30 seconds for 30 students
- Report generation: < 10 seconds

### 8.2 Caching Strategy

**Redis Caching:**
- User sessions (30 min TTL)
- API responses (5-60 min TTL)
- Student lists (15 min TTL, invalidate on update)
- Timetable data (24 hour TTL)
- Report data (1 hour TTL)

### 8.3 Database Optimization

- Indexes on tenant_id, foreign keys, date fields
- Partitioning for attendance table (monthly)
- Connection pooling (max 20 connections per instance)
- Read replicas for reporting queries

### 8.4 Scalability Approach

**Horizontal Scaling:**
- Stateless application servers
- Load balancer distributes traffic
- Auto-scaling based on CPU (50-70% threshold)

**Vertical Scaling:**
- Upgrade database instances as data grows
- Add read replicas for read-heavy workloads

---

## 9. Error Handling & Logging

### 9.1 Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "issue": "Invalid email format"
    }
  }
}
```

### 9.2 Error Codes

- `AUTHENTICATION_FAILED`
- `AUTHORIZATION_DENIED`
- `VALIDATION_ERROR`
- `RESOURCE_NOT_FOUND`
- `DUPLICATE_ENTRY`
- `INTERNAL_SERVER_ERROR`

### 9.3 Logging Levels

- **ERROR**: Application errors
- **WARN**: Potential issues
- **INFO**: Business events
- **DEBUG**: Development debugging

### 9.4 Log Aggregation

- Winston logger → Elasticsearch
- Structured JSON logs
- Correlation IDs for request tracing
- 90-day retention

---

## 10. Testing Strategy

### 10.1 Testing Pyramid

```
                 /\
                /  \
               /    \
              / E2E  \       (5%)  - Critical user flows
             /--------\
            /          \
           / Integration\    (20%) - API endpoints, database
          /--------------\
         /                \
        /   Unit Tests     \  (75%) - Business logic, utilities
       /--------------------\
```

**Test Distribution**:
- **Unit Tests**: 75% coverage - Test individual functions, services
- **Integration Tests**: 20% coverage - Test API endpoints with database
- **End-to-End Tests**: 5% coverage - Test critical user workflows

**Coverage Goals**:
- **Overall**: 80% code coverage
- **Critical Paths**: 90% coverage (auth, payments, grades)
- **Business Logic**: 85% coverage

---

### 10.2 Unit Testing

**Framework**: Jest

**What to Test**:
- Business logic functions
- Utility functions
- Data transformations
- Calculations (grade calculation, attendance percentage)
- Validation logic

**Example Unit Test**:
```typescript
// grade-calculator.spec.ts
describe('GradeCalculator', () => {
  describe('calculateGradeLetter', () => {
    it('should return A+ for 90% or above', () => {
      expect(calculateGradeLetter(90, 100)).toBe('A+');
      expect(calculateGradeLetter(95, 100)).toBe('A+');
    });
    
    it('should return A for 80-89%', () => {
      expect(calculateGradeLetter(80, 100)).toBe('A');
      expect(calculateGradeLetter(85, 100)).toBe('A');
    });
    
    it('should return F for below 40%', () => {
      expect(calculateGradeLetter(30, 100)).toBe('F');
    });
  });
  
  describe('calculateWeightedAverage', () => {
    it('should calculate correctly with equal weightage', () => {
      const assessments = [
        {totalMarks: 100, weightage: 50},
        {totalMarks: 100, weightage: 50}
      ];
      const grades = [
        {marksObtained: 80},
        {marksObtained: 90}
      ];
      
      const result = calculateWeightedAverage(assessments, grades);
      expect(result).toBe(85.0);
    });
  });
});
```

**Mocking**:
```typescript
// Mocking database calls
jest.mock('../database/prisma.service');

describe('StudentService', () => {
  let service: StudentService;
  let prisma: jest.Mocked<PrismaService>;
  
  beforeEach(() => {
    prisma = {
      student: {
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn()
      }
    } as any;
    
    service = new StudentService(prisma);
  });
  
  it('should return all students for a school', async () => {
    const mockStudents = [{id: '1', name: 'Test'}];
    prisma.student.findMany.mockResolvedValue(mockStudents);
    
    const result = await service.findBySchool('school-id');
    
    expect(result).toEqual(mockStudents);
    expect(prisma.student.findMany).toHaveBeenCalledWith({
      where: {schoolId: 'school-id'}
    });
  });
});
```

---

### 10.3 Integration Testing

**Framework**: Jest + Supertest

**What to Test**:
- API endpoints (request → response)
- Database operations
- Authentication/authorization
- Error handling
- Validation

**Example Integration Test**:
```typescript
// students.e2e.spec.ts
describe('Students API (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  
  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();
    
    app = moduleFixture.createNestApplication();
    await app.init();
    
    // Login to get token
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({email: 'admin@test.com', password: 'password'});
    
    accessToken = response.body.data.accessToken;
  });
  
  afterAll(async () => {
    await app.close();
  });
  
  describe('GET /students', () => {
    it('should return list of students', async () => {
      const response = await request(app.getHttpServer())
        .get('/students')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
    
    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .get('/students')
        .expect(401);
    });
  });
  
  describe('POST /students', () => {
    it('should create a new student', async () => {
      const createDto = {
        firstName: 'Test',
        lastName: 'Student',
        email: 'test@student.com',
        classId: 'class-uuid',
        admissionNumber: 'ADM-2024-001'
      };
      
      const response = await request(app.getHttpServer())
        .post('/students')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createDto)
        .expect(201);
      
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.email).toBe(createDto.email);
    });
    
    it('should return 400 for invalid email', async () => {
      const createDto = {
        firstName: 'Test',
        email: 'invalid-email'
      };
      
      const response = await request(app.getHttpServer())
        .post('/students')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createDto)
        .expect(400);
      
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
```

---

### 10.4 End-to-End Testing

**Framework**: Playwright (frontend E2E)

**Critical User Flows to Test**:
1. **Teacher**: Login → Mark Attendance → Logout
2. **Parent**: Login → View Child's Grades → Pay Fee → Logout
3. **Admin**: Login → Create Student → Assign Fees → Logout
4. **Student**: Login → View Timetable → View Grades → Logout

**Example E2E Test**:
```typescript
// attendance-marking.spec.ts
import {test, expect} from '@playwright/test';

test.describe('Attendance Marking Flow', () => {
  test('teacher can mark attendance for class', async ({page}) => {
    // Login
    await page.goto('http://localhost:3000/login');
    await page.fill('[name="email"]', 'teacher@test.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    
    // Navigate to attendance
    await page.click('text=Attendance');
    await expect(page).toHaveURL(/.*\/attendance/);
    
    // Select class
    await page.selectOption('[name="classId"]', 'class-uuid');
    
    // Mark students present
    await page.click('[data-student="student-1"] [data-status="present"]');
    await page.click('[data-student="student-2"] [data-status="present"]');
    await page.click('[data-student="student-3"] [data-status="absent"]');
    
    // Submit
    await page.click('button:has-text("Submit Attendance")');
    
    // Verify success
    await expect(page.locator('.toast-success')).toBeVisible();
    await expect(page.locator('.toast-success')).toContainText('Attendance marked successfully');
  });
});
```

---

### 10.5 Performance Testing

**Tools**: Apache JMeter, K6, Artillery

**Test Scenarios**:
1. **Load Test**: Simulate normal load (100 concurrent users)
2. **Stress Test**: Test beyond normal load (500+ concurrent users)
3. **Spike Test**: Sudden traffic spike (0 → 1000 users in 1 minute)
4. **Endurance Test**: Sustained load over time (100 users for 24 hours)

**Example K6 Script**:
```javascript
// load-test.js
import http from 'k6/http';
import {check, sleep} from 'k6';

export const options = {
  stages: [
    {duration: '2m', target: 50},  // Ramp up to 50 users
    {duration: '5m', target: 100}, // Stay at 100 users
    {duration: '2m', target: 0},   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.01'],   // Less than 1% failure rate
  }
};

export default function() {
  // Login
  const loginRes = http.post('https://api.eduflow.pk/v1/auth/login', {
    email: 'test@example.com',
    password: 'password'
  });
  
  check(loginRes, {
    'login successful': (r) => r.status === 200
  });
  
  const token = loginRes.json('data.accessToken');
  
  // Get students
  const studentsRes = http.get('https://api.eduflow.pk/v1/students', {
    headers: {Authorization: `Bearer ${token}`}
  });
  
  check(studentsRes, {
    'students loaded': (r) => r.status === 200,
    'response time OK': (r) => r.timings.duration < 500
  });
  
  sleep(1);
}
```

**Performance Acceptance Criteria**:
- 95% of requests complete in < 500ms
- 99% of requests complete in < 1s
- Error rate < 0.1%
- System stable under 100 concurrent users for 24 hours

---

### 10.6 Security Testing

**Tools**: OWASP ZAP, Burp Suite, npm audit, Snyk

**Tests**:
1. **Vulnerability Scanning**: Automated scan for known vulnerabilities
2. **Penetration Testing**: Manual testing by security expert
3. **Dependency Audit**: Check for vulnerable dependencies
4. **SQL Injection Testing**: Attempt SQL injection attacks
5. **XSS Testing**: Attempt cross-site scripting attacks
6. **Authentication Testing**: Test auth bypass attempts
7. **Authorization Testing**: Test privilege escalation

**Automated Security Checks**:
```bash
# NPM audit for vulnerable dependencies
npm audit

# Snyk scan
snyk test

# OWASP ZAP baseline scan
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t https://api.eduflow.pk -r security-report.html
```

---

### 10.7 Test Automation Approach

**CI/CD Pipeline**:
```yaml
# .github/workflows/test.yml
name: Test Pipeline

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:coverage
      
  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: test
      redis:
        image: redis:7
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run test:integration
  
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npx playwright install
      - run: npm run test:e2e
```

**Test Execution Strategy**:
- **Pre-commit**: Linting, type checking
- **On PR**: Unit tests, integration tests
- **On merge to main**: All tests + E2E tests
- **Nightly**: Performance tests, security scans
- **Weekly**: Full regression suite

---

## 11. Deployment Strategy

### 11.1 Environment Setup

**Environments**:
1. **Local Development**: Developer machines
2. **Development**: Shared dev environment (self-hosted)
3. **Staging**: Pre-production (cloud)
4. **Production**: Live environment (cloud)

**Environment Configuration**:
```
local → dev → staging → production
  ↓       ↓       ↓          ↓
Docker  Docker  K8s        K8s
(WSL2)  (Linux) (Cloud)    (Cloud)
```

---

### 11.2 CI/CD Pipeline

**Pipeline Stages**:
```mermaid
graph LR
    A[Code Push] --> B[Lint & Type Check]
    B --> C[Unit Tests]
    C --> D[Integration Tests]
    D --> E[Build Docker Image]
    E --> F[Push to Registry]
    F --> G{Branch?}
    G -->|dev| H[Deploy to Dev]
    G -->|staging| I[Deploy to Staging]
    G -->|main| J[Deploy to Production]
    J --> K[E2E Tests]
    K --> L{Tests Pass?}
    L -->|No| M[Rollback]
    L -->|Yes| N[Complete]
```

**GitHub Actions Workflow**:
```yaml
# .github/workflows/deploy.yml
name: Deploy Pipeline

on:
  push:
    branches: [dev, staging, main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run lint
      - run: npm run test:ci
      - run: npm run build
      
      - name: Build Docker Image
        run: docker build -t eduflow-api:${{ github.sha }} .
      
      - name: Push to Registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker push eduflow-api:${{ github.sha }}
  
  deploy:
    needs: build-and-test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Kubernetes
        run: |
          kubectl set image deployment/eduflow-api \
            eduflow-api=eduflow-api:${{ github.sha }} \
            -n ${{ env.NAMESPACE }}
          kubectl rollout status deployment/eduflow-api -n ${{ env.NAMESPACE }}
```

---

### 11.3 Deployment Method

**Strategy**: Rolling Deployment with Health Checks

**Kubernetes Deployment**:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: eduflow-api
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: eduflow-api
  template:
    metadata:
      labels:
        app: eduflow-api
    spec:
      containers:
      - name: eduflow-api
        image: eduflow-api:latest
        ports:
        - containerPort: 4000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: eduflow-secrets
              key: database-url
        resources:
          requests:
            cpu: 500m
            memory: 1Gi
          limits:
            cpu: 1000m
            memory: 2Gi
        livenessProbe:
          httpGet:
            path: /health
            port: 4000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 4000
          initialDelaySeconds: 10
          periodSeconds: 5
```

**Deployment Process**:
1. Build new Docker image
2. Push to container registry
3. Update Kubernetes deployment
4. Rolling update (one pod at a time)
5. Health check before marking ready
6. Automatic rollback if health check fails

**Zero-Downtime Deployment**:
- Rolling update ensures old pods run until new pods are ready
- Health checks prevent traffic to unhealthy pods
- `maxUnavailable: 0` ensures minimum capacity maintained

---

### 11.4 Rollback Strategy

**Automatic Rollback Triggers**:
- Health check failures after deployment
- Error rate spike (>5% within 5 minutes)
- Critical service dependency failures

**Manual Rollback**:
```bash
# Rollback to previous version
kubectl rollout undo deployment/eduflow-api -n production

# Rollback to specific version
kubectl rollout undo deployment/eduflow-api --to-revision=5 -n production

# Check rollout history
kubectl rollout history deployment/eduflow-api -n production
```

**Rollback SLA**: < 5 minutes from detection to recovery

---

### 11.5 Infrastructure as Code

**Tool**: Terraform

**Resources Managed**:
- Kubernetes cluster
- Database instances (PostgreSQL, MongoDB)
- Redis cluster
- Load balancers
- S3 buckets
- CloudFlare configuration
- Monitoring stack

**Example Terraform**:
```hcl
# main.tf
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  backend "s3" {
    bucket = "eduflow-terraform-state"
    key    = "production/terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = var.aws_region
}

# PostgreSQL RDS
resource "aws_db_instance" "postgres" {
  identifier          = "eduflow-postgres"
  engine              = "postgres"
  engine_version      = "16"
  instance_class      = "db.t3.medium"
  allocated_storage   = 100
  storage_encrypted   = true
  
  db_name  = var.db_name
  username = var.db_username
  password = var.db_password
  
  multi_az               = true
  backup_retention_period = 30
  
  tags = {
    Environment = "production"
    Project     = "eduflow"
  }
}

# S3 Bucket
resource "aws_s3_bucket" "files" {
  bucket = "eduflow-files"
  
  versioning {
    enabled = true
  }
  
  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }
}
```

---

### 11.6 Configuration Management

**Method**: Environment Variables + Kubernetes Secrets

**Configuration Hierarchy**:
1. **Defaults**: Hardcoded in application
2. **Environment Files**: `.env.development`, `.env.production`
3. **Environment Variables**: Override env files
4. **Kubernetes Secrets**: Sensitive data in production

**Kubernetes Secrets**:
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: eduflow-secrets
type: Opaque
stringData:
  database-url: "postgresql://user:pass@host:5432/eduflow"
  jwt-secret: "super-secret-key"
  stripe-secret-key: "sk_live_xxx"
  redis-url: "redis://redis:6379"
```

**Config Validation on Startup**:
```typescript
// config.validation.ts
import * as Joi from 'joi';

const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'staging', 'production').required(),
  DATABASE_URL: Joi.string().required(),
  REDIS_URL: Joi.string().required(),
  JWT_SECRET: Joi.string().min(32).required(),
  STRIPE_SECRET_KEY: Joi.string().when('NODE_ENV', {
    is: 'production',
    then: Joi.required()
  }),
  // ... more validations
});

const {error, value} = envSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation failed: ${error.message}`);
}

export const config = value;
```

---

## 12. Monitoring & Maintenance

### 12.1 Application Monitoring (APM)

**Tools**: Prometheus + Grafana + Sentry

**Key Dashboards**:
1. **System Health**: CPU, memory, disk, network
2. **Application Performance**: Request rate, response time, error rate
3. **Business Metrics**: Active users, payments, attendance
4. **Database Performance**: Query time, connections, cache hit rate
5. **Queue Metrics**: Job rate, queue length, job duration

**Prometheus Metrics**:
```typescript
// metrics.ts
import {Counter, Histogram, Gauge, Registry} from 'prom-client';

const register = new Registry();

// HTTP request metrics
const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
  registers: [register]
});

const httpRequestTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

// Business metrics
const activeUsers = new Gauge({
  name: 'active_users_total',
  help: 'Total number of active users',
  labelNames: ['role'],
  registers: [register]
});

const paymentsProcessed = new Counter({
  name: 'payments_processed_total',
  help: 'Total number of payments processed',
  labelNames: ['status', 'payment_method'],
  registers: [register]
});

// Middleware to track metrics
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration.labels(req.method, req.route.path, res.statusCode).observe(duration);
    httpRequestTotal.labels(req.method, req.route.path, res.statusCode).inc();
  });
  
  next();
});

// Expose metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

---

### 12.2 Infrastructure Monitoring

**Node Exporter**: System metrics (CPU, memory, disk, network)
**PostgreSQL Exporter**: Database metrics
**Redis Exporter**: Cache metrics
**Kubernetes Metrics**: Pod, node, deployment metrics

**Alert Examples**:
- CPU > 80% for 5 minutes
- Memory > 85% for 5 minutes
- Disk < 15% free space
- Database connections > 90% of pool
- Pod crash loop detected
- Node not ready

---

### 12.3 Log Aggregation (ELK Stack)

**Stack**: Elasticsearch + Logstash + Kibana

**Log Flow**:
```
Application → Logstash → Elasticsearch → Kibana
                ↓
             Parsing, Enrichment, Filtering
```

**Logstash Configuration**:
```ruby
# logstash.conf
input {
  file {
    path => "/var/log/eduflow/*.log"
    codec => json
  }
}

filter {
  # Parse JSON logs
  json {
    source => "message"
  }
  
  # Add geo-location based on IP
  geoip {
    source => "ip_address"
  }
  
  # Parse user agent
  useragent {
    source => "user_agent"
    target => "ua"
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "eduflow-logs-%{+YYYY.MM.dd}"
  }
}
```

**Kibana Dashboards**:
1. **Error Logs**: Recent errors, error trends
2. **User Activity**: Logins, actions by user
3. **API Usage**: Endpoint usage, slow queries
4. **Security Events**: Failed logins, suspicious activity

---

### 12.4 Alerting Rules & Escalation

**Alert Severity Levels**:
1. **Critical**: System down, data loss, security breach
2. **High**: Major feature broken, high error rate
3. **Medium**: Performance degradation, non-critical feature broken
4. **Low**: Warning signs, potential issues

**Escalation Policy**:
```
Critical Alert
    ↓
1. Slack notification (immediate)
    ↓
2. Email to on-call engineer (immediate)
    ↓
3. If not acknowledged in 10 minutes → SMS
    ↓
4. If not resolved in 30 minutes → Escalate to team lead
    ↓
5. If not resolved in 1 hour → Escalate to CTO
```

**On-Call Rotation**:
- Weekly rotation among senior engineers
- PagerDuty integration for alert management
- Runbooks for common incidents
- Post-incident reviews (blameless)

---

### 12.5 Health Check Endpoints

**Endpoints**:
- `GET /health`: Basic health check
- `GET /health/detailed`: Detailed health with dependencies
- `GET /ready`: Readiness check for load balancer

**Implementation**:
```typescript
@Get('health')
async healthCheck() {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  };
}

@Get('health/detailed')
async detailedHealthCheck() {
  const checks = await Promise.all([
    this.checkDatabase(),
    this.checkRedis(),
    this.checkS3(),
    this.checkExternalAPIs()
  ]);
  
  const allHealthy = checks.every(c => c.healthy);
  
  return {
    status: allHealthy ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    checks: {
      database: checks[0],
      redis: checks[1],
      storage: checks[2],
      external_apis: checks[3]
    }
  };
}

private async checkDatabase(): Promise<HealthCheck> {
  try {
    await this.prisma.$queryRaw`SELECT 1`;
    return {healthy: true, latency: '< 10ms'};
  } catch (error) {
    return {healthy: false, error: error.message};
  }
}
```

---

### 12.6 Maintenance Windows

**Scheduled Maintenance**:
- **Frequency**: Monthly (first Sunday, 2 AM - 4 AM local time)
- **Duration**: 2 hours maximum
- **Notification**: 1 week advance notice via email, in-app banner

**Maintenance Tasks**:
- Database maintenance (vacuuming, re-indexing)
- Security patches
- Dependency updates
- Performance optimizations
- Backup verification

**Maintenance Mode**:
```typescript
// Enable maintenance mode
await redis.set('maintenance_mode', 'true', 'EX', 7200); // 2 hours

// Middleware to check maintenance mode
app.use(async (req, res, next) => {
  const maintenanceMode = await redis.get('maintenance_mode');
  
  if (maintenanceMode && !req.path.startsWith('/admin')) {
    return res.status(503).json({
      error: {
        code: 'MAINTENANCE_MODE',
        message: 'System is under maintenance. Please try again later.',
        estimatedCompletion: '2024-12-10T04:00:00Z'
      }
    });
  }
  
  next();
});
```

---

## 13. Data Flow Diagrams

### 13.1 User Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API
    participant DB as PostgreSQL
    participant R as Redis
    
    U->>F: Enter email/password
    F->>A: POST /auth/login
    A->>DB: Verify credentials
    DB-->>A: User data
    A->>A: Generate access token + refresh token
    A->>R: Store session
    A-->>F: Tokens
    F->>F: Store access token in memory
    F->>F: Store refresh token in HTTP-only cookie
    F-->>U: Redirect to dashboard
    
    Note over U,R: Later: Access token expires
    
    F->>A: API request (expired token)
    A-->>F: 401 Unauthorized
    F->>A: POST /auth/refresh (refresh token in cookie)
    A->>R: Verify session
    R-->>A: Session valid
    A->>A: Generate new tokens
    A->>R: Update session
    A-->>F: New tokens
    F->>A: Retry original request
    A-->>F: Success
```

---

### 13.2 Attendance Marking Flow

```mermaid
sequenceDiagram
    participant T as Teacher
    participant F as Frontend
    participant A as API
    participant DB as PostgreSQL
    participant Q as Queue
    participant N as Notification Service
    
    T->>F: Select class & date
    F->>A: GET /students?classId=xxx
    A->>DB: Fetch students
    DB-->>A: Students list
    A-->>F: Students
    F-->>T: Display attendance grid
    
    T->>F: Mark attendance (Present/Absent/Late)
    F->>F: Optimistic UI update
    F->>A: POST /attendance/mark-bulk
    A->>A: Validate teacher assigned to class
    A->>DB: Bulk insert/update attendance
    DB-->>A: Success
    A->>Q: Queue notifications for absent students
    A-->>F: Success
    F-->>T: Show success message
    
    Q->>N: Process notification job
    N->>DB: Fetch parent contact info
    DB-->>N: Parent details
    N->>N: Send SMS/Email to parents
```

---

### 13.3 Fee Payment Flow (Stripe)

```mermaid
sequenceDiagram
    participant P as Parent
    participant F as Frontend
    participant A as API
    participant DB as PostgreSQL
    participant S as Stripe
    participant Q as Queue
    
    P->>F: Select fees to pay
    F->>A: POST /fee-payments/stripe
    A->>DB: Fetch fee details
    DB-->>A: Fee amounts
    A->>S: Create PaymentIntent
    S-->>A: clientSecret
    A->>DB: Create pending payment record
    A-->>F: clientSecret
    
    F->>F: Load Stripe.js
    F->>P: Show payment form
    P->>F: Enter card details
    F->>S: Confirm payment (via Stripe.js)
    S-->>F: Payment success
    F-->>P: Show success message
    
    Note over S,A: Webhook (async)
    
    S->>A: POST /webhooks/stripe (payment_intent.succeeded)
    A->>A: Verify webhook signature
    A->>DB: Update payment status to 'completed'
    A->>DB: Update fee_assignment status to 'paid'
    A->>Q: Queue receipt generation & email
    A-->>S: 200 OK
    
    Q->>Q: Generate PDF receipt
    Q->>Q: Send email with receipt
```

---

### 13.4 Grade Publication Flow

```mermaid
sequenceDiagram
    participant T as Teacher
    participant F as Frontend
    participant A as API
    participant DB as PostgreSQL
    participant C as Cache (Redis)
    participant Q as Queue
    participant WS as WebSocket
    
    T->>F: Enter grades for assessment
    F->>A: POST /grades/bulk-entry
    A->>DB: Insert grades
    DB-->>A: Success
    A->>C: Invalidate report card cache
    A->>Q: Queue notification job
    A-->>F: Success
    
    Q->>DB: Fetch affected students & parents
    DB-->>Q: Student/parent list
    Q->>WS: Send real-time notification
    WS-->>F: Notify online users
    Q->>Q: Queue emails
    
    Note over F,C: Student/parent views grades
    
    F->>A: GET /grades/report-card/:studentId
    A->>C: Check cache
    C-->>A: Cache miss
    A->>DB: Fetch grades, calculate report card
    DB-->>A: Report data
    A->>C: Cache report card (1 hour TTL)
    A-->>F: Report card data
    F-->>T: Display report card
```

---

### 13.5 Offline Sync Flow (PWA)

```mermaid
sequenceDiagram
    participant T as Teacher
    participant PWA as PWA (Offline)
    participant IDB as IndexedDB
    participant SW as Service Worker
    participant A as API
    participant DB as PostgreSQL
    
    Note over T,IDB: Offline Mode
    
    T->>PWA: Mark attendance
    PWA->>IDB: Store in pending queue
    PWA-->>T: Show "Queued for sync"
    
    Note over T,DB: Online Mode Restored
    
    SW->>SW: Detect online
    SW->>IDB: Fetch pending operations
    IDB-->>SW: Attendance records
    SW->>A: POST /attendance/mark-bulk (background sync)
    A->>DB: Bulk insert
    DB-->>A: Success
    A-->>SW: Success
    SW->>IDB: Clear pending queue
    SW->>PWA: Trigger refresh
    PWA-->>T: Show "Synced successfully"
```

---

## 14. Non-Functional Requirements

### 14.1 Availability

**SLA**: 99.9% uptime (< 8.76 hours downtime per year)

**Strategies**:
- Multi-region deployment (future)
- Database replication (Multi-AZ)
- Auto-scaling for traffic spikes
- Health checks and automatic restarts
- Redundant infrastructure components

**Downtime Windows**:
- Planned maintenance: 2 hours/month
- Emergency maintenance: As needed (rare)

---

### 14.2 Reliability

**MTBF** (Mean Time Between Failures): > 720 hours (30 days)
**MTTR** (Mean Time To Recovery): < 1 hour

**Fault Tolerance**:
- Graceful degradation (if Redis down, continue without cache)
- Circuit breakers for external services
- Retry logic with exponential backoff
- Dead letter queues for failed jobs

**Disaster Recovery**:
- **RTO** (Recovery Time Objective): 4 hours
- **RPO** (Recovery Point Objective): 1 hour (from backups)
- Automated backup restoration scripts
- Regular disaster recovery drills (quarterly)

---

### 14.3 Maintainability

**Code Standards**:
- ESLint + Prettier for code formatting
- TypeScript for type safety
- Conventional Commits for git messages
- Code reviews required for all PRs
- Minimum 80% test coverage

**Documentation**:
- API documentation (Swagger/OpenAPI)
- Code comments for complex logic
- README files for each module
- Architecture decision records (ADRs)
- Runbooks for operations

**Refactoring**:
- Tech debt tracked in backlog
- Quarterly refactoring sprints
- Regular dependency updates

---

### 14.4 Usability

**Response Times**:
- Page load: < 2 seconds
- Form submission: < 1 second
- Search results: < 500ms

**User Experience**:
- Intuitive navigation
- Clear error messages
- Inline help and tooltips
- Responsive design (mobile-first)
- Accessibility (WCAG 2.1 AA)

**Onboarding**:
- Interactive product tour for new users
- Video tutorials
- Help center with searchable articles
- In-app support widget

---

### 14.5 Compliance

**Data Protection**:
- Encryption at rest (AES-256)
- Encryption in transit (TLS 1.3)
- Data retention policies (10 years for student records)
- Right to erasure (with legal exceptions)
- Data portability (export in JSON/CSV)

**Legal Requirements** (Pakistan):
- Student data retention: 10 years after graduation
- Parental consent for data collection
- Financial records: 7 years retention
- Audit trails: 2 years

**Security Compliance**:
- OWASP Top 10 mitigation
- Regular security audits (annual)
- Penetration testing (annual)
- Vulnerability scanning (weekly)

---

## 15. Assumptions & Constraints

### 15.1 Assumptions

**Technical Assumptions**:
1. Schools have reliable internet connectivity (at least 10 Mbps)
2. Users have modern browsers (Chrome, Firefox, Safari, Edge - last 2 versions)
3. Mobile devices support PWA features
4. Schools can provide student/teacher data in CSV/Excel format for migration
5. Payment gateways (Stripe, JazzCash) will maintain current API versions
6. Third-party services (SendGrid, Twilio) will be available 99.9% of time

**Business Assumptions**:
1. Average school size: 500 students, 50 teachers
2. Peak usage: 9 AM - 12 PM (school hours)
3. Fee payment cycles: Monthly, quarterly, or annual
4. Academic year: April to March (standard in Pakistan)
5. Schools operate 6 days a week (Monday-Saturday)

**User Behavior Assumptions**:
1. Teachers mark attendance daily within first 2 hours
2. Parents check grades/fees weekly
3. Students check timetable/grades twice a week
4. Admins generate reports monthly

---

### 15.2 Constraints

**Technical Constraints**:
1. **Budget**: Limited infrastructure budget initially (optimize for cost)
2. **Self-hosted Testing**: Must support Windows environment with Docker Desktop
3. **Database Choice**: Must use PostgreSQL + MongoDB (no other databases)
4. **Payment Gateways**: Limited to Stripe, JazzCash, Bank Transfers
5. **Mobile**: PWA initially, native apps in future (resource constraint)

**Business Constraints**:
1. **Timeline**: Full feature set within 9-12 months
2. **Team Size**: Small development team (6-8 people)
3. **Market**: Focus on Pakistani market initially
4. **Language**: English primary, Urdu/Arabic input support (no full translation yet)
5. **Freemium Tier**: Must support 50 students free tier (limited revenue initially)

**Regulatory Constraints**:
1. **Data Retention**: 10-year retention for student records (cannot delete earlier)
2. **Parental Consent**: Required for all student data collection
3. **Financial Records**: 7-year retention for tax purposes
4. **Age Restrictions**: No data collection from students under 13 without consent

**Operational Constraints**:
1. **Maintenance Windows**: Limited to off-hours (2-4 AM)
2. **Support Hours**: 9 AM - 6 PM Monday-Friday initially
3. **On-call**: Limited on-call rotation (small team)
4. **Internationalization**: English and Urdu only initially

---

## 16. Risks & Mitigation

### 16.1 Technical Risks

**Risk 1: Database Performance Degradation at Scale**
- **Probability**: Medium
- **Impact**: High
- **Mitigation**:
  - Implement aggressive indexing strategy
  - Use read replicas for read-heavy queries
  - Implement caching layers (Redis)
  - Monitor query performance continuously
  - Plan for database sharding at 50+ schools

**Risk 2: Payment Gateway Downtime**
- **Probability**: Low
- **Impact**: High
- **Mitigation**:
  - Support multiple payment gateways (Stripe, JazzCash, Bank Transfer)
  - Queue payment processing (retry on failure)
  - Display alternative payment methods if one fails
  - Monitor payment gateway status proactively

**Risk 3: Third-party Service Failures** (Email, SMS)
- **Probability**: Medium
- **Impact**: Medium
- **Mitigation**:
  - Use multiple providers (SendGrid primary, AWS SES backup)
  - Queue all notifications (retry with backoff)
  - Fallback to alternative channels (if SMS fails, send email)
  - Monitor service health

**Risk 4: Security Breach / Data Leak**
- **Probability**: Low
- **Impact**: Critical
- **Mitigation**:
  - Regular security audits and penetration testing
  - Follow OWASP Top 10 guidelines
  - Implement encryption at rest and in transit
  - Use secrets management service
  - Incident response plan
  - Cyber insurance

**Risk 5: Offline Sync Conflicts**
- **Probability**: Medium
- **Impact**: Medium
- **Mitigation**:
  - Use "last write wins" strategy with timestamp
  - Display conflict resolution UI for critical data
  - Limit offline operations to specific features (attendance)
  - Validate on server before accepting offline data

---

### 16.2 Business Risks

**Risk 1: Low User Adoption**
- **Probability**: Medium
- **Impact**: High
- **Mitigation**:
  - Extensive user research and usability testing
  - Onboarding support for new schools
  - Training materials (videos, guides)
  - Free tier to lower barrier to entry
  - Continuous user feedback collection

**Risk 2: Competition from Established Players**
- **Probability**: High
- **Impact**: Medium
- **Mitigation**:
  - Focus on unique value propositions (speed, reliability, UX)
  - Rapid feature development
  - Strong customer support
  - Competitive pricing
  - Build strong relationships with pilot schools

**Risk 3: Slow Sales Cycle**
- **Probability**: High
- **Impact**: Medium
- **Mitigation**:
  - Target smaller schools first (faster decision-making)
  - Freemium model for easy trials
  - Referral program
  - Case studies from pilot schools
  - Partner with school associations

**Risk 4: Churn (Schools Leaving)**
- **Probability**: Medium
- **Impact**: High
- **Mitigation**:
  - Excellent customer support
  - Regular feature updates
  - Annual contracts with discounts
  - Data export tools (reduce lock-in fear)
  - Collect feedback on why schools leave

---

### 16.3 Operational Risks

**Risk 1: Key Personnel Leaving**
- **Probability**: Medium
- **Impact**: High
- **Mitigation**:
  - Comprehensive documentation
  - Knowledge sharing sessions
  - Cross-training team members
  - Bus factor > 1 for critical components
  - Competitive compensation

**Risk 2: Infrastructure Cost Overruns**
- **Probability**: Medium
- **Impact**: Medium
- **Mitigation**:
  - Set up billing alerts
  - Optimize resource usage continuously
  - Use reserved instances for predictable workloads
  - Monitor cost per school metric
  - Plan for economies of scale

**Risk 3: Support Overload**
- **Probability**: High
- **Impact**: Medium
- **Mitigation**:
  - Comprehensive self-service help center
  - Chatbot for common questions
  - Tiered support based on subscription
  - Collect common issues and address in product
  - Hire support staff as volume grows

---

## 17. Development Phases

### 17.1 Phase 1: MVP (Months 1-5)

**Goal**: Core functionality for pilot schools

**Features**:
- ✅ User authentication (email/password)
- ✅ School, class, student, teacher management
- ✅ Attendance marking (bulk)
- ✅ Basic grade entry (assessments, grades)
- ✅ Fee structures and assignments
- ✅ Fee payment recording (manual)
- ✅ Basic announcements
- ✅ Basic reports (attendance summary, grade reports)
- ✅ PWA with basic offline support
- ✅ Role-based access control

**Success Criteria**:
- 5-10 pilot schools onboarded
- < 2 seconds page load time
- 99% uptime
- Teachers can mark attendance in < 30 seconds
- Positive feedback from pilot schools

**Team Allocation**:
- 2 Full-stack Engineers
- 1 Backend Engineer
- 1 Frontend Engineer
- 0.5 DevOps Engineer
- 1 QA Engineer

**Estimated Effort**: ~20 weeks

---

### 17.2 Phase 2: Advanced Features (Months 6-9)

**Goal**: Expand functionality and integrations

**Features**:
- ✅ Online payments (Stripe, JazzCash)
- ✅ Advanced reporting (custom report builder)
- ✅ Analytics dashboard
- ✅ Real-time messaging
- ✅ Timetable management
- ✅ Academic calendar
- ✅ Advanced notifications (SMS, email)
- ✅ File uploads (assignments, documents)
- ✅ Report card generation (PDF)
- ✅ Multi-school management for super admin
- ✅ Improved PWA (better offline support)

**Success Criteria**:
- 20-30 schools onboarded
- 90% payment success rate
- 85% user satisfaction score
- Advanced reports used by 70% of admins

**Team Allocation**: Same as Phase 1

**Estimated Effort**: ~16 weeks

---

### 17.3 Phase 3: Scale & Polish (Months 10-12)

**Goal**: Optimize for scale and prepare for growth

**Features**:
- ✅ Performance optimization (caching, query optimization)
- ✅ Native mobile app preparation (API optimization)
- ✅ Advanced analytics (predictive, machine learning)
- ✅ Integration marketplace (future integrations)
- ✅ Parent app features (dedicated parent view)
- ✅ Student portal enhancements
- ✅ Advanced security features (2FA, audit logs)
- ✅ Localization improvements (Urdu UI translation)
- ✅ Scalability improvements (sharding, load balancing)
- ✅ DevOps automation (CI/CD, monitoring)

**Success Criteria**:
- 50+ schools onboarded
- System supports 5,000+ concurrent users
- < 500ms API response time (p95)
- 99.9% uptime
- Ready to scale to 100+ schools

**Team Allocation**: Same + 0.5 DevOps (full-time)

**Estimated Effort**: ~12 weeks

---

### 17.4 Phase 4: Native Apps & Expansion (Year 2)

**Goal**: Native mobile apps and market expansion

**Features**:
- Native iOS app
- Native Android app
- Advanced AI features (attendance predictions, at-risk students)
- Gamification (student engagement)
- Parent community features
- Integration with government systems (if applicable)
- Multi-language support (full translation)
- International expansion prep (multi-currency, compliance)

**Success Criteria**:
- 100+ schools
- Native apps launched
- International pilots started

**Team Expansion**: +2 Mobile Developers, +1 ML Engineer

---

## 18. Data Migration Strategy

### 18.1 Overview

Data migration is critical for onboarding schools with existing data from legacy systems or manual records. EduFlow supports both bulk imports and incremental data entry.

### 18.2 Import Formats

**Supported Formats:**
| Format | Use Case | Max Records |
|--------|----------|-------------|
| **Excel (.xlsx)** | Primary import format with templates | 5,000 rows |
| **CSV (.csv)** | Fallback format with header mapping | 10,000 rows |
| **JSON** | API-based bulk import | No limit |

**Pre-built Import Templates:**

1. **Students Template** (`students_import_template.xlsx`)
   - Required: first_name, last_name, date_of_birth, admission_date, class, section
   - Optional: registration_no, father_name, father_phone, address, etc.

2. **Staff Template** (`staff_import_template.xlsx`)
   - Required: first_name, last_name, email, role, designation
   - Optional: phone, department, date_of_joining, salary, etc.

3. **Fee Structures Template** (`fee_structures_template.xlsx`)
   - Required: name, fee_type, frequency, amount
   - Optional: applicable_classes, late_fee_amount, grace_period_days

### 18.3 Migration Workflow

```mermaid
flowchart TB
    A[Download Template] --> B[Fill Data / Export from Legacy]
    B --> C[Upload File]
    C --> D[System Validation]
    D --> E{Valid?}
    E -->|Yes| F[Preview Data]
    E -->|No| G[Show Errors]
    G --> B
    F --> H[User Confirmation]
    H --> I[Import to Database]
    I --> J[Generate Import Report]
    J --> K[Audit Log Created]
```

**Steps:**
1. **Template Download**: Admin downloads pre-formatted Excel template from admin panel
2. **Data Entry**: School enters data or exports from legacy system
3. **Upload & Validation**: File uploaded, system validates all rows
4. **Error Handling**: Invalid rows highlighted with specific error messages
5. **Preview**: Admin reviews data before final import
6. **Confirmation**: Admin confirms import
7. **Audit Trail**: All imported records logged with import batch ID

### 18.4 Validation Rules

**Student Import Validation:**
| Field | Validation | Error Message |
|-------|------------|---------------|
| `first_name` | Required, max 100 chars | "First name is required" |
| `last_name` | Required, max 100 chars | "Last name is required" |
| `date_of_birth` | Required, valid date, age 3-25 | "Invalid date of birth" |
| `registration_no` | Unique per school | "Duplicate registration number" |
| `father_cnic` | XXXXX-XXXXXXX-X format | "Invalid CNIC format" |
| `father_phone` | Valid Pakistan phone | "Invalid phone format" |
| `email` | Valid email format | "Invalid email format" |
| `class` | Must exist in system | "Class not found" |
| `section` | Must exist for class | "Section not found" |

**Data Integrity Checks:**
- Duplicate detection based on name + date_of_birth
- Cross-reference validation (class/section must exist)
- Phone number format validation (Pakistan: 03XX-XXXXXXX)
- CNIC format validation (XXXXX-XXXXXXX-X)

### 18.5 Rollback Procedures

**Import Rollback:**
- Each import creates a batch ID
- Rollback deletes all records with matching batch ID
- Maximum rollback window: 24 hours after import
- Rollback requires admin approval

**Rollback API:**
```typescript
POST /api/v1/admin/imports/:batchId/rollback
Authorization: Bearer <admin_token>
```

### 18.6 Data Export

**Export Formats:**
- Excel (.xlsx) - Formatted reports
- CSV - Raw data
- PDF - Report cards, fee receipts

**GDPR/Privacy Compliance:**
- Full data export for any student (parent request)
- Data anonymization for analytics exports
- Export audit logging

### 18.7 Legacy System Migration Checklist

- [ ] Identify data sources (Excel files, previous SMS, manual registers)
- [ ] Map legacy fields to EduFlow schema
- [ ] Clean data (remove duplicates, fix formats)
- [ ] Create missing reference data (classes, sections, subjects)
- [ ] Import in order: Staff → Students → Fees → Attendance (historical)
- [ ] Verify data integrity post-import
- [ ] Train staff on new system
- [ ] Run parallel operation for 1-2 weeks

---

## 19. Open Questions

### 19.1 Technical Questions

1. **Database Sharding Strategy**: At what scale should we implement sharding? Shard by school_id or another dimension?
   - **Recommendation**: Implement at 50-75 schools or when PostgreSQL reaches 500GB

2. **CDN Provider**: Should we stick with CloudFlare or consider alternatives (AWS CloudFront, Fastly)?
   - **Current**: CloudFlare (free tier suitable for pilot)

3. **Monitoring Solution**: Continue with Prometheus+Grafana or invest in managed APM (New Relic, DataDog)?
   - **Current**: Prometheus+Grafana (cost-effective)
   - **Future**: Consider managed APM at 30+ schools

4. **Background Jobs**: BullMQ sufficient or should we plan for more robust solution (AWS SQS, RabbitMQ)?
   - **Current**: BullMQ sufficient
   - **Future**: Evaluate at higher volumes

5. **File Storage**: Self-hosted MinIO for testing, but should production use AWS S3 or managed MinIO?
   - **Recommendation**: AWS S3 for production (reliability, scalability)

---

### 19.2 Product Questions

1. **Freemium Limits**: What features should be restricted in free tier vs paid tiers?
   - **To Decide**: SMS notifications, advanced reports, file storage limits, number of users

2. **Mobile App Priority**: Should we fast-track native mobile apps based on pilot feedback?
   - **Current**: PWA first, native apps in Year 2
   - **Flexible**: Can adjust based on user demand

3. **AI Features**: What AI/ML features would provide most value?
   - **Ideas**: Attendance prediction, at-risk student identification, automated grading, smart scheduling
   - **To Validate**: With pilot schools

4. **Integration Priorities**: Which third-party integrations are most requested?
   - **Possible**: Google Classroom, Microsoft Teams, Zoom, other LMS platforms
   - **To Decide**: Based on user feedback

5. **Internationalization**: Should we expand to other South Asian countries (India, Bangladesh)?
   - **Current**: Focus on Pakistan
   - **Future**: Consider based on success metrics

---

### 19.3 Business Questions

1. **Pricing Strategy**: How should we price different tiers for maximum conversion?
   - **Current**: Freemium model
   - **To Decide**: Exact pricing for Basic, Professional, Enterprise tiers

2. **Customer Support**: In-house vs outsourced customer support?
   - **Current**: In-house for pilot
   - **To Decide**: Scale support strategy at 30+ schools

3. **Sales Strategy**: Direct sales vs channel partners (resellers)?
   - **Current**: Direct sales
   - **Future**: Consider channel partners for faster growth

4. **Data Residency**: Should we offer Pakistan-hosted option vs international cloud?
   - **Current**: International cloud
   - **Future**: Evaluate demand for local hosting

5. **Compliance Certifications**: Which certifications to pursue (ISO 27001, SOC 2)?
   - **Current**: None (early stage)
   - **Future**: Pursue for enterprise customers

---

## Conclusion

This Technical Design Document provides a comprehensive blueprint for building EduFlow, a modern School Management System tailored for the Pakistani education market. The design emphasizes:

- **Speed & Reliability**: Optimized for fast performance and 99.9% uptime
- **Scalability**: Architecture supports growth from 10 to 100+ schools
- **Security**: Enterprise-grade security with encryption and compliance
- **User Experience**: Mobile-first design with offline support
- **Maintainability**: Clean architecture, comprehensive testing, and monitoring

**Next Steps**:
1. ✅ Review and approve TDD with stakeholders
2. Set up development environment
3. Sprint planning for Phase 1
4. Begin MVP development
5. Regular technical review meetings (bi-weekly)

**Document Maintenance**:
- This TDD is a living document
- Updates required when: architecture changes, new technologies adopted, major features added
- Version control: Track changes in git with ADRs (Architecture Decision Records)

---

**Document Version**: 1.0  
**Last Updated**: December 9, 2024  
**Next Review**: March 2025 (post-MVP)

---

**Prepared By**: Technical Architecture Team  
**Reviewed By**: Product Team, Tech Lead  
**Approved By**: [Pending]


---

## Document Sign-Off

**Document Prepared By**: Technical Architecture Team  
**Reviewed By**: Product Team, Tech Lead  
**Status**: Ready for Review  
**Next Review Date**: March 2025 (Post-MVP)

**Next Steps**: 
1. Review and approve TDD with all stakeholders
2. Set up development environment (local and staging)
3. Begin Phase 1 Sprint Planning
4. Schedule weekly architecture reviews

For questions or clarifications, contact the technical lead.

---

**END OF DOCUMENT**

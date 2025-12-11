# EduFlow App Flow & User Management
**Complete Guide to Hierarchical User Management and CRUD Permissions**

---

## Document Control

| Field | Details |
|-------|---------|
| **Product** | EduFlow - School Management System |
| **Version** | 1.0 |
| **Created** | December 11, 2024 |
| **Status** | Production Ready |
| **Related Documents** | TDD, UI Technical Document, Brand Kit |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Authentication Flow](#2-authentication-flow)
3. [Hierarchical User Management](#3-hierarchical-user-management)
4. [User Creation Flows](#4-user-creation-flows)
5. [CRUD Permissions Summary](#5-crud-permissions-summary)
6. [Data Scope & Filtering](#6-data-scope--filtering)
7. [UI/UX Patterns](#7-uiux-patterns)
8. [API Authorization](#8-api-authorization)
9. [Security Considerations](#9-security-considerations)

---

## 1. Executive Summary

### 1.1 Core Principles

**🚫 NO PUBLIC REGISTRATION**

EduFlow operates on a strict **invitation-only, hierarchical user management system**. Key principles:

1. **No Self-Registration**: There is no public "Sign Up" or "Register" page
2. **Hierarchical Creation**: Users are created by parent-level administrators
3. **Scoped Access**: All users can only access data within their organizational scope
4. **Role-Based Permissions**: CRUD operations are strictly controlled by user role

### 1.2 User Hierarchy

```
Platform (EduFlow SaaS)
└── Super Admin (seeded on deployment)
    └── Organization (e.g., "Lahore Grammar School System")
        └── Org Admin
            └── School (e.g., "LGS Johar Town")
                └── School Admin
                    └── Staff (Principal, Teachers, Accountant, HR, etc.)
                        └── Students & Parents
```

### 1.3 Quick Reference: Who Can Create Whom

| Creator | Can Create |
|---------|------------|
| **Super Admin** | Organizations, Org Admins, School Admins, Schools |
| **Org Admin** | School Admins, Org Admins (within org), Schools (within org) |
| **School Admin** | Staff (Principal, Teachers, Accountant, HR, etc.) |
| **Principal** | Cannot create users (only manage existing) |
| **Teachers & Staff** | Can register Students and Parents |
| **Parents** | Cannot create users |
| **Students** | Cannot create users |

---

## 2. Authentication Flow

### 2.1 Login Flow (Login-Only System)

**Page**: `/login`

```mermaid
flowchart TD
    A[User visits /login] --> B{Has credentials?}
    B -->|No| C[Contact administrator<br/>to create account]
    B -->|Yes| D[Enter email & password]
    D --> E[Submit login form]
    E --> F{Valid credentials?}
    F -->|No| G[Show error:<br/>'Invalid email or password']
    G --> D
    F -->|Yes| H[Generate JWT tokens]
    H --> I[Store access token in memory]
    I --> J[Store refresh token in HTTP-only cookie]
    J --> K{Check user role}
    K -->|super_admin| L[Redirect to Platform Dashboard]
    K -->|org_admin| M[Redirect to Org Dashboard]
    K -->|school_admin| N[Redirect to School Dashboard]
    K -->|teacher| O[Redirect to Teacher Dashboard]
    K -->|parent| P[Redirect to Parent Dashboard]
    K -->|student| Q[Redirect to Student Dashboard]
    K -->|other staff| R[Redirect to Role-specific Dashboard]

    style C fill:#ffcccc
    style G fill:#ffcccc
```

**Key Points:**
- ❌ No "Create Account" button
- ❌ No "Sign Up" link
- ✅ Only "Forgot Password" link
- ✅ "Need Help?" link for support

### 2.2 JWT Token Structure

```json
{
  "sub": "user-uuid-123",
  "email": "user@school.edu",
  "role": "teacher",
  "organizationId": "org-uuid-456",
  "schoolId": "school-uuid-789",
  "permissions": [
    "read:students",
    "write:attendance",
    "read:grades"
  ],
  "iat": 1702318800,
  "exp": 1702319700
}
```

**Token Usage:**
- **Access Token**: 15 minutes expiry, used for all API calls
- **Refresh Token**: 30 days expiry, used to obtain new access tokens
- **Automatic Refresh**: Frontend automatically refreshes token when expired

---

## 3. Hierarchical User Management

### 3.1 Initial System Setup

**Step 1: System Deployment**

On first deployment, the system automatically seeds a default **Super Admin** account:

```sql
-- Seeded on deployment
INSERT INTO users (email, password_hash, role, first_name, last_name, status)
VALUES (
  'admin@eduflow.com',
  '$2b$12$hashed_password',
  'super_admin',
  'System',
  'Administrator',
  'active'
);
```

**Default Super Admin Credentials:**
- Email: `admin@eduflow.com`
- Password: Set during deployment (environment variable)

**Step 2: Super Admin Creates Organizations**

Super Admin logs in and creates organizations (school chains):

```typescript
POST /api/v1/organizations
Authorization: Bearer <super_admin_token>
{
  "name": "Lahore Grammar School System",
  "code": "LGS",
  "email": "info@lgs.edu.pk",
  "phone": "+92-42-12345678"
}
```

**Step 3: Super Admin Creates Org Admins**

```typescript
POST /api/v1/users
Authorization: Bearer <super_admin_token>
{
  "email": "admin@lgs.edu.pk",
  "firstName": "Ahmed",
  "lastName": "Khan",
  "role": "org_admin",
  "organizationId": "org-uuid-lgs",
  "temporaryPassword": "TempPass123!",
  "sendWelcomeEmail": true
}
```

**Step 4: Org Admin Creates Schools**

```typescript
POST /api/v1/schools
Authorization: Bearer <org_admin_token>
{
  "name": "LGS Johar Town",
  "code": "LGS-JT",
  "organizationId": "org-uuid-lgs",  // Auto-set from JWT
  "city": "Lahore",
  "address": "123 Main Blvd, Johar Town"
}
```

**Step 5: Org Admin Creates School Admins**

```typescript
POST /api/v1/users
Authorization: Bearer <org_admin_token>
{
  "email": "admin@lgs-jt.edu.pk",
  "firstName": "Sara",
  "lastName": "Ali",
  "role": "school_admin",
  "organizationId": "org-uuid-lgs",  // Auto-set
  "schoolId": "school-uuid-lgs-jt",
  "temporaryPassword": "TempPass123!",
  "sendWelcomeEmail": true
}
```

**Step 6: School Admin Creates Staff**

```typescript
POST /api/v1/users
Authorization: Bearer <school_admin_token>
{
  "email": "teacher@lgs-jt.edu.pk",
  "firstName": "Fatima",
  "lastName": "Malik",
  "role": "teacher",
  "schoolId": "school-uuid-lgs-jt",  // Auto-set
  "department": "Mathematics",
  "temporaryPassword": "TempPass123!",
  "sendWelcomeEmail": true
}
```

**Step 7: Staff Creates Students & Parents**

Teachers or School Admin create students:

```typescript
POST /api/v1/students
Authorization: Bearer <teacher_token>
{
  "firstName": "Ali",
  "lastName": "Hassan",
  "dateOfBirth": "2010-05-15",
  "admissionDate": "2024-04-01",
  "classId": "class-uuid-5",
  "sectionId": "section-uuid-5a",
  "fatherName": "Hassan Ahmed",
  "fatherPhone": "+92-300-1234567",
  "fatherEmail": "hassan@email.com"
}

// System automatically creates parent user account:
// - Email: hassan@email.com
// - Role: parent
// - Temporary password sent via email
```

### 3.2 User Creation Hierarchy Diagram

```mermaid
graph TB
    A[Super Admin<br/>admin@eduflow.com<br/>✅ Seeded on deployment] -->|Creates| B[Organization<br/>Lahore Grammar School]
    A -->|Creates| C[Org Admin<br/>admin@lgs.edu.pk]
    C -->|Creates| D[School<br/>LGS Johar Town]
    C -->|Creates| E[School Admin<br/>admin@lgs-jt.edu.pk]
    E -->|Creates| F[Principal<br/>principal@lgs-jt.edu.pk]
    E -->|Creates| G[Teacher<br/>teacher@lgs-jt.edu.pk]
    E -->|Creates| H[Accountant<br/>accountant@lgs-jt.edu.pk]
    E -->|Creates| I[HR<br/>hr@lgs-jt.edu.pk]
    G -->|Registers| J[Student<br/>student1@lgs-jt.edu.pk]
    J -->|Auto-creates| K[Parent<br/>parent@email.com]

    style A fill:#9370DB,color:#fff
    style C fill:#673AB7,color:#fff
    style E fill:#2196F3,color:#fff
    style F fill:#FF5722,color:#fff
    style G fill:#7CB342,color:#fff
    style H fill:#FFC107
    style I fill:#795548,color:#fff
    style K fill:#E91E63,color:#fff
    style J fill:#00BCD4
```

---

## 4. User Creation Flows

### 4.1 Super Admin: Creating Organizations

**UI Flow:**

1. Navigate to: **Super Admin Dashboard** → **Organizations** tab
2. Click: **"+ Create Organization"** button
3. Fill form:
   - Organization Name (e.g., "Beaconhouse School System")
   - Organization Code (e.g., "BSS")
   - Headquarters Address
   - Contact Email
   - Contact Phone
4. Click: **"Create Organization"**
5. Success: Organization created, shown in organizations list

**UI Screen:**

```
┌─────────────────────────────────────────────────────────┐
│ Super Admin Dashboard > Organizations                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  All Organizations (23)        [+ Create Organization] │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │ Lahore Grammar School      LGS      15 Schools  │  │
│  │ Karachi                    Active               │  │
│  │ [View] [Edit]                                   │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │ Beaconhouse School System  BSS      22 Schools  │  │
│  │ Nationwide                 Active               │  │
│  │ [View] [Edit]                                   │  │
│  └─────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 4.2 Org Admin: Creating Schools

**UI Flow:**

1. Navigate to: **Org Admin Dashboard** → **Schools** tab
2. Click: **"+ Add School"** button
3. Fill form:
   - School Name (e.g., "LGS Gulberg Branch")
   - School Code (e.g., "LGS-GLB")
   - City, Address
   - Contact Details
4. Click: **"Create School"**
5. Success: School created within organization

**Important**: Org Admin can only create schools within their organization (enforced by backend).

### 4.3 School Admin: Creating Staff

**UI Flow:**

1. Navigate to: **School Dashboard** → **Staff Management**
2. Click: **"+ Add Staff Member"** button
3. Select role:
   - Principal
   - Vice Principal
   - Teacher
   - Accountant
   - HR Manager
   - Librarian
   - Receptionist
4. Fill form:
   - First Name, Last Name
   - Email (becomes login credential)
   - Phone
   - Role-specific fields (e.g., subject for teachers)
5. Toggle: **"Send welcome email"** (default: on)
6. Click: **"Create Staff Member"**
7. System actions:
   - Creates user account with temporary password
   - Sends welcome email with login instructions
   - Staff member prompted to change password on first login

**UI Screen:**

```
┌─────────────────────────────────────────────────────────┐
│ School Dashboard > Staff Management                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  All Staff (45)                    [+ Add Staff Member]│
│                                                         │
│  Filters: [All Roles ▼] [Active ▼] [Search...]        │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │ 👨‍🏫 Ahmed Khan          Teacher                   │  │
│  │ Mathematics Dept       ahmed@school.edu         │  │
│  │ Joined: Jan 2024      [View] [Edit]            │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │ 💼 Sara Ali            Accountant                │  │
│  │ Finance Dept          sara@school.edu           │  │
│  │ Joined: Mar 2023      [View] [Edit]            │  │
│  └─────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 4.4 Teacher/Admin: Registering Students

**UI Flow:**

1. Navigate to: **Students** → **Admissions**
2. Click: **"+ Admit New Student"** button
3. Fill multi-step form:

   **Step 1: Student Information**
   - First Name, Last Name
   - Date of Birth
   - Gender, Blood Group
   - CNIC / B-Form Number

   **Step 2: Academic Details**
   - Admission Date
   - Registration Number (auto-generated)
   - Class & Section
   - Previous School (optional)

   **Step 3: Parent/Guardian Information**
   - Father Name, Father CNIC, Father Phone ✅ (Required)
   - Father Email (becomes parent login)
   - Mother Name, Mother Phone
   - Guardian Details (optional)

   **Step 4: Address & Emergency Contact**
   - Residential Address
   - Emergency Contact Name & Phone

   **Step 5: Medical Information** (optional)
   - Medical Conditions
   - Allergies
   - Special Needs

4. Review summary
5. Click: **"Complete Admission"**
6. System actions:
   - Creates student record
   - **Automatically creates parent user account** (email: father's email)
   - Sends welcome email to parent with login credentials
   - Generates admission receipt

**Parent Account Auto-Creation:**

```typescript
// When student is created
POST /api/v1/students
{
  "firstName": "Ali",
  "fatherEmail": "father@email.com",
  // ... other fields
}

// System automatically creates parent user:
{
  "email": "father@email.com",
  "role": "parent",
  "schoolId": "school-uuid",
  "firstName": extractFromFatherName(),
  "temporaryPassword": generateSecurePassword(),
  "linkedStudents": ["student-uuid-ali"]
}

// Welcome email sent to father@email.com:
Subject: Welcome to EduFlow - Your Child's School Portal Access

Dear Parent,

Your child Ali Hassan has been admitted to LGS Johar Town.
You can now access the parent portal to track attendance, grades, and fees.

Login URL: https://lgs-jt.eduflow.pk/login
Email: father@email.com
Temporary Password: xY9mK2pQ7n

Please change your password upon first login.
```

---

## 5. CRUD Permissions Summary

### 5.1 Permissions Legend

- ✅ **Full Access** - Create, Read, Update, Delete
- 📖 **Read Only** - View only
- 📝 **Create & Read** - Can create new records and view
- ✏️ **Read & Update** - Can view and modify
- ❌ **No Access** - Cannot access

### 5.2 Quick Permissions Table

| Entity | Super Admin | Org Admin | School Admin | Principal | Teacher | Accountant | Parent | Student |
|--------|------------|-----------|--------------|-----------|---------|------------|--------|---------|
| **Organizations** | ✅ Full | 📖 Own Org | ❌ None | ❌ None | ❌ None | ❌ None | ❌ None | ❌ None |
| **Schools** | ✅ All | ✅ Within Org | 📖 Own | 📖 Own | 📖 Own | 📖 Own | 📖 Own | 📖 Own |
| **Users/Staff** | ✅ All | ✅ Within Org | ✅ School Staff | 📖 Read | ❌ None | ❌ None | ❌ None | ❌ None |
| **Students** | ✅ All | ✅ Within Org | ✅ School | ✅ School | 📖 Own Classes | 📖 All | 📖 Own Kids | 📖 Self |
| **Attendance** | ✅ All | ✅ Within Org | ✅ School | ✅ School | ✅ Own Classes | 📖 Read | 📖 Own Kids | 📖 Self |
| **Grades** | ✅ All | ✅ Within Org | ✅ School | ✅ School | ✅ Own Subjects | 📖 Read | 📖 Own Kids | 📖 Self |
| **Fees** | ✅ All | ✅ Within Org | ✅ School | ✅ School | 📖 Own Classes | ✅ Full | 📖 Own Kids | 📖 Self |
| **Timetables** | ✅ All | ✅ Within Org | ✅ School | ✅ School | 📖 Own Schedule | 📖 Read | 📖 Kids' Classes | 📖 Own Class |
| **Messages** | ✅ All | ✅ Within Org | ✅ School | ✅ School | ✏️ Own Classes | 📖 Read | ✏️ Teachers | ✏️ Teachers |
| **Reports** | ✅ All | ✅ Within Org | ✅ School | ✅ School | 📖 Own Classes | ✅ Financial | 📖 Own Kids | 📖 Self |

### 5.3 Detailed Permission Examples

#### Example 1: Teacher Marking Attendance

**Scenario**: Teacher "Ms. Fatima" wants to mark attendance for Class 5-A.

**Permission Check:**
1. ✅ User role: `teacher`
2. ✅ Has `write:attendance` permission
3. ✅ Assigned to Class 5-A (verified in `class_subjects` table)
4. ✅ Within 24-hour window (attendance date must be today or yesterday)

**API Call:**
```typescript
POST /api/v1/attendance/bulk
Authorization: Bearer <teacher_token>
{
  "sectionId": "section-uuid-5a",
  "date": "2024-12-11",
  "records": [
    { "studentId": "student-1", "status": "present" },
    { "studentId": "student-2", "status": "absent" },
    { "studentId": "student-3", "status": "late", "lateMinutes": 15 }
  ]
}
```

**Backend Validation:**
```typescript
// AttendanceController
async markBulkAttendance(@Body() dto, @CurrentUser() user) {
  // 1. Verify teacher assigned to section
  const isAssigned = await this.teacherService.isAssignedToSection(
    user.id,
    dto.sectionId
  );
  if (!isAssigned && user.role !== 'school_admin' && user.role !== 'principal') {
    throw new ForbiddenException('Not assigned to this class');
  }

  // 2. Verify section belongs to teacher's school
  const section = await this.sectionService.findOne(dto.sectionId);
  if (section.schoolId !== user.schoolId) {
    throw new ForbiddenException('Section not in your school');
  }

  // 3. Verify date within allowed window
  const daysDiff = differenceInDays(new Date(), new Date(dto.date));
  if (daysDiff > 1 && user.role === 'teacher') {
    throw new ForbiddenException('Can only mark attendance for today or yesterday');
  }

  // 4. Mark attendance
  return this.attendanceService.markBulk(dto, user);
}
```

#### Example 2: Parent Viewing Child's Grades

**Scenario**: Parent "Mr. Hassan" wants to view grades for his son "Ali".

**Permission Check:**
1. ✅ User role: `parent`
2. ✅ Has `read:grades` permission
3. ✅ Is parent of student "Ali" (verified in `parent_students` table)
4. ✅ Grades are published (only published grades visible to parents)

**API Call:**
```typescript
GET /api/v1/students/student-uuid-ali/grades?term=first-term
Authorization: Bearer <parent_token>
```

**Backend Validation:**
```typescript
// GradesController
async getStudentGrades(@Param('studentId') studentId, @CurrentUser() user) {
  // 1. Verify parent-student relationship
  if (user.role === 'parent') {
    const isParent = await this.parentService.isParentOf(user.id, studentId);
    if (!isParent) {
      throw new ForbiddenException('Not your child');
    }
  }

  // 2. Fetch only published grades for parents
  const grades = await this.gradesService.findByStudent(studentId, {
    published: user.role === 'parent' || user.role === 'student'
  });

  return grades;
}
```

#### Example 3: School Admin Cannot Access Other School's Data

**Scenario**: School Admin of "LGS Johar Town" tries to view students from "LGS DHA".

**Permission Check:**
1. ✅ User role: `school_admin`
2. ❌ `schoolId` in JWT: `school-lgs-jt`
3. ❌ Requested school: `school-lgs-dha`
4. ❌ **Access Denied** (different school)

**API Call:**
```typescript
GET /api/v1/schools/school-lgs-dha/students
Authorization: Bearer <school_admin_token>
```

**Backend Response:**
```typescript
// Middleware automatically filters by schoolId
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const { schoolId, organizationId } = extractFromJWT(req);

    // Inject tenant context into request
    req['schoolId'] = schoolId;
    req['organizationId'] = organizationId;

    next();
  }
}

// In controller
async getStudents(@Param('schoolId') schoolId, @CurrentUser() user) {
  // Auto-filter by user's school
  if (user.role === 'school_admin' || user.role === 'teacher') {
    if (schoolId !== user.schoolId) {
      throw new ForbiddenException('Cannot access other school data');
    }
  }

  // ... rest of logic
}
```

---

## 6. Data Scope & Filtering

### 6.1 Automatic Tenant Filtering

**Database Query Middleware:**

All database queries automatically inject tenant filters based on JWT claims:

```typescript
// TypeORM Custom Repository
@Injectable()
export class TenantAwareRepository<T> extends Repository<T> {
  constructor(
    @InjectRepository(T) private repo: Repository<T>,
    @Inject(REQUEST) private request: Request
  ) {
    super();
  }

  find(options?: FindManyOptions<T>) {
    const { schoolId, organizationId, role } = this.request['user'];

    // Auto-inject tenant filters
    const tenantFilter: any = {};

    if (role === 'super_admin') {
      // No filtering - can see all
    } else if (role === 'org_admin') {
      tenantFilter.organizationId = organizationId;
    } else {
      // All other roles - filter by school
      tenantFilter.schoolId = schoolId;
    }

    return this.repo.find({
      ...options,
      where: {
        ...options?.where,
        ...tenantFilter
      }
    });
  }
}
```

### 6.2 Data Scope by Role

| Role | Data Scope | Filter Applied |
|------|-----------|---------------|
| **Super Admin** | All organizations, all schools | No filter |
| **Org Admin** | All schools in their organization | `WHERE organization_id = :orgId` |
| **School Admin** | Only their school | `WHERE school_id = :schoolId` |
| **Principal** | Only their school | `WHERE school_id = :schoolId` |
| **Teacher** | Only assigned classes | `WHERE school_id = :schoolId AND section_id IN (:assignedSections)` |
| **Accountant** | Only their school | `WHERE school_id = :schoolId` |
| **Parent** | Only their children | `WHERE student_id IN (:childrenIds)` |
| **Student** | Only self | `WHERE student_id = :studentId` |

### 6.3 Row-Level Security Examples

**PostgreSQL Row-Level Security (RLS):**

```sql
-- Enable RLS on students table
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Policy for school admins: only see students in their school
CREATE POLICY school_admin_students ON students
  FOR ALL
  TO school_admin_role
  USING (school_id = current_setting('app.current_school_id')::uuid);

-- Policy for teachers: only see students in assigned classes
CREATE POLICY teacher_students ON students
  FOR SELECT
  TO teacher_role
  USING (
    section_id IN (
      SELECT section_id FROM class_subjects
      WHERE teacher_id = current_setting('app.current_user_id')::uuid
    )
  );

-- Policy for parents: only see own children
CREATE POLICY parent_students ON students
  FOR SELECT
  TO parent_role
  USING (
    id IN (
      SELECT student_id FROM parent_students
      WHERE parent_id = current_setting('app.current_user_id')::uuid
    )
  );
```

---

## 7. UI/UX Patterns

### 7.1 User Creation Forms

**Common Elements Across All Admin Dashboards:**

1. **"+ Add User" Button**: Top-right of user list
2. **Role Selector**: Dropdown limited to roles the admin can create
3. **Form Fields**: Adjust based on selected role
4. **Email Field**: Becomes login credential
5. **Temporary Password**: Auto-generated or manual entry
6. **"Send Welcome Email" Toggle**: Default ON
7. **Preview Card**: Shows what welcome email will contain

**Form Validation:**

```typescript
// User Creation Form Schema
const userCreationSchema = z.object({
  email: z.string().email('Valid email required'),
  firstName: z.string().min(2, 'First name too short'),
  lastName: z.string().min(2, 'Last name too short'),
  role: z.enum([
    'org_admin', 'school_admin', 'principal', 'teacher',
    'accountant', 'hr', 'librarian', 'receptionist'
  ]),
  phone: z.string().regex(/^03\d{2}-\d{7}$/, 'Invalid Pakistan phone number'),
  temporaryPassword: z.string().min(8, 'Password must be at least 8 characters'),
  sendWelcomeEmail: z.boolean().default(true)
});

// Role-specific fields
const teacherFields = z.object({
  department: z.string(),
  subjects: z.array(z.string()).min(1),
  qualifications: z.string()
});

const accountantFields = z.object({
  bankDetails: z.object({
    bankName: z.string(),
    accountNumber: z.string()
  })
});
```

### 7.2 Role-Based Dashboard Navigation

**Dynamic Navigation Based on Role:**

```typescript
// Navigation menu generator
const getNavigationForRole = (role: UserRole) => {
  const baseItems = [
    { label: 'Dashboard', href: '/dashboard', icon: Home }
  ];

  switch (role) {
    case 'super_admin':
      return [
        ...baseItems,
        { label: 'Organizations', href: '/organizations', icon: Building },
        { label: 'All Schools', href: '/schools', icon: School },
        { label: 'Platform Analytics', href: '/analytics', icon: BarChart },
        { label: 'System Settings', href: '/settings', icon: Settings }
      ];

    case 'org_admin':
      return [
        ...baseItems,
        { label: 'My Organization', href: '/organization', icon: Building },
        { label: 'Schools', href: '/schools', icon: School },
        { label: 'Org Analytics', href: '/analytics', icon: BarChart }
      ];

    case 'school_admin':
      return [
        ...baseItems,
        { label: 'Students', href: '/students', icon: Users },
        { label: 'Staff', href: '/staff', icon: UserCog },
        { label: 'Attendance', href: '/attendance', icon: CheckSquare },
        { label: 'Grades', href: '/grades', icon: Award },
        { label: 'Fees', href: '/fees', icon: DollarSign },
        { label: 'Timetable', href: '/timetable', icon: Calendar },
        { label: 'Reports', href: '/reports', icon: FileText }
      ];

    case 'teacher':
      return [
        ...baseItems,
        { label: 'My Classes', href: '/classes', icon: BookOpen },
        { label: 'Attendance', href: '/attendance', icon: CheckSquare },
        { label: 'Grades', href: '/grades', icon: Award },
        { label: 'Timetable', href: '/timetable', icon: Calendar },
        { label: 'Messages', href: '/messages', icon: MessageSquare }
      ];

    case 'parent':
      return [
        ...baseItems,
        { label: 'My Children', href: '/children', icon: Users },
        { label: 'Attendance', href: '/attendance', icon: CheckSquare },
        { label: 'Grades', href: '/grades', icon: Award },
        { label: 'Fee Payments', href: '/fees', icon: DollarSign },
        { label: 'Messages', href: '/messages', icon: MessageSquare }
      ];

    case 'student':
      return [
        ...baseItems,
        { label: 'My Timetable', href: '/timetable', icon: Calendar },
        { label: 'Attendance', href: '/attendance', icon: CheckSquare },
        { label: 'Grades', href: '/grades', icon: Award },
        { label: 'Assignments', href: '/assignments', icon: FileText }
      ];
  }
};
```

### 7.3 Access Denied UI Pattern

**When user tries to access unauthorized resource:**

```
┌─────────────────────────────────────────────────────────┐
│                        🚫                               │
│                                                         │
│                 Access Denied                           │
│                                                         │
│  You don't have permission to access this resource.    │
│                                                         │
│  If you believe this is a mistake, please contact      │
│  your administrator.                                    │
│                                                         │
│           [← Back to Dashboard]                         │
└─────────────────────────────────────────────────────────┘
```

---

## 8. API Authorization

### 8.1 Authorization Guards

**NestJS RBAC Guard:**

```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<UserRole[]>(
      'roles',
      context.getHandler()
    );

    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return requiredRoles.some(role => user.role === role);
  }
}

// Usage in controller
@Post('users')
@Roles('super_admin', 'org_admin', 'school_admin')  // Only these roles can create users
@UseGuards(RolesGuard)
async createUser(@Body() dto: CreateUserDto, @CurrentUser() user: User) {
  // Additional checks
  if (user.role === 'school_admin' && dto.role === 'super_admin') {
    throw new ForbiddenException('Cannot create super admin');
  }

  return this.usersService.create(dto, user);
}
```

### 8.2 Permission Decorators

```typescript
// Custom decorator for fine-grained permissions
export const RequirePermissions = (...permissions: string[]) => {
  return applyDecorators(
    SetMetadata('permissions', permissions),
    UseGuards(PermissionsGuard)
  );
};

// Usage
@Post('attendance/bulk')
@RequirePermissions('write:attendance')
async markAttendance(@Body() dto, @CurrentUser() user) {
  // ... implementation
}

// PermissionsGuard implementation
@Injectable()
export class PermissionsGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.get<string[]>(
      'permissions',
      context.getHandler()
    );

    if (!requiredPermissions) return true;

    const { user } = context.switchToHttp().getRequest();

    return requiredPermissions.every(perm =>
      user.permissions.includes(perm)
    );
  }
}
```

### 8.3 API Endpoint Authorization Matrix

| Endpoint | Super Admin | Org Admin | School Admin | Principal | Teacher | Accountant | Parent | Student |
|----------|------------|-----------|--------------|-----------|---------|------------|--------|---------|
| `POST /api/v1/organizations` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `POST /api/v1/schools` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `POST /api/v1/users` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `POST /api/v1/students` | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `POST /api/v1/attendance/bulk` | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `POST /api/v1/grades` | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `POST /api/v1/fees` | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| `POST /api/v1/payments` | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| `GET /api/v1/students` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `GET /api/v1/reports/financial` | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |

---

## 9. Security Considerations

### 9.1 Password Policies

**Initial User Setup:**
1. Admin creates user with **temporary password**
2. Welcome email sent with login link
3. User must **change password on first login**
4. New password must meet requirements:
   - Minimum 8 characters
   - At least 1 uppercase letter
   - At least 1 lowercase letter
   - At least 1 number
   - At least 1 special character

**Password Change Enforcement:**

```typescript
// First login check
@Get('auth/me')
async getCurrentUser(@CurrentUser() user: User) {
  const userProfile = await this.usersService.findOne(user.id);

  return {
    ...userProfile,
    mustChangePassword: userProfile.passwordChangedAt === null,
    accountAge: differenceInDays(new Date(), userProfile.createdAt)
  };
}

// Force password change
if (mustChangePassword) {
  // Redirect to /change-password
  // User cannot access any other page until password changed
}
```

### 9.2 Audit Logging

**All user creation logged:**

```typescript
// After creating user
await this.auditLogService.log({
  userId: currentUser.id,
  action: 'create',
  entityType: 'user',
  entityId: newUser.id,
  changes: {
    email: newUser.email,
    role: newUser.role,
    schoolId: newUser.schoolId
  },
  ipAddress: request.ip,
  userAgent: request.headers['user-agent']
});
```

**Audit log includes:**
- Who created the user (admin)
- When (timestamp)
- What was created (role, school, email)
- From where (IP address)

### 9.3 Account Deactivation

**Soft Delete Approach:**

Instead of deleting users, accounts are deactivated:

```typescript
// Deactivate user (NOT delete)
@Delete('users/:id')
@Roles('super_admin', 'org_admin', 'school_admin')
async deactivateUser(@Param('id') userId: string, @CurrentUser() admin: User) {
  // Check if admin has permission to deactivate this user
  const targetUser = await this.usersService.findOne(userId);

  if (admin.role === 'school_admin' && targetUser.schoolId !== admin.schoolId) {
    throw new ForbiddenException('Cannot deactivate users from other schools');
  }

  // Soft delete
  await this.usersService.update(userId, {
    status: 'inactive',
    deletedAt: new Date(),
    deletedBy: admin.id
  });

  // Revoke all refresh tokens
  await this.authService.revokeAllUserTokens(userId);

  // Audit log
  await this.auditLogService.log({
    userId: admin.id,
    action: 'deactivate',
    entityType: 'user',
    entityId: userId
  });

  return { message: 'User deactivated successfully' };
}
```

### 9.4 Protection Against Privilege Escalation

**Example: School Admin tries to create Org Admin:**

```typescript
@Post('users')
async createUser(@Body() dto: CreateUserDto, @CurrentUser() admin: User) {
  // Define role hierarchy
  const roleHierarchy = {
    super_admin: ['super_admin', 'org_admin', 'school_admin', 'principal', 'teacher', ...],
    org_admin: ['org_admin', 'school_admin', 'principal', 'teacher', ...],
    school_admin: ['principal', 'teacher', 'accountant', 'hr', ...]
  };

  const allowedRoles = roleHierarchy[admin.role];

  if (!allowedRoles.includes(dto.role)) {
    throw new ForbiddenException(
      `${admin.role} cannot create users with role ${dto.role}`
    );
  }

  // Additional checks...
  return this.usersService.create(dto);
}
```

---

## 10. Complete Workflow Examples

### Workflow 1: New School Onboarding

```mermaid
sequenceDiagram
    participant SA as Super Admin
    participant OA as Org Admin (New)
    participant SchA as School Admin (New)
    participant T as Teacher (New)
    participant S as Student
    participant P as Parent (Auto-created)

    SA->>SA: Login to platform
    SA->>System: Create Organization "ABC Schools"
    System-->>SA: Org created
    SA->>System: Create Org Admin (orgadmin@abc.edu)
    System->>OA: Send welcome email
    OA->>OA: Login with temp password
    OA->>OA: Change password
    OA->>System: Create School "ABC Primary"
    System-->>OA: School created
    OA->>System: Create School Admin (admin@abcprimary.edu)
    System->>SchA: Send welcome email
    SchA->>SchA: Login & change password
    SchA->>System: Create Teacher (teacher@abcprimary.edu)
    System->>T: Send welcome email
    T->>T: Login & change password
    T->>System: Admit Student "Ali"
    System-->>T: Student created
    System->>P: Auto-create parent account
    System->>P: Send welcome email
    P->>P: Login & view child's info
```

### Workflow 2: Daily Attendance Marking

```mermaid
flowchart TD
    A[Teacher logs in] --> B[Navigate to Attendance]
    B --> C[Select Class & Date]
    C --> D[Load student list]
    D --> E[Mark attendance<br/>Present/Absent/Late]
    E --> F{All marked?}
    F -->|No| E
    F -->|Yes| G[Submit attendance]
    G --> H[Backend validation]
    H --> I{Valid?}
    I -->|No| J[Show errors]
    J --> E
    I -->|Yes| K[Save to database]
    K --> L[Queue notifications]
    L --> M[Send SMS/Email to<br/>parents of absent students]
    M --> N[Show success message]
```

---

## Appendix A: Role Permission Reference

### Super Admin Capabilities

**Full Platform Control:**
- Create/Delete Organizations
- Create/Manage Org Admins
- View all schools, all users, all data across platform
- Override any permission
- System configuration
- Platform-wide analytics

**Use Cases:**
- Initial system setup
- Managing multiple school chains
- Troubleshooting across organizations
- Platform-level reporting

### Org Admin Capabilities

**Organization Scope:**
- Create/Delete Schools within organization
- Create/Manage School Admins
- View all data across all schools in organization
- Organization-wide analytics
- Cannot access other organizations

**Use Cases:**
- Managing multi-branch school system
- Cross-school reporting
- Staff allocation across branches
- Standardization across schools

### School Admin Capabilities

**School Scope:**
- Create/Manage all staff (teachers, accountant, etc.)
- Full CRUD on students, attendance, grades, fees
- School-level analytics
- Cannot access other schools (even in same organization)

**Use Cases:**
- Day-to-day school operations
- Staff management
- Student admissions
- School-level reporting

### Teacher Capabilities

**Class Scope:**
- View assigned classes only
- Mark attendance for assigned classes
- Enter grades for assigned subjects
- Message students/parents in assigned classes
- View timetable

**Restrictions:**
- Cannot create users
- Cannot modify students
- Cannot delete anything
- Limited to assigned classes

### Parent Capabilities

**Child Scope:**
- View own children's data only
- View attendance, grades (published), fees
- Pay fees online
- Message teachers
- View timetable for children's classes

**Restrictions:**
- Cannot create anything
- Cannot modify anything
- Cannot view other students
- Read-only except fee payments

### Student Capabilities

**Self Scope:**
- View own attendance
- View own grades (published)
- View own fees
- View own timetable
- Message teachers

**Restrictions:**
- Cannot create anything
- Cannot modify anything
- Cannot view other students
- Strictly read-only

---

## Appendix B: Common API Flows

### Flow 1: Login → Token → Dashboard

```bash
# 1. Login
curl -X POST https://api.eduflow.pk/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teacher@school.edu",
    "password": "MyPassword123!"
  }'

# Response:
{
  "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-123",
    "email": "teacher@school.edu",
    "role": "teacher",
    "schoolId": "uuid-school",
    "organizationId": "uuid-org"
  }
}

# 2. Get Dashboard Data
curl -X GET https://api.eduflow.pk/v1/dashboard \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."

# Response: Role-specific dashboard data
```

### Flow 2: Create Student → Auto-create Parent

```bash
# 1. School Admin creates student
curl -X POST https://api.eduflow.pk/v1/students \
  -H "Authorization: Bearer <school_admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Ali",
    "lastName": "Hassan",
    "dateOfBirth": "2010-05-15",
    "admissionDate": "2024-12-11",
    "classId": "uuid-class-5",
    "sectionId": "uuid-section-5a",
    "fatherName": "Hassan Ahmed",
    "fatherPhone": "+92-300-1234567",
    "fatherEmail": "hassan@email.com",
    "address": "123 Street, Lahore"
  }'

# Response:
{
  "student": {
    "id": "uuid-student-ali",
    "firstName": "Ali",
    "lastName": "Hassan",
    "registrationNo": "REG-2024-001",
    ...
  },
  "parentAccount": {
    "id": "uuid-parent-hassan",
    "email": "hassan@email.com",
    "role": "parent",
    "temporaryPassword": "********",  # Hidden in response
    "welcomeEmailSent": true
  }
}

# 2. Parent receives email, logs in
# 3. Parent forced to change password on first login
```

---

## Conclusion

EduFlow's hierarchical user management system ensures:

✅ **Security**: No public registration, invitation-only access
✅ **Data Isolation**: Users can only access data within their scope
✅ **Role-Based Access**: Granular CRUD permissions per role
✅ **Auditability**: All user actions logged for compliance
✅ **Scalability**: System supports organizations with multiple schools

**Key Takeaways:**
1. **Login-only system** - No public registration page
2. **Hierarchical user creation** - Admins create subordinate users
3. **Scoped data access** - Users see only relevant data
4. **Role-based permissions** - CRUD operations controlled by role
5. **Audit trail** - All actions logged for accountability

---

**Document Version**: 1.0
**Last Updated**: December 11, 2024
**Next Review**: March 2025

**Questions?** Refer to TDD, UI Document, or contact technical lead.

---

**END OF DOCUMENT**

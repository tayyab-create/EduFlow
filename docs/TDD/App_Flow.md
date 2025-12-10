# EduFlow Application Flow

## Overview

EduFlow uses a **hierarchical admin management** model. Administrators cannot self-register; they are created by higher-level admins.

---

## 1. Role Hierarchy

```
Platform
└── Super Admin (Platform Owner)
    └── Organization (School Chain)
        └── Org Admin
            └── School (Branch)
                └── School Admin
                    └── Staff (Principal, Teachers, etc.)
```

---

## 2. User Creation Rules

| Creator | Can Create |
|---------|-----------|
| **Super Admin** | Org Admins, School Admins, Schools, Organizations |
| **Org Admin** | School Admins (within org), Other Org Admins (within org), Schools (within org) |
| **School Admin** | Staff (Principal, Teachers, Accountant, etc.) |
| **Staff** | Cannot create users |

---

## 3. Authentication Flow

### 3.1 No Public Registration
- **Login only** for admin roles
- Default Super Admin is **seeded** on first deployment
- All other admins are created by their parent admin

### 3.2 Initial Setup
1. System seeds `super@eduflow.pk` as Super Admin
2. Super Admin logs in
3. Creates Organizations → Creates Org Admins
4. Org Admin creates Schools → Creates School Admins

---

## 4. UI Routes by Role

### Super Admin
| Route | Purpose |
|-------|---------|
| `/dashboard` | Platform-wide analytics |
| `/organizations` | Manage all organizations |
| `/organizations/:id/admins` | Manage Org Admins |
| `/schools` | View all schools |
| `/users` | View all users |

### Org Admin
| Route | Purpose |
|-------|---------|
| `/dashboard` | Organization analytics |
| `/schools` | Schools in their org |
| `/schools/:id/admins` | Manage School Admins |
| `/users` | Users in their org |

### School Admin
| Route | Purpose |
|-------|---------|
| `/dashboard` | School analytics |
| `/staff` | Manage school staff |
| `/students` | Manage students |
| `/academic` | Academic setup |

---

## 5. API Endpoints for User Management

### User Creation (POST)
```
POST /api/v1/users
Authorization: Bearer <token>

Body:
{
  "email": "admin@school.pk",
  "firstName": "John",
  "lastName": "Doe",
  "role": "school_admin",
  "schoolId": "uuid",           // Required for school-level roles
  "organizationId": "uuid"      // Required for org_admin
}
```

### Permission Matrix
| Endpoint | Super Admin | Org Admin | School Admin |
|----------|-------------|-----------|--------------|
| Create Org Admin | ✅ Any org | ✅ Own org only | ❌ |
| Create School Admin | ✅ Any school | ✅ Own org schools | ❌ |
| Create Staff | ✅ | ✅ Own org | ✅ Own school |

---

## 6. Seed Data

On first run, system creates:
```
super@eduflow.pk / AdminPass123!
└── Super Admin role
```

---

## 7. Implementation Checklist

- [ ] Remove public `/register` route
- [ ] Create seed script for Super Admin
- [ ] Add Users module with hierarchical creation
- [ ] Add "Manage Admins" UI in Organizations page
- [ ] Add "Manage Staff" UI in Schools page
- [ ] Enforce role-based creation in UsersService

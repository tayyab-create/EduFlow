# Migration Guide: Hierarchical Authentication Implementation
**Quick Start Guide for Deploying Changes**

---

## Prerequisites

- PostgreSQL database running
- Node.js installed
- Backend server codebase with latest changes

---

## Step-by-Step Migration

### Step 1: Backup Database 🔒

```bash
# Create backup before migration
pg_dump -U postgres -d eduflow > eduflow_backup_$(date +%Y%m%d).sql
```

**Restore command** (if needed):
```bash
psql -U postgres -d eduflow < eduflow_backup_YYYYMMDD.sql
```

---

### Step 2: Install Dependencies

```bash
cd server
npm install
```

---

### Step 3: Run Migration 🚀

```bash
# Run the migration
npm run typeorm:migration:run
```

**Expected Output:**
```
query: BEGIN TRANSACTION
query: ALTER TABLE "users" ADD COLUMN "organization_id" uuid
query: CREATE INDEX "IDX_users_organization_id" ON "users" ("organization_id")
query: ALTER TABLE "users" ADD CONSTRAINT "FK_users_organization" ...
query: UPDATE "users" u SET "organization_id" = s."organization_id" FROM "schools" s ...
query: COMMIT
✅ Migration completed: Added organization_id to users table
✅ Existing users linked to their school's organization
```

---

### Step 4: Verify Migration

```bash
# Connect to database
psql -U postgres -d eduflow

# Check the new column
\d users

# Should show:
# organization_id | uuid | |
```

**Verify data populated:**
```sql
SELECT
    id,
    email,
    role,
    organization_id,
    school_id
FROM users
WHERE role IN ('org_admin', 'school_admin', 'teacher')
LIMIT 10;
```

**Expected**: All users with `school_id` should have `organization_id` populated.

---

### Step 5: Restart Server

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

---

### Step 6: Test Changes ✅

#### Test 1: Public Registration Removed
```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "Test123!"
  }'

# Expected: 404 Not Found ✅
```

#### Test 2: Login & JWT Payload
```bash
# Login as Super Admin
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "super@eduflow.pk",
    "password": "AdminPass123!"
  }'

# Response should include:
{
  "success": true,
  "data": {
    "user": { ... },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "...",
      "expiresIn": 900
    }
  }
}

# Decode accessToken at https://jwt.io
# Should contain:
# - organizationId (if applicable)
# - permissions array ✅
```

#### Test 3: Create Organization (Super Admin)
```bash
# First, get Super Admin token
SUPER_TOKEN="<paste_access_token_here>"

# Create organization
curl -X POST http://localhost:3001/api/v1/organizations \
  -H "Authorization: Bearer $SUPER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test School System",
    "code": "TSS",
    "city": "Lahore",
    "email": "info@tss.edu.pk"
  }'

# Expected: 201 Created ✅
```

#### Test 4: Create Org Admin (Super Admin)
```bash
# Get organizationId from previous step
ORG_ID="<organization_uuid>"

curl -X POST http://localhost:3001/api/v1/users \
  -H "Authorization: Bearer $SUPER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "orgadmin@tss.edu.pk",
    "password": "OrgAdmin123!",
    "firstName": "Ahmed",
    "lastName": "Khan",
    "role": "org_admin",
    "organizationId": "'$ORG_ID'"
  }'

# Expected: 201 Created ✅
```

#### Test 5: Org Admin Creates School
```bash
# Login as Org Admin
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "orgadmin@tss.edu.pk",
    "password": "OrgAdmin123!"
  }'

# Get token
ORG_ADMIN_TOKEN="<paste_token>"

# Create school (organizationId auto-set)
curl -X POST http://localhost:3001/api/v1/schools \
  -H "Authorization: Bearer $ORG_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "TSS Gulberg Campus",
    "code": "TSS-GLB",
    "city": "Lahore",
    "address": "123 Main Boulevard"
  }'

# Expected: 201 Created ✅
# organizationId should be auto-set to Org Admin's organization
```

#### Test 6: Org Admin Cannot Create in Other Org
```bash
# Try to create school in different organization
curl -X POST http://localhost:3001/api/v1/schools \
  -H "Authorization: Bearer $ORG_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Unauthorized School",
    "code": "UNAUTH",
    "organizationId": "different-org-uuid"
  }'

# Expected: 403 Forbidden ✅
# Error: "Org Admin can only create schools within their own organization"
```

---

## Troubleshooting

### Issue 1: Migration Fails

**Error**: `relation "users" does not exist`
**Solution**:
```bash
# Ensure database is created
createdb eduflow

# Run all migrations from scratch
npm run typeorm:migration:run
```

---

### Issue 2: organization_id Not Populated

**Error**: Existing users have NULL organization_id

**Solution**:
```sql
-- Manually populate from schools
UPDATE "users" u
SET "organization_id" = s."organization_id"
FROM "schools" s
WHERE u."school_id" = s."id"
AND u."organization_id" IS NULL;
```

---

### Issue 3: JWT Still Missing organizationId

**Error**: JWT doesn't contain organizationId field

**Solution**:
```bash
# Restart server completely
pkill -f "npm run start:dev"
npm run start:dev

# Clear any cached tokens in browser/Postman
# Login again to get new token
```

---

### Issue 4: Foreign Key Constraint Error

**Error**: `violates foreign key constraint "FK_users_organization"`

**Solution**:
```sql
-- Check for orphaned organization references
SELECT id, email, organization_id
FROM users
WHERE organization_id IS NOT NULL
AND organization_id NOT IN (SELECT id FROM organizations);

-- Fix orphaned records (set to NULL)
UPDATE users
SET organization_id = NULL
WHERE organization_id NOT IN (SELECT id FROM organizations);
```

---

## Rollback Procedure

If you need to rollback:

### 1. Rollback Migration
```bash
npm run typeorm:migration:revert
```

### 2. Revert Code Changes
```bash
git log --oneline  # Find commit hash before changes
git revert <commit-hash>
```

### 3. Restart Server
```bash
npm run start:dev
```

---

## Post-Migration Checklist

- [ ] Migration ran successfully
- [ ] `organization_id` column exists in `users` table
- [ ] Existing users have `organization_id` populated
- [ ] Server starts without errors
- [ ] Login returns JWT with `organizationId` and `permissions`
- [ ] Public registration endpoint returns 404
- [ ] Super Admin can create Org Admin
- [ ] Org Admin can create schools in their org
- [ ] Org Admin cannot create schools in other org
- [ ] School Admin can create teachers
- [ ] Organization-level filtering works (Org Admin sees only their org's users)

---

## Database Verification Queries

```sql
-- 1. Check users table structure
\d users;

-- 2. Verify organization_id populated
SELECT
    COUNT(*) as total_users,
    COUNT(organization_id) as users_with_org_id,
    COUNT(*) - COUNT(organization_id) as users_without_org_id
FROM users;

-- Expected: users_without_org_id should be 0 or only Super Admin

-- 3. Check Org Admin users
SELECT
    id,
    email,
    role,
    organization_id,
    school_id
FROM users
WHERE role = 'org_admin';

-- Expected: All org_admins should have organization_id, school_id should be NULL

-- 4. Check School Admin users
SELECT
    u.id,
    u.email,
    u.role,
    u.organization_id,
    u.school_id,
    s.name as school_name,
    o.name as org_name
FROM users u
LEFT JOIN schools s ON u.school_id = s.id
LEFT JOIN organizations o ON u.organization_id = o.id
WHERE u.role = 'school_admin'
LIMIT 10;

-- Expected: All school_admins should have both organization_id and school_id

-- 5. Check for orphaned references
SELECT
    u.id,
    u.email,
    u.organization_id
FROM users u
WHERE u.organization_id IS NOT NULL
AND u.organization_id NOT IN (SELECT id FROM organizations);

-- Expected: 0 rows (no orphaned references)

-- 6. Verify foreign key constraints
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'users'
AND tc.constraint_type = 'FOREIGN KEY';

-- Expected: Should see FK_users_organization constraint
```

---

## Performance Considerations

### Index Performance

After migration, the new index on `organization_id` should improve query performance:

```sql
-- Check index usage
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE tablename = 'users'
ORDER BY idx_scan DESC;

-- Expected: IDX_users_organization_id should show usage after queries
```

### Query Plan Analysis

```sql
-- Test query performance
EXPLAIN ANALYZE
SELECT * FROM users
WHERE organization_id = 'some-uuid';

-- Should use index scan, not sequential scan
```

---

## Security Verification

### Test Attack Scenarios

#### 1. Self-Registration Attack
```bash
# Should fail
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "hacker@evil.com", "password": "hack", "role": "super_admin"}'

# Expected: 404 Not Found
```

#### 2. Privilege Escalation
```bash
# School Admin tries to create Org Admin
curl -X POST http://localhost:3001/api/v1/users \
  -H "Authorization: Bearer $SCHOOL_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email": "fake@org.com", "role": "org_admin", ...}'

# Expected: 403 Forbidden
# Error: "school_admin cannot create org_admin users"
```

#### 3. Cross-Organization Access
```bash
# Org Admin A tries to create school in Org B
curl -X POST http://localhost:3001/api/v1/schools \
  -H "Authorization: Bearer $ORG_ADMIN_A_TOKEN" \
  -d '{"organizationId": "org-b-uuid", ...}'

# Expected: 403 Forbidden
# Error: "Org Admin can only create schools within their own organization"
```

---

## Next Steps After Migration

1. **Update Frontend**:
   - Remove registration page UI
   - Update JWT decoder to parse `organizationId` and `permissions`
   - Add user creation forms in admin dashboards

2. **Update API Documentation**:
   - Remove `/register` endpoint from docs
   - Document new JWT payload structure
   - Add examples for hierarchical user creation

3. **Write Integration Tests**:
   - Test hierarchical user creation flows
   - Test organization scoping
   - Test permission enforcement

4. **Monitor Production**:
   - Watch for any 403 errors (permission denied)
   - Check database query performance with new indexes
   - Monitor JWT token sizes (permissions array adds ~1-2KB)

---

## Support

If you encounter issues:
1. Check [IMPLEMENTATION_FIXES_SUMMARY.md](./IMPLEMENTATION_FIXES_SUMMARY.md) for detailed changes
2. Review [BEFORE_AFTER_COMPARISON.md](./BEFORE_AFTER_COMPARISON.md) for expected behavior
3. See [EduFlow App Flow & User Management.md](./EduFlow%20App%20Flow%20&%20User%20Management.md) for complete flows

---

**Migration Guide Version**: 1.0
**Date**: December 11, 2024
**Status**: Ready for Production

---

**END OF GUIDE**

# EduFlow - Hierarchical Authentication Testing UI

A comprehensive web interface to test all implemented hierarchical authentication and RBAC features.

---

## 🚀 Quick Start

### 1. Start Your Backend Server

```bash
cd server
npm run start:dev
```

**Ensure the server is running on:** `http://localhost:3001`

### 2. Run the Database Migration

```bash
cd server
npm run typeorm:migration:run
```

This adds the `organization_id` column to the users table.

### 3. Open the Testing UI

Simply open `testing-ui/index.html` in your browser:

```bash
# On macOS
open testing-ui/index.html

# On Windows
start testing-ui/index.html

# On Linux
xdg-open testing-ui/index.html
```

Or drag the file into your browser.

---

## 📋 Testing Checklist

### Test 1: ✅ Login (No Registration)

**Purpose**: Verify login works and JWT contains new fields

**Steps**:
1. Click "Super Admin" quick login button
2. Click "Login"
3. Check the "Decoded JWT Payload" section

**Expected**:
- ✅ Login succeeds
- ✅ JWT contains `organizationId` (if applicable)
- ✅ JWT contains `permissions` array
- ✅ JWT contains `role`, `email`, `schoolId`

**Sample JWT**:
```json
{
  "sub": "user-uuid-123",
  "email": "super@eduflow.pk",
  "role": "super_admin",
  "organizationId": null,
  "schoolId": null,
  "permissions": [
    "read:*",
    "write:*",
    "delete:*",
    "manage:organizations",
    "manage:schools",
    "manage:users"
  ]
}
```

---

### Test 2: ❌ Test Registration (Should Fail)

**Purpose**: Verify public registration endpoint is removed

**Steps**:
1. Click "Test Registration Endpoint"

**Expected**:
- ✅ Status: **404 Not Found**
- ✅ Message: "Endpoint does not exist"

**Result**: Registration endpoint successfully removed ✅

---

### Test 3: 🏢 Create Organization

**Purpose**: Verify Super Admin can create organizations

**Steps**:
1. Login as Super Admin (use quick login)
2. Fill in organization details (default values provided)
3. Click "Create Organization"

**Expected**:
- ✅ Organization created successfully
- ✅ Response contains organization UUID
- ✅ Organization ID auto-filled in "Create Org Admin" form

**Sample Response**:
```json
{
  "id": "org-uuid-123",
  "name": "Test School System",
  "code": "TSS",
  "city": "Lahore",
  "email": "info@tss.edu.pk"
}
```

---

### Test 4: 👤 Create Org Admin

**Purpose**: Verify Super Admin can create Org Admin with organizationId

**Steps**:
1. Ensure you've created an organization first
2. Organization ID should be auto-filled
3. Click "Create Org Admin"

**Expected**:
- ✅ Org Admin created successfully
- ✅ User has `organizationId` set
- ✅ User has `role: 'org_admin'`

**Credentials Created**:
- Email: `orgadmin@tss.edu.pk`
- Password: `OrgAdmin123!`

---

### Test 5: 🏫 Create School (Org Admin)

**Purpose**: Verify Org Admin can create schools in their organization

**Steps**:
1. **Logout** and login as Org Admin:
   - Click "Org Admin" quick login
   - Email: `orgadmin@tss.edu.pk`
   - Password: `OrgAdmin123!`
2. Fill in school details
3. **Do NOT** provide organizationId (it should be auto-set)
4. Click "Create School"

**Expected**:
- ✅ School created successfully
- ✅ `organizationId` is **auto-set** to Org Admin's organization
- ✅ Response shows the school belongs to correct organization

**Sample Response**:
```json
{
  "id": "school-uuid-456",
  "name": "TSS Gulberg Campus",
  "code": "TSS-GLB",
  "organizationId": "org-uuid-123",  // ✅ Auto-set!
  "city": "Lahore",
  "address": "123 Main Boulevard"
}
```

---

### Test 6: 🚫 Test Cross-Org Access

**Purpose**: Verify Org Admin CANNOT create schools in other organizations

**Steps**:
1. Login as Org Admin (from Test 5)
2. Create a **different** organization (as Super Admin) first, or use a random UUID
3. Enter that different organization UUID in the form
4. Click "Test Cross-Org Access"

**Expected**:
- ✅ Status: **403 Forbidden**
- ✅ Error: "Org Admin can only create schools within their own organization"

**Result**: Cross-organization access blocked ✅

---

### Test 7: 📋 Get All Users (Test Filtering)

**Purpose**: Verify organization-level data scoping works

**Steps**:

#### As Super Admin:
1. Login as Super Admin
2. Click "Get All Users (Super Admin)"
3. **Expected**: See ALL users across all organizations ✅

#### As Org Admin:
1. Login as Org Admin (`orgadmin@tss.edu.pk`)
2. Click "Get All Users (Org Admin)"
3. **Expected**: See ONLY users in their organization ✅

#### As School Admin:
1. Login as School Admin (if created)
2. Click "Get All Users (School Admin)"
3. **Expected**: See ONLY users in their school ✅

---

### Test 8: 🔍 JWT Token Inspector

**Purpose**: Verify JWT structure and contents

**Steps**:
1. Login as any user
2. Click "Inspect Current Token"
3. Review the decoded payload

**Verify JWT Contains**:
- ✅ `sub` (User ID)
- ✅ `email`
- ✅ `role`
- ✅ `organizationId` (for Org Admin)
- ✅ `schoolId` (for school-level users)
- ✅ `permissions` (array of permission strings)
- ✅ `iat` (issued at)
- ✅ `exp` (expiration)

---

### Test 9: 📊 Test Results Summary

**Purpose**: Overview of all test results

Check the "Test Results Summary" card for:
- ✅ Public Registration Removed
- ✅ JWT Contains organizationId
- ✅ JWT Contains permissions
- ✅ Org Admin Can Create Schools
- ✅ Cross-Org Access Blocked

All should show "✅ Passed"

---

## 🎯 Complete Test Flow

### Full Hierarchical Flow Test

1. **Login as Super Admin**
   ```
   Email: super@eduflow.pk
   Password: AdminPass123!
   ```

2. **Create Organization**
   ```
   Name: Test School System
   Code: TSS
   ```

3. **Create Org Admin**
   ```
   Email: orgadmin@tss.edu.pk
   Password: OrgAdmin123!
   Organization: (auto-filled from step 2)
   ```

4. **Logout & Login as Org Admin**
   ```
   Email: orgadmin@tss.edu.pk
   Password: OrgAdmin123!
   ```

5. **Create School (as Org Admin)**
   ```
   Name: TSS Gulberg Campus
   Code: TSS-GLB
   (organizationId auto-set)
   ```

6. **Verify JWT Payload**
   - Check that Org Admin token contains `organizationId`
   - Check that `permissions` array includes org-wide permissions

7. **Test Cross-Org Blocking**
   - Try to create school in different org (should fail)

8. **Create School Admin (as Org Admin)**
   ```bash
   # Use the API directly or add to UI
   POST /api/v1/users
   {
     "email": "schooladmin@tss.edu.pk",
     "password": "SchoolAdmin123!",
     "role": "school_admin",
     "schoolId": "<school-uuid-from-step-5>"
   }
   ```

9. **Verify Data Scoping**
   - Login as different roles
   - Check that each role sees only their scoped data

---

## 🐛 Troubleshooting

### Issue: Cannot connect to API

**Solution**:
```bash
# Ensure backend is running
cd server
npm run start:dev

# Check it's running on port 3001
curl http://localhost:3001/api/v1/health
```

### Issue: 404 on login

**Solution**: Backend server might not be running or migrations not applied
```bash
npm run typeorm:migration:run
npm run start:dev
```

### Issue: JWT doesn't contain organizationId

**Solution**:
1. Ensure migration was run
2. Clear browser cache/tokens
3. Login again to get new token

### Issue: Org Admin creation fails

**Solution**: Ensure you provide `organizationId` when creating Org Admin

### Issue: Cross-org test doesn't work

**Solution**: You need two different organizations. Create a second one as Super Admin first.

---

## 📸 Screenshots Guide

### 1. Login Screen
- Shows quick login buttons
- Displays decoded JWT payload
- Token contains organizationId and permissions

### 2. Registration Test
- Shows 404 error
- Confirms endpoint removal

### 3. Create Organization
- Simple form for org creation
- Returns organization UUID

### 4. Create School
- Shows organizationId auto-set
- Demonstrates Org Admin capability

### 5. Cross-Org Test
- Shows 403 Forbidden error
- Confirms security boundaries

### 6. JWT Inspector
- Detailed token breakdown
- Permission array visible

---

## 🎨 UI Features

- **Color-Coded Responses**: Green for success, red for errors
- **Quick Login Buttons**: Preset credentials for different roles
- **Auto-Fill**: Organization IDs auto-populate between forms
- **Real-Time JWT Decoding**: See token contents immediately
- **Test Status Tracking**: Track which tests passed/failed
- **Tabbed Interface**: Switch between different role perspectives

---

## 📝 Notes

### Default Credentials

**Super Admin** (seeded):
- Email: `super@eduflow.pk`
- Password: `AdminPass123!`

**Org Admin** (created in tests):
- Email: `orgadmin@tss.edu.pk`
- Password: `OrgAdmin123!`

**School Admin** (created in tests):
- Email: `schooladmin@tss.edu.pk`
- Password: `SchoolAdmin123!`

### API Endpoints Tested

- ❌ `POST /api/v1/auth/register` - Should return 404
- ✅ `POST /api/v1/auth/login` - Should return JWT with new fields
- ✅ `POST /api/v1/organizations` - Super Admin only
- ✅ `POST /api/v1/users` - Create Org Admin (Super Admin)
- ✅ `POST /api/v1/schools` - Create school (Super Admin or Org Admin)
- ✅ `GET /api/v1/users` - Get users (filtered by role)

---

## ✅ Success Criteria

All tests should show:

1. ✅ **Registration Removed**: 404 error when accessing register endpoint
2. ✅ **JWT Enhanced**: Contains `organizationId` and `permissions`
3. ✅ **Org Admin School Creation**: Can create schools in their org
4. ✅ **Cross-Org Blocking**: Cannot create schools in other orgs
5. ✅ **Data Scoping**: Each role sees only their scoped data

If all 5 criteria pass, the implementation is correct! 🎉

---

## 🔗 Related Documentation

- [Implementation Fixes Summary](../docs/IMPLEMENTATION_FIXES_SUMMARY.md)
- [Before/After Comparison](../docs/BEFORE_AFTER_COMPARISON.md)
- [Migration Guide](../docs/MIGRATION_GUIDE.md)
- [App Flow & User Management](../docs/EduFlow%20App%20Flow%20&%20User%20Management.md)

---

**Testing UI Version**: 1.0
**Date**: December 11, 2024
**Status**: Ready for Testing

---

**Happy Testing! 🚀**

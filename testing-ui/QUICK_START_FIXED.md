# Quick Start Guide - Fixed Version

## What Was Fixed

### 1. **Bug Fix: organizationId not saved when creating users**
- **Location**: [users.service.ts:167](../server/src/users/users.service.ts#L167)
- **Issue**: When creating an Org Admin user, the `organizationId` was set in the DTO but not included in the user entity creation
- **Fix**: Added `organizationId: dto.organizationId` to the user creation object

### 2. **Database Reset**
- Cleaned the database completely
- Recreated all tables with proper schema
- Super Admin will be auto-created on next server start

## How to Test the Fix

### Step 1: Start the Backend Server
```bash
cd server
npm run start:dev
```

The server will automatically:
- Connect to the database
- Create the Super Admin user: `super@eduflow.pk` / `AdminPass123!`

### Step 2: Open the Testing UI
Open `testing-ui/index.html` in your browser.

### Step 3: Test the Complete Flow

#### 3.1 Login as Super Admin
- Email: `super@eduflow.pk`
- Password: `AdminPass123!`
- Click **Login**
- ✅ You should see a success response with JWT token

#### 3.2 Create an Organization
- Organization Name: `Test School System`
- Organization Code: `TSS`
- City: `Lahore`
- Email: `info@tss.edu.pk`
- Click **Create Organization**
- ✅ Copy the Organization ID from the response

#### 3.3 Create an Org Admin
- Email: `orgadmin@tss.edu.pk`
- Password: `OrgAdmin123!`
- First Name: `Ahmed`
- Last Name: `Khan`
- Organization ID: (paste the ID from step 3.2)
- Click **Create Org Admin**
- ✅ Org Admin should be created successfully

#### 3.4 Login as Org Admin
- Click the **Org Admin** quick login button (or manually enter credentials)
- Email: `orgadmin@tss.edu.pk`
- Password: `OrgAdmin123!`
- Click **Login**
- ✅ You should login successfully and see the JWT token with `organizationId`

#### 3.5 Create a School (As Org Admin)
- School Name: `TSS Gulberg Campus`
- School Code: `TSS-GLB`
- City: `Lahore`
- Address: `123 Main Boulevard`
- Click **Create School**
- ✅ School should be created successfully
- ✅ The `organizationId` should be auto-populated (matching the Org Admin's organization)

#### 3.6 Test Cross-Org Access (Should Fail)
- Get a different Organization ID (create another org as Super Admin)
- Try to create a school with that different organization ID while logged in as Org Admin
- ✅ Should receive **403 Forbidden** error

## Available Scripts

### Database Management
```bash
# Reset database (drop all tables and recreate)
npm run db:reset

# Run migrations
npm run migration:run

# Show migration status
npm run migration:show

# Revert last migration
npm run migration:revert
```

### Development
```bash
# Start server in development mode
npm run start:dev

# Build the server
npm run build

# Run tests
npm run test
```

## Troubleshooting

### Issue: "Org Admin must be associated with an organization"
**Solution**: This error is now fixed. Make sure you:
1. Ran `npm run db:reset` to clean the database
2. Rebuilt the server with `npm run build`
3. Restarted your backend server
4. Created a new Org Admin with the fixed code

### Issue: Migration errors
**Solution**: If you see migration errors, run:
```bash
npm run db:reset
```
This will clean everything and start fresh.

### Issue: Super Admin not created
**Solution**: The Super Admin is created automatically when the server starts. Check the server logs for:
```
✅ Super Admin seeded: super@eduflow.pk / AdminPass123!
```

## Summary

The bug has been fixed! Now when you create an Org Admin:
1. ✅ The `organizationId` is properly saved to the database
2. ✅ Org Admins can create schools in their organization
3. ✅ Org Admins are restricted to their organization scope
4. ✅ Cross-organization access is blocked

Happy testing! 🎉

# 🚀 Quick Start - Testing UI

**Get testing in 3 simple steps!**

---

## Step 1: Run Migration

```bash
cd server
npm run typeorm:migration:run
```

**What this does**: Adds `organization_id` column to users table

---

## Step 2: Start Backend

```bash
cd server
npm run start:dev
```

**Verify it's running**:
```bash
curl http://localhost:3001/api/v1/health
```

---

## Step 3: Open Testing UI

**Simply open in browser:**
```bash
# Double-click the file, or:
open testing-ui/index.html
```

---

## 🎯 Quick Test Sequence (5 minutes)

### 1. Test Login ✅
- Click **"Super Admin"** quick login button
- Click **"Login"**
- ✅ Check JWT contains `organizationId` and `permissions`

### 2. Test No Registration ❌
- Click **"Test Registration Endpoint"**
- ✅ Should show **404 Not Found**

### 3. Create Organization 🏢
- Keep default values
- Click **"Create Organization"**
- ✅ Copy the organization ID

### 4. Create Org Admin 👤
- Organization ID auto-fills
- Click **"Create Org Admin"**
- ✅ Note the credentials

### 5. Test Org Admin Flow 🏫
- **Logout** (refresh page)
- Click **"Org Admin"** quick login
- Login with: `orgadmin@tss.edu.pk` / `OrgAdmin123!`
- Click **"Create School"**
- ✅ Check that `organizationId` is auto-set in response

### 6. Test Cross-Org Blocking 🚫
- Enter a random UUID in "Different Organization ID"
- Click **"Test Cross-Org Access"**
- ✅ Should show **403 Forbidden**

---

## ✅ All Tests Passed?

If you see:
- ✅ Public Registration Removed
- ✅ JWT Contains organizationId
- ✅ JWT Contains permissions
- ✅ Org Admin Can Create Schools
- ✅ Cross-Org Access Blocked

**Congratulations! Implementation is correct! 🎉**

---

## 🐛 Issues?

### Backend not responding?
```bash
cd server
npm install
npm run start:dev
```

### Migration not applied?
```bash
cd server
npm run typeorm:migration:run
```

### Need to reset database?
```bash
cd server
npm run typeorm:schema:drop
npm run typeorm:migration:run
npm run seed  # If you have a seeder
```

---

## 📚 Need More Details?

See [README.md](./README.md) for:
- Complete testing guide
- Detailed test scenarios
- Troubleshooting tips
- API endpoint reference

---

**That's it! Start testing in under 5 minutes! 🚀**

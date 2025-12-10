# Database Setup Guide

## Option 1: Docker Desktop (Recommended)

1. **Install Docker Desktop** from https://www.docker.com/products/docker-desktop
2. **Start Docker Desktop** and wait for it to fully load
3. Run: `docker-compose up -d`
4. Database will be available at `localhost:5432`

---

## Option 2: Local PostgreSQL Installation (Without Docker)

### Step 1: Install PostgreSQL

Download and install from: https://www.postgresql.org/download/windows/

During installation:
- Remember the password you set for `postgres` user
- Keep default port `5432`

### Step 2: Create Database

Open **pgAdmin** (installed with PostgreSQL) or command line:

```sql
-- Connect as postgres user, then run:
CREATE DATABASE eduflow;
```

Or via command line:
```bash
psql -U postgres
CREATE DATABASE eduflow;
\q
```

### Step 3: Update Server Environment

Edit `server/.env`:
```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password_here
DATABASE_NAME=eduflow
```

### Step 4: Start Server

```bash
cd server
npm run start:dev
```

TypeORM will auto-create tables on first run (in dev mode).

---

## Verify Connection

Once server starts, you should see:
```
🚀 EduFlow Backend running on http://localhost:3001
```

Test the health endpoint:
```
GET http://localhost:3001/api/health
```

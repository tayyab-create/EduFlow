# UI Technical Document
# EduFlow - School Management System
# Complete Frontend Specification

---

## Document Control

| Field | Details |
|-------|---------|
| **Product Name** | EduFlow - School Management System |
| **Document Type** | UI Technical Specification |
| **Version** | 1.0 |
| **Document Owner** | Frontend Architecture Team |
| **Status** | Draft for Review |
| **Created** | December 10, 2024 |
| **Last Updated** | December 10, 2024 |
| **Related Documents** | School_Management_System_PRD.md, EduFlow_Technical_Design_Document.md, Database_Schema.md |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [UI Architecture Overview](#2-ui-architecture-overview)
3. [Design System & Component Library](#3-design-system--component-library)
4. [Role-Based Page Structures](#4-role-based-page-structures)
5. [Shared Components Library](#5-shared-components-library)
6. [Super Admin Interface](#6-super-admin-interface)
7. [School Admin Interface](#7-school-admin-interface)
8. [Principal Interface](#8-principal-interface)
9. [Teacher Interface](#9-teacher-interface)
10. [Parent Interface](#10-parent-interface)
11. [Student Interface](#11-student-interface)
12. [Accountant Interface](#12-accountant-interface)
13. [Responsive Design Strategy](#13-responsive-design-strategy)
14. [Accessibility Standards](#14-accessibility-standards)
15. [Offline-First Strategy](#15-offline-first-strategy)
16. [Performance Optimization](#16-performance-optimization)
17. [Internationalization (i18n)](#17-internationalization-i18n)

---

## 1. Executive Summary

### 1.1 Document Purpose

This document provides a comprehensive specification of the EduFlow frontend user interface, detailing every page, component, and interaction pattern required for each user role. It serves as the single source of truth for frontend development, ensuring consistency, efficiency, and alignment with the Product Requirements Document (PRD).

### 1.2 UI Goals

- **Speed**: Reduce clicks by 70% for common tasks
- **Simplicity**: Intuitive interfaces requiring minimal training
- **Reliability**: Offline-capable with seamless sync
- **Mobile-First**: Touch-optimized interfaces for all screen sizes
- **Accessibility**: WCAG 2.1 AA compliance
- **Performance**: < 2 second page loads, < 500ms interactions

### 1.3 Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Next.js 14 (App Router) | SSR, SSG, routing, API routes |
| **UI Library** | React 18 | Component architecture |
| **Language** | TypeScript | Type safety |
| **Styling** | Tailwind CSS | Utility-first CSS |
| **Components** | shadcn/ui | Pre-built accessible components |
| **State Management** | Zustand | Global state (auth, user, notifications) |
| **Server State** | TanStack Query (React Query) | API data fetching, caching |
| **Forms** | React Hook Form + Zod | Form validation |
| **Tables** | TanStack Table | Advanced data tables |
| **Charts** | Recharts | Data visualization |
| **Icons** | Lucide React | Icon library |
| **Real-time** | Socket.io Client | Live updates, messaging |
| **Offline** | Workbox (PWA) | Service worker, offline caching |
| **Date/Time** | date-fns | Date manipulation |
| **Notifications** | React Hot Toast | Toast notifications |

### 1.4 Design Principles

1. **Task-Oriented**: Organize by user tasks, not system structure
2. **Progressive Disclosure**: Show only essential information initially
3. **Bulk Actions**: Support batch operations for efficiency
4. **Smart Defaults**: Pre-fill forms with intelligent defaults
5. **Instant Feedback**: Provide immediate visual responses
6. **Forgiving UX**: Allow undo, auto-save drafts
7. **Context-Aware**: Show relevant information based on role and context

---

## 2. UI Architecture Overview

### 2.1 Application Structure

```
/app
  /(public)                     # Public pages (no auth required)
    /page.tsx                   # Landing page
    /about
    /pricing
    /contact
  
  /(auth)                       # Authentication pages
    /login                      # Login only (no public registration)
    /forgot-password
    /reset-password
    /verify-email
  
  # NOTE: No /register route for admin roles
  # Admins are created by parent-level admins via User Management
  
  /(dashboard)                  # Protected routes (auth required)
    /layout.tsx                 # Main dashboard layout with sidebar
    
    /(super-admin)              # Super Admin routes
      /overview
      /organizations            # Manage all organizations
      /organizations/:id/admins # Manage Org Admins
      /schools
      /schools/:id/admins       # Manage School Admins  
      /users                    # All platform users
      /analytics
      /billing
      /support-tickets
    
    /(org-admin)                # Organization Admin routes
      /overview                 # Org-wide dashboard
      /schools                  # Schools in this organization
      /schools/:id/admins       # Manage School Admins
      /users                    # Users in this organization
      /analytics                # Consolidated analytics
      /reports                  # Cross-school reports
      /settings                 # Org-level settings
    
    /(admin)                    # School Admin routes
      /overview
      /staff                    # Manage school staff
      /staff/invite             # Invite new staff members
      /students
      /teachers
      /classes
      /subjects
      /timetable
      /fees
      /reports
      /settings
    
    /(admin)                    # School Admin routes
      /overview
      /students
      /teachers
      /staff
      /classes
      /subjects
      /timetable
      /fees
      /reports
      /settings
    
    /(principal)                # Principal routes
      /overview
      /analytics
      /teachers
      /students
      /reports
      /approvals
    
    /(teacher)                  # Teacher routes
      /overview
      /my-classes
      /attendance
      /grades
      /assignments
      /timetable
      /messages
    
    /(parent)                   # Parent routes
      /overview
      /children
      /attendance
      /grades
      /fees
      /messages
      /events
    
    /(student)                  # Student routes
      /overview
      /timetable
      /attendance
      /grades
      /assignments
      /messages
      /library
    
    /(accountant)               # Accountant routes
      /overview
      /fees
      /payments
      /reports
      /expense-management

/components
  /ui                           # shadcn/ui base components
    /button.tsx
    /card.tsx
    /dialog.tsx
    /dropdown-menu.tsx
    /form.tsx
    /input.tsx
    /select.tsx
    /table.tsx
    /tabs.tsx
    /toast.tsx
    # ... more base components
  
  /shared                       # Shared business components
    /layout
      /DashboardLayout.tsx
      /Sidebar.tsx
      /Header.tsx
      /Breadcrumbs.tsx
    /data-display
      /DataTable.tsx
      /StatsCard.tsx
      /ChartCard.tsx
      /EmptyState.tsx
    /forms
      /FormField.tsx
      /FileUpload.tsx
      /DatePicker.tsx
      /TimePicker.tsx
    /feedback
      /LoadingSpinner.tsx
      /ErrorBoundary.tsx
      /ConfirmDialog.tsx
  
  /features                     # Feature-specific components
    /attendance
      /AttendanceGrid.tsx
      /QuickAttendanceCard.tsx
      /AttendanceCalendar.tsx
      /AttendanceStats.tsx
    /grades
      /GradeEntryTable.tsx
      /ReportCard.tsx
      /AssessmentForm.tsx
    /students
      /StudentCard.tsx
      /StudentList.tsx
      /StudentForm.tsx
      /StudentProfile.tsx
    /fees
      /FeeCard.tsx
      /PaymentForm.tsx
      /FeeHistory.tsx
    /messaging
      /ChatWindow.tsx
      /MessageList.tsx
      /ComposeMessage.tsx
    /timetable
      /WeeklyTimetable.tsx
      /TimetableSlot.tsx
    /analytics
      /DashboardCharts.tsx
      /AttendanceChart.tsx
      /PerformanceChart.tsx

/lib
  /api
    /client.ts                  # Axios/Fetch wrapper
    /endpoints.ts               # API endpoint definitions
  /hooks
    /useAuth.ts
    /useUser.ts
    /useSocket.ts
    /useOfflineSync.ts
  /utils
    /formatting.ts
    /validation.ts
    /constants.ts
  /store
    /auth.store.ts
    /notification.store.ts
    /offline.store.ts

/public
  /images
  /fonts
  /icons
```

### 2.2 Routing Strategy

**Next.js App Router with Role-Based Access:**

- **Route Groups**: `(auth)`, `(dashboard)`, `(super-admin)`, etc.
- **Middleware**: Check authentication and role permissions
- **Dynamic Routes**: `[id]` for detail pages
- **Parallel Routes**: `@modal` for modal overlays
- **Intercepting Routes**: `(.)` for smooth transitions

### 2.3 State Management Architecture

**Zustand Stores:**
- `authStore` - User authentication state, token, role
- `userStore` - Current user profile data
- `notificationStore` - In-app notifications
- `offlineStore` - Pending offline actions, sync status
- `themeStore` - Theme preferences (light/dark mode)

**TanStack Query:**
- Server state for all API data
- Automatic caching and refetching
- Optimistic updates
- Infinite scrolling support

### 2.4 Navigation Structure

**Sidebar Navigation (Role-Based):**
- Collapsible sidebar for desktop
- Bottom navigation for mobile
- Quick actions floating button
- Search command palette (Cmd+K)


## 3. Design System & Component Library

### 3.1 Color Palette

**Primary Colors:**
```css
--primary-50: #EEF2FF;
--primary-100: #E0E7FF;
--primary-500: #4F46E5;  /* Main brand color */
--primary-600: #4338CA;
--primary-700: #3730A3;
--primary-900: #1E1B4B;
```

**Secondary Colors:**
```css
--secondary-50: #ECFDF5;
--secondary-500: #10B981;  /* Success, positive actions */
--secondary-600: #059669;
```

**Semantic Colors:**
```css
--success: #10B981;
--warning: #F59E0B;
--error: #EF4444;
--info: #3B82F6;
```

**Neutral Colors:**
```css
--gray-50: #F9FAFB;
--gray-100: #F3F4F6;
--gray-200: #E5E7EB;
--gray-500: #6B7280;
--gray-700: #374151;
--gray-900: #111827;
```

### 3.2 Typography

**Font Families:**
- **Primary**: Inter (sans-serif) - UI text
- **Headings**: Inter (bold/semibold)
- **Monospace**: JetBrains Mono - Code, IDs
- **Urdu/Arabic**: Noto Nastaliq Urdu

**Type Scale:**
```css
text-xs: 0.75rem (12px)     /* Helper text, labels */
text-sm: 0.875rem (14px)    /* Body text, form inputs */
text-base: 1rem (16px)      /* Default body */
text-lg: 1.125rem (18px)    /* Emphasized text */
text-xl: 1.25rem (20px)     /* Section headings */
text-2xl: 1.5rem (24px)     /* Page headings */
text-3xl: 1.875rem (30px)   /* Hero text */
text-4xl: 2.25rem (36px)    /* Large displays */
```

### 3.3 Spacing System

**Base Unit: 4px (0.25rem)**

```css
space-1: 0.25rem (4px)
space-2: 0.5rem (8px)
space-3: 0.75rem (12px)
space-4: 1rem (16px)
space-6: 1.5rem (24px)
space-8: 2rem (32px)
space-12: 3rem (48px)
space-16: 4rem (64px)
```

### 3.4 Border Radius

```css
rounded-sm: 2px      /* Subtle rounding */
rounded: 4px         /* Default cards, inputs */
rounded-md: 6px      /* Buttons */
rounded-lg: 8px      /* Modals, large cards */
rounded-xl: 12px     /* Feature cards */
rounded-2xl: 16px    /* Hero sections */
rounded-full: 9999px /* Avatars, badges */
```

### 3.5 Shadows

```css
shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05)
shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)
shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)
shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)
shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04)
```

### 3.6 Component Specifications

#### Button Component

**Variants:**
- **Primary**: Main call-to-action (blue background)
- **Secondary**: Secondary actions (gray background)
- **Outline**: Tertiary actions (border only)
- **Ghost**: Minimal emphasis (no background)
- **Destructive**: Delete/remove actions (red)
- **Link**: Text-only link style

**Sizes:**
- **xs**: 24px height, 12px text
- **sm**: 32px height, 14px text
- **md**: 40px height, 14px text (default)
- **lg**: 48px height, 16px text
- **xl**: 56px height, 18px text

**States:**
- Default
- Hover (darker shade)
- Active (pressed state)
- Disabled (50% opacity, no pointer)
- Loading (spinner icon)

**Component Props:**
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}
```

#### Input Component

**Types:**
- Text
- Email
- Password (with show/hide toggle)
- Number
- Tel (phone)
- Date
- Time
- Textarea

**States:**
- Default
- Focus (blue border)
- Error (red border + error message)
- Disabled (grayed out)
- Success (green border)

**Features:**
- Label (required/optional indicator)
- Helper text
- Error message
- Prefix/suffix icons
- Character counter (for textarea)
- Urdu/Arabic RTL support

#### Card Component

**Variants:**
- **Default**: Basic card with padding
- **Interactive**: Hover effect, clickable
- **Stats**: Highlighted metric display
- **Feature**: Icon + title + description

**Structure:**
- Header (optional)
- Body (main content)
- Footer (optional)

#### Table Component

**Features:**
- Sortable columns
- Filterable columns
- Pagination
- Row selection (checkbox)
- Expandable rows
- Loading skeleton
- Empty state
- Responsive (stacked on mobile)
- Export to CSV/Excel

#### Modal/Dialog Component

**Sizes:**
- sm (400px)
- md (600px)
- lg (800px)
- xl (1200px)
- full (fullscreen on mobile)

**Structure:**
- Header (title + close button)
- Body (scrollable content)
- Footer (actions)

#### Form Component

**Features:**
- Multi-step forms
- Auto-save drafts
- Inline validation
- Error summary
- Success feedback
- Cancel confirmation

---

## 4. Role-Based Page Structures

### 4.1 User Roles Overview

| Role | Primary Tasks | Access Level |
|------|---------------|--------------|
| **Super Admin** | Platform management, multi-school oversight | Full platform access |
| **School Admin** | School setup, user management, all operations | Full school access |
| **Principal** | Monitoring, approvals, reports | Read + approve |
| **Teacher** | Attendance, grades, teaching tasks | Class-specific write |
| **Parent** | View child data, pay fees, communicate | Read-only + payments |
| **Student** | View schedules, grades, assignments | Read-only own data |
| **Accountant** | Fee management, financial reports | Finance-focused |

### 4.2 Page Complexity Levels

| Level | Description | Example |
|-------|-------------|---------|
| **L1** | Simple view (1-2 components) | Overview dashboard |
| **L2** | Moderate (3-5 components, 1 form) | Profile page |
| **L3** | Complex (6+ components, multiple forms) | Grade entry |
| **L4** | Very complex (data tables, charts, workflows) | Reports, analytics |


## 5. Shared Components Library

### 5.1 Layout Components

#### DashboardLayout
**Purpose**: Main container for all dashboard pages

**Components:**
- `<Sidebar />` - Navigation sidebar (collapsible)
- `<Header />` - Top bar (user menu, notifications, search)
- `<Breadcrumbs />` - Current location breadcrumb trail
- `<main>` - Page content area
- `<QuickActionsButton />` - Floating action button (mobile)

**Features:**
- Responsive collapse (auto-collapse < 1024px)
- Persisted sidebar state (localStorage)
- Role-based menu items
- Active route highlighting

#### Sidebar
**Structure:**
```typescript
interface SidebarItem {
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: number;  // Notification count
  children?: SidebarItem[];  // Nested menu
  roles?: UserRole[];  // Visible to specific roles
}
```

**Sections:**
1. **Branding** - School logo + name
2. **Main Navigation** - Role-specific menu
3. **Quick Actions** - Frequently used links
4. **Footer** - Settings, help, logout

#### Header
**Left Section:**
- Menu toggle (mobile)
- Breadcrumbs

**Right Section:**
- Global search (Cmd+K)
- Notifications dropdown
- Messages icon (unread count)
- User avatar + dropdown menu

#### Breadcrumbs
**Pattern**: Home > Section > Subsection > Current Page

**Example**:
```
Dashboard > Students > Class 5-A > Edit Student
```

### 5.2 Data Display Components

#### DataTable
**Features:**
- Column sorting
- Column filtering
- Search
- Pagination (10, 25, 50, 100 per page)
- Row selection (single/multiple)
- Bulk actions toolbar
- Column visibility toggle
- Export to CSV/Excel
- Responsive (card view on mobile)

**Column Definition:**
```typescript
interface Column<T> {
  id: string;
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  filterType?: 'text' | 'select' | 'date' | 'number';
  width?: string;
  align?: 'left' | 'center' | 'right';
}
```

**Bulk Actions:**
- Select all (current page / all pages)
- Actions dropdown (Edit, Delete, Export, etc.)
- Confirmation dialogs

#### StatsCard
**Use**: Display key metrics

**Structure:**
- Icon (color-coded)
- Label
- Value (large number)
- Change indicator (↑ +5.2% vs last month)
- Trend sparkline (optional)

**Variants:**
- **Compact**: Icon + value only
- **Standard**: Icon + label + value + change
- **Detailed**: Standard + mini chart

#### ChartCard
**Use**: Visualizations wrapper

**Structure:**
- Header (title + time range selector)
- Chart area (responsive)
- Legend (if needed)
- Footer (optional summary)

**Supported Charts:**
- Line chart
- Bar chart
- Pie/Donut chart
- Area chart
- Stacked bar chart

#### EmptyState
**Use**: When no data available

**Structure:**
- Icon (illustrative)
- Heading ("No students found")
- Description (helpful hint)
- Action button ("Add Student")

### 5.3 Form Components

#### FormField
**Wrapper for form inputs with:**
- Label (with required indicator)
- Input component
- Helper text
- Error message
- Inline validation

#### FileUpload
**Features:**
- Drag & drop
- File type validation
- Size limit validation (default: 5MB)
- Preview (images, PDFs)
- Progress bar
- Multiple file support

**Accepted Types:**
- Images: .jpg, .jpeg, .png, .webp
- Documents: .pdf, .doc, .docx
- Spreadsheets: .xls, .xlsx

#### DatePicker
**Features:**
- Calendar dropdown
- Manual input support
- Date range selection
- Min/max date restrictions
- Disabled dates
- Locale support (English + Urdu date display)

#### TimePicker
**Features:**
- 12-hour / 24-hour format
- Dropdown or scroll selection
- Minute intervals (1, 5, 15, 30 min)

### 5.4 Feedback Components

#### LoadingSpinner
**Variants:**
- **Page**: Full-page overlay
- **Inline**: Within component
- **Button**: Inside button (loading state)

**Sizes:**
- xs (16px)
- sm (24px)
- md (32px)
- lg (48px)
- xl (64px)

#### Toast Notifications
**Types:**
- **Success**: ✓ Green (Operation successful)
- **Error**: ✕ Red (Operation failed)
- **Warning**: ⚠ Yellow (Caution needed)
- **Info**: ℹ Blue (General information)

**Duration:** 3-5 seconds (auto-dismiss)

**Position:** Top-right (desktop), Top-center (mobile)

#### ConfirmDialog
**Use**: Confirm destructive actions

**Structure:**
- Icon (warning triangle)
- Title ("Delete Student?")
- Description ("This action cannot be undone.")
- Actions:
  - Cancel (secondary button)
  - Confirm (destructive button)

**Variations:**
- Simple confirm/cancel
- With input field (e.g., "Type DELETE to confirm")

#### ErrorBoundary
**Features:**
- Catch React component errors
- Display friendly error message
- Error details (development only)
- "Try Again" button
- "Report Issue" link

### 5.5 Navigation Components

#### Tabs
**Variants:**
- **Line**: Underline indicator
- **Boxed**: Pill-style background
- **Segmented**: iOS-style segmented control

**Features:**
- Horizontal scroll (many tabs)
- Active state
- Disabled state
- Badge/count on tabs

#### Pagination
**Structure:**
- Previous button
- Page numbers (1, 2, 3, ..., 10)
- Next button
- Page size selector
- Total items count

**Mobile:**
- Simplified: Previous | 1 of 10 | Next

#### Dropdown Menu
**Features:**
- Nested submenus
- Icons + labels
- Keyboard navigation
- Dividers
- Checkboxes (multi-select)

### 5.6 Feedback & Validation

#### Inline Validation
- **Instant**: On blur (leaving field)
- **Async**: Username/email uniqueness check
- **Cross-field**: Password confirmation match

**Validation States:**
- Neutral (default)
- Success (green border, checkmark)
- Error (red border, error message)
- Warning (yellow border, warning message)

#### Form Summary Errors
**Display at top of form:**
- List of all validation errors
- Click to focus field
- Auto-scroll to first error


## 6. Super Admin Interface

**Role**: Platform administrator managing multiple schools

### 6.1 Pages Overview

| Page | Path | Complexity | Components |
|------|------|------------|------------|
| Dashboard | `/super-admin/overview` | L2 | 7 components |
| Schools Management | `/super-admin/schools` | L3 | 8 components |
| School Detail | `/super-admin/schools/[id]` | L3 | 9 components |
| Analytics | `/super-admin/analytics` | L4 | 12 components |
| Billing | `/super-admin/billing` | L3 | 10 components |
| Support Tickets | `/super-admin/support-tickets` | L3 | 8 components |
| System Settings | `/super-admin/settings` | L2 | 6 components |

### 6.2 Dashboard (`/super-admin/overview`)

**Purpose**: Platform-level overview and health monitoring

**Layout:**
```
+--------------------------------------------------+
|  Header (Breadcrumbs, Search, Notifications)    |
+--------------------------------------------------+
|  Stats Cards Row (4 cards)                       |
|  - Total Schools | Active Users                  |
|  - Total Students | Revenue (MRR)                |
+--------------------------------------------------+
|  Two-column Layout                               |
|                                                  |
|  Left Column (60%)       | Right Column (40%)   |
|  +----------------------+ +--------------------+ |
|  | Active Schools Chart | | Recent Activities | |
|  | (Line chart)         | | (Activity feed)   | |
|  +----------------------+ +--------------------+ |
|  | User Growth Chart    | | Support Tickets   | |
|  | (Bar chart)          | | (Ticket list)     | |
|  +----------------------+ +--------------------+ |
|  | Revenue Chart        | | Upcoming Events   | |
|  | (Area chart)         | | (Event list)      | |
|  +----------------------+ +--------------------+ |
+--------------------------------------------------+
```

**Components:**

1. **StatsCard (x4)**
   - Total Schools (count + growth %)
   - Active Users (count + growth %)
   - Total Students (count + growth %)
   - Monthly Recurring Revenue (PKR amount + growth %)

2. **ActiveSchoolsChart**
   - Type: Line chart
   - Data: Active schools over time (last 12 months)
   - Filters: Time range selector (1M, 3M, 6M, 1Y)

3. **UserGrowthChart**
   - Type: Stacked bar chart
   - Data: Users by role (Teachers, Parents, Students) per month
   - Interactive: Click bar to filter

4. **RevenueChart**
   - Type: Area chart
   - Data: MRR over time with subscription tiers breakdown
   - Tooltips: Hover for detailed breakdown

5. **RecentActivitiesPanel**
   - Feed of platform-wide activities
   - Items: School registered, Payment received, User upgraded tier
   - Actions: Click to view details
   - Load more button

6. **SupportTicketsWidget**
   - List of open tickets (high priority first)
   - Ticket card: School name, Issue title, Status badge, Time ago
   - Action: Click to view ticket details
   - "View All" button

7. **UpcomingEventsPanel**
   - List of system maintenance, feature releases
   - Event card: Title, Description, Date
   - Filter: Show past events toggle

### 6.3 Schools Management (`/super-admin/schools`)

**Purpose**: Manage all schools on the platform

**Layout:**
```
+--------------------------------------------------+
|  Page Header                                     |
|  Title: Schools Management                       |
|  Action: + Add School (button)                   |
+--------------------------------------------------+
|  Filters & Search Bar                            |
|  [ Search ] [ Status ] [ Tier ] [ City ]         |
+--------------------------------------------------+
|  Schools Data Table                              |
|  Columns:                                        |
|  - Logo | Name | Code | City | Tier |           |
|    Students | Staff | Status | Actions           |
+--------------------------------------------------+
|  Pagination                                      |
+--------------------------------------------------+
```

**Components:**

1. **PageHeader**
   - Title: "Schools Management"
   - Description: "Manage all schools on the platform"
   - Action button: "+ Add School" (opens modal)

2. **SearchBar**
   - Placeholder: "Search by school name, code, city..."
   - Debounced search (300ms)
   - Clear button

3. **FilterBar**
   - Status filter (dropdown): All, Active, Inactive, Suspended
   - Tier filter (dropdown): All, Free, Basic, Professional, Enterprise
   - City filter (multi-select): Major Pakistani cities
   - Date range: Subscription start/end

4. **SchoolsDataTable**
   - **Columns:**
     - Logo (image thumbnail)
     - Name (clickable → school detail)
     - Code (unique identifier)
     - City
     - Tier (badge with color)
     - Students (count)
     - Staff (count)
     - Status (badge: active/inactive)
     - Actions (dropdown menu)
   
   - **Actions dropdown:**
     - View Details
     - Edit School
     - Manage Users
     - View Analytics
     - Suspend School
     - Delete School (confirmation required)
   
   - **Bulk actions:**
     - Export selected
     - Change tier (multiple schools)
     - Suspend selected
   
   - **Sorting:** All columns sortable
   - **Pagination:** 25 per page (configurable)

5. **AddSchoolModal** (triggered by "+ Add School")
   - Multi-step form (3 steps)
   - **Step 1: Basic Information**
     - School name (required)
     - School code (auto-generated, editable)
     - Logo upload
     - City, district, province
     - Contact: phone, email, website
   - **Step 2: Subscription**
     - Tier selection (radio buttons)
     - Start date, end date
     - Student limit, staff limit
   - **Step 3: Admin User**
     - First name, last name
     - Email (will receive credentials)
     - Phone
   - Footer: Back, Cancel, Next/Submit

### 6.4 School Detail (`/super-admin/schools/[id]`)

**Purpose**: Comprehensive view and management of a single school

**Layout:**
```
+--------------------------------------------------+
|  School Header Card                              |
|  Logo | Name | Code | Status | Tier              |
|  Quick Actions: Edit, Suspend, View Portal       |
+--------------------------------------------------+
|  Tabs Navigation                                 |
|  [ Overview ] [ Users ] [ Analytics ]            |
|  [ Billing ] [ Settings ] [ Activity Logs ]      |
+--------------------------------------------------+
|  Tab Content Area (dynamic based on active tab)  |
+--------------------------------------------------+
```

**Tab 1: Overview**
- Stats cards: Students, Staff, Active Users, Revenue
- Subscription details card
- Recent activity timeline
- Quick links (Login as Admin, View Reports)

**Tab 2: Users**
- User data table (all school users)
- Filters: Role, status
- Actions: Add user, edit user, reset password, deactivate
- Export user list

**Tab 3: Analytics**
- User activity chart (daily/weekly/monthly)
- Feature usage breakdown
- Login patterns heatmap
- Performance metrics (page load times, API latency)

**Tab 4: Billing**
- Current plan details
- Payment history table
- Invoices (downloadable PDFs)
- Change plan button

**Tab 5: Settings**
- School branding (logo, colors)
- Limits (students, staff)
- Feature flags (enable/disable modules)
- Data retention policies
- Integrations status

**Tab 6: Activity Logs**
- Audit log table (filtered for this school)
- Columns: Timestamp, User, Action, IP, Details
- Filters: Date range, user, action type
- Export logs

**Components:** (9 total)

1. **SchoolHeaderCard**
2. **TabsNavigation**
3. **OverviewTab** (contains StatsCards, SubscriptionCard, ActivityTimeline)
4. **UsersTab** (contains UserDataTable)
5. **AnalyticsTab** (contains charts)
6. **BillingTab** (contains payment tables)
7. **SettingsTab** (contains form sections)
8. **ActivityLogsTab** (contains audit table)
9. **EditSchoolModal** (triggered from header actions)

### 6.5 Analytics (`/super-admin/analytics`)

**Purpose**: Platform-wide analytics and insights

**Layout:**
```
+--------------------------------------------------+
|  Time Range Selector (Last 7 days, 30 days, etc)|
+--------------------------------------------------+
|  Key Metrics Grid (4 columns)                    |
+--------------------------------------------------+
|  Charts Section (2 columns)                      |
|  User Engagement | Revenue Trends                |
+--------------------------------------------------+
|  Charts Section (2 columns)                      |
|  Top Schools | Feature Adoption                  |
+--------------------------------------------------+
|  Export Button (CSV, PDF)                        |
+--------------------------------------------------+
```

**Components:** (12 total)

1. **TimeRangeSelector**: Dropdown or date range picker
2. **KeyMetricsGrid**: 4 StatsCards (DAU, MAU, Churn Rate, ARPU)
3. **UserEngagementChart**: Line chart (daily active users over time)
4. **RevenueTrendsChart**: Area chart (MRR, growth rate)
5. **TopSchoolsChart**: Bar chart (top 10 schools by revenue/students)
6. **FeatureAdoptionChart**: Pie chart (most used features)
7. **ChurnAnalysisChart**: Line chart (churned schools over time)
8. **SignupConversionFunnel**: Funnel chart (signup → activation → paid)
9. **GeographicDistribution**: Map (schools by city)
10. **DeviceBreakdown**: Pie chart (desktop vs mobile vs tablet)
11. **PerformanceMetrics**: Table (API latency, uptime, error rates)
12. **ExportButton**: Export all analytics data

### 6.6 Billing (`/super-admin/billing`)

**Purpose**: Manage platform subscriptions and payments

**Layout:**
```
+--------------------------------------------------+
|  Stats Row: Total Revenue | Outstanding |        |
|             Paid This Month | Avg. Revenue      |
+--------------------------------------------------+
|  Filters: Status, Tier, Date Range               |
+--------------------------------------------------+
|  Subscriptions Data Table                        |
|  Columns: School | Plan | Amount | Status |      |
|           Next Billing | Actions                  |
+--------------------------------------------------+
```

**Components:** (10 total)

1. **RevenueStatsCards** (4 cards)
2. **FilterBar** (status, tier, date range)
3. **SubscriptionsDataTable**
   - Columns: School name, Plan tier, Amount (PKR), Status (badge), Next billing date, Actions
   - Actions: View invoice, Change plan, Cancel subscription, Process payment
4. **InvoiceModal**: Display/download invoice (triggered from actions)
5. **ChangePlanModal**: Update subscription tier
6. **ProcessPaymentModal**: Manual payment entry (for offline payments)
7. **CancelSubscriptionModal**: Cancellation flow with feedback
8. **PaymentHistoryPanel**: Recent transactions
9. **OutstandingPaymentsWidget**: List of overdue payments
10. **ExportButton**: Export billing data

### 6.7 Support Tickets (`/super-admin/support-tickets`)

**Purpose**: Manage support requests from schools

**Layout:**
```
+--------------------------------------------------+
|  Filters: Priority, Status, Assigned To          |
+--------------------------------------------------+
|  Tickets Data Table                              |
|  Columns: ID | School | Title | Priority |       |
|           Status | Assigned | Created | Actions   |
+--------------------------------------------------+
```

**Components:** (8 total)

1. **FilterBar** (priority, status, assignee)
2. **TicketsDataTable**
   - Columns: Ticket ID, School name, Title, Priority (badge), Status (badge), Assigned to, Created date, Actions
   - Actions: View ticket, Assign, Close, Escalate
   - Sorting: Priority (high first), Created date (newest first)
3. **TicketDetailModal**: Full ticket view with conversation thread
4. **AssignTicketModal**: Assign to support staff member
5. **ReplyToTicketForm**: Text editor for support response
6. **CloseTicketModal**: Closing reason + feedback request
7. **EscalateTicketModal**: Escalation reason + reassignment
8. **NewTicketButton**: Create ticket on behalf of school

### 6.8 System Settings (`/super-admin/settings`)

**Purpose**: Configure platform-wide settings

**Sections:**
- General Settings (platform name, logo, contact)
- Email Configuration (SMTP settings)
- Payment Gateway Settings (JazzCash, Stripe API keys)
- Feature Flags (enable/disable modules globally)
- Security Settings (password policies, session timeout)
- Data Retention Policies

**Components:** (6 total)

1. **SettingsForm** (multi-section form with save button)
2. **EmailConfigurationPanel**
3. **PaymentGatewayPanel**
4. **FeatureFlagsPanel**
5. **SecuritySettingsPanel**
6. **DataRetentionPanel**


## 7. School Admin Interface

**Role**: School administrator with full control over their school

### 7.1 Pages Overview

| Page | Path | Complexity | Components |
|------|------|------------|------------|
| Dashboard | `/admin/overview` | L2 | 8 components |
| Students List | `/admin/students` | L3 | 7 components |
| Student Detail | `/admin/students/[id]` | L3 | 10 components |
| Add/Edit Student | `/admin/students/new` | L3 | 6 components |
| Teachers List | `/admin/teachers` | L3 | 6 components |
| Teacher Detail | `/admin/teachers/[id]` | L2 | 8 components |
| Staff Management | `/admin/staff` | L3 | 7 components |
| Classes & Sections | `/admin/classes` | L3 | 8 components |
| Subjects | `/admin/subjects` | L2 | 5 components |
| Timetable | `/admin/timetable` | L4 | 9 components |
| Fee Structures | `/admin/fees/structures` | L3 | 7 components |
| Fee Assignments | `/admin/fees/assignments` | L3 | 6 components |
| Payments | `/admin/fees/payments` | L3 | 7 components |
| Reports | `/admin/reports` | L4 | 10 components |
| Settings | `/admin/settings` | L3 | 8 components |

### 7.2 Dashboard (`/admin/overview`)

**Purpose**: School-level overview and quick actions

**Layout:**
```
+--------------------------------------------------+
|  Welcome Message: "Good morning, [Admin Name]"   |
|  Today's Date & Quick Actions                    |
+--------------------------------------------------+
|  Stats Cards Row (5 cards)                       |
|  Total Students | Total Teachers | Classes |     |
|  Present Today | Fees Pending                    |
+--------------------------------------------------+
|  Two-column Layout                               |
|                                                  |
|  Left Column (65%)       | Right Column (35%)   |
|  +----------------------+ +--------------------+ |
|  | Attendance Chart     | | Today's Schedule  | |
|  | (Last 7 days)        | | (Upcoming events) | |
|  +----------------------+ +--------------------+ |
|  | Recent Activities    | | Quick Links       | |
|  | (Activity feed)      | | (Action buttons)  | |
|  +----------------------+ +--------------------+ |
|  | Pending Approvals    | | Announcements     | |
|  | (Leave requests,     | | (School notices)  | |
|  |  document uploads)   | |                   | |
|  +----------------------+ +--------------------+ |
+--------------------------------------------------+
```

**Components:** (8 total)

1. **WelcomeHeader**
   - Greeting based on time of day
   - Current date (in English and Urdu calendar)
   - Weather widget (optional)
   - Quick action buttons: Mark Attendance, Add Student, Send Announcement

2. **StatsCard (x5)**
   - **Total Students**: Count + link to students page
   - **Total Teachers**: Count + link to teachers page
   - **Total Classes**: Count + link to classes page
   - **Present Today**: Count + percentage (with color indicator)
   - **Fees Pending**: Amount (PKR) + count of students

3. **AttendanceOverviewChart**
   - Type: Line chart
   - Data: Attendance percentage for last 7 days
   - Interactive: Click day to see details
   - Toggle: View by grade

4. **TodaysSchedulePanel**
   - List of upcoming classes/events
   - Item: Time, Class, Teacher, Room
   - Highlight current/next event

5. **RecentActivitiesTimeline**
   - Feed of school activities
   - Items: Student enrolled, Teacher assigned, Fee paid, Attendance marked
   - Load more button
   - Filter: Activity type

6. **PendingApprovalsWidget**
   - List of items requiring approval
   - Types: Leave requests, document uploads, fee waivers
   - Item card: Type, Requester, Reason, Time ago
   - Actions: Approve, Reject (opens dialog)
   - Badge: Total pending count

7. **QuickLinksPanel**
   - Grid of commonly used actions
   - Links: Add Student, Mark Attendance, Enter Grades, Generate Report, Send Message, Add Event
   - Each link: Icon + label

8. **AnnouncementsPanel**
   - List of recent school announcements
   - Item: Title, Date, Author
   - Action: Click to view full announcement
   - "+ New Announcement" button

### 7.3 Students List (`/admin/students`)

**Purpose**: Manage all students in the school

**Layout:**
```
+--------------------------------------------------+
|  Page Header                                     |
|  Title: Students Management                      |
|  Actions: + Add Student | Import | Export        |
+--------------------------------------------------+
|  Filters & Search                                |
|  [ Search ] [ Class ] [ Section ] [ Status ]     |
|  [ Gender ] [ Transport Route ]                  |
+--------------------------------------------------+
|  Students Data Table                             |
|  Columns: Photo | ID | Name | Class | Section | |
|           Father Name | Contact | Status | Actions|
+--------------------------------------------------+
|  Pagination                                      |
+--------------------------------------------------+
```

**Components:** (7 total)

1. **PageHeader**
   - Title: "Students Management"
   - Action buttons:
     - "+ Add Student" (primary button → new student page)
     - "Import Students" (secondary button → import modal)
     - "Export" (outline button → export dropdown: CSV, Excel, PDF)

2. **SearchBar**
   - Placeholder: "Search by name, ID, father name, contact..."
   - Debounced search
   - Advanced search toggle (opens advanced filters)

3. **FilterBar**
   - Class filter (dropdown): All, Class 1, Class 2, ..., Class 10
   - Section filter (dropdown): All, A, B, C, ... (dynamic based on class)
   - Status filter (dropdown): All, Active, Inactive, Graduated, Withdrawn
   - Gender filter (dropdown): All, Male, Female
   - Transport Route filter (dropdown): All, Route 1, Route 2, ... (if transport enabled)
   - "Clear Filters" button

4. **StudentsDataTable**
   - **Columns:**
     - Photo (avatar thumbnail, click to enlarge)
     - Student ID (unique identifier)
     - Name (sortable, clickable → student detail)
     - Class (e.g., "5")
     - Section (e.g., "A")
     - Father Name
     - Contact (phone or email)
     - Status (badge: active/inactive/graduated)
     - Actions (dropdown menu)
   
   - **Actions dropdown:**
     - View Profile
     - Edit Student
     - View Attendance
     - View Grades
     - View Fee Status
     - Promote to Next Class
     - Mark as Withdrawn
     - Delete Student (confirmation required)
   
   - **Bulk actions:**
     - Select all (checkbox in header)
     - Actions: Export selected, Promote selected, Assign fee, Send message
   
   - **Features:**
     - Row selection (checkbox)
     - Sortable columns
     - Responsive (card view on mobile)
     - Loading skeleton
     - Empty state ("No students found")

5. **Pagination**
   - Current page / Total pages
   - Previous / Next buttons
   - Page size selector: 10, 25, 50, 100
   - Total students count

6. **ImportStudentsModal**
   - File upload (CSV, Excel)
   - Template download link ("Download sample file")
   - Instructions
   - File preview (first 5 rows)
   - Validation errors display
   - Submit button

7. **AdvancedFiltersModal**
   - Additional filters:
     - Date of birth range
     - Admission date range
     - Sibling in school (yes/no)
     - Fee status (paid/pending/overdue)
     - Discount applied (yes/no)
   - Apply / Reset buttons

### 7.4 Student Detail (`/admin/students/[id]`)

**Purpose**: Comprehensive view of a single student's information

**Layout:**
```
+--------------------------------------------------+
|  Student Header Card                             |
|  Photo | Name | ID | Class-Section | Status      |
|  Quick Actions: Edit, Print Profile, Send Message|
+--------------------------------------------------+
|  Tabs Navigation                                 |
|  [ Profile ] [ Attendance ] [ Grades ]           |
|  [ Fees ] [ Documents ] [ Parents ] [ Activity ] |
+--------------------------------------------------+
|  Tab Content Area                                |
+--------------------------------------------------+
```

**Tab 1: Profile**
- Personal details (name, DOB, gender, blood group, etc.)
- Contact information
- Address
- Medical information
- Emergency contacts
- Enrollment details (admission date, class history)
- Sibling information

**Tab 2: Attendance**
- Monthly calendar view (color-coded: present/absent/late/leave)
- Attendance statistics (total days, present %, absent %, late %)
- Date range selector
- Export attendance report button

**Tab 3: Grades**
- List of assessments by term
- Report cards (downloadable PDFs)
- Performance chart (grade trends over time)
- Subject-wise performance breakdown

**Tab 4: Fees**
- Fee summary card (total due, paid, balance)
- Assigned fees list (table)
- Payment history (table with receipts)
- "Record Payment" button
- "Generate Invoice" button

**Tab 5: Documents**
- Uploaded documents (birth certificate, ID card, medical certificate, etc.)
- File cards with preview
- Upload new document button
- Download / Delete actions

**Tab 6: Parents**
- Parent cards (father and mother)
- Each card: Name, Relation, Phone, Email, Occupation
- "Edit Parent Info" button
- "Add Parent" button (if guardian)

**Tab 7: Activity Log**
- Timeline of student-related activities
- Items: Enrollment, class promotion, fee payment, attendance marked, grade entered
- Filter by activity type
- Date range filter

**Components:** (10 total)

1. **StudentHeaderCard**
2. **TabsNavigation**
3. **ProfileTab** (contains multiple info sections)
4. **AttendanceTab** (calendar + stats)
5. **GradesTab** (assessments list + charts)
6. **FeesTab** (fee details + payment history)
7. **DocumentsTab** (document cards)
8. **ParentsTab** (parent cards)
9. **ActivityLogTab** (timeline)
10. **EditStudentModal** (triggered from header)

### 7.5 Add/Edit Student (`/admin/students/new` or `/admin/students/[id]/edit`)

**Purpose**: Create new or edit existing student record

**Layout:**
```
+--------------------------------------------------+
|  Page Header: Add Student / Edit Student         |
+--------------------------------------------------+
|  Multi-step Form Progress (4 steps)              |
|  [1 Personal] → [2 Academic] → [3 Parents] →     |
|  [4 Documents]                                   |
+--------------------------------------------------+
|  Form Content (current step)                     |
+--------------------------------------------------+
|  Footer: Back | Cancel | Save Draft | Next/Submit|
+--------------------------------------------------+
```

**Step 1: Personal Information**
- Student photo upload
- First name, last name (English & Urdu)
- Gender (radio buttons)
- Date of birth (date picker)
- Place of birth
- CNIC (B-Form number)
- Blood group (dropdown)
- Religion
- Address (textarea)
- City, district, province

**Step 2: Academic Information**
- Admission number (auto-generated, editable)
- Admission date
- Class (dropdown)
- Section (dropdown, based on selected class)
- Roll number
- Previous school (optional)
- Previous class
- Transport required (checkbox)
  - If yes: Route selection
- Hostel accommodation (checkbox)

**Step 3: Parent/Guardian Information**
- **Father's Information:**
  - Name (English & Urdu)
  - CNIC
  - Occupation
  - Phone (primary, secondary)
  - Email
  - Office address
- **Mother's Information:**
  - Name (English & Urdu)
  - CNIC
  - Occupation
  - Phone
  - Email
- **Guardian Information (if applicable):**
  - Same fields as father/mother
  - Relationship to student
- Primary contact person (radio buttons: Father/Mother/Guardian)

**Step 4: Documents & Finalization**
- Document uploads (drag & drop or file picker):
  - Birth certificate (required)
  - B-Form copy (required)
  - Previous school report card (optional)
  - Medical certificate (optional)
  - Photos (2 passport size) (required)
- Student status (active/inactive)
- Start date
- Notes (textarea, for admin remarks)

**Footer Actions:**
- **Back**: Previous step
- **Cancel**: Discard and return to students list (with confirmation)
- **Save Draft**: Save progress (auto-save every 30s)
- **Next**: Next step (validation required)
- **Submit**: Final step submission (validation + confirmation)

**Components:** (6 total)

1. **FormProgressStepper** (shows current step)
2. **PersonalInfoForm** (step 1 fields)
3. **AcademicInfoForm** (step 2 fields)
4. **ParentInfoForm** (step 3 fields)
5. **DocumentsForm** (step 4 file uploads)
6. **FormFooter** (navigation buttons)

**Features:**
- Auto-save drafts (every 30 seconds)
- Inline validation
- Cross-field validation (e.g., father's phone != mother's phone)
- Duplicate student check (by CNIC or name + DOB)
- Form state persistence (if user navigates away)
- Success toast on submission
- Redirect to student detail page after creation

### 7.6 Teachers List (`/admin/teachers`)

**Purpose**: Manage teaching staff

**Layout:**
```
+--------------------------------------------------+
|  Page Header                                     |
|  Title: Teachers Management                      |
|  Actions: + Add Teacher | Import | Export        |
+--------------------------------------------------+
|  Filters & Search                                |
|  [ Search ] [ Subject ] [ Class ] [ Status ]     |
+--------------------------------------------------+
|  Teachers Data Table                             |
|  Columns: Photo | ID | Name | Subjects | Classes||
|           Contact | Joined | Status | Actions     |
+--------------------------------------------------+
```

**Components:** (6 total)

1. **PageHeader**
2. **SearchBar**
3. **FilterBar** (subject, class, status)
4. **TeachersDataTable**
   - Columns: Photo, Teacher ID, Name, Subjects (tags), Classes (tags), Contact (phone/email), Joined date, Status, Actions
   - Actions: View Profile, Edit, Assign Classes, View Schedule, Deactivate
5. **AddTeacherModal** (multi-step form similar to student)
6. **ImportTeachersModal**

### 7.7 Teacher Detail (`/admin/teachers/[id]`)

**Purpose**: View and manage teacher information

**Tabs:**
- Profile (personal, contact, qualification, experience)
- Classes & Subjects (assigned classes and timetable)
- Attendance (teacher's own attendance)
- Leave History (leave requests and approvals)
- Performance (class performance metrics)
- Documents (certificates, degrees, CNIC)
- Activity Log

**Components:** (8 total)
- Similar structure to Student Detail with teacher-specific tabs

### 7.8 Staff Management (`/admin/staff`)

**Purpose**: Manage non-teaching staff (accountant, librarian, receptionist, etc.)

**Components:** (7 total)
- Similar to Teachers List but with different filters and columns
- Staff roles filter
- Department filter
- Attendance tracking
- Leave management


### 7.9 Classes & Sections (`/admin/classes`)

**Purpose**: Manage class structure and sections

**Layout:**
```
+--------------------------------------------------+
|  Page Header: Classes & Sections                 |
|  Action: + Add Class                             |
+--------------------------------------------------+
|  Class Cards Grid (responsive)                   |
|  Each card:                                      |
|  +----------------+                              |
|  | Class 1        |                              |
|  | Sections: A, B |                              |
|  | Students: 60   |                              |
|  | Teachers: 3    |                              |
|  | [Manage]       |                              |
|  +----------------+                              |
+--------------------------------------------------+
```

**Class Detail View (Modal or Side Panel):**
- Class information (name, academic year, class teacher)
- Sections list with student count
- Assigned subjects
- Assigned teachers
- Timetable preview

**Components:** (8 total)

1. **PageHeader**
2. **ClassCardGrid** (displays all classes)
3. **ClassCard** (individual class card)
4. **AddClassModal** (form to create new class)
5. **ClassDetailPanel** (side panel or modal)
6. **SectionsList** (within class detail)
7. **AddSectionModal**
8. **AssignTeacherModal**

### 7.10 Subjects (`/admin/subjects`)

**Purpose**: Manage subjects and curriculum

**Layout:**
```
+--------------------------------------------------+
|  Page Header: Subjects                           |
|  Action: + Add Subject                           |
+--------------------------------------------------+
|  Subjects Data Table                             |
|  Columns: Code | Name | Classes | Teachers |     |
|           Theory Hours | Practical Hours | Actions|
+--------------------------------------------------+
```

**Components:** (5 total)

1. **PageHeader**
2. **SubjectsDataTable**
3. **AddSubjectModal**
4. **EditSubjectModal**
5. **AssignSubjectToClassModal**

### 7.11 Timetable (`/admin/timetable`)

**Purpose**: Create and manage school timetable

**Layout:**
```
+--------------------------------------------------+
|  Timetable Header                                |
|  Select: Class [dropdown] Section [dropdown]     |
|  Actions: Generate, Import, Export, Print        |
+--------------------------------------------------+
|  Weekly Timetable Grid                           |
|         Mon    Tue    Wed    Thu    Fri          |
|  08:00  Math   Eng    Sci    Math   Eng          |
|  09:00  Eng    Math   Urdu   Sci    Math         |
|  10:00  Break  Break  Break  Break  Break        |
|  11:00  ...    ...    ...    ...    ...          |
+--------------------------------------------------+
```

**Components:** (9 total)

1. **TimetableHeader** (filters + actions)
2. **WeeklyTimetableGrid** (drag-drop enabled)
3. **TimeSlotCard** (individual slot in grid)
4. **AddSlotModal** (form to add/edit period)
5. **GenerateTimetableModal** (auto-generate based on constraints)
6. **ImportTimetableModal**
7. **ConflictWarningDialog** (show teacher/room conflicts)
8. **TimetableTemplatesModal** (save/load templates)
9. **PrintTimetableButton** (print-friendly view)

### 7.12 Fee Structures (`/admin/fees/structures`)

**Purpose**: Define fee templates

**Layout:**
```
+--------------------------------------------------+
|  Page Header: Fee Structures                     |
|  Action: + Create Structure                      |
+--------------------------------------------------+
|  Fee Structures List (Cards)                     |
|  Each card:                                      |
|  +------------------+                            |
|  | Tuition Fee      |                            |
|  | Amount: 5,000    |                            |
|  | Classes: 1-5     |                            |
|  | [Edit] [Delete]  |                            |
|  +------------------+                            |
+--------------------------------------------------+
```

**Components:** (7 total)

1. **PageHeader**
2. **FeeStructuresGrid**
3. **FeeStructureCard**
4. **CreateFeeStructureModal** (form)
5. **EditFeeStructureModal**
6. **DeleteConfirmationDialog**
7. **FeeStructureDetailPanel** (shows breakdown)

### 7.13 Fee Assignments (`/admin/fees/assignments`)

**Purpose**: Assign fees to students

**Layout:**
```
+--------------------------------------------------+
|  Assign Fees Header                              |
|  Select: Class, Section, Fee Structure           |
|  Action: Assign to Selected Students             |
+--------------------------------------------------+
|  Students Selection Table (with checkboxes)      |
+--------------------------------------------------+
```

**Components:** (6 total)

1. **AssignFeesHeader**
2. **StudentSelectionTable**
3. **FeePreviewPanel** (shows fee breakdown)
4. **BulkAssignButton**
5. **ConfirmAssignmentDialog**
6. **SuccessFeedback** (toast + summary)

### 7.14 Payments (`/admin/fees/payments`)

**Purpose**: Record and track payments

**Layout:**
```
+--------------------------------------------------+
|  Payments Header                                 |
|  Filters: Status, Date Range, Class, Payment Mode|
|  Actions: Record Payment, Export                 |
+--------------------------------------------------+
|  Payments Data Table                             |
|  Columns: Date | Student | Fee Type | Amount |   |
|           Paid | Balance | Status | Receipt       |
+--------------------------------------------------+
```

**Components:** (7 total)

1. **PageHeader**
2. **FilterBar**
3. **PaymentsDataTable**
4. **RecordPaymentModal** (form)
5. **ReceiptModal** (generate/print receipt)
6. **PaymentDetailsPanel** (side panel)
7. **ExportButton**

### 7.15 Reports (`/admin/reports`)

**Purpose**: Generate and view reports

**Layout:**
```
+--------------------------------------------------+
|  Reports Dashboard                               |
|  Sections: Attendance | Academic | Financial |   |
|            Enrollment | Custom                    |
+--------------------------------------------------+
|  Report Templates (Cards)                        |
|  Click to generate report                        |
+--------------------------------------------------+
```

**Report Types:**
- **Attendance Reports**: Daily, weekly, monthly, class-wise, student-wise
- **Academic Reports**: Grade sheets, report cards, class performance, subject-wise analysis
- **Financial Reports**: Fee collection, outstanding fees, payment history, defaulters list
- **Enrollment Reports**: New admissions, class strength, dropout analysis
- **Custom Reports**: Drag-and-drop report builder

**Components:** (10 total)

1. **ReportsDashboard**
2. **ReportCategoryTabs**
3. **ReportTemplatesGrid**
4. **ReportTemplateCard**
5. **GenerateReportModal** (filters + parameters)
6. **ReportPreview** (before download)
7. **CustomReportBuilder** (drag-drop fields)
8. **ReportScheduler** (auto-generate reports)
9. **SavedReportsPanel**
10. **ExportOptions** (PDF, Excel, CSV)

### 7.16 Settings (`/admin/settings`)

**Purpose**: School configuration and preferences

**Sections:**
- **School Profile**: Name, logo, address, contact
- **Academic Year**: Define academic year, terms, holidays
- **Grading Scale**: Configure grading system
- **Attendance Settings**: Mark attendance before time, grace period
- **Fee Settings**: Late fee rules, discount policies, payment gateways
- **Notifications**: Email/SMS preferences, templates
- **User Roles & Permissions**: Custom role creation
- **Data & Privacy**: Data retention, export data

**Components:** (8 total)

1. **SettingsSidebar** (section navigation)
2. **SchoolProfileForm**
3. **AcademicYearForm**
4. **GradingScaleForm**
5. **AttendanceSettingsForm**
6. **FeeSettingsForm**
7. **NotificationSettingsForm**
8. **RolesPermissionsPanel**


## 8. Principal Interface

**Role**: School principal with oversight and approval authority

### 8.1 Pages Overview

| Page | Path | Complexity | Components |
|------|------|------------|------------|
| Dashboard | `/principal/overview` | L2 | 8 components |
| Analytics | `/principal/analytics` | L4 | 10 components |
| Teachers | `/principal/teachers` | L2 | 5 components |
| Students | `/principal/students` | L2 | 5 components |
| Reports | `/principal/reports` | L3 | 8 components |
| Approvals | `/principal/approvals` | L3 | 7 components |
| Messages | `/principal/messages` | L2 | 5 components |

### 8.2 Dashboard (`/principal/overview`)

**Purpose**: High-level school overview for principal

**Layout:** Similar to School Admin dashboard but with focus on monitoring and approvals

**Components:** (8 total)
- Stats cards (school-wide metrics)
- Attendance trends chart
- Academic performance chart
- Teacher performance metrics
- Pending approvals widget
- Recent activities
- Upcoming events
- Quick reports

### 8.3 Analytics (`/principal/analytics`)

**Purpose**: Deep insights into school performance

**Charts:**
- Student performance trends
- Attendance analysis
- Teacher effectiveness
- Class-wise comparison
- Subject-wise performance
- Fee collection trends
- Enrollment trends
- Dropout analysis

**Components:** (10 total)
- Various chart components for each metric
- Filters (date range, class, subject)
- Export button
- Custom report builder

### 8.4 Approvals (`/principal/approvals`)

**Purpose**: Approve/reject requests

**Types of Approvals:**
- Leave requests (teachers, staff)
- Fee waivers/discounts
- Student admissions
- Budget requests
- Purchase orders
- Document uploads

**Layout:**
```
+--------------------------------------------------+
|  Approvals Header                                |
|  Tabs: All | Leave Requests | Fee Waivers |      |
|        Admissions | Others                        |
+--------------------------------------------------+
|  Approvals List (Cards)                          |
|  Each card:                                      |
|  - Request type, requester, details, date        |
|  - Actions: Approve, Reject, Request More Info   |
+--------------------------------------------------+
```

**Components:** (7 total)

1. **ApprovalsHeader**
2. **ApprovalsTabs**
3. **ApprovalsListPanel**
4. **ApprovalCard**
5. **ApprovalDetailModal** (shows full request)
6. **ApproveRejectDialog** (confirmation + reason)
7. **RequestInfoDialog** (ask for more details)

---

## 9. Teacher Interface

**Role**: Teaching staff marking attendance, entering grades, communicating

### 9.1 Pages Overview

| Page | Path | Complexity | Components |
|------|------|------------|------------|
| Dashboard | `/teacher/overview` | L1 | 6 components |
| My Classes | `/teacher/my-classes` | L2 | 5 components |
| Attendance | `/teacher/attendance` | L3 | 7 components |
| Mark Attendance (Quick) | `/teacher/attendance/quick` | L2 | 4 components |
| Grades | `/teacher/grades` | L3 | 8 components |
| Grade Entry | `/teacher/grades/enter` | L3 | 6 components |
| Assignments | `/teacher/assignments` | L3 | 7 components |
| Timetable | `/teacher/timetable` | L1 | 3 components |
| Messages | `/teacher/messages` | L2 | 5 components |
| Students | `/teacher/students` | L2 | 4 components |

### 9.2 Dashboard (`/teacher/overview`)

**Purpose**: Quick overview and today's tasks

**Layout:**
```
+--------------------------------------------------+
|  Welcome Message & Today's Date                  |
+--------------------------------------------------+
|  Today's Classes (Card)                          |
|  - Next class: Class 5-A, Math, Room 12, 10:00  |
|  - Upcoming: Class 6-B, Math, Room 15, 11:00    |
|  [Mark Attendance] button per class              |
+--------------------------------------------------+
|  Quick Stats (3 cards)                           |
|  - Classes Today | Pending Grades | Messages     |
+--------------------------------------------------+
|  Recent Activities                               |
|  - Attendance marked for 5-A                     |
|  - Grades entered for 6-B Quiz                   |
+--------------------------------------------------+
```

**Components:** (6 total)

1. **WelcomeHeader**
2. **TodaysClassesCard** (list of today's classes)
3. **QuickStatsCards** (3 cards)
4. **RecentActivitiesPanel**
5. **QuickActionsPanel** (Mark Attendance, Enter Grades, Send Message)
6. **AnnouncementsPanel**

### 9.3 My Classes (`/teacher/my-classes`)

**Purpose**: View assigned classes

**Layout:**
```
+--------------------------------------------------+
|  My Classes Header                               |
+--------------------------------------------------+
|  Class Cards Grid                                |
|  Each card:                                      |
|  +------------------+                            |
|  | Class 5-A        |                            |
|  | Math             |                            |
|  | 30 Students      |                            |
|  | Mon, Wed, Fri    |                            |
|  | [View Details]   |                            |
|  +------------------+                            |
+--------------------------------------------------+
```

**Class Detail Panel:**
- Student list
- Attendance overview
- Grade summary
- Assignments list
- Quick actions

**Components:** (5 total)

1. **PageHeader**
2. **ClassCardsGrid**
3. **ClassCard**
4. **ClassDetailPanel** (side drawer or modal)
5. **StudentListTable** (within class detail)

### 9.4 Mark Attendance (Quick) (`/teacher/attendance/quick`)

**Purpose**: Fast attendance marking interface (< 30 seconds goal)

**Layout:**
```
+--------------------------------------------------+
|  Mark Attendance - Class 5-A - Math - [Date]     |
+--------------------------------------------------+
|  Bulk Actions:                                   |
|  [Mark All Present] [Mark All Absent]            |
+--------------------------------------------------+
|  Student List (Grid of Cards - 3-4 columns)      |
|  +----------------+  +----------------+           |
|  | Photo          |  | Photo          |           |
|  | Ahmed Ali      |  | Sara Khan      |           |
|  | Roll: 5        |  | Roll: 6        |           |
|  | [P] [A] [L]    |  | [P] [A] [L]    |           |
|  +----------------+  +----------------+           |
+--------------------------------------------------+
|  Footer: [Cancel] [Save] [Save & Mark Next Class]|
+--------------------------------------------------+
```

**Key Features:**
- **Visual Design**: Large, touch-friendly buttons
- **Shortcuts**: Keyboard shortcuts (P, A, L for Present, Absent, Late)
- **Smart Defaults**: All marked present by default (change only absent/late)
- **Quick Actions**: Bulk actions for entire class
- **Auto-Save**: Save draft every 10 seconds
- **Confirmation**: "Mark all as present?" before saving
- **Performance**: Render only visible students (virtualization if 50+ students)

**Components:** (4 total)

1. **AttendanceHeader** (class info, date, bulk actions)
2. **StudentAttendanceGrid** (responsive grid)
3. **StudentAttendanceCard** (individual student)
4. **AttendanceFooter** (action buttons)

### 9.5 Grade Entry (`/teacher/grades/enter`)

**Purpose**: Enter grades for an assessment

**Layout:**
```
+--------------------------------------------------+
|  Grade Entry - Class 5-A - Mid-Term Exam - Math  |
|  Total Marks: 100 | Passing Marks: 40            |
+--------------------------------------------------+
|  Grades Entry Table                              |
|  Roll | Name          | Marks | Grade | Status   |
|  1    | Ahmed Ali     | [80]  | A     | Pass     |
|  2    | Sara Khan     | [92]  | A+    | Pass     |
|  3    | ...           | [...] | ...   | ...      |
+--------------------------------------------------+
|  Footer: [Cancel] [Save Draft] [Submit]          |
+--------------------------------------------------+
```

**Key Features:**
- **Inline Editing**: Click to edit marks
- **Auto-Grade Calculation**: Grade (A+, A, B) based on marks
- **Validation**: Marks cannot exceed total marks
- **Bulk Actions**: Copy marks down, set all to passing
- **Keyboard Navigation**: Tab/Enter to move between fields
- **Auto-Save**: Draft saved every 30 seconds
- **Absent Handling**: Mark student as "Absent" (no marks)

**Components:** (6 total)

1. **GradeEntryHeader**
2. **AssessmentInfoCard**
3. **GradeEntryTable**
4. **GradeInputCell** (editable cell)
5. **ValidationFeedback** (inline errors)
6. **GradeEntryFooter**

### 9.6 Assignments (`/teacher/assignments`)

**Purpose**: Manage homework and assignments

**Components:** (7 total)
- AssignmentsHeader
- AssignmentsTabs (Active, Past, Drafts)
- AssignmentsListPanel
- AssignmentCard
- CreateAssignmentModal
- AssignmentDetailPanel
- GradeSubmissionsModal

---

## 10. Parent Interface

**Role**: View child's data, pay fees, communicate with teachers

### 10.1 Pages Overview

| Page | Path | Complexity | Components |
|------|------|------------|------------|
| Dashboard | `/parent/overview` | L1 | 6 components |
| Children | `/parent/children` | L2 | 5 components |
| Child Profile | `/parent/children/[id]` | L2 | 7 components |
| Attendance | `/parent/attendance` | L2 | 5 components |
| Grades | `/parent/grades` | L2 | 6 components |
| Fees | `/parent/fees` | L3 | 8 components |
| Pay Fees | `/parent/fees/pay` | L3 | 6 components |
| Messages | `/parent/messages` | L2 | 5 components |
| Events | `/parent/events` | L1 | 3 components |
| Timetable | `/parent/timetable` | L1 | 3 components |

### 10.2 Dashboard (`/parent/overview`)

**Purpose**: Quick overview of all children

**Layout:**
```
+--------------------------------------------------+
|  Welcome Message: "Good morning, [Parent Name]"  |
+--------------------------------------------------+
|  Children Cards Row (if multiple children)       |
|  +----------------+  +----------------+           |
|  | Ahmed Ali      |  | Sara Khan      |           |
|  | Class 5-A      |  | Class 3-B      |           |
|  | Present Today  |  | Present Today  |           |
|  | [View Details] |  | [View Details] |           |
|  +----------------+  +----------------+           |
+--------------------------------------------------+
|  Quick Stats (3 cards)                           |
|  - Fees Pending | Upcoming Events | Messages     |
+--------------------------------------------------+
|  Recent Activities                               |
|  - Attendance marked for Ahmed                   |
|  - Grades published for Sara                     |
+--------------------------------------------------+
|  Announcements Panel                             |
+--------------------------------------------------+
```

**Components:** (6 total)

1. **WelcomeHeader**
2. **ChildrenCardsRow**
3. **ChildCard**
4. **QuickStatsCards**
5. **RecentActivitiesPanel**
6. **AnnouncementsPanel**

### 10.3 Fees (`/parent/fees`)

**Purpose**: View and manage fee payments

**Layout:**
```
+--------------------------------------------------+
|  Fees Header                                     |
|  Select: Child                                   |
+--------------------------------------------------+
|  Fee Summary Card                                |
|  - Total Due: 15,000 PKR                         |
|  - Paid: 10,000 PKR                              |
|  - Balance: 5,000 PKR                            |
|  - Next Due Date: [Date]                         |
|  [Pay Now] button                                |
+--------------------------------------------------+
|  Fee Details (Table)                             |
|  - Fee Type, Amount, Due Date, Status            |
+--------------------------------------------------+
|  Payment History (Table)                         |
|  - Date, Amount, Mode, Receipt                   |
+--------------------------------------------------+
```

**Components:** (8 total)

1. **FeesHeader**
2. **ChildSelector**
3. **FeeSummaryCard**
4. **PayNowButton** (navigates to payment page)
5. **FeeDetailsTable**
6. **PaymentHistoryTable**
7. **DownloadReceiptButton**
8. **ViewInvoiceButton**

### 10.4 Pay Fees (`/parent/fees/pay`)

**Purpose**: Online fee payment

**Layout:**
```
+--------------------------------------------------+
|  Pay Fees - [Child Name]                         |
+--------------------------------------------------+
|  Fee Summary                                     |
|  - Selected Fees: [List]                         |
|  - Total Amount: 5,000 PKR                       |
+--------------------------------------------------+
|  Payment Method Selection                        |
|  [ ] JazzCash   [ ] EasyPaisa   [ ] Bank Transfer|
|  [ ] Credit/Debit Card (Stripe)                  |
+--------------------------------------------------+
|  Payment Details Form (based on method)          |
|  - For JazzCash/EasyPaisa: Mobile number         |
|  - For Card: Card details (Stripe embedded form) |
|  - For Bank: Upload receipt                      |
+--------------------------------------------------+
|  Footer: [Cancel] [Proceed to Pay]               |
+--------------------------------------------------+
```

**Components:** (6 total)

1. **PaymentHeader**
2. **FeeSummaryCard**
3. **PaymentMethodSelector** (radio buttons)
4. **PaymentDetailsForm** (conditional based on method)
5. **StripePaymentForm** (if card selected)
6. **PaymentFooter**

---

## 11. Student Interface

**Role**: Students accessing their own data

### 11.1 Pages Overview

| Page | Path | Complexity | Components |
|------|------|------------|------------|
| Dashboard | `/student/overview` | L1 | 5 components |
| Timetable | `/student/timetable` | L1 | 3 components |
| Attendance | `/student/attendance` | L1 | 4 components |
| Grades | `/student/grades` | L2 | 5 components |
| Assignments | `/student/assignments` | L2 | 6 components |
| Messages | `/student/messages` | L2 | 5 components |
| Library | `/student/library` | L2 | 5 components |
| Profile | `/student/profile` | L1 | 4 components |

### 11.2 Dashboard (`/student/overview`)

**Purpose**: Student's personalized dashboard

**Components:** (5 total)
- WelcomeHeader
- TodaysClassesCard
- QuickStatsCards (Attendance %, Assignments Due, Messages)
- RecentActivitiesPanel
- AnnouncementsPanel

### 11.3 Assignments (`/student/assignments`)

**Purpose**: View and submit assignments

**Tabs:**
- Pending
- Submitted
- Graded

**Components:** (6 total)
- AssignmentsHeader
- AssignmentsTabs
- AssignmentsListPanel
- AssignmentCard
- AssignmentDetailModal
- SubmitAssignmentForm

---

## 12. Accountant Interface

**Role**: Manage finances, fees, and expenses

### 12.1 Pages Overview

| Page | Path | Complexity | Components |
|------|------|------------|------------|
| Dashboard | `/accountant/overview` | L2 | 7 components |
| Fees Overview | `/accountant/fees` | L3 | 8 components |
| Payments | `/accountant/payments` | L3 | 7 components |
| Reports | `/accountant/reports` | L4 | 9 components |
| Expense Management | `/accountant/expenses` | L3 | 7 components |
| Vouchers | `/accountant/vouchers` | L2 | 6 components |
| Defaulters | `/accountant/defaulters` | L2 | 5 components |

### 12.2 Dashboard (`/accountant/overview`)

**Purpose**: Financial overview

**Layout:**
```
+--------------------------------------------------+
|  Financial Dashboard                             |
+--------------------------------------------------+
|  Stats Cards (5 cards)                           |
|  - Total Receivable | Collected This Month |     |
|    Outstanding | Expenses | Net Revenue         |
+--------------------------------------------------+
|  Charts Section                                  |
|  - Fee Collection Trend (Line chart)             |
|  - Payment Methods Breakdown (Pie chart)         |
+--------------------------------------------------+
|  Recent Transactions                             |
|  - Payment received, expense recorded, etc.      |
+--------------------------------------------------+
|  Defaulters List (High Priority)                 |
+--------------------------------------------------+
```

**Components:** (7 total)

1. **FinancialHeader**
2. **FinancialStatsCards** (5 cards)
3. **FeeCollectionChart**
4. **PaymentMethodsChart**
5. **RecentTransactionsPanel**
6. **DefaultersWidget**
7. **QuickActionsPanel**

### 12.3 through 12.7

The remaining accountant pages (Fees Overview, Payments, Reports, Expense Management, Vouchers, Defaulters) follow similar patterns with data tables, forms, and specialized financial widgets.


### 12.8 Defaulters (`/accountant/defaulters`) - Continued

**Purpose**: Track students with overdue fees

**Layout:**
```
+--------------------------------------------------+
|  Defaulters Header                               |
|  Filters: Class, Days Overdue, Amount Range      |
|  Actions: Send Reminders, Export List            |
+--------------------------------------------------+
|  Defaulters Data Table                           |
|  Columns: Student | Class | Total Due |          |
|           Days Overdue | Last Payment | Actions  |
+--------------------------------------------------+
```

**Components:** (5 total)

1. **DefaultersHeader**
2. **FilterBar**
3. **DefaultersDataTable**
   - Columns: Student name (with photo), Class-Section, Total due (PKR), Days overdue (highlighted if > 30 days), Last payment date, Actions
   - Actions: Send reminder, View fee details, Record payment, Grant waiver
4. **SendReminderModal** (SMS/Email template)
5. **ExportButton**

---

## 13. Responsive Design Strategy

### 13.1 Breakpoints

EduFlow uses a mobile-first responsive design approach with the following breakpoints:

```css
/* Tailwind CSS Breakpoints */
sm: 640px   /* Small tablets, large phones */
md: 768px   /* Tablets */
lg: 1024px  /* Laptops, small desktops */
xl: 1280px  /* Desktops */
2xl: 1536px /* Large desktops */
```

### 13.2 Layout Adaptations

#### Mobile (< 768px)

**Navigation:**
- Hamburger menu (top-left)
- Bottom navigation bar (4-5 primary actions)
- Full-screen sidebar overlay when opened
- Simplified breadcrumbs (current page only)

**Data Tables:**
- Transform to card/list view
- Show essential columns only
- "View more" button for full details
- Horizontal scroll for wide tables (last resort)

**Forms:**
- Stack all inputs vertically
- Full-width inputs
- Larger touch targets (min 44px height)
- Floating labels to save space

**Modals:**
- Full-screen on mobile
- Slide up animation
- Header with back button

**Dashboard:**
- Single column layout
- Stack all cards vertically
- Collapsible sections

**Quick Attendance:**
- 2 columns of student cards
- Larger buttons (P/A/L)
- Fixed footer with save button

#### Tablet (768px - 1024px)

**Navigation:**
- Collapsible sidebar (can toggle open/closed)
- Header remains visible
- Breadcrumbs visible

**Data Tables:**
- Show more columns (5-7 columns)
- Pagination visible
- Some filters may be in dropdown

**Forms:**
- 2-column layout for related fields
- Side-by-side for short inputs (e.g., first name | last name)

**Dashboard:**
- 2-column layout for cards
- Charts at full width or half width

**Quick Attendance:**
- 3 columns of student cards

#### Desktop (> 1024px)

**Navigation:**
- Full sidebar always visible (can be collapsed)
- All menu items visible
- Breadcrumbs with full path

**Data Tables:**
- All columns visible
- Advanced filters visible
- Bulk actions toolbar

**Forms:**
- Multi-column layouts (2-3 columns)
- Inline validation messages
- Side panels for related info

**Dashboard:**
- 3-4 column grid for stats cards
- Two-column layout for main content
- All widgets visible without scrolling (above the fold)

**Quick Attendance:**
- 4-5 columns of student cards
- All students visible or minimal scrolling

### 13.3 Touch Optimization

**Minimum Touch Target Sizes:**
- Buttons: 44px × 44px (iOS guideline)
- Links: 44px × 44px
- Form inputs: 48px height
- Checkboxes/Radio: 32px × 32px (with larger hit area)

**Gestures:**
- Swipe to delete (in lists)
- Pull to refresh (on mobile lists)
- Pinch to zoom (on images, charts)
- Long press for context menu

**Feedback:**
- Visual feedback on tap (ripple effect)
- Haptic feedback for important actions (if supported)
- Loading indicators during async operations

### 13.4 Responsive Components Patterns

#### Responsive Data Table

**Desktop:** Full table with all columns
**Tablet:** Horizontal scroll or hide non-essential columns
**Mobile:** Transform to card view

```typescript
// Mobile Card View Example
<div className="md:hidden">
  {data.map(item => (
    <Card key={item.id}>
      <CardHeader>
        <Avatar src={item.photo} />
        <h3>{item.name}</h3>
      </CardHeader>
      <CardBody>
        <div>Class: {item.class}</div>
        <div>Status: <Badge>{item.status}</Badge></div>
      </CardBody>
      <CardFooter>
        <Button>View Details</Button>
      </CardFooter>
    </Card>
  ))}
</div>

{/* Desktop Table View */}
<div className="hidden md:block">
  <Table>
    {/* Full table with all columns */}
  </Table>
</div>
```

#### Responsive Navigation

**Desktop:** Sidebar + Header
**Tablet:** Collapsible sidebar + Header
**Mobile:** Hidden sidebar + Header + Bottom nav

```typescript
// Conditional rendering based on screen size
<div className="flex">
  {/* Sidebar - Desktop */}
  <Sidebar className="hidden lg:block" />
  
  {/* Sidebar - Mobile Overlay */}
  <MobileSidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />
  
  <div className="flex-1">
    <Header onMenuClick={() => setIsOpen(true)} />
    <main>{children}</main>
    
    {/* Bottom Navigation - Mobile Only */}
    <BottomNav className="lg:hidden" />
  </div>
</div>
```

### 13.5 Performance Considerations

**Image Optimization:**
- Use Next.js `<Image>` component for automatic optimization
- Lazy load images below the fold
- Use responsive images (srcset)
- WebP format with fallbacks

**Code Splitting:**
- Route-based code splitting (automatic with Next.js)
- Dynamic imports for heavy components
- Lazy load modals and side panels

**Virtual Scrolling:**
- Use `@tanstack/react-virtual` for long lists (100+ items)
- Render only visible items
- Example: Student lists, attendance grids

**Caching:**
- React Query for API response caching
- Service worker caching for offline support
- Local storage for user preferences

---

## 14. Accessibility Standards

### 14.1 WCAG 2.1 AA Compliance

EduFlow targets **WCAG 2.1 Level AA** compliance for accessibility.

#### Key Requirements:

**1. Perceivable**
- **Text Alternatives**: All images have alt text
- **Color Contrast**: Minimum 4.5:1 for normal text, 3:1 for large text
- **Adaptable Content**: Proper HTML semantics, responsive design
- **Distinguishable**: Don't rely on color alone for information

**2. Operable**
- **Keyboard Accessible**: All functionality via keyboard
- **No Keyboard Trap**: Users can navigate away using keyboard only
- **Timing Adjustable**: Users can extend time limits
- **Seizures**: No content flashing more than 3 times per second
- **Navigable**: Clear navigation, skip links, page titles, focus indicators

**3. Understandable**
- **Readable**: Clear language, avoid jargon
- **Predictable**: Consistent navigation and behavior
- **Input Assistance**: Labels, error messages, help text

**4. Robust**
- **Compatible**: Valid HTML, ARIA landmarks
- **Assistive Technology**: Works with screen readers

### 14.2 Semantic HTML

Use proper HTML5 semantic elements:

```html
<!-- Good -->
<header>
  <nav>
    <ul>
      <li><a href="/dashboard">Dashboard</a></li>
    </ul>
  </nav>
</header>

<main>
  <article>
    <h1>Page Title</h1>
    <section>
      <h2>Section Title</h2>
      <p>Content...</p>
    </section>
  </article>
</main>

<footer>
  <p>&copy; 2024 EduFlow</p>
</footer>

<!-- Bad -->
<div class="header">
  <div class="nav">
    <div class="menu-item">Dashboard</div>
  </div>
</div>
```

### 14.3 ARIA Labels and Roles

Use ARIA attributes for enhanced screen reader support:

```jsx
// Button with icon only
<button aria-label="Close modal" onClick={onClose}>
  <XIcon />
</button>

// Loading spinner
<div role="status" aria-live="polite">
  <Spinner />
  <span className="sr-only">Loading...</span>
</div>

// Form errors
<input
  type="email"
  aria-invalid={hasError}
  aria-describedby="email-error"
/>
{hasError && (
  <span id="email-error" role="alert">
    Please enter a valid email
  </span>
)}

// Navigation landmarks
<nav aria-label="Main navigation">
  {/* Navigation items */}
</nav>

<nav aria-label="Breadcrumb navigation">
  {/* Breadcrumbs */}
</nav>
```

### 14.4 Keyboard Navigation

**Tab Order:**
- Natural tab order follows visual flow
- Use `tabIndex={0}` to include in tab order
- Use `tabIndex={-1}` to exclude but allow programmatic focus
- Never use `tabIndex > 0` (disrupts natural order)

**Keyboard Shortcuts:**
- `Tab` / `Shift+Tab`: Navigate between focusable elements
- `Enter` / `Space`: Activate buttons, links
- `Escape`: Close modals, dropdowns
- `Arrow keys`: Navigate within menus, dropdowns, date pickers
- `Cmd+K` / `Ctrl+K`: Open search command palette

**Focus Management:**
- Visible focus indicators (outline or ring)
- Trap focus in modals (use `react-focus-lock`)
- Restore focus when closing modals
- Skip to main content link

```jsx
// Skip to main content
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>

<main id="main-content">
  {/* Page content */}
</main>
```

### 14.5 Color Contrast

**Minimum Contrast Ratios:**
- Normal text (< 24px): **4.5:1**
- Large text (≥ 24px or ≥ 19px bold): **3:1**
- UI components and graphics: **3:1**

**Testing Tools:**
- Chrome DevTools Lighthouse
- axe DevTools browser extension
- WAVE browser extension
- Contrast checker: [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

**Color Palette Compliance:**
```css
/* All color combinations meet WCAG AA standards */

/* Text on white background */
--text-on-white: #111827; /* 16.7:1 ratio ✓ */
--gray-on-white: #374151; /* 10.7:1 ratio ✓ */

/* Text on primary background */
--white-on-primary: #FFFFFF on #4F46E5; /* 7.3:1 ratio ✓ */

/* Status badges */
--success-text: #065F46 on #D1FAE5; /* 7.6:1 ratio ✓ */
--error-text: #991B1B on #FEE2E2; /* 6.8:1 ratio ✓ */
```

### 14.6 Screen Reader Support

**Best Practices:**

1. **Descriptive Link Text**
   ```jsx
   // Bad
   <a href="/students/123">Click here</a>
   
   // Good
   <a href="/students/123">View Ahmed Ali's profile</a>
   ```

2. **Form Labels**
   ```jsx
   // Always associate labels with inputs
   <label htmlFor="email">Email Address</label>
   <input id="email" type="email" name="email" />
   ```

3. **Live Regions for Dynamic Content**
   ```jsx
   // Announce success messages
   <div role="status" aria-live="polite" aria-atomic="true">
     {successMessage}
   </div>
   
   // Announce errors (assertive = interrupts)
   <div role="alert" aria-live="assertive">
     {errorMessage}
   </div>
   ```

4. **Visually Hidden Text**
   ```css
   /* sr-only class for screen reader only content */
   .sr-only {
     position: absolute;
     width: 1px;
     height: 1px;
     padding: 0;
     margin: -1px;
     overflow: hidden;
     clip: rect(0, 0, 0, 0);
     white-space: nowrap;
     border-width: 0;
   }
   ```

5. **Loading States**
   ```jsx
   <button disabled={isLoading} aria-busy={isLoading}>
     {isLoading ? (
       <>
         <Spinner />
         <span className="sr-only">Loading...</span>
       </>
     ) : (
       'Submit'
     )}
   </button>
   ```

### 14.7 Accessibility Testing Checklist

**Automated Testing:**
- [ ] Run Lighthouse accessibility audit (score > 90)
- [ ] Use axe DevTools for automated checks
- [ ] ESLint plugin: `eslint-plugin-jsx-a11y`

**Manual Testing:**
- [ ] Navigate entire app using only keyboard
- [ ] Test with screen reader (NVDA on Windows, VoiceOver on Mac)
- [ ] Verify focus indicators are visible
- [ ] Check color contrast with tools
- [ ] Test with browser zoom at 200%
- [ ] Test with CSS disabled
- [ ] Verify all images have alt text
- [ ] Confirm all forms have labels
- [ ] Test error messages are announced

**User Testing:**
- [ ] Test with users who use assistive technologies
- [ ] Gather feedback from users with disabilities

---

## 15. Offline-First Strategy

### 15.1 Progressive Web App (PWA)

EduFlow is built as a PWA for offline capability and app-like experience.

**PWA Features:**
- Installable on mobile and desktop
- Offline functionality for critical features
- Background sync for pending actions
- Push notifications
- App-like experience (no browser chrome)

### 15.2 Service Worker Implementation

**Using Workbox (Next.js Plugin):**

```javascript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/api\.eduflow\.pk\/api\/v1\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
        networkTimeoutSeconds: 10,
      },
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'image-cache',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
  ],
});

module.exports = withPWA({
  // Next.js config
});
```

### 15.3 Offline-Capable Features

**Priority 1 (Must work offline):**
- View previously loaded data (students, attendance, timetable)
- Mark attendance (sync when online)
- View grades (cached)
- Read messages (cached)

**Priority 2 (Degraded offline experience):**
- View reports (cached versions)
- View fee status (cached)
- Browse announcements (cached)

**Priority 3 (Requires online):**
- Submit new data (create student, enter grades) - queue for sync
- Make payments - requires online
- Real-time messaging - requires online
- Generate new reports - requires online

### 15.4 Offline Data Storage

**IndexedDB for Local Storage:**

Use `localforage` library for simplified IndexedDB access:

```typescript
import localforage from 'localforage';

// Store attendance draft
await localforage.setItem('attendance-draft-5A-2024-12-10', {
  classId: '5A',
  date: '2024-12-10',
  students: [
    { id: '1', status: 'present' },
    { id: '2', status: 'absent' },
  ],
  synced: false,
});

// Retrieve attendance draft
const draft = await localforage.getItem('attendance-draft-5A-2024-12-10');

// Queue for background sync
await localforage.setItem('sync-queue', [
  { type: 'attendance', data: draft, timestamp: Date.now() },
]);
```

**Data to Cache:**
- User profile
- Student lists (per class)
- Attendance records (last 30 days)
- Grades (last academic year)
- Timetable (current week)
- Messages (last 100)
- School settings

### 15.5 Sync Strategy

**Background Sync API:**

```typescript
// Register background sync
if ('serviceWorker' in navigator && 'sync' in registration) {
  registration.sync.register('sync-attendance');
}

// In service worker
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-attendance') {
    event.waitUntil(syncAttendance());
  }
});

async function syncAttendance() {
  const queue = await localforage.getItem('sync-queue');
  
  for (const item of queue) {
    try {
      await fetch('/api/v1/attendance/bulk', {
        method: 'POST',
        body: JSON.stringify(item.data),
      });
      
      // Mark as synced
      item.synced = true;
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }
  
  // Update queue (remove synced items)
  const remaining = queue.filter(item => !item.synced);
  await localforage.setItem('sync-queue', remaining);
}
```

**Manual Sync Trigger:**

```jsx
// Sync button in UI
<button onClick={handleManualSync} disabled={isSyncing}>
  {isSyncing ? (
    <>
      <Spinner className="mr-2" />
      Syncing...
    </>
  ) : (
    <>
      <SyncIcon className="mr-2" />
      Sync Now
    </>
  )}
</button>
```

### 15.6 Offline UI Indicators

**Network Status Indicator:**

```jsx
// Hook to detect online/offline status
import { useEffect, useState } from 'react';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  
  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
    }
    
    function handleOffline() {
      setIsOnline(false);
    }
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return isOnline;
}

// Usage in component
function OfflineIndicator() {
  const isOnline = useOnlineStatus();
  
  if (isOnline) return null;
  
  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white p-2 text-center">
      <WifiOffIcon className="inline mr-2" />
      You are offline. Changes will sync when connection is restored.
    </div>
  );
}
```

**Pending Sync Badge:**

```jsx
// Show count of pending syncs
function SyncStatusBadge() {
  const [pendingCount, setPendingCount] = useState(0);
  
  useEffect(() => {
    async function checkPending() {
      const queue = await localforage.getItem('sync-queue') || [];
      setPendingCount(queue.length);
    }
    
    checkPending();
    const interval = setInterval(checkPending, 5000); // Check every 5s
    
    return () => clearInterval(interval);
  }, []);
  
  if (pendingCount === 0) return null;
  
  return (
    <Badge variant="warning">
      {pendingCount} pending {pendingCount === 1 ? 'sync' : 'syncs'}
    </Badge>
  );
}
```

### 15.7 Offline Form Handling

**Save Draft Locally:**

```jsx
function AttendanceForm() {
  const [attendance, setAttendance] = useState([]);
  const isOnline = useOnlineStatus();
  
  // Auto-save draft every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      saveDraft(attendance);
    }, 10000);
    
    return () => clearInterval(interval);
  }, [attendance]);
  
  async function saveDraft(data) {
    await localforage.setItem('attendance-draft', data);
  }
  
  async function handleSubmit() {
    if (isOnline) {
      // Submit immediately
      await submitAttendance(attendance);
    } else {
      // Queue for sync
      const queue = await localforage.getItem('sync-queue') || [];
      queue.push({
        type: 'attendance',
        data: attendance,
        timestamp: Date.now(),
      });
      await localforage.setItem('sync-queue', queue);
      
      toast.success('Attendance saved. Will sync when online.');
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      
      <div className="flex justify-between">
        <Button type="button" onClick={() => saveDraft(attendance)}>
          Save Draft
        </Button>
        <Button type="submit">
          {isOnline ? 'Submit' : 'Save Offline'}
        </Button>
      </div>
    </form>
  );
}
```

---

## 16. Performance Optimization

### 16.1 Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| **First Contentful Paint (FCP)** | < 1.5s | Lighthouse |
| **Largest Contentful Paint (LCP)** | < 2.5s | Lighthouse |
| **Time to Interactive (TTI)** | < 3.5s | Lighthouse |
| **Total Blocking Time (TBT)** | < 300ms | Lighthouse |
| **Cumulative Layout Shift (CLS)** | < 0.1 | Lighthouse |
| **API Response Time** | < 500ms | Backend monitoring |
| **Page Load Time** | < 2s | Google Analytics |

### 16.2 Code Splitting and Lazy Loading

**Route-based Code Splitting:**

Next.js automatically code-splits by route. Each page is a separate bundle.

**Component-level Lazy Loading:**

```jsx
import dynamic from 'next/dynamic';

// Lazy load heavy components
const ChartComponent = dynamic(() => import('@/components/ChartComponent'), {
  loading: () => <Spinner />,
  ssr: false, // Disable server-side rendering for this component
});

// Lazy load modals (only when opened)
const StudentDetailModal = dynamic(() => 
  import('@/components/StudentDetailModal')
);

function StudentsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  return (
    <>
      <button onClick={() => setIsModalOpen(true)}>View Student</button>
      
      {isModalOpen && (
        <StudentDetailModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </>
  );
}
```

**Library-level Code Splitting:**

```jsx
// Import only what you need from libraries

// Bad - imports entire lodash library
import _ from 'lodash';

// Good - imports only specific function
import debounce from 'lodash/debounce';
```

### 16.3 Image Optimization

**Next.js Image Component:**

```jsx
import Image from 'next/image';

// Optimized image with automatic lazy loading
<Image
  src="/student-photo.jpg"
  alt="Student photo"
  width={200}
  height={200}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..." // Low-quality placeholder
/>

// Avatar with fallback
<Image
  src={student.avatar || '/default-avatar.png'}
  alt={student.name}
  width={48}
  height={48}
  className="rounded-full"
/>
```

**Responsive Images:**

```jsx
<Image
  src="/school-building.jpg"
  alt="School building"
  width={1200}
  height={800}
  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
/>
```

### 16.4 Data Fetching Optimization

**React Query Configuration:**

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Prefetch data on hover
function StudentCard({ studentId }) {
  const queryClient = useQueryClient();
  
  function handleMouseEnter() {
    queryClient.prefetchQuery({
      queryKey: ['student', studentId],
      queryFn: () => fetchStudent(studentId),
    });
  }
  
  return (
    <div onMouseEnter={handleMouseEnter}>
      <Link href={`/students/${studentId}`}>
        View Student
      </Link>
    </div>
  );
}
```

**Infinite Scrolling for Large Lists:**

```jsx
import { useInfiniteQuery } from '@tanstack/react-query';

function StudentsList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['students'],
    queryFn: ({ pageParam = 1 }) => fetchStudents(pageParam),
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });
  
  return (
    <>
      {data?.pages.map((page) => (
        page.students.map(student => (
          <StudentCard key={student.id} student={student} />
        ))
      ))}
      
      {hasNextPage && (
        <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? 'Loading...' : 'Load More'}
        </button>
      )}
    </>
  );
}
```

**Optimistic Updates:**

```jsx
function MarkAttendance() {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: submitAttendance,
    onMutate: async (newAttendance) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['attendance'] });
      
      // Snapshot the previous value
      const previousAttendance = queryClient.getQueryData(['attendance']);
      
      // Optimistically update to the new value
      queryClient.setQueryData(['attendance'], (old) => ({
        ...old,
        ...newAttendance,
      }));
      
      return { previousAttendance };
    },
    onError: (err, newAttendance, context) => {
      // Rollback on error
      queryClient.setQueryData(['attendance'], context.previousAttendance);
      toast.error('Failed to mark attendance');
    },
    onSettled: () => {
      // Refetch after success or error
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
  });
  
  return (
    <button onClick={() => mutation.mutate(attendanceData)}>
      Save Attendance
    </button>
  );
}
```

### 16.5 Virtual Scrolling for Large Lists

**Using @tanstack/react-virtual:**

```jsx
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

function VirtualStudentList({ students }) {
  const parentRef = useRef();
  
  const virtualizer = useVirtualizer({
    count: students.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80, // Estimated row height
    overscan: 5, // Render 5 extra items above/below viewport
  });
  
  return (
    <div
      ref={parentRef}
      style={{ height: '600px', overflow: 'auto' }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const student = students[virtualRow.index];
          
          return (
            <div
              key={student.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <StudentCard student={student} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

### 16.6 Memoization and Re-render Optimization

**React.memo for Component Memoization:**

```jsx
import { memo } from 'react';

// Memoize component to prevent unnecessary re-renders
const StudentCard = memo(function StudentCard({ student }) {
  return (
    <div>
      <h3>{student.name}</h3>
      <p>{student.class}</p>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function
  return prevProps.student.id === nextProps.student.id;
});
```

**useMemo for Expensive Calculations:**

```jsx
import { useMemo } from 'react';

function AttendanceStats({ attendance }) {
  const stats = useMemo(() => {
    const total = attendance.length;
    const present = attendance.filter(a => a.status === 'present').length;
    const absent = attendance.filter(a => a.status === 'absent').length;
    const percentage = (present / total) * 100;
    
    return { total, present, absent, percentage };
  }, [attendance]); // Recalculate only when attendance changes
  
  return (
    <div>
      <p>Present: {stats.present} ({stats.percentage.toFixed(1)}%)</p>
      <p>Absent: {stats.absent}</p>
    </div>
  );
}
```

**useCallback for Function Memoization:**

```jsx
import { useCallback } from 'react';

function StudentsList() {
  const [selectedStudents, setSelectedStudents] = useState([]);
  
  // Memoize callback to prevent child re-renders
  const handleSelect = useCallback((studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  }, []); // No dependencies, function never changes
  
  return (
    <div>
      {students.map(student => (
        <StudentCard 
          key={student.id}
          student={student}
          onSelect={handleSelect} // Same function reference
        />
      ))}
    </div>
  );
}
```

### 16.7 Bundle Size Optimization

**Analyze Bundle Size:**

```bash
# Install bundle analyzer
npm install @next/bundle-analyzer

# Add to next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // Next.js config
});

# Run analysis
ANALYZE=true npm run build
```

**Tree Shaking:**

Ensure imports are tree-shakeable:

```jsx
// Bad - imports entire library
import { Button, Card, Input, Select, ... } from 'ui-library';

// Good - imports only what's needed
import Button from 'ui-library/button';
import Card from 'ui-library/card';
```

**Dynamic Imports:**

```jsx
// Import heavy libraries only when needed
async function exportToExcel(data) {
  const XLSX = await import('xlsx');
  const workbook = XLSX.utils.book_new();
  // ... export logic
}
```

---

## 17. Internationalization (i18n)

### 17.1 Language Support

**Primary Languages:**
- **English** (default)
- **Urdu** (Pakistani national language)

**Future Expansion:**
- Regional languages (Punjabi, Sindhi, Pashto, etc.)
- Arabic (for Islamic content)

### 17.2 i18n Implementation

**Using next-intl:**

```bash
npm install next-intl
```

**Configuration:**

```typescript
// i18n.config.ts
export const locales = ['en', 'ur'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  ur: 'اردو',
};
```

**Folder Structure:**

```
/messages
  /en
    common.json
    dashboard.json
    students.json
    attendance.json
  /ur
    common.json
    dashboard.json
    students.json
    attendance.json
```

**Translation Files:**

```json
// messages/en/common.json
{
  "nav": {
    "dashboard": "Dashboard",
    "students": "Students",
    "attendance": "Attendance",
    "grades": "Grades",
    "fees": "Fees"
  },
  "actions": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "view": "View"
  },
  "status": {
    "active": "Active",
    "inactive": "Inactive",
    "present": "Present",
    "absent": "Absent"
  }
}

// messages/ur/common.json
{
  "nav": {
    "dashboard": "ڈیش بورڈ",
    "students": "طلباء",
    "attendance": "حاضری",
    "grades": "نمبرات",
    "fees": "فیس"
  },
  "actions": {
    "save": "محفوظ کریں",
    "cancel": "منسوخ کریں",
    "delete": "حذف کریں",
    "edit": "ترمیم کریں",
    "view": "دیکھیں"
  },
  "status": {
    "active": "فعال",
    "inactive": "غیر فعال",
    "present": "حاضر",
    "absent": "غیر حاضر"
  }
}
```

**Usage in Components:**

```jsx
import { useTranslations } from 'next-intl';

function Dashboard() {
  const t = useTranslations('common');
  
  return (
    <div>
      <h1>{t('nav.dashboard')}</h1>
      <button>{t('actions.save')}</button>
    </div>
  );
}
```

**Language Switcher:**

```jsx
import { useRouter } from 'next/router';
import { locales, localeNames } from '@/i18n.config';

function LanguageSwitcher() {
  const router = useRouter();
  const { locale, pathname, query, asPath } = router;
  
  function changeLocale(newLocale: string) {
    router.push({ pathname, query }, asPath, { locale: newLocale });
  }
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <GlobeIcon />
        {localeNames[locale]}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {locales.map((loc) => (
          <DropdownMenuItem 
            key={loc}
            onClick={() => changeLocale(loc)}
            className={locale === loc ? 'bg-accent' : ''}
          >
            {localeNames[loc]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

### 17.3 RTL (Right-to-Left) Support

**Urdu and Arabic are RTL languages.**

**Configuration:**

```jsx
// app/layout.tsx
import { useLocale } from 'next-intl';

export default function RootLayout({ children }) {
  const locale = useLocale();
  const isRTL = locale === 'ur' || locale === 'ar';
  
  return (
    <html lang={locale} dir={isRTL ? 'rtl' : 'ltr'}>
      <body>{children}</body>
    </html>
  );
}
```

**Tailwind CSS RTL Support:**

```bash
npm install tailwindcss-rtl
```

```javascript
// tailwind.config.js
module.exports = {
  plugins: [
    require('tailwindcss-rtl'),
  ],
};
```

**RTL-aware Classes:**

```jsx
// Use logical properties instead of physical
<div className="ms-4"> {/* margin-start (left in LTR, right in RTL) */}
<div className="me-4"> {/* margin-end (right in LTR, left in RTL) */}
<div className="ps-4"> {/* padding-start */}
<div className="pe-4"> {/* padding-end */}

// Text alignment
<p className="text-start"> {/* left in LTR, right in RTL */}

// Flex direction
<div className="flex-row-reverse"> {/* Reverse in RTL */}
```

**Icons in RTL:**

Some icons need to be flipped in RTL:

```jsx
function BackButton() {
  const isRTL = useDirection() === 'rtl';
  
  return (
    <button>
      <ChevronLeftIcon className={isRTL ? 'rotate-180' : ''} />
      Back
    </button>
  );
}
```

### 17.4 Date and Number Formatting

**Date Formatting:**

```typescript
import { format } from 'date-fns';
import { enUS, ur } from 'date-fns/locale';

function formatDate(date: Date, locale: string) {
  const localeMap = {
    en: enUS,
    ur: ur, // If available, otherwise use custom
  };
  
  return format(date, 'PPP', { locale: localeMap[locale] });
}

// Usage
<p>{formatDate(new Date(), 'en')}</p> // December 10, 2024
<p>{formatDate(new Date(), 'ur')}</p> // ۱۰ دسمبر، ۲۰۲۴
```

**Number Formatting:**

```typescript
function formatNumber(num: number, locale: string) {
  return new Intl.NumberFormat(locale).format(num);
}

// English: 1,234,567
// Urdu: ۱۲,۳۴,۵۶۷ (using Urdu numerals if preferred)
```

**Currency Formatting:**

```typescript
function formatCurrency(amount: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'PKR',
  }).format(amount);
}

// English: PKR 5,000
// Urdu: ۵,۰۰۰ روپے
```

### 17.5 Urdu Text Input

**Forms with Urdu Support:**

```jsx
function StudentForm() {
  return (
    <form>
      {/* English name */}
      <label>Name (English)</label>
      <input type="text" name="name_en" />
      
      {/* Urdu name */}
      <label>نام (اردو)</label>
      <input 
        type="text" 
        name="name_ur" 
        dir="rtl"
        lang="ur"
        className="font-urdu" // Special Urdu font
      />
      
      {/* Father's name */}
      <label>والد کا نام</label>
      <input type="text" name="father_name_ur" dir="rtl" lang="ur" />
    </form>
  );
}
```

**Urdu Font:**

```css
/* In global CSS */
@import url('https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;700&display=swap');

.font-urdu {
  font-family: 'Noto Nastaliq Urdu', serif;
}
```

---

## Appendix A: Component Props Reference

### Button Component Props

```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  children: React.ReactNode;
}
```

### Input Component Props

```typescript
interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'date' | 'time';
  label?: string;
  required?: boolean;
  placeholder?: string;
  helperText?: string;
  errorMessage?: string;
  disabled?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
}
```

### DataTable Component Props

```typescript
interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  pagination?: boolean;
  pageSize?: number;
  selectable?: boolean;
  onSelectionChange?: (selectedRows: T[]) => void;
  sortable?: boolean;
  filterable?: boolean;
  loading?: boolean;
  emptyState?: React.ReactNode;
  className?: string;
}

interface Column<T> {
  id: string;
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  filterType?: 'text' | 'select' | 'date' | 'number';
  width?: string;
  align?: 'left' | 'center' | 'right';
}
```

### Modal Component Props

```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}
```

---

## Appendix B: API Integration Examples

### Authentication

```typescript
// Login
POST /api/v1/auth/login
Request: { email: string, password: string }
Response: { 
  accessToken: string, 
  refreshToken: string, 
  user: User 
}

// Refresh Token
POST /api/v1/auth/refresh
Request: { refreshToken: string }
Response: { accessToken: string }

// Get Current User
GET /api/v1/auth/me
Headers: { Authorization: 'Bearer <token>' }
Response: { user: User }
```

### Students

```typescript
// List Students
GET /api/v1/students?class=5&section=A&page=1&limit=25
Response: { 
  students: Student[], 
  total: number, 
  page: number, 
  totalPages: number 
}

// Get Student
GET /api/v1/students/:id
Response: { student: Student }

// Create Student
POST /api/v1/students
Request: { 
  firstName: string,
  lastName: string,
  dateOfBirth: string,
  class: string,
  section: string,
  // ... other fields
}
Response: { student: Student }

// Update Student
PATCH /api/v1/students/:id
Request: { /* fields to update */ }
Response: { student: Student }
```

### Attendance

```typescript
// Mark Attendance (Bulk)
POST /api/v1/attendance/bulk
Request: {
  classId: string,
  sectionId: string,
  date: string,
  attendance: [
    { studentId: string, status: 'present' | 'absent' | 'late' | 'leave' }
  ]
}
Response: { success: boolean, marked: number }

// Get Attendance
GET /api/v1/attendance?classId=...&date=2024-12-10
Response: { 
  attendance: Attendance[], 
  stats: { total, present, absent, late, leave } 
}
```

### Grades

```typescript
// Create Assessment
POST /api/v1/assessments
Request: {
  name: string,
  type: 'quiz' | 'test' | 'exam' | 'assignment',
  classId: string,
  subjectId: string,
  totalMarks: number,
  date: string
}
Response: { assessment: Assessment }

// Enter Grades (Bulk)
POST /api/v1/grades/bulk
Request: {
  assessmentId: string,
  grades: [
    { studentId: string, marks: number }
  ]
}
Response: { success: boolean, entered: number }

// Get Report Card
GET /api/v1/students/:id/report-card?termId=...
Response: { reportCard: ReportCard }
```

### Fees

```typescript
// Assign Fees
POST /api/v1/fees/assign
Request: {
  feeStructureId: string,
  studentIds: string[],
  dueDate: string
}
Response: { success: boolean, assigned: number }

// Record Payment
POST /api/v1/fees/payment
Request: {
  feeId: string,
  studentId: string,
  amount: number,
  paymentMode: 'cash' | 'online' | 'bank_transfer',
  transactionId?: string
}
Response: { payment: Payment, receipt: Receipt }

// Get Pending Fees
GET /api/v1/fees/pending?studentId=...
Response: { fees: Fee[], totalDue: number }
```

---

## Appendix C: Useful Code Snippets

### Custom Hook: useDebounce

```typescript
import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Usage
function SearchBar() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  
  useEffect(() => {
    if (debouncedSearch) {
      // Perform search
      searchStudents(debouncedSearch);
    }
  }, [debouncedSearch]);
  
  return (
    <input 
      type="text" 
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />
  );
}
```

### Custom Hook: useLocalStorage

```typescript
import { useState, useEffect } from 'react';

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}

// Usage
function Settings() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');
  
  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      Toggle Theme
    </button>
  );
}
```

### Error Boundary Component

```tsx
import React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Log to error reporting service (e.g., Sentry)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
          <p className="text-gray-600 mb-4">
            {this.state.error?.message}
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 bg-primary text-white rounded"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Usage
<ErrorBoundary>
  <StudentsList />
</ErrorBoundary>
```

---

## Document Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Dec 10, 2024 | Frontend Team | Initial UI Technical Document created |

---

**END OF DOCUMENT**

Total Pages: ~150
Total Components Documented: 200+
Total Pages Specified: 80+

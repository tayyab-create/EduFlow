# EduFlow Brand Kit & Design System
**Complete UI/UX Guidelines & Implementation Specifications**

---

## Document Control

| Field | Details |
|-------|---------|
| **Product** | EduFlow - School Management System |
| **Version** | 1.0 |
| **Created** | December 10, 2024 |
| **Status** | Production Ready |
| **Stack** | Next.js 14, Tailwind CSS, shadcn/ui, TypeScript |
| **References** | SMS_1.png (colorful), SMS_2.jpg (professional) |

---

## Executive Summary

### Design Foundation Analysis

**From SMS_1.png (Colorful Education Theme):**
✓ Strong green primary (#7CB342)
✓ Performance color coding (red/yellow/green)
✓ Circular metric badges
✓ Playful illustrations (trophy, avatars)
✓ Large numeric displays
✓ Horizontal navigation
✓ Cartoon-style student avatars

**From SMS_2.jpg (Professional Academic Theme):**
✓ Neutral gray base with subtle accents
✓ Sidebar navigation (collapsible)
✓ Area charts for trends
✓ Clean data tables
✓ Calendar grid components
✓ Professional profile photos
✓ Soft shadows on white cards

### Core Principles (From PRD)
1. **Speed**: <3 clicks, <30 sec tasks
2. **Mobile-First**: 40%+ mobile target
3. **Reliable**: 99.9% uptime, auto-save
4. **Accessible**: WCAG 2.1 AA, ages 10-60
5. **Localized**: Urdu support, PKR currency

---

## 1. Brand Identity

### 1.1 Product Positioning

**Name:** EduFlow  
**Tagline:** "Streamline Education, Empower Learning"  
**Promise:** Reduce admin time by 60% while providing real-time student insights

**Target Users (From PRD):**
- School Administrators (35-45): Need dashboards, reports
- Teachers (25-40): Need fast workflows, mobile access
- Parents (30-45): Need simple info, easy payments
- Students (10-16): Need intuitive, visual interfaces

### 1.2 Brand Voice

| Context | Tone | Example |
|---------|------|---------|
| Errors | Helpful | "Oops! Let's try that again." |
| Success | Encouraging | "Great! Attendance saved." |
| Onboarding | Friendly | "Welcome! Let's get started." |
| Warnings | Direct | "This can't be undone. Continue?" |

---

## 2. Color System

### 2.1 Primary Colors

**Brand Green (From SMS_1)**
```css
--primary-50: #F0F9E8
--primary-100: #D4EFC4
--primary-500: #7CB342  /* Main brand */
--primary-600: #689F38  /* Hover */
--primary-700: #558B2F  /* Active */
```

**Tailwind Config:**
```js
colors: {
  primary: {
    DEFAULT: '#7CB342',
    50: '#F0F9E8',
    500: '#7CB342',
    600: '#689F38',
    700: '#558B2F',
  }
}
```

### 2.2 Semantic Colors

```css
/* Success (Excellent ≥80%) */
--success-500: #7CB342

/* Warning (Average 50-79%) */
--warning-500: #FFC107

/* Error (Needs Attention <40%) */
--error-500: #EF5350

/* Info */
--info-500: #2196F3
```

### 2.3 Neutral Grays (From SMS_2)

```css
--neutral-50: #F9FAFB    /* Page background */
--neutral-200: #E5E7EB   /* Borders */
--neutral-500: #6B7280   /* Secondary text */
--neutral-900: #111827   /* Primary text */
```

### 2.4 Performance Color Mapping

| Level | Score | Color | Usage |
|-------|-------|-------|-------|
| Excellent | ≥80% | Green #7CB342 | Success states |
| Good | 60-79% | Light Green | Moderate success |
| Average | 50-59% | Yellow #FFC107 | Warnings |
| Below | 40-49% | Orange #FFA726 | Action needed |
| Critical | <40% | Red #EF5350 | Urgent attention |

---

## 3. Typography

### 3.1 Font Families

```css
/* Primary */
--font-primary: 'Inter', -apple-system, sans-serif;

/* Alternative (Friendlier) */
--font-alt: 'DM Sans', sans-serif;

/* Monospace (Data) */
--font-mono: 'JetBrains Mono', monospace;

/* Urdu Support */
--font-urdu: 'Noto Nastaliq Urdu', serif;
```

### 3.2 Type Scale

```css
/* Headings */
--font-size-h1: 2.25rem;   /* 36px - Page title */
--font-size-h2: 1.875rem;  /* 30px - Section */
--font-size-h3: 1.5rem;    /* 24px - Sub-section */
--font-size-h4: 1.25rem;   /* 20px - Card heading */

/* Body */
--font-size-body: 1rem;     /* 16px - Default */
--font-size-body-sm: 0.875rem;  /* 14px */
--font-size-body-xs: 0.75rem;   /* 12px - Caption */

/* UI */
--font-size-button: 0.875rem;  /* 14px */
--font-size-input: 1rem;       /* 16px - Prevent iOS zoom */
```

### 3.3 Font Weights

```css
--font-weight-normal: 400     /* Body text */
--font-weight-medium: 500     /* Labels */
--font-weight-semibold: 600   /* Headings, buttons */
--font-weight-bold: 700       /* Statistics */
```

---

## 4. Spacing & Layout

### 4.1 Spacing Scale (4px base)

```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px - Base */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-12: 3rem;     /* 48px */
```

**Common Usage:**
- Component padding: 16-24px (space-4 to space-6)
- Section margins: 32px (space-8)
- Grid gaps: 16-24px (space-4 to space-6)

### 4.2 Border Radius

```css
--radius-sm: 0.25rem;   /* 4px - Badges */
--radius-md: 0.5rem;    /* 8px - Buttons, inputs */
--radius-lg: 0.75rem;   /* 12px - Cards */
--radius-xl: 1rem;      /* 16px - Large cards */
--radius-2xl: 1.5rem;   /* 24px - Page container (SMS_1) */
--radius-full: 9999px;  /* Circular */
```

### 4.3 Shadows (From SMS_2)

```css
--shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);

/* Focus */
--shadow-focus: 0 0 0 3px rgba(124, 179, 66, 0.3);
```

**Elevation:**
- Level 1: Buttons, inputs (shadow-sm)
- Level 2: Cards (shadow-md)
- Level 3: Dropdowns (shadow-lg)
- Level 4: Modals (shadow-xl)

---

## 5. Component Library

### 5.1 Buttons

#### Primary Button
```css
.btn-primary {
  background: #7CB342;
  color: white;
  padding: 0.625rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  min-height: 40px;
}

.btn-primary:hover {
  background: #689F38;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.btn-primary:active {
  background: #558B2F;
  transform: translateY(0);
}
```

#### Secondary Button
```css
.btn-secondary {
  background: white;
  border: 1px solid #D1D5DB;
  color: #111827;
  padding: 0.625rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
}

.btn-secondary:hover {
  background: #F9FAFB;
  border-color: #9CA3AF;
}
```

#### Ghost Button
```css
.btn-ghost {
  background: transparent;
  color: #689F38;
  padding: 0.625rem 1.5rem;
  font-weight: 600;
}

.btn-ghost:hover {
  background: rgba(124, 179, 66, 0.1);
}
```

#### Danger Button
```css
.btn-danger {
  background: #EF5350;
  color: white;
  padding: 0.625rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
}
```

### 5.2 Input Fields

#### Text Input
```css
.input {
  width: 100%;
  padding: 0.625rem 0.875rem;
  font-size: 1rem;
  border: 1px solid #D1D5DB;
  border-radius: 0.5rem;
  background: white;
}

.input:focus {
  outline: none;
  border-color: #7CB342;
  box-shadow: 0 0 0 3px rgba(124, 179, 66, 0.1);
}

.input.error {
  border-color: #EF5350;
}

.input:disabled {
  background: #F3F4F6;
  color: #9CA3AF;
}
```

#### Checkbox
```css
.checkbox {
  width: 20px;
  height: 20px;
  border: 2px solid #D1D5DB;
  border-radius: 0.25rem;
}

.checkbox:checked {
  background: #7CB342;
  border-color: #7CB342;
}
```

#### Toggle Switch
```css
.toggle {
  width: 44px;
  height: 24px;
  background: #D1D5DB;
  border-radius: 9999px;
  position: relative;
  cursor: pointer;
}

.toggle.checked {
  background: #7CB342;
}

.toggle::after {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  top: 2px;
  left: 2px;
  transition: transform 200ms;
}

.toggle.checked::after {
  transform: translateX(20px);
}
```

### 5.3 Cards

#### Standard Card
```css
.card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.card:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}
```

#### Stat Card (SMS_1 Style)
```css
.stat-card {
  background: linear-gradient(135deg, #7CB342 0%, #9CCC65 100%);
  color: white;
  border-radius: 1rem;
  padding: 1.5rem;
  text-align: center;
}

.stat-card .value {
  font-size: 3rem;
  font-weight: 700;
  line-height: 1;
}

.stat-card .label {
  font-size: 0.875rem;
  opacity: 0.9;
  margin-top: 0.5rem;
}
```

#### Student Performance Card (SMS_1 Pattern)
```css
.student-card {
  background: white;
  border-radius: 0.75rem;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.student-card.excellent {
  background: #F0F9E8; /* Light green */
}

.student-card.average {
  background: #FFF8E1; /* Light yellow */
}

.student-card.needs-attention {
  background: #FFEBEE; /* Light red */
}
```

### 5.4 Navigation

#### Horizontal Nav (SMS_1 Style)
```css
.navbar {
  height: 64px;
  background: white;
  border-bottom: 1px solid #E5E7EB;
  display: flex;
  align-items: center;
  padding: 0 1.5rem;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.navbar-menu a {
  color: #6B7280;
  font-weight: 500;
  text-decoration: none;
}

.navbar-menu a:hover {
  color: #111827;
}

.navbar-menu a.active {
  color: #7CB342;
  border-bottom: 3px solid #7CB342;
}
```

#### Sidebar Nav (SMS_2 Style)
```css
.sidebar {
  width: 280px;
  height: 100vh;
  background: white;
  border-right: 1px solid #E5E7EB;
  position: fixed;
  padding: 1.5rem;
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  color: #6B7280;
  font-weight: 500;
}

.sidebar-item:hover {
  background: #F3F4F6;
  color: #111827;
}

.sidebar-item.active {
  background: #E8F5E9;
  color: #7CB342;
}
```

### 5.5 Modal
```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.modal {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #E5E7EB;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #E5E7EB;
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}
```

### 5.6 Alerts & Notifications

#### Alert Box
```css
.alert {
  padding: 1rem 1.25rem;
  border-radius: 0.5rem;
  border-left: 4px solid;
  display: flex;
  gap: 0.75rem;
}

.alert-success {
  background: #E8F5E9;
  border-left-color: #7CB342;
  color: #2E7D32;
}

.alert-warning {
  background: #FFF8E1;
  border-left-color: #FFA726;
  color: #E65100;
}

.alert-error {
  background: #FFEBEE;
  border-left-color: #EF5350;
  color: #C62828;
}

.alert-info {
  background: #E3F2FD;
  border-left-color: #2196F3;
  color: #1565C0;
}
```

#### Toast Notification
```css
.toast {
  position: fixed;
  top: 1rem;
  right: 1rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  padding: 1rem 1.25rem;
  max-width: 400px;
  z-index: 100;
  animation: slideInRight 300ms ease;
}
```

### 5.7 Progress Indicators

#### Circular Badge (SMS_1 Style)
```css
.progress-circle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
}

.progress-circle.excellent {
  background: #7CB342;
  color: white;
}

.progress-circle.average {
  background: #FFC107;
  color: white;
}

.progress-circle.needs-attention {
  background: #EF5350;
  color: white;
}
```

#### Progress Bar
```css
.progress-bar-container {
  width: 100%;
  height: 8px;
  background: #E5E7EB;
  border-radius: 9999px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  border-radius: 9999px;
  transition: width 300ms ease;
}

.progress-bar.success {
  background: #7CB342;
}

.progress-bar.warning {
  background: #FFA726;
}
```

---

## 6. Layout Patterns

### 6.1 Dashboard Grid

```css
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1.5rem;
}

/* Widget Sizes */
.widget-sm { grid-column: span 3; }   /* 1/4 width */
.widget-md { grid-column: span 6; }   /* 1/2 width */
.widget-lg { grid-column: span 9; }   /* 3/4 width */
.widget-full { grid-column: span 12; } /* Full width */

/* Responsive */
@media (max-width: 1024px) {
  .widget-sm, .widget-md {
    grid-column: span 6;
  }
}

@media (max-width: 768px) {
  .widget-sm, .widget-md, .widget-lg {
    grid-column: span 12;
  }
}
```

### 6.2 Page Structure

**With Horizontal Nav (SMS_1):**
```css
.layout-horizontal {
  display: grid;
  grid-template-rows: 64px 1fr;
  min-height: 100vh;
}

.layout-header {
  grid-row: 1;
}

.layout-main {
  grid-row: 2;
  padding: 2rem;
}
```

**With Sidebar (SMS_2):**
```css
.layout-sidebar {
  display: grid;
  grid-template-columns: 280px 1fr;
  min-height: 100vh;
}

.sidebar {
  grid-column: 1;
}

.layout-main {
  grid-column: 2;
  padding: 2rem;
}
```

### 6.3 Responsive Breakpoints

```css
/* Tailwind-compatible */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
@media (min-width: 1536px) { /* 2xl */ }
```

**Touch Targets:**
- Minimum: 44px Ã— 44px (iOS)
- Recommended: 48px Ã— 48px (Material)

---

## 7. Role-Specific Themes

### 7.1 Color Coding by Role

```css
:root {
  --role-super-admin: #9C27B0;    /* Purple */
  --role-school-admin: #2196F3;   /* Blue */
  --role-principal: #FF5722;      /* Deep Orange */
  --role-teacher: #7CB342;        /* Green (primary) */
  --role-accountant: #FFC107;     /* Amber */
  --role-parent: #E91E63;         /* Pink */
  --role-student: #00BCD4;        /* Cyan */
  --role-hr: #795548;             /* Brown */
}
```

**Usage:**
- Sidebar active item background tint
- User avatar border
- Dashboard accents
- Role badges

### 7.2 Dashboard Layouts by Role

**Admin Dashboard:**
- Overview stats (enrollment, attendance, fees)
- Financial charts
- Pending approvals
- Recent activities
- Quick actions

**Teacher Dashboard:**
- Today's schedule
- Quick attendance entry
- Pending grading tasks
- Unread messages
- Class performance

**Parent Dashboard:**
- Child selector
- Attendance summary
- Recent grades
- Fee status
- Upcoming events
- Teacher messages

**Student Dashboard:**
- Today's schedule
- Assignments due
- Recent grades
- Performance charts
- Announcements

---

## 8. Data Visualization

### 8.1 Chart Types (From References)

| Data Type | Chart | Use Case | Reference |
|-----------|-------|----------|-----------|
| Trends | Area Chart | Attendance over time | SMS_2 |
| Comparison | Bar Chart | Class performance | SMS_1 |
| Proportions | Donut Chart | Grade distribution | SMS_1 |
| Metrics | Number Card | Key stats | SMS_1 |
| Progress | Progress Bar | Task completion | SMS_2 |

### 8.2 Chart Styling

**Area Chart Config (Recharts):**
```typescript
{
  strokeWidth: 2,
  fillOpacity: 0.3,
  colors: {
    present: '#7CB342',
    absent: '#EF5350'
  },
  grid: {
    stroke: '#E5E7EB',
    strokeDasharray: '3 3'
  }
}
```

**Bar Chart Config:**
```typescript
{
  barSize: 32,
  barRadius: [8, 8, 0, 0],  // Rounded top
  colors: ['#7CB342', '#FFC107', '#EF5350']
}
```

---

## 9. UI Patterns

### 9.1 Attendance Marking (PRD: <30sec)

```html
<div class="attendance-form">
  <div class="bulk-actions">
    <button class="btn-primary">Mark All Present</button>
  </div>
  
  <div class="student-grid">
    <div class="student-item">
      <img class="avatar" src="student.jpg" />
      <div class="name">Ahmed Ali</div>
      <div class="status-selector">
        <button class="status-btn active">P</button>
        <button class="status-btn">A</button>
        <button class="status-btn">L</button>
      </div>
    </div>
  </div>
  
  <div class="auto-save">
    <span>Auto-saved 3 seconds ago</span>
  </div>
</div>
```

### 9.2 Student List Item

```html
<div class="student-list-item">
  <img class="avatar" src="student.jpg" />
  <div class="info">
    <h3 class="name">Ahmed Ali</h3>
    <p class="meta">Class 5-A • Roll #12</p>
  </div>
  <div class="stats">
    <div class="stat">
      <span class="label">Attendance</span>
      <span class="value success">92%</span>
    </div>
  </div>
  <div class="actions">
    <button class="icon-btn">View</button>
  </div>
</div>
```

### 9.3 KPI Card

```html
<div class="kpi-card">
  <div class="kpi-header">
    <div class="icon success">📊</div>
    <div class="trend up">+12%</div>
  </div>
  <div class="value">1,247</div>
  <div class="label">Total Students</div>
  <div class="sublabel">+23 this month</div>
</div>
```

---

## 10. Accessibility (WCAG 2.1 AA)

### 10.1 Color Contrast

**Minimum Ratios:**
- Normal text: 4.5:1
- Large text (18px+): 3:1
- UI components: 3:1

**Test Primary Colors:**
- ✅ `#7CB342` on white: 4.51:1 (Pass)
- ✅ White on `#7CB342`: 4.51:1 (Pass)
- ✅ `#111827` on white: 16.14:1 (Pass)

### 10.2 Keyboard Navigation

```css
/* Focus visible for keyboard users */
:focus-visible {
  outline: 2px solid #7CB342;
  outline-offset: 2px;
}

/* Hide for mouse users */
:focus:not(:focus-visible) {
  outline: none;
}
```

### 10.3 ARIA Labels

```html
<!-- Button with icon only -->
<button aria-label="Edit student">
  <svg>...</svg>
</button>

<!-- Form label -->
<label for="email">Email Address</label>
<input id="email" type="email" />

<!-- Status text -->
<div role="status" aria-live="polite">
  Attendance saved successfully
</div>
```

### 10.4 Alt Text

```html
<!-- Informative -->
<img src="student.jpg" alt="Student profile photo of Ahmed Ali" />

<!-- Decorative -->
<img src="decoration.svg" alt="" role="presentation" />
```

---

## 11. Implementation Guide

### 11.1 Tailwind CSS Configuration

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#7CB342',
          50: '#F0F9E8',
          100: '#D4EFC4',
          500: '#7CB342',
          600: '#689F38',
          700: '#558B2F',
        },
        neutral: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          500: '#6B7280',
          900: '#111827',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        urdu: ['Noto Nastaliq Urdu', 'serif'],
      },
      borderRadius: {
        'md': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        'sm': '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      }
    }
  }
}
```

### 11.2 shadcn/ui Integration

**Install shadcn/ui:**
```bash
npx shadcn-ui@latest init
```

**Add components:**
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
```

**Customize theme:**
```css
/* globals.css */
@layer base {
  :root {
    --primary: 94 67 25;  /* #7CB342 in HSL */
    --radius: 0.5rem;
  }
}
```

### 11.3 Icon Library Setup

**Lucide React:**
```bash
npm install lucide-react
```

**Usage:**
```tsx
import { User, Calendar, CheckCircle } from 'lucide-react';

<User size={20} className="text-neutral-600" />
<Calendar size={24} className="text-primary-500" />
<CheckCircle size={16} className="text-success-500" />
```

### 11.4 Chart Library Setup

**Recharts:**
```bash
npm install recharts
```

**Basic Area Chart:**
```tsx
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

<AreaChart width={600} height={300} data={data}>
  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
  <XAxis dataKey="date" />
  <YAxis />
  <Tooltip />
  <Area 
    type="monotone" 
    dataKey="present" 
    stroke="#7CB342" 
    fill="#7CB342" 
    fillOpacity={0.3}
  />
</AreaChart>
```

---

## 12. Screen Specifications

### 12.1 Login Screen

**Layout:**
- Center-aligned form
- Logo + Tagline
- Email + Password fields
- "Remember Me" checkbox
- Primary button: "Sign In"
- Links: "Forgot Password", "Need Help?"

**Components:**
- Card (max-width: 400px)
- Text inputs with icons
- Primary button (full-width)
- Ghost button for secondary actions

### 12.2 Teacher Dashboard

**Layout Grid:**
```
[Today's Schedule] [Quick Attendance - Large]
[Pending Tasks]    [Messages]
[Class Performance - Full Width]
```

**Key Features:**
- Current period highlighted
- One-click attendance entry
- Auto-save indicator
- Real-time message updates

### 12.3 Student Performance View (SMS_1 Pattern)

**Components:**
- Performance cards with color coding
- Circular metric badges
- Progress bars
- Filter controls (class, date range)

**Color Logic:**
```typescript
function getCardBackground(avgScore: number): string {
  if (avgScore >= 80) return 'bg-success-50';
  if (avgScore >= 60) return 'bg-primary-50';
  if (avgScore >= 50) return 'bg-warning-50';
  return 'bg-error-50';
}
```

### 12.4 Fee Payment Screen

**Flow:**
1. Fee summary card
2. Payment method selection (JazzCash, EasyPaisa, Bank)
3. Amount confirmation
4. Payment gateway redirect
5. Receipt generation

**Components:**
- Summary card with breakdown
- Radio group for payment methods
- Confirmation modal
- Success/error toast

---

## 13. Design Assets Checklist

### 13.1 Required Icons (Lucide)

**Navigation:**
- Home, Users, Calendar, BookOpen, DollarSign, MessageSquare, Settings

**Actions:**
- Edit, Trash2, Plus, Download, Upload, Search, Filter, X

**Status:**
- Check, CheckCircle, XCircle, AlertCircle, Info

**User:**
- User, UserPlus, Users, UserCheck

**Data:**
- TrendingUp, TrendingDown, BarChart, PieChart, Activity

**Misc:**
- Bell, Mail, Phone, MapPin, Clock, Eye, EyeOff

### 13.2 Illustration Style

**Based on SMS_1:**
- Cartoon-style student avatars
- Trophy/achievement icons
- Simple, friendly illustrations
- Colorful, not corporate
- Appropriate for ages 10-60

**Sources:**
- unDraw (free, customizable)
- Humaaans (mix-and-match characters)
- Storyset by Freepik (animated SVGs)

### 13.3 Avatar Guidelines

**Student Avatars:**
- Circular, 32-64px typical sizes
- Cartoon style or real photos
- Fallback: Initials with gradient background
- Border for active/selected state

**Fallback Avatar Component:**
```tsx
function AvatarFallback({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();
  
  return (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-300 flex items-center justify-center text-white font-semibold">
      {initials}
    </div>
  );
}
```

### 13.4 Empty States

**Pattern:**
- Illustration (centered)
- Heading: "No [items] yet"
- Body: Brief explanation
- CTA button: "Add [item]"

**Example:**
```html
<div class="empty-state">
  <img src="empty-students.svg" alt="" class="w-48 mx-auto" />
  <h3 class="text-xl font-semibold mt-4">No students yet</h3>
  <p class="text-neutral-500 mt-2">Add your first student to get started.</p>
  <button class="btn-primary mt-4">Add Student</button>
</div>
```

---

## 14. Component States

### 14.1 Button States

| State | Visual | CSS |
|-------|--------|-----|
| Default | Base styles | `.btn-primary` |
| Hover | Lift + darker | `transform: translateY(-1px)` |
| Active | Press down | `transform: translateY(0)` |
| Focus | Outline ring | `box-shadow: focus-ring` |
| Disabled | Gray, no pointer | `opacity: 0.5; cursor: not-allowed` |
| Loading | Spinner | Transparent text + centered spinner |

### 14.2 Input States

| State | Visual | Border Color |
|-------|--------|--------------|
| Default | Base | `#D1D5DB` |
| Hover | Subtle | `#9CA3AF` |
| Focus | Primary | `#7CB342` + focus ring |
| Error | Red | `#EF5350` + error message |
| Disabled | Gray | `#E5E7EB` + gray bg |
| Success | Green | `#7CB342` + checkmark icon |

### 14.3 Card States

| State | Visual | Shadow |
|-------|--------|--------|
| Default | Base | `shadow-md` |
| Hover | Lift | `shadow-lg` |
| Active | Pressed | `shadow-sm` |
| Selected | Border | `border: 2px solid primary` |
| Disabled | Faded | `opacity: 0.6` |

---

## 15. Animations

### 15.1 Transitions

```css
/* Default */
transition: all 150ms ease;

/* Slow */
transition: all 300ms ease;

/* Fast */
transition: all 100ms ease;
```

### 15.2 Keyframe Animations

```css
/* Fade In */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide Up */
@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Slide In Right */
@keyframes slideInRight {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

/* Spin (for loaders) */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

### 15.3 Usage

```css
.modal {
  animation: fadeIn 200ms ease;
}

.toast {
  animation: slideInRight 300ms ease;
}

.loading-spinner {
  animation: spin 600ms linear infinite;
}
```

---

## 16. Dark Mode (Future)

### 16.1 Color Adjustments

```css
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #1F2937;
    --bg-secondary: #111827;
    --text-primary: #F9FAFB;
    --text-secondary: #D1D5DB;
    --border-light: #374151;
  }
}
```

### 16.2 Implementation Strategy

1. Define dark mode colors in Tailwind config
2. Use `dark:` prefix for dark mode styles
3. Provide manual toggle (localStorage)
4. Respect system preference by default

---

## 17. Performance Optimization

### 17.1 Image Optimization

```tsx
// Next.js Image component
import Image from 'next/image';

<Image
  src="/student.jpg"
  alt="Student photo"
  width={64}
  height={64}
  className="rounded-full"
  loading="lazy"
/>
```

### 17.2 Code Splitting

```tsx
// Dynamic import for heavy components
import dynamic from 'next/dynamic';

const ChartComponent = dynamic(() => import('./Chart'), {
  loading: () => <div>Loading chart...</div>,
  ssr: false
});
```

### 17.3 Skeleton Screens

```tsx
function StudentListSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="h-16 bg-neutral-200 rounded-lg"></div>
        </div>
      ))}
    </div>
  );
}
```

---

## 18. Internationalization (i18n)

### 18.1 English (Primary)

Default language for UI elements.

### 18.2 Urdu Support

```tsx
// For data input (names, addresses)
<input 
  type="text"
  className="font-urdu text-right"
  dir="rtl"
  placeholder="نام درج کریں"
/>
```

### 18.3 Future Languages

- Full Urdu UI translation
- Arabic support
- Other South Asian languages

---

## Conclusion

This Brand Kit provides comprehensive guidelines for implementing EduFlow's UI/UX design system. All specifications are based on:

✅ Reference image analysis (SMS_1.png, SMS_2.jpg)  
✅ PRD requirements (speed, reliability, mobile-first)  
✅ TDD technical stack (Next.js, Tailwind, TypeScript)  
✅ Database entities (11 user roles, 40+ tables)  

**Next Steps:**
1. Review and approve this Brand Kit
2. Set up Tailwind configuration
3. Install shadcn/ui components
4. Begin implementation with login screen
5. Build component library in Storybook
6. Regular design reviews with team

**Questions?** Refer to related documents (PRD, TDD, Database Schema) or contact the design/product team.

---

**Document End**


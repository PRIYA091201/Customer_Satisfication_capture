# Customer Feedback Application Specification

## 1. Project Overview
A full-stack web application that enables customers to submit star ratings and text reviews, and allows admins and managers to analyze that feedback through a secure, login-protected dashboard with charts, filters, and export capabilities.

## 2. Value Statements (Given / When / Then)

### Customer-facing

**Scenario: Submitting Feedback**
- **Given** a customer scans the feedback QR code
- **When** the customer submits a completed form
- **Then** their emoji are saved instantly to the database

**Scenario: Successful Submission Confirmation**
- **Given** a customer is filling out the feedback form
- **When** a customer fills in all required fields and submits
- **Then** they see a thank-you confirmation so they know it was received

**Scenario: Form Validation**
- **Given** a customer is filling out the feedback form
- **When** a customer leaves a field blank and attempts to submit
- **Then** they see a clear validation error before the form is submitted

**Scenario: Categorized Feedback**
- **Given** a customer is submitting feedback
- **When** a customer selects a category for their feedback
- **Then** admins can later filter and analyze feedback by that category

### Supervisor (Dashboard)

**Scenario: Dashboard Overview**
- **Given** a supervisor has valid credentials
- **When** a supervisor logs into the dashboard
- **Then** they immediately see total feedback count, average rating, and trends

**Scenario: Rating Analytics**
- **Given** an admin is viewing the dashboard
- **When** an admin views the rating bar chart
- **Then** they understand how many customers gave sad, happy, neutral at a glance

**Scenario: Category Analytics**
- **Given** an admin is viewing the dashboard
- **When** an admin views the pie chart
- **Then** they understand which category gets the most feedback

**Scenario: Filtering by Rating**
- **Given** an admin is viewing the feedback table
- **When** an admin filters by emoji (sad, happy, neutral) rating
- **Then** they can isolate unhappy customers (using sad emoji) and respond proactively

**Scenario: Filtering by Date**
- **Given** an admin is viewing the feedback table
- **When** an admin filters by date range
- **Then** they can measure feedback from a specific campaign or time period

**Scenario: Unauthorized Access**
- **Given** a user is not logged in
- **When** a user tries to access the dashboard without login
- **Then** they are redirected to the login page automatically

**Scenario: Role-Based Access Control**
- **Given** a logged-in user with a manager role
- **When** a manager tries to access User Management
- **Then** they see an "Access Denied" message — that page is Admin only

## 3. Functional Requirements

### 3.1 Feedback Submission (Public)
- **FR-01**: The system shall provide a public feedback form using a QR.
- **FR-02**: The form shall collect: emoji (sad, happy, neutral), gender, age group, and review message like anonymous feedback.
- **FR-03**: The system shall validate all fields before submission (no blank fields, valid email format).
- **FR-04**: On successful submission, the system shall show a thank-you confirmation message.
- **FR-05**: Submitted feedback shall be stored immediately in the database with a timestamp.
- **FR-06**: The form shall prevent duplicate rapid submissions (disable submit button after click) and also include geofencing, allowing a re-submission only after 2 hours.

### 3.2 Authentication
- **FR-07**: The system shall provide a login page with email and password fields.
- **FR-08**: Only pre-created accounts (no self-registration) can log in.
- **FR-09**: On successful login, the user shall be redirected to the dashboard.
- **FR-10**: On failed login, the system shall display a clear error message.
- **FR-11**: The system shall maintain the session across page refreshes.
- **FR-12**: Users shall be able to log out from any dashboard page.
- **FR-13**: Unauthenticated users who visit a protected route shall be redirected to `/login`.

### 3.3 Dashboard — Summary Stats
- **FR-14**: The dashboard shall display total number of feedback entries received.
- **FR-15**: The dashboard shall display the average emoji (sad, happy, neutral) across all feedback.
- **FR-16**: The dashboard shall display count of feedback received in the current week.
- **FR-17**: The dashboard shall display count of feedback received in the current month.

### 3.4 Dashboard — Feedback Table
- **FR-22**: The table shall display columns: Date, Section, Branch, Product, Rating (sad, happy, neutral), Review (truncated), Actions, Age Group, Gender.
- **FR-23**: The table shall support free-text search across name, email, and review fields.
- **FR-25**: The table shall support filtering by category (Product, Branch, Rating, Section, Date).
- **FR-26**: The table shall support filtering by date range (from date — to date).
- **FR-27**: The table shall be sortable by date (default: newest first).
- **FR-28**: The table shall paginate results at 20 rows per page.
- **FR-29**: Clicking a row shall navigate to a full feedback detail page.

### 3.5 CSV Export
- **FR-38**: Supervisors shall be able to export feedback data as a CSV file.
- **FR-39**: The export shall respect active filters (date range, category, rating).
- **FR-40**: The CSV shall include all columns: id, date, name, email, rating, branch, message, section.

## 4. Non-Functional Requirements

### 4.1 Performance
- **NFR-01**: The feedback submission form shall load in under 2 seconds on a standard connection.
- **NFR-03**: Table search and filter operations shall return results within 1 second.
- **NFR-04**: The database shall be indexed on `created_at`, `rating`, and `category` columns for fast queries.

### 4.2 Security
- **NFR-05**: All dashboard routes shall be protected — unauthenticated requests return 401.
- **NFR-06**: Row Level Security (RLS) shall be enabled on all Supabase tables.
- **NFR-07**: The Supabase service key shall never be exposed to the frontend.
- **NFR-08**: Environment variables (Supabase URL, keys) shall never be committed to GitHub.
- **NFR-09**: Passwords shall be handled entirely by Supabase Auth (never stored manually).

### 4.3 Usability
- **NFR-11**: The dashboard shall be fully usable on desktop (1280px+) and tablet (768px+) screens.
- **NFR-12**: All forms shall show inline validation messages — not just browser alerts.
- **NFR-13**: Loading states shall use skeleton loaders so the page does not feel broken.
- **NFR-14**: Empty states shall show a friendly message with a helpful suggestion.
- **NFR-15**: All destructive actions (delete) shall require a confirmation dialog before executing.
- **NFR-16**: Toast notifications shall confirm every user action (saved, deleted, exported, etc.).

### 4.4 Reliability
- **NFR-17**: The application shall handle Supabase connection errors gracefully with a user-facing message.
- **NFR-18**: Form submissions shall not be lost if the network is slow — show a loading spinner on submit.
- **NFR-19**: If the session expires, the user shall be redirected to login with a session-expired message.

### 4.5 Maintainability
- **NFR-20**: All components shall be written in TypeScript with proper type definitions (no `any`).
- **NFR-21**: Supabase queries shall be centralized in a `/lib/supabase.ts` file — not scattered across components.
- **NFR-22**: Environment variables shall be accessed through a single `/config/env.ts` file.
- **NFR-23**: Each page shall be its own component file under `/pages/`.
- **NFR-24**: Reusable UI elements (Button, Input, Table, Badge) shall live under `/components/ui/`.

### 4.6 Scalability
- **NFR-25**: The database shall support up to 100,000 feedback records without degrading query performance.
- **NFR-26**: Pagination (20 rows/page) shall use database-level LIMIT/OFFSET, not in-memory filtering.

## 5. Tech Stack

### 5.1 Frontend
| Technology | Version | Purpose | Why this choice |
| :--- | :--- | :--- | :--- |
| React | 18+ | UI component framework | Industry standard, large ecosystem |
| TypeScript | 5+ | Type-safe JavaScript | Catches bugs early, better code completion in VS Code |
| Tailwind CSS | 3+ | Utility-first styling | Fast styling without writing custom CSS files |
| Recharts | 2+ | Charts (bar, line, pie) | React-native, simple API, responsive by default |
| React Router | 6+ | Client-side page routing | Handles `/dashboard`, `/login` etc. without page reload |
| Supabase JS | 2+ | Frontend SDK for Supabase | Official client, handles auth + database queries |

### 5.2 Backend
| Technology | Purpose |
| :--- | :--- |
| Deno | Backend runtime |
| TypeScript | Type-safe backend logic |
| Deno std/http | HTTP server to serve the app |

### 5.3 Database & Auth
| Technology | Purpose |
| :--- | :--- |
| Supabase | Hosted PostgreSQL + Auth |
| PostgreSQL | Relational database |
| Supabase Auth | User login / session management |

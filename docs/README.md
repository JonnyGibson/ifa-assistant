# IFA Assistant - Technical Documentation

This document provides comprehensive documentation for the IFA Assistant application, designed for Independent Financial Advisors to manage their practice efficiently.

## 1. Project Overview & Purpose

The IFA Assistant is a comprehensive backoffice system for Independent Financial Advisors (IFAs) in the UK. Its purpose is to streamline administrative tasks, enhance client management, improve compliance, and provide better visibility into client portfolios and business metrics.

### Core Business Goals

- Centralize client information and interaction history
- Track financial products and portfolio performance
- Simplify administrative workflows and reduce manual tasks
- Ensure compliance with UK financial regulations
- Provide actionable insights through dashboards and reports

## 2. Technology Stack

*   **Frontend:**
    *   Vue.js 3 (Composition API)
    *   Vue Router for navigation
    *   Tailwind CSS for styling
    *   Chart.js for data visualization
*   **Data Persistence:**
    *   Browser IndexedDB (local development)
    *   Dexie.js as IndexedDB wrapper
*   **Authentication:**
    *   Custom authentication service using IndexedDB
*   **Build Tools:**
    *   Vite
    *   Node.js / npm

## 3. System Architecture

The application follows a client-side architecture with a focus on responsive user experience:

*   **Client-Side Application:** The entire application runs in the browser, with Vue.js handling UI rendering and state management.
*   **Local Data Storage:** Data is stored in the browser's IndexedDB, managed through Dexie.js.
*   **Component-Based Structure:** The UI is composed of reusable Vue components organized by feature.
*   **Service Layer:** Business logic is encapsulated in dedicated services for authentication, data access, and domain-specific operations.
*   **Routing:** Vue Router handles navigation between views with authentication guards for protected routes.

## 4. File Structure & Key Components

```
ifa-assistant/
├── src/               # Source files
│   ├── assets/        # Static assets (CSS, images)
│   ├── components/    # Reusable Vue components
│   ├── router/        # Vue Router configuration
│   ├── services/      # Application services for auth and data
│   │   ├── auth/      # Authentication services
│   │   ├── database/  # Data access services
│   │   └── models/    # Domain models
│   ├── views/         # Page-level Vue components
│   ├── App.vue        # Main application component
│   └── main.js        # Application entry point
```

## 5. User Experience & Journeys

This section documents the complete user journeys within the IFA Assistant application, based on the actual code implementation.

### 5.1. Authentication & Onboarding

#### Initial Entry
Users begin at the login screen (`LoginForm.vue`), which is the default route (`/`). The application checks for an existing auth token in localStorage and automatically redirects authenticated users to their dashboard.

**User Flow:**
1. User navigates to application URL
2. System checks for existing authentication token
3. If token exists and is valid, user is redirected to Dashboard
4. If no valid token exists, Login form is displayed

#### Login Process
The login form (`LoginForm.vue`) allows users to authenticate with email/password credentials against the IndexedDB user store.

**User Flow:**
1. User enters email and password
2. On submission, `authService.login()` validates credentials against stored users
3. If valid, a session token is generated and stored in localStorage
4. User is redirected to Dashboard (`/dashboard`)
5. If invalid, error message is displayed

#### Database Reset Option
For development purposes, users can reset the database from the login screen.

**User Flow:**
1. User clicks "Reset Database" button
2. System reinitializes IndexedDB with fresh test data
3. Confirmation message is shown
4. User can then log in with default credentials

#### Logout Process
Authenticated users can log out from any page via the header button.

**User Flow:**
1. User clicks "Sign Out" button in application header
2. `authService.logout()` is called, removing the authentication token
3. User is redirected to login page
4. Previous user session data is cleared from memory

### 5.2. Dashboard & Overview

The Dashboard (`Dashboard.vue`) serves as the central hub, displaying key metrics and recent activity.

**User Flow:**
1. After successful login, user lands on Dashboard
2. System loads client data, portfolio valuations, and recent interactions
3. User sees:
   - Summary statistics (total clients, AUM, active portfolios)
   - Portfolio distribution by category (using Chart.js)
   - Top clients by portfolio value
   - Recent interactions across all clients
   - Upcoming appointments

**Key Metrics Displayed:**
- Total number of clients
- Assets under management (AUM)
- Number of active investment portfolios
- Average portfolio value
- Investment category distribution (pie chart)
- List of top clients by portfolio value

### 5.3. Client Management

#### Client List View
The Clients page (`Clients.vue`) provides a comprehensive list of all clients with search, filter, and add functionality.

**User Flow:**
1. User navigates to Clients page from sidebar
2. System loads all client records from IndexedDB
3. Clients are displayed in a sortable, searchable table
4. For each client, key information is shown:
   - Name and contact details
   - Risk profile
   - Portfolio value
   - Last contact date
   - Next scheduled appointment

**Client Search & Filter:**
1. User enters text in search box
2. Client list filters in real-time by name, email, or other relevant fields
3. Results update dynamically as user types

#### Adding a New Client
Users can add new clients directly from the Clients page.

**User Flow:**
1. User clicks "Add Client" button
2. Modal form appears with fields for client details
3. User completes required information:
   - Personal details (name, DOB, contact information)
   - Risk profile
   - Notes
4. On submission, client record is added to IndexedDB
5. New client appears in the client list
6. Modal closes automatically

#### Client Detail View
Clicking on any client opens their detailed profile (`ClientDetail.vue`).

**User Flow:**
1. User clicks on client name or "View" button in client list
2. System loads detailed client data, including:
   - Personal information
   - Contact details
   - Financial accounts
   - Insurance policies
   - Interaction history
3. User can see all related financial products and communication history

#### Client Interactions
Within the Client Detail view, users can record and view all client interactions.

**User Flow:**
1. User views the "Recent Interactions" section
2. System displays chronological list of past interactions
3. User can click "View All" to see complete interaction history
4. User can add new interactions by:
   - Selecting interaction type (meeting, call, email, etc.)
   - Setting date and status
   - Adding notes or details
   - Submitting to create new interaction record

### 5.4. Investment & Product Management

#### Funds Overview
The Funds page (`Funds.vue`) provides a comprehensive view of available investment funds.

**User Flow:**
1. User navigates to Funds from sidebar
2. System loads fund data from IndexedDB
3. Funds are displayed in a sortable, filterable table showing:
   - Fund name
   - Asset class
   - Risk rating
   - Performance metrics
   - Fees and charges

**Fund Search & Filter:**
1. User can filter by asset class, risk rating, or search by name
2. Table updates dynamically as filters are applied
3. Performance data is highlighted with visual indicators

#### Client Investments
Within Client Detail view, users can see a client's specific investments.

**User Flow:**
1. In Client Detail, user views the "Investment Accounts" section
2. Each account shows:
   - Account type (ISA, SIPP, GIA, etc.)
   - Current value
   - Fund allocation
   - Performance indicators

#### Insurance Policies
The system also tracks client insurance policies within the Client Detail view.

**User Flow:**
1. In Client Detail, user views the "Insurance Policies" section
2. Each policy shows:
   - Policy type
   - Provider
   - Premium amount
   - Renewal date
   - Coverage details

### 5.5. Appointments & Task Management

The Appointments page (`Appointments.vue`) allows users to manage client meetings and follow-ups.

**User Flow:**
1. User navigates to Appointments from sidebar
2. System loads all scheduled appointments from IndexedDB
3. Appointments are displayed in a calendar view and/or a list view showing:
   - Client name
   - Date and time
   - Appointment type
   - Status (scheduled, completed, cancelled)

**Adding New Appointments:**
1. User clicks "Add Appointment" button
2. Modal form appears with:
   - Client selector
   - Date/time picker
   - Appointment type selector
   - Notes field
3. On submission, appointment is added to the system
4. Calendar/list view is updated

**Upcoming Appointments Dashboard Widget:**
1. On Dashboard, user sees "Upcoming Appointments" widget
2. Shows next few scheduled appointments
3. Provides quick access to appointment details

### 5.6. Administrative Functions

#### Settings & User Management
The Settings page (`Settings.vue`) provides admin-only functionality for system management.

**User Flow (Admin Users Only):**
1. Admin user navigates to Settings from sidebar
2. System loads user management interface
3. Admin can:
   - View all system users
   - Add new users with specified permissions
   - Edit existing user details
   - Reset user passwords
   - Delete users
   - Reset the entire database (development/testing feature)

**Adding New Users:**
1. Admin clicks "Add User" button
2. Form appears with fields for:
   - Username
   - Email
   - Password
   - First/Last name
   - Admin privileges toggle
3. On submission, new user is created in the system

**Database Management:**
1. Admin can click "Reset Database" to restore system to initial state (clears all data and re-seeds with test data).
2. Confirmation dialog prevents accidental resets.
3. After reset, system is reinitialized with seed data.

### 5.7. Error Handling & Recovery

The application includes several error handling flows to ensure a smooth user experience:

**Authentication Failures:**
1. If login credentials are invalid, specific error message is shown
2. If session token becomes invalid during use, user is redirected to login

**Data Loading Errors:**
1. If database connection fails, error message is displayed
2. Retry options are provided where appropriate
3. Loading states provide visual feedback during data retrieval

**Form Validation:**
1. Required fields are clearly marked
2. Validation errors appear inline with relevant form fields
3. Submission is prevented until all validation passes

## 6. Data Models & Relationships

The application uses several core data models stored in IndexedDB:

### Users
- Authentication credentials
- Personal information
- Role permissions (admin/regular)

### Clients
- Personal and contact information
- Risk profile
- Relationship details
- Associated accounts and policies

### Investment Accounts
- Account type
- Provider
- Value
- Allocation details
- Performance metrics
- Associated client

### Insurance Policies
- Policy type
- Provider
- Premium details
- Coverage information
- Associated client

### Interactions
- Interaction type
- Date/time
- Associated client
- Notes/details
- Status

### Appointments
- Client reference
- Date/time
- Type
- Status
- Notes

## 7. Development Guidelines

Please refer to the `.cursorrules` file for detailed AI development guidelines. Key principles include:

- Maintain Vue.js 3 Composition API patterns
- Follow Tailwind CSS conventions for styling
- Keep components focused and reusable
- Use service-based architecture for business logic
- Implement proper authentication checks
- Follow IndexedDB best practices with Dexie.js
- Ensure proper error handling throughout

## 8. Testing Guidelines

The project utilizes MCP (Model Control Protocol) for automated testing to ensure application stability and correctness. Key areas covered by tests include:

-   **Authentication:** Login, logout, session persistence, token handling, and access control via route guards.
-   **Client Management:** Create, Read, Update, and Delete (CRUD) operations for client records. Verification of data persistence in IndexedDB.
-   **Navigation:** Testing all primary navigation paths and ensuring authenticated routes are protected.
-   **Form Handling:** Validation logic, successful submission, and error handling for all major forms (Login, Add Client, Add Appointment, etc.).
-   **Data Display:** Verification that dashboard metrics are calculated and displayed correctly based on underlying data.
-   **Filtering & Searching:** Testing the functionality of search inputs and filters in tables (Clients, Funds).
-   **Appointments:** CRUD operations for appointments and correct display in calendar/list views.
-   **Admin Functions:** Testing user management (add, edit, delete users) and database reset functionality.

Tests should verify not only that actions complete programmatically but also that UI elements are interactive from a user's perspective (visible, enabled, clickable) where feasible using MCP capabilities.

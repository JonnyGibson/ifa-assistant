# IFA Assistant

A modern financial advisor assistant platform built with Vue.js and a local-first IndexedDB approach (using Dexie.js), designed to help financial advisors manage their clients, appointments, and documents efficiently during development.

**Note for AI Assistant:** Please consult this README and the `.cursorrules` file before making changes or suggestions.

## Tech Stack

### Frontend
- **Framework:** Vue.js 3 (Primarily Composition API)
- **Routing:** Vue Router
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Data Visualization:** Chart.js (used in `Dashboard.vue`)

### Data Management (Local Development)
- **Database:** Browser IndexedDB
- **Wrapper:** Dexie.js
- **Authentication:** Custom local auth service (`src/services/db.js`) using IndexedDB
- **Seeding:** Automatic seeding with test data on initialization

### Development
- **Environment:** Node.js / npm

## Project Structure

```
ifa-assistant/
├── public/            # Public static files (e.g., index.html)
├── src/               # Source files
│   ├── assets/        # Static assets (CSS, images)
│   ├── components/    # Reusable Vue components (e.g., Sidebar, LoginForm, StatsCard)
│   ├── router/        # Vue Router configuration (index.js)
│   ├── services/      # Application services (e.g., db.js for IndexedDB access)
│   ├── views/         # Page-level Vue components (e.g., Dashboard, Clients, Documents)
│   ├── App.vue        # Main application component (layout, auth handling)
│   └── main.js        # Vue app initialization, plugins (Router), DB initialization
├── .gitignore         # Git ignore file
├── README.md          # This file
├── package.json       # Project dependencies and scripts
└── vite.config.js     # Vite configuration
```

## Core Concepts & Flow

1.  **Initialization (`main.js`):** Initializes the IndexedDB database (`initializeDatabase` from `src/services/db.js`, which includes seeding if necessary), creates the Vue app, installs the Vue Router plugin, and provides the `authService`.
2.  **Root Component (`App.vue`):**
    *   Acts as the main layout container.
    *   Checks authentication status using `authService.getCurrentUser` based on a token stored in `localStorage`.
    *   Uses `v-if` directives to show either `LoginForm.vue` (if not authenticated) or the main application layout (Sidebar + router-view, if authenticated).
    *   Contains a loading state (`isLoading`) to prevent content flashing before auth is checked.
    *   Provides the `currentUser` reactive ref to child components.
3.  **Routing (`src/router.js`):**
    *   Defines application routes, mapping paths (e.g., `/`, `/clients`) to view components (e.g., `Dashboard.vue`, `Clients.vue`).
    *   Uses `createWebHistory`.
    *   Includes a `beforeEach` navigation guard that checks for `auth_token` in `localStorage`, validates it using `authService`, and checks for admin permissions (`user.isAdmin`) for protected routes like `/settings`.
4.  **Sidebar (`components/Sidebar.vue`):** Uses `<router-link>` components to trigger navigation changes handled by Vue Router.
5.  **Views (`views/*.vue`):** Page-level components rendered by `<router-view>`. These inject the `currentUser` ref (provided by `App.vue`) to get the `userId` and use `dataService` methods (from `src/services/db.js`) to fetch and manipulate data relevant to their section (e.g., `Clients.vue` uses `dataService.getClients(userId)`).
6.  **Data Service (`src/services/db.js`):**
    *   Uses Dexie.js to wrap IndexedDB.
    *   Defines the database schema (tables like `users`, `clients`, `tasks`, etc.).
    *   Handles database initialization and seeding with UK-focused test data.
    *   Provides `authService` for login, logout, registration, and user validation.
    *   Provides `dataService` for CRUD operations on various data types, ensuring operations are scoped to the logged-in user where appropriate.
    *   Includes functions for resetting the database (`db.reset()`).

## AI Assistant Troubleshooting Tips & Context

*   **Routing/Navigation Guard:** If navigation seems broken or redirects aren't working, check the `router.beforeEach` guard in `src/router.js`. Ensure it correctly reads `auth_token` from `localStorage`, calls `authService.getCurrentUser`, and checks the `user.isAdmin` flag.
*   **Component Rendering/Data Fetching:** If a view isn't rendering its content:
    *   Check the browser console for errors during the component's `setup` or `onMounted` lifecycle hooks.
    *   Ensure data fetching methods (e.g., `fetchClients` in `Clients.vue`) are called correctly, using the injected `userId` from the `currentUser`.
    *   Verify that the `currentUser` is being successfully provided by `App.vue` and injected into the view.
    *   Check for errors returned by `dataService` methods.
*   **IndexedDB Issues:**
    *   Use browser developer tools (Application/Storage tab -> IndexedDB -> IFAAssistantDB) to inspect the database contents directly.
    *   Check the console for logs related to database initialization, seeding, or errors from `db.js`.
    *   If data seems missing or corrupt, try resetting using the `/settings` page (as admin) or by clearing browser application storage in dev tools.
*   **Authentication:** Auth state (`isAuthenticated`, `currentUser`) is managed reactively within `App.vue`. Login stores a token in `localStorage`, logout removes it. `checkAuth` validates the token on page load.
*   **Dependencies:** Ensure `npm install` has been run. Check `package.json` for required dependencies (Vue, Vue Router, Dexie, Tailwind, Chart.js).

## Local Development Setup

### Prerequisites
- Node.js (v16+)
- npm

### Getting Started
1.  Clone the repository.
2.  Install dependencies: `npm install`
3.  Start the development server: `npm run dev` (Usually runs on http://localhost:5173 or similar)
4.  The application uses IndexedDB. On the first run, it will automatically seed itself with test data.

### Test Users (Development)

Default test user seeded into IndexedDB during initial setup:
- **Admin:** email: `admin@webserve.it` / password: `admin123`
- *(Note: Login uses the email address. Only the admin user is created by default during the seeding process. Other users can be added via the Settings page when logged in as admin.)*

### Database Management
- Data is stored locally in your browser's IndexedDB.
- The database automatically seeds on first load or if empty.
- Log in as the `admin` user and navigate to the `/settings` page to:
    - Reset the database to its initial seed state.
    - Clear all data (except admin users).
    - Manage users (add, edit, delete, reset password).
- To completely clear the database, use your browser's developer tools to clear application storage for the site.

## Development Workflows

- **Feature Development:** Create new branches for features. Keep components small and focused.
- **Styling:** Utilize Tailwind CSS utility classes.
- **Data Handling:** Use the `dataService` and `authService` from `src/services/db.js` for all data interactions.

## Testing with MCP Server

The project uses MCP (Model Control Protocol) server for automated testing and UI interaction verification. This allows us to:

- Simulate user interactions with the application
- Verify UI components are working correctly
- Test form submissions and data entry (using IndexedDB)
- Validate navigation flows
- Check authentication processes (using local auth service)
- Ensure proper error handling

### Running MCP Tests

1. Start the MCP server (this is typically handled by your development environment)
2. The MCP server provides browser automation capabilities through tools like:
   - Navigation (`navigate`, `go_back`, `go_forward`)
   - Element interaction (`click`, `type`, `hover`)
   - Form handling (`select_option`, `press_key`)
   - State verification (`snapshot`, `get_console_logs`)
   - Visual testing (`screenshot`)

### Best Practices for MCP Testing

- Always verify elements are visible and interactive before attempting interactions
- Use proper waiting mechanisms when testing dynamic content
- Check for proper error handling and edge cases
- Validate form submissions and data persistence in IndexedDB
- Test across different authentication states (admin, regular user)
- Verify navigation flows and routing behavior based on auth/admin status

### Common MCP Test Scenarios

1. User Authentication
   - Login/logout flows using seeded users (`admin`)
   - Invalid credentials handling
   - Session token handling in `localStorage`

2. Client Management (as logged-in user)
   - Adding new clients
   - Editing client information
   - Searching and filtering clients
   - Deleting clients

3. Document Handling (Metadata only)
   - Creating folders
   - Viewing document metadata
   - Deleting document metadata/folders

4. Appointment Scheduling (as logged-in user)
   - Creating appointments
   - Updating appointment details
   - Calendar interaction

5. Admin Settings Page (as `admin` user)
   - Accessing `/settings`
   - Resetting/Clearing database
   - Adding/Editing/Deleting users
   - Password resets

6. Data Validation
   - Form validation
   - Error message display
   - Required field handling
```

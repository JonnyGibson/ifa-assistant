# IFA Assistant

A modern financial advisor assistant platform built with Vue.js and Supabase, designed to help financial advisors manage their clients, appointments, and documents efficiently.

**Note for AI Assistant:** Please consult this README and the `.cursorrules` file before making changes or suggestions.

## Tech Stack

### Frontend
- **Framework:** Vue.js 3 (Primarily Composition API, Options API used in `Sidebar.vue`)
- **Routing:** Vue Router
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Data Visualization:** Chart.js (used in `Dashboard.vue`)
- **State Management:** Implicit via Supabase and component state (no dedicated state library like Pinia/Vuex currently)

### Backend & Database
- **Platform:** Supabase
  - **Database:** PostgreSQL
  - **Authentication:** Supabase Auth (Email/Password)
  - **Storage:** Supabase Storage (for documents)
  - **Real-time:** Supabase Realtime (potential use)
  - **Security:** Row Level Security (RLS)

### Development
- **Environment:** Node.js / npm
- **Supabase CLI:** For local Supabase management

## Project Structure

```
ifa-assistant/
├── public/            # Public static files (e.g., index.html)
├── src/               # Source files
│   ├── assets/        # Static assets (CSS, images)
│   ├── components/    # Reusable Vue components (e.g., Sidebar, LoginForm, StatsCard)
│   ├── router/        # Vue Router configuration (index.js)
│   ├── views/         # Page-level Vue components (e.g., Dashboard, Clients, Documents)
│   ├── App.vue        # Main application component (layout, auth handling)
│   ├── main.js        # Vue app initialization, plugins (Router)
│   └── supabase.js    # Supabase client configuration
├── supabase/          # Supabase local development configuration
│   ├── migrations/    # Database migrations
│   ├── seed.sql       # Generated seed data (if used)
│   └── functions/     # Edge Functions (if used)
├── scripts/           # Helper scripts (e.g., seeding, db management)
│   ├── db-manager.js
│   └── generate-seed-data.js
├── .env               # Environment variables (MUST contain VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
├── .gitignore         # Git ignore file
├── README.md          # This file
├── package.json       # Project dependencies and scripts
└── vite.config.js     # Vite configuration
```

## Core Concepts & Flow

1.  **Initialization (`main.js`):** Creates the Vue app, initializes the Supabase client (using `.env` variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`), and installs the Vue Router plugin.
2.  **Root Component (`App.vue`):**
    *   Acts as the main layout container.
    *   Checks authentication status using `supabase.auth.getSession()` and `onAuthStateChange`.
    *   Uses `v-if` directives to show either `LoginForm.vue` (if not authenticated) or the main application layout (Sidebar + router-view, if authenticated).
    *   Contains a loading state (`isLoading`) to prevent content flashing before auth is checked.
    *   Includes the `<Sidebar />` and the `<router-view />` components.
3.  **Routing (`router/index.js`):**
    *   Defines application routes, mapping paths (e.g., `/`, `/clients`) to view components (e.g., `Dashboard.vue`, `Clients.vue`).
    *   Uses `createWebHistory`.
    *   Includes a `beforeEach` navigation guard. **Crucially, this guard currently relies on `App.vue`'s internal logic to show/hide content based on authentication.** It primarily checks for the `supabase.auth.token` in `localStorage` and logs navigation but does *not* perform redirects itself for the main authenticated routes.
4.  **Sidebar (`components/Sidebar.vue`):** Uses `<router-link>` components to trigger navigation changes handled by Vue Router. Uses the Options API and `$route.path` for active link styling.
5.  **Views (`views/*.vue`):** Page-level components rendered by `<router-view>`. These fetch and display data relevant to their specific section (e.g., `Dashboard.vue` fetches client stats, notes, and renders charts).

## AI Assistant Troubleshooting Tips & Context

*   **Routing/Navigation Guard:** If navigation seems broken or components aren't rendering, first check the `router.beforeEach` guard in `router/index.js`. The issue might be related to how it interacts with `App.vue`'s authentication handling. The guard *should not* be redirecting to a 'Login' route, as `App.vue` handles this display internally. Ensure `localStorage.getItem('supabase.auth.token')` is checking the correct key.
*   **Component Rendering:** If a view (like Dashboard) isn't rendering its content:
    *   Verify the component's template has **exactly one root element**. (This was a recent issue with `Dashboard.vue`).
    *   Check the browser console for errors during the component's `setup` or `onMounted` lifecycle hooks.
    *   Ensure any data fetching (`fetchDashboardData` in Dashboard) is completing successfully and updating the reactive refs (`ref`).
*   **Chart.js:** The Dashboard uses Chart.js. Remember that chart initialization needs a valid canvas element. DOM querying (`document.querySelector`) inside `onMounted` is used, but ensure the query selectors are correct (e.g., `#riskProfileChart canvas`) and that the component has fully rendered. Consider `nextTick` if timing issues arise.
*   **Authentication:** Auth state (`isAuthenticated`) is managed reactively within `App.vue`. Changes rely on Supabase's `getSession` and `onAuthStateChange`.
*   **Dependencies:** Ensure `npm install` has been run. Check `package.json` for required dependencies (Vue, Vue Router, Supabase JS client, Tailwind, Chart.js).
*   **Environment Variables:** Supabase connection requires `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to be set in a `.env` file at the project root.

## Local Development Setup

### Prerequisites
- Node.js (v16+)
- npm
- Supabase CLI (`npm install -g supabase`) - *Optional if only connecting to a remote Supabase instance, required for local development.*

### Getting Started (Connecting to Remote Supabase)
1.  Create a `.env` file in the project root.
2.  Add your Supabase project URL and Anon Key:
    ```dotenv
    VITE_SUPABASE_URL=YOUR_SUPABASE_URL
    VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    ```
3.  Install dependencies: `npm install`
4.  Start the development server: `npm run dev` (Usually runs on http://localhost:5173)

### Getting Started (Using Local Supabase)
1.  Ensure Supabase CLI is installed.
2.  Start the local Supabase instance: `supabase start`
3.  Note the API URL and anon key printed in the terminal.
4.  Create/update the `.env` file with these local keys.
5.  Install dependencies: `npm install`
6.  Start the development server: `npm run dev`

### Database Management (Local Supabase)
- Reset database & users: `npm run db:reset`
- Reset only data (preserves users): `npm run db:reset-data`
- Access Supabase Studio via the URL provided by `supabase start`.
- Migrations are in `supabase/migrations/`.

### Database Structure

#### Core Tables
- **clients** - Client information and risk profiles
  - Personal details (name, contact, address)
  - Risk profile and investment preferences
  - Client status and review dates
- **client_notes** - Meeting notes and client interactions
  - Note types (meeting, call, email, review)
  - Timestamps and content
  - Client reference
- **appointments** - Client appointments and scheduling
  - Date/time and duration
  - Status tracking
  - Client reference
- **documents** - Document management and tracking
  - File metadata and storage paths
  - Document types and status
  - Client reference

#### Security & Access Control
- Row Level Security (RLS) policies implemented on all tables
- Authentication through Supabase Auth
- Role-based access control (RBAC)
- Secure file storage with access controls

### Test Users (Development)

Default test users for local development:
- user1@example.com / admin123
- user2@example.com / admin123
- user3@example.com / admin123
- user4@example.com / admin123
- user5@example.com / admin123

## Development Workflows

### Database Migrations
- Migration files are in `supabase/migrations/`
- New migrations should follow the naming pattern: `YYYYMMDDHHMMSS_description.sql`
- Migrations are automatically applied during `supabase start`
- Always test migrations locally before deployment

### Seeding Data
- Seed data is generated using `scripts/generate-seed-data.js`
- Seeds are automatically applied during database reset
- Sample data includes realistic client profiles and interactions
- Test data follows GDPR-compliant patterns

### Local Development Tips
1. Always use `supabase start` before development
2. Use `npm run db:reset-data` to refresh data without affecting users
3. Access Supabase Studio at the URL provided after `supabase start`
4. Database connection details are provided after `supabase start`
5. Monitor real-time subscriptions in Supabase Studio
6. Use the Supabase CLI for database management tasks
7. Keep all Supabase keys and secrets secure and never commit them

### Supabase Integration
- Client-side integration through `@supabase/supabase-js`
- Real-time subscriptions for live updates
- Secure file uploads to Supabase Storage
- Authentication flows with Supabase Auth
- Row Level Security for data protection

## Local Development URLs

After running `supabase start`, you'll see the following URLs in your terminal:
- Frontend: http://localhost:5173
- Supabase Studio
- API URL
- Database URL
- Storage URL
- Auth URL

Note: The actual URLs and keys will be displayed in your terminal after running `supabase start`. Never commit these values to version control. 

## Testing with MCP Server

The project uses MCP (Model Control Protocol) server for automated testing and UI interaction verification. This allows us to:

- Simulate user interactions with the application
- Verify UI components are working correctly
- Test form submissions and data entry
- Validate navigation flows
- Check authentication processes
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
- Validate form submissions and data persistence
- Test across different authentication states
- Verify navigation flows and routing behavior

### Common MCP Test Scenarios

1. User Authentication
   - Login/logout flows
   - Invalid credentials handling
   - Session management

2. Client Management
   - Adding new clients
   - Editing client information
   - Searching and filtering clients
   - Status updates

3. Document Handling
   - File uploads
   - Document previews
   - Permission checks

4. Appointment Scheduling
   - Creating appointments
   - Updating appointment details
   - Calendar integration

5. Data Validation
   - Form validation
   - Error message display
   - Required field handling
``` 
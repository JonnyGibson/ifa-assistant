# IFA Assistant

A modern financial advisor assistant platform built with Vue.js and Supabase, designed to help financial advisors manage their clients, appointments, and documents efficiently.

## Tech Stack

### Frontend
- **Vue.js 3** - Progressive JavaScript framework
- **Vite** - Next generation frontend tooling
- **Tailwind CSS** - Utility-first CSS framework
- **Chart.js** - Data visualization library

### Backend & Database
- **Supabase** - Open source Firebase alternative
  - PostgreSQL database with full-text search and JSON support
  - Authentication with email/password and social providers
  - Row Level Security (RLS) policies for data protection
  - Real-time subscriptions for live updates
  - Storage for document management
  - Edge Functions for serverless operations

## Local Development Setup

### Prerequisites
- Node.js (v16+)
- Supabase CLI (`npm install -g supabase`)

### Getting Started

1. Start the local Supabase instance:
```bash
supabase start
```

2. After starting Supabase, you'll see connection details in the terminal. Make sure to:
   - Note the API URL and anon key for your frontend configuration
   - Keep the service_role key secure and never commit it
   - Use the Studio URL to access the database management interface

3. Install dependencies:
```bash
npm install
```

4. Start the development server:
```bash
npm run dev
```

### Database Management

The project includes several scripts for managing the database:

```bash
# Reset everything (database + users)
npm run db:reset

# Reset only database content (preserves users)
npm run db:reset-data
```

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

## Project Structure

```
ifa-assistant/
├── src/               # Source files
│   ├── components/    # Vue components
│   ├── assets/        # Static assets
│   └── supabase.js    # Supabase client configuration
├── supabase/
│   ├── migrations/    # Database migrations
│   ├── seed.sql      # Generated seed data
│   └── functions/    # Edge Functions
├── scripts/
│   ├── db-manager.js        # Database management scripts
│   └── generate-seed-data.js # Seed data generator
└── public/            # Public static files
```

## Contributing

1. Create feature branches from `main`
2. Follow the existing code style
3. Update migrations when changing database structure
4. Update this README when adding new features or workflows
5. Test all database changes locally before committing
6. Document any new Supabase features or configurations

## Local Development URLs

After running `supabase start`, you'll see the following URLs in your terminal:
- Frontend: http://localhost:5173
- Supabase Studio
- API URL
- Database URL
- Storage URL
- Auth URL

Note: The actual URLs and keys will be displayed in your terminal after running `supabase start`. Never commit these values to version control. 
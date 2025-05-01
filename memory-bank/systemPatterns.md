# System Patterns

## Architecture Overview

### Component Architecture
1. Views (Page Level)
   - Dashboard: Central hub for metrics and activity
   - ClientDetail: Comprehensive client information
   - Funds: Investment fund management
   - Activity: Interaction tracking
   - Reports: Analytics and reporting

2. Core Components
   - FundsTable: Reusable fund display with sorting/filtering
   - ClientActivityChart: Visualizes client interactions
   - PerformanceBadge: Standardized performance indicators
   - StatsCard: Metric display components

### Data Patterns

1. Database Structure (IndexedDB)
   - Users: Authentication and permissions
   - Clients: Core client information
   - Funds: Investment fund data
   - Accounts: Investment account records
   - Holdings: Fund holdings in accounts
   - Interactions: Client communication records
   - Insurance: Policy management

2. Service Layer
   - AuthService: Authentication management
   - ClientService: Client data operations
   - FundService: Fund data and updates
   - InvestmentService: Portfolio management
   - InteractionService: Activity tracking

### UI Patterns

1. Layout Structure
   - Glass morphism for cards
   - Responsive grid systems
   - Expandable/collapsible sections
   - Modal dialogs for actions
   - Sidebar navigation

2. Data Display
   - Sortable tables
   - Category-based organization
   - Performance indicators
   - Status badges
   - Chart visualizations

### Interaction Patterns

1. Navigation
   - Hierarchical routing
   - Protected routes
   - Deep linking
   - Breadcrumb trails

2. Data Entry
   - Form validation
   - Real-time updates
   - Error handling
   - Success feedback

3. State Management
   - Reactive references
   - Computed properties
   - Watchers for side effects
   - Event handling

## Technical Decisions

1. Vue 3 Composition API
   - Better type support
   - More flexible component logic
   - Improved code reuse
   - Enhanced performance

2. IndexedDB with Dexie.js
   - Offline-first architecture
   - Complex querying capability
   - Transaction support
   - Schema migrations

3. Tailwind CSS
   - Utility-first approach
   - Consistent styling
   - Responsive design
   - Performance optimization

4. Chart.js Integration
   - Portfolio visualization
   - Performance tracking
   - Distribution analysis
   - Risk assessment
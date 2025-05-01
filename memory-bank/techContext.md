# Technical Context

## Development Environment
- Node.js runtime
- Vite build system
- npm package management
- Local development server
- Browser-based storage

## Frontend Architecture

### Vue.js Implementation
- Vue 3 Composition API
- Vue Router for navigation
- Reactive state management
- Component composition
- Lifecycle hooks

### Database Schema
```javascript
// IndexedDB Tables
{
  users: '++id, &email, username, isAdmin',
  clients: '++id, lastName, email, firstName, riskProfile',
  funds: '++id, &isin, &sedol, name, category',
  accounts: '++id, clientId, type, provider, accountNumber, dateOpened, status',
  holdings: '++id, accountId, fundId, unitsHeld, purchaseDate, purchasePrice, [accountId+fundId]',
  insurancePolicies: '++id, clientId, type, provider, policyNumber, startDate, renewalDate',
  interactions: '++id, clientId, date, userId, userEmail, interactionTypeId',
  sessions: '++id, token, userId',
  interactionTypes: '++id, &name, category',
  documents: '++id, clientId, type, filename, uploadDate, metadata'
}
```

### Service Layer
- Authentication services
- Data access services
- Fund management services
- Investment tracking services
- Insurance management services
- Client interaction services

### UI Implementation
1. Layout Components
   - Responsive grid system
   - Glass morphism effects
   - Tailwind utility classes
   - Dynamic components

2. Data Visualization
   - Chart.js integration
   - SVG-based badges
   - Performance indicators
   - Interactive graphs

3. Form Handling
   - Validation logic
   - Error states
   - Success feedback
   - Real-time updates

## Development Tools

### Build System
- Vite configuration
- Hot module replacement
- Asset optimization
- Code splitting

### Testing Framework
- MCP server integration
- Browser automation
- UI verification
- State validation

### CSS Framework
- Tailwind CSS
- Custom utilities
- Responsive design
- Theme configuration

## Security Implementation
- Role-based access
- Route protection
- Data validation
- Session management
- Secure storage

## Performance Optimization
- Lazy loading
- Code splitting
- Asset optimization
- Caching strategies
- IndexedDB indexing
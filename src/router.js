import { createRouter, createWebHistory } from 'vue-router';
import { authService } from './services/db';

// Import Views (using .vue extension is good practice)
import DashboardView from './views/Dashboard.vue';
import ClientsView from './views/Clients.vue';
import ClientDetailView from './views/ClientDetail.vue';
import FundsView from './views/Funds.vue';
import SettingsView from './views/Settings.vue';
import LoginForm from './components/LoginForm.vue'; 

const routes = [
  { 
    path: '/', 
    name: 'Dashboard', 
    component: DashboardView, 
    meta: { requiresAuth: true } 
  },
  { 
    path: '/login', 
    name: 'Login', 
    component: LoginForm 
    // Public route, no meta needed unless checking if already logged in
  },
  { 
    path: '/clients', 
    name: 'Clients', 
    component: ClientsView, 
    meta: { requiresAuth: true } 
  },
  { 
    // Route for viewing a specific client
    path: '/clients/:id', // Use a dynamic segment for the client ID
    name: 'ClientDetail', 
    component: ClientDetailView, 
    meta: { requiresAuth: true },
    props: true // Automatically pass route params as props to the component
  },
   { 
    path: '/funds', 
    name: 'Funds', 
    component: FundsView, 
    meta: { requiresAuth: true } 
  },
  {
    path: '/settings',
    name: 'Settings',
    component: SettingsView,
    meta: { requiresAdmin: true } // requiresAuth is implied by requiresAdmin
  },
  // Add a catch-all 404 route (optional but recommended)
  {
    path: '/:pathMatch(.*)*', // Matches everything
    name: 'NotFound',
    component: { template: '<div class="p-4 text-center text-red-500"><h1>404 - Page Not Found</h1></div>' } 
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  linkActiveClass: 'bg-emerald-700 text-white', // Example active class styling for sidebar
  linkExactActiveClass: 'bg-emerald-800 text-white'
});

// Navigation guard (Keep existing guard logic)
router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin);
  const token = localStorage.getItem('auth_token');
  let user = null;

  // Check if navigating to login page when already logged in
  if (to.name === 'Login' && token) {
    try {
      user = await authService.getCurrentUser(token);
      if (user) {
        console.log('[Router Guard] Already logged in. Redirecting from Login to Dashboard.');
        next({ name: 'Dashboard' }); // Redirect to dashboard
        return;
      }
    } catch (error) {
      // Ignore error, proceed to login
    }
  }

  console.log(`[Router Guard] Navigating from ${from.path} to ${to.path}`);

  if (token && !user) { // Avoid fetching user again if already checked above
    try {
      user = await authService.getCurrentUser(token);
      if (!user) {
        localStorage.removeItem('auth_token');
        console.log('[Router Guard] Invalid/expired token found, clearing.');
      }
    } catch (error) {
      console.error('[Router Guard] Error fetching user:', error);
      localStorage.removeItem('auth_token');
    }
  }

  const isAuthenticated = !!user;
  console.log(`[Router Guard] isAuthenticated: ${isAuthenticated}, User:`, user ? user.email : 'None'); // Log email now

  if (requiresAdmin) {
    if (isAuthenticated && user.isAdmin) {
      console.log('[Router Guard] Admin access granted.');
      next();
    } else if (isAuthenticated) {
      console.log('[Router Guard] Admin access denied (User not admin). Redirecting to Dashboard.');
      next({ name: 'Dashboard' });
    } else {
      console.log('[Router Guard] Admin access denied (Not authenticated). Redirecting to Login.');
      next({ name: 'Login' });
    }
  } else if (requiresAuth) {
    if (isAuthenticated) {
      console.log('[Router Guard] Authenticated access granted.');
      next();
    } else {
      console.log('[Router Guard] Authenticated access denied. Redirecting to Login.');
      next({ name: 'Login' });
    }
  } else {
    console.log('[Router Guard] Public access granted.');
    next();
  }
});

export default router; 
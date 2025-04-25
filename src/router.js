import { createRouter, createWebHistory } from 'vue-router';
import { authService } from './services/database';

// Route components
const Dashboard = () => import('./views/Dashboard.vue');
const Clients = () => import('./views/Clients.vue');
const ClientDetail = () => import('./views/ClientDetail.vue');
const Activity = () => import('./views/Activity.vue');
const Funds = () => import('./views/Funds.vue');
const Documents = () => import('./views/Documents.vue');
const Reports = () => import('./views/Reports.vue');
const Compliance = () => import('./views/Compliance.vue');
const Settings = () => import('./views/Settings.vue');
const LoginForm = () => import('./components/LoginForm.vue');

const routes = [
  {
    path: '/',
    name: 'Home',
    component: LoginForm,
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/clients',
    name: 'Clients',
    component: Clients,
    meta: { requiresAuth: true }
  },
  {
    path: '/clients/:id',
    name: 'ClientDetail',
    component: ClientDetail,
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/activity',
    name: 'Activity',
    component: Activity,
    meta: { requiresAuth: true }
  },
  {
    path: '/funds',
    name: 'Funds',
    component: Funds,
    meta: { requiresAuth: true }
  },
  {
    path: '/documents',
    name: 'Documents',
    component: Documents,
    meta: { requiresAuth: true }
  },
  {
    path: '/reports',
    name: 'Reports',
    component: Reports,
    meta: { requiresAuth: true }
  },
  {
    path: '/compliance',
    name: 'Compliance',
    component: Compliance,
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Simplified navigation guard
router.beforeEach(async (to, from, next) => {
  console.log(`[Router Guard] Navigating from ${from.fullPath} to ${to.fullPath}`);
  
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  
  try {
    const isAuthenticated = await authService.checkAuth();
    console.log(`[Router Guard] Auth check: ${isAuthenticated}, Route requires auth: ${requiresAuth}`);

    if (requiresAuth && !isAuthenticated) {
      // Not authenticated, trying to access protected route
      console.log('[Router Guard] Not authenticated, redirecting to home');
      return next({ path: '/', query: { redirect: to.fullPath } });
    }

    if (isAuthenticated && to.path === '/') {
      // Authenticated user trying to access home/login page
      console.log('[Router Guard] Already authenticated, redirecting to dashboard');
      return next({ path: '/dashboard' });
    }

    // All other cases, just proceed
    console.log('[Router Guard] Proceeding with navigation');
    return next();
  } catch (error) {
    console.error('[Router Guard] Auth check failed:', error);
    if (requiresAuth) {
      return next({ path: '/' });
    }
    return next();
  }
});

export default router;
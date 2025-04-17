import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Clients from '../views/Clients.vue'
import Documents from '../views/Documents.vue'
import Compliance from '../views/Compliance.vue'
import Appointments from '../views/Appointments.vue'
import Reports from '../views/Reports.vue'
import ClientDetails from '../views/ClientDetails.vue'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/clients',
    name: 'Clients',
    component: Clients
  },
  {
    path: '/clients/:id',
    name: 'ClientDetails',
    component: ClientDetails,
    props: true
  },
  {
    path: '/documents',
    name: 'Documents',
    component: Documents
  },
  {
    path: '/compliance',
    name: 'Compliance',
    component: Compliance
  },
  {
    path: '/appointments',
    name: 'Appointments',
    component: Appointments
  },
  {
    path: '/reports',
    name: 'Reports',
    component: Reports
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Restored Navigation Guard
router.beforeEach((to, from, next) => {
  console.log(`[Router Guard] Navigating from ${from.fullPath} to ${to.fullPath}`);
  const isAuthenticated = !!localStorage.getItem('supabase.auth.token'); // Check if token exists
  console.log(`[Router Guard] isAuthenticated based on localStorage: ${isAuthenticated}`);

  // App.vue handles showing LoginForm if !isAuthenticated internally.
  // The primary role of the guard here might be future-proofing or 
  // potentially adding checks for specific roles if needed later.
  // For now, we mostly rely on App.vue's rendering logic.
  
  // You could add more specific checks here if some routes were public
  // e.g., if (to.meta.requiresAuth && !isAuthenticated) { /* handle */ }

  // Allow navigation to proceed. App.vue will show login or the route content.
  console.log('[Router Guard] Proceeding with navigation.');
  next(); 
});

export default router 
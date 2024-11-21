import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  { path: '/', component: () => import('@/views/HomeView.vue') },
  {
    path: '/login',
    component: () => import('@/views/LoginView.vue'),
  },
  {
    path: '/register',
    component: () => import('@/views/RegisterView.vue'),
  },
  {
    path: '/dashboard',
    component: () => import('@/views/DashboardView.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;

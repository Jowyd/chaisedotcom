import AuthorList from '@/views/AuthorList.vue';
import { createRouter, createWebHistory } from 'vue-router'

const routes =[
  {path: '/', redirect: '/authors'},
  {path: '/authors', component: AuthorList}
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;

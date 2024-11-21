import { createApp } from 'vue';
import App from './App.vue';
import PrimeVue from 'primevue/config';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Lara from '@primevue/themes/lara';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import router from '@/router';
import './styles.css';

const app = createApp(App);

app.use(PrimeVue, {
  theme: {
    preset: Lara,
  },
});
app.use(router);
app.component('Button', Button);
app.component('Card', Card);
app.mount('#app');

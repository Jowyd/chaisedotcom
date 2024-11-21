import { createApp } from 'vue';
import App from './App.vue';
import PrimeVue from 'primevue/config';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Sidebar from 'primevue/sidebar';
import Menu from 'primevue/menu';
import Avatar from 'primevue/avatar';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
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
app.use(PrimeVue, {
  theme: {
    preset: Lara,
  },
});
app.component('Button', Button);
app.component('Card', Card);
app.component('Sidebar', Sidebar);
app.component('Menu', Menu);
app.component('Avatar', Avatar);
app.component('Dialog', Dialog);
app.component('InputText', InputText);
app.component('Dropdown', Dropdown);
app.mount('#app');

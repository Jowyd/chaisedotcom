import { createApp } from 'vue';
import PrimeVue from 'primevue/config';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Avatar from 'primevue/avatar';
import Lara from '@primevue/themes/lara';

import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import App from './App.vue';
import router from './router';
import ConfirmationService from 'primevue/confirmationservice';

import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';
import './styles.css';
import Tooltip from 'primevue/tooltip';
import Dialog from 'primevue/dialog';

const app = createApp(App);

app.use(PrimeVue, {
  theme: {
    preset: Lara,
  },
});
app.use(router);
app.use(ConfirmationService);
app.component('Button', Button);
app.component('Card', Card);
app.component('Avatar', Avatar);
app.component('TabView', TabView);
app.component('TabPanel', TabPanel);
app.component('Dialog', Dialog);

app.directive('tooltip', Tooltip);

app.mount('#app');

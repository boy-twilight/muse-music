import { createApp } from 'vue';
import './assets/style/reset.less';
import './assets/style/global.less';
import App from '@/App.vue';
import router from '@/router';
import pinia from '@/store';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import { vPrevent } from '@/directives';

const app = createApp(App);

app.directive('prevent', vPrevent);
app.use(pinia);
app.use(router);
app.use(ElementPlus);
app.mount('#app');

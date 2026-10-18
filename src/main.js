import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from '@/router/index.js'
import AppLink from '@/components/AppLink.vue'
import { installPreloadRecovery } from '@/utils/preloadRecovery.js'

installPreloadRecovery(router)

createApp(App).component('AppLink', AppLink).use(router).mount('#app')

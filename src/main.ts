import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { createHead } from '@unhead/vue/client'

import App from './App.vue'
import router from './app/router'
import { queryClient } from './app/providers/queryClient'
import './assets/styles/tailwind.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(VueQueryPlugin, { queryClient })
app.use(createHead())

app.mount('#app')

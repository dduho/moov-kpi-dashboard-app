import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'

// Tailwind CSS
import './assets/styles/main.css'

import App from './App.vue'

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#2563eb',
          secondary: '#64748b',
          accent: '#3b82f6',
          error: '#ef4444',
          warning: '#f59e0b',
          info: '#06b6d4',
          success: '#10b981',
        },
      },
    },
  },
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(vuetify)

app.mount('#app')
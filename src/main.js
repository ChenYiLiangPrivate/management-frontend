import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
// 导入Element Plus及样式
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// 创建应用并使用Element Plus
createApp(App)
  .use(ElementPlus)
  .mount('#app')

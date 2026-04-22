import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'


// https://vitejs.dev/config/
export default defineConfig({
  server: {
    // 是否自动打开浏览器
    open: true,
    // 服务器主机名，如果允许外部访问，可设置为"0.0.0.0"
    host: '0.0.0.0',
    // 服务器端口号
    port: 3000,

    //服务器代理配置
    proxy: {
      "/api": {
        target: 'http://127.0.0.1:8088',
        changeOrigin: true,
        //重写url
        // rewrite(path) {
        //   return path.replace('/api', '');
        // },
      },
      '/socket.io': {
        target: 'ws://localhost:3000',
        ws: true
      }
    },
  },
  // 配置别名
  resolve: {
    alias: {
      "@": path.resolve(__dirname, './src')
    }
  },

  plugins: [react()],
})






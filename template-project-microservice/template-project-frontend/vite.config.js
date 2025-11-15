import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'src',
  publicDir: '../public',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html')
      }
    }
  },
  server: {
    port: 3001,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8888',  // Gateway 端口
        changeOrigin: true,
        secure: false,
        // 不重写路径，保持 /api 前缀，因为网关路由配置是 /api/auth/**
        // rewrite: (path) => path.replace(/^\/api/, ''),
        // 排除静态资源文件，避免代理前端模块文件
        bypass(req) {
          // 如果请求的是静态资源文件（.js, .css 等），不进行代理
          if (req.url && /\.(js|css|html|json|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/i.test(req.url)) {
            return req.url;
          }
        },
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('Proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Proxying request:', req.method, req.url, '->', options.target + req.url);
          });
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@api': resolve(__dirname, 'src/api'),
      '@components': resolve(__dirname, 'src/components'),
      '@pages': resolve(__dirname, 'src/pages'),
      '@services': resolve(__dirname, 'src/services'),
      '@layouts': resolve(__dirname, 'src/layouts'),
      '@styles': resolve(__dirname, 'src/styles'),
      '@config': resolve(__dirname, 'src/config')
    }
  }
});


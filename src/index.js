import React from 'react';
import ReactDOM from 'react-dom/client';
import { Layout } from '@douyinfe/semi-ui';
import App from './App';
import HeaderBar from './components/HeaderBar';
import reportWebVitals from './reportWebVitals';
import 'semantic-ui-css/semantic.min.css';
import './index.css';
import { ThemeProvider } from './context/Theme';

// 添加全局错误处理
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// 调试信息
console.log('App starting...');
console.log('Environment:', process.env.NODE_ENV);

try {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  const { Sider, Content, Header } = Layout;
  
  root.render(
    <ThemeProvider>
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ position: 'sticky', top: 0, zIndex: 1 }}>
          <HeaderBar />
        </Header>
        <Layout>
          <Content style={{ 
            padding: '24px',
            '@media screen and (max-width: 768px)': {
              padding: '12px'
            }
          }}>
            <App />
          </Content>
        </Layout>
      </Layout>
    </ThemeProvider>
  );
  
  console.log('App rendered successfully');
} catch (error) {
  console.error('Failed to render app:', error);
  // 备用渲染
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; padding: 20px; font-family: Arial, sans-serif;">
        <h2>应用启动失败</h2>
        <p>错误信息: ${error.message}</p>
        <button onclick="window.location.reload()" style="padding: 10px 20px; background: #1890ff; color: white; border: none; border-radius: 4px; cursor: pointer;">
          重新加载
        </button>
      </div>
    `;
  }
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

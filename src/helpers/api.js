import { showError } from './utils';
import axios from 'axios';

export const API = axios.create({
  baseURL: '',
  timeout: 30000, // 30秒超时
  headers: {
    'Content-Type': 'application/json',
  }
});

// 请求拦截器
API.interceptors.request.use(
  (config) => {
    console.log('API请求:', config.method?.toUpperCase(), config.url);
    console.log('请求头:', config.headers);
    return config;
  },
  (error) => {
    console.error('请求拦截器错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
API.interceptors.response.use(
  (response) => {
    console.log('API响应成功:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API响应错误:', error);
    console.error('错误配置:', error.config);
    console.error('错误响应:', error.response);
    
    // 不要自动显示错误，让组件自己处理
    return Promise.reject(error);
  }
);

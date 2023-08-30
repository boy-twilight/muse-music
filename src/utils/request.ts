import axios, { AxiosInstance } from 'axios';
import { message, ss } from '.';
import { MessageType } from '@/constants/common';

const request: AxiosInstance = axios.create({
  timeout: 10000,
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true
});

// 添加请求拦截器
request.interceptors.request.use(
  (config) => {
    // 如果存在token，请求头携带token
    const token = ss.get('token');
    if (token) config.headers.Authorization = `${token}`;
    return config;
  },
  (error) => {
    message(MessageType.ERROR, error.message);
  }
);

// 添加响应拦截器
request.interceptors.response.use(
  (response) => {
    if (response.status != 200 && response.status != 201) {
      return Promise.reject(response);
    } else {
      return response.data;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default request;

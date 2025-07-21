import { showError } from './utils';
import axios from 'axios';

export const API = axios.create({
  baseURL: '',
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    showError(error);
  }
);

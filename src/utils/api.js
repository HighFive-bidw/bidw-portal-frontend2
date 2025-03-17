import axios from 'axios';

const API_CONFIG = {
  auth: window.__runtime_config__.AUTH_URL,
  report: window.__runtime_config__.REPORT_URL,
  subscription: window.__runtime_config__.SUBSCRIPTION_URL,
};

/* 인스턴스 생성 */
const createAxiosInstance = (baseURL) => {
  const instance = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  /* 요청 인터셉터 */
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  /* 응답 인터셉터 */
  instance.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

/* API 인스턴스 */
export const authApi = createAxiosInstance(API_CONFIG.auth);
export const reportApi = createAxiosInstance(API_CONFIG.report);
export const subscriptionApi = createAxiosInstance(API_CONFIG.subscription);

/* API 서비스 함수 */
export const authService = {
  login: (credentials) => authApi.post('/login', credentials),
  logout: (token) => authApi.post('/logout', { token }),
};

export const reportService = {
  getReportList: () => reportApi.get('/list'),
  getFilteredReports: (startDate, endDate) => reportApi.get('/filter', { params: { startDate, endDate } }),
  getReportDetail: (reportId) => reportApi.get(`/${reportId}`),
  downloadReport: (reportId) => reportApi.get(`/${reportId}/download`),
};

export const subscriptionService = {
  getSubscriptionList: (userId) => subscriptionApi.get('/list', { params: { userId } }),
  subscribeReport: (userId, reportId) => subscriptionApi.post('/subscribe', { reportId }, { params: { userId } }),
  unsubscribeReport: (subscriptionId, userId) => subscriptionApi.delete(`/${subscriptionId}`, { params: { userId } }),
};

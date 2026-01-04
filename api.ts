import axios, { AxiosError } from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<any>) => {
    if (error.response) {
      const message = error.response.data?.error || error.response.data?.message || 'Terjadi kesalahan';
      
      // Don't show toast for 401 (will be handled by auth)
      if (error.response.status !== 401) {
        toast.error(message);
      }
      
      // Handle 401 - Unauthorized
      if (error.response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
    } else if (error.request) {
      toast.error('Tidak dapat terhubung ke server');
    } else {
      toast.error('Terjadi kesalahan');
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    if (typeof window !== 'undefined' && response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },
  
  register: async (data: any) => {
    const response = await api.post('/auth/register', data);
    if (typeof window !== 'undefined' && response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },
  
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },
};

// Attendance API
export const attendanceAPI = {
  upload: async (formData: FormData) => {
    const response = await api.post('/attendance/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  
  getMy: async (params?: { startDate?: string; endDate?: string; limit?: number }) => {
    const response = await api.get('/attendance/my', { params });
    return response.data;
  },
  
  getDetail: async (attendanceId: string) => {
    const response = await api.get(`/attendance/${attendanceId}`);
    return response.data;
  },
  
  submitReason: async (attendanceId: string, data: { reasonType: string; reasonText?: string }) => {
    const response = await api.post(`/attendance/${attendanceId}/reason`, data);
    return response.data;
  },
};

// Waste API
export const wasteAPI = {
  upload: async (formData: FormData) => {
    const response = await api.post('/waste/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  
  getMy: async (params?: { status?: string; limit?: number }) => {
    const response = await api.get('/waste/my', { params });
    return response.data;
  },
  
  getDetail: async (wasteId: string) => {
    const response = await api.get(`/waste/${wasteId}`);
    return response.data;
  },
  
  getAISuggestion: async (formData: FormData) => {
    const response = await api.post('/waste/ai-suggest', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

// Points API
export const pointsAPI = {
  getMy: async () => {
    const response = await api.get('/points/my');
    return response.data;
  },
  
  getHistory: async (limit?: number) => {
    const response = await api.get('/points/history', { params: { limit } });
    return response.data;
  },
  
  getBreakdown: async () => {
    const response = await api.get('/points/breakdown');
    return response.data;
  },
  
  getLeaderboard: async (limit?: number) => {
    const response = await api.get('/points/leaderboard', { params: { limit } });
    return response.data;
  },
};

// Dashboard API
export const dashboardAPI = {
  getSchool: async (params?: { startDate?: string; endDate?: string }) => {
    const response = await api.get('/dashboard/school', { params });
    return response.data;
  },
  
  getSPPG: async (params?: { startDate?: string; endDate?: string }) => {
    const response = await api.get('/dashboard/sppg', { params });
    return response.data;
  },
  
  exportCSV: async (params?: { startDate?: string; endDate?: string }) => {
    const response = await api.get('/dashboard/export', { 
      params,
      responseType: 'blob',
    });
    return response.data;
  },
};

export default api;


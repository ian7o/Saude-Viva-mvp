import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
};

export const appointmentsService = {
  getAll: async () => {
    const response = await api.get('/appointments');
    return response.data;
  },
  getToday: async () => {
    const response = await api.get('/appointments/today');
    return response.data;
  },
  getByRange: async (startDate: string, endDate: string) => {
    const response = await api.get('/appointments/range', { params: { startDate, endDate } });
    return response.data;
  },
};

export const documentsService = {
  getAll: async () => {
    const response = await api.get('/documents');
    return response.data;
  },
  upload: async (formData: FormData) => {
    const response = await api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  download: async (id: number) => {
    const token = localStorage.getItem('token');
    const response = await api.get(`/documents/${id}/download`, {
      responseType: 'blob',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', '');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
  view: (id: number) => {
    const token = localStorage.getItem('token');
    return `http://localhost:4000/api/documents/${id}/view?token=${token}`;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/documents/${id}`);
    return response.data;
  },
};

export const patientsService = {
  getAll: async () => {
    const response = await api.get('/patients');
    return response.data;
  },
};

export default api;
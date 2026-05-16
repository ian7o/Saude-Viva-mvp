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
  download: (id: number) => {
    return `http://localhost:4000/api/documents/${id}/download`;
  },
  view: (id: number) => {
    return `http://localhost:4000/api/documents/${id}/view`;
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
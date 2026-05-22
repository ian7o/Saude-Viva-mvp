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
  getByRange: async (startDate: string, endDate: string, doctorId?: number, specialty?: string) => {
    const params: any = { startDate, endDate };
    if (doctorId) params.doctorId = doctorId;
    if (specialty) params.specialty = specialty;
    const response = await api.get('/appointments/range', { params });
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
    const token = localStorage.getItem('token');
    const link = document.createElement('a');
    link.href = `http://localhost:4000/api/documents/${id}/download?token=${token}`;
//   http://localhost:4000/api/documents/2/download/?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoiYWRtaW5Ac2F1ZGV2aXZhLmNvbSIsInJvbGUiOiJkb2N0b3IiLCJpYXQiOjE3Nzg5NzI1NDIsImV4cCI6MTc3OTA1ODk0Mn0.cmkDZ8pUKeAfRKiGgL0rCCAKISH8MNTp4MEX6ZtJ4kY
    link.setAttribute('download', '');
    document.body.appendChild(link);
    link.click();
    link.remove();
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
  create: async (data: { name: string; identificationNumber: string; birthDate?: string; phone?: string; email?: string }) => {
    const response = await api.post('/patients', data);
    return response.data;
  },
  update: async (id: number, data: { name?: string; identificationNumber?: string; birthDate?: string; phone?: string; email?: string }) => {
    const response = await api.put(`/patients/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/patients/${id}`);
    return response.data;
  },
};

export const doctorsService = {
  getAll: async () => {
    const response = await api.get('/doctors');
    return response.data;
  },
};

export const messagesService = {
  getContacts: async () => {
    const response = await api.get('/messages/contacts');
    return response.data;
  },
  getHistory: async (contactId: number, contactType: string) => {
    const response = await api.get(`/messages/${contactId}/${contactType}`);
    return response.data;
  },
  send: async (data: { content: string; receiverId: number; receiverType: string }) => {
    const response = await api.post('/messages', data);
    return response.data;
  },
};

export default api;

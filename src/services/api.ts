import axios from 'axios';
import { PassportData, PassportsResponse, StatisticsData } from '../types/passport';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const passportAPI = {
  // Upload and extract passport data
  uploadAndExtract: async (file: File) => {
    const formData = new FormData();
    formData.append('passport', file);
    
    const response = await api.post('/passports/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Save verified passport data
  savePassport: async (passportData: PassportData) => {
    const response = await api.post('/passports/save', passportData);
    return response.data;
  },

  // Get all passports with pagination
  getAllPassports: async (page: number = 1, limit: number = 10): Promise<PassportsResponse> => {
    const response = await api.get(`/passports?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get passport by ID
  getPassportById: async (id: string) => {
    const response = await api.get(`/passports/${id}`);
    return response.data;
  },

  // Update passport
  updatePassport: async (id: string, passportData: Partial<PassportData>) => {
    const response = await api.put(`/passports/${id}`, passportData);
    return response.data;
  },

  // Delete passport
  deletePassport: async (id: string) => {
    const response = await api.delete(`/passports/${id}`);
    return response.data;
  },

  // Search passports
  searchPassports: async (query: string, field?: string, page: number = 1, limit: number = 10): Promise<PassportsResponse> => {
    const params = new URLSearchParams({
      query,
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (field) {
      params.append('field', field);
    }
    
    const response = await api.get(`/passports/search?${params}`);
    return response.data;
  },

  // Get statistics
  getStatistics: async (): Promise<{ success: boolean; data: StatisticsData }> => {
    const response = await api.get('/passports/statistics');
    return response.data;
  },
};

export default api;
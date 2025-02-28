import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const api = axios.create({
  baseURL: apiUrl,
});

export const getVecinos = () => api.get('/api/vecinos');
export const createVecino = (data) => api.post('/api/vecinos', data);
export const getVecinoById = (id) => api.get(`/api/vecinos/${id}`);
export const updateVecino = (id, data) => api.put(`/api/vecinos/${id}`, data);
export const deleteVecino = (id) => api.delete(`/api/vecinos/${id}`);
export const getOrdenes = () => api.get('/api/ordenes');
export const createOrden = (data) => api.post('/api/ordenes', data);
export const getOrdenById = (id) => api.get(`/api/ordenes/${id}`);
export const updateOrden = (id, data) => api.put(`/api/ordenes/${id}`, data);
export const deleteOrden = (id) => api.delete(`/api/ordenes/${id}`);
export const addVisita = (id, data) => api.post(`/api/ordenes/${id}/visitas`, data);
export const completarOrden = (id) => api.patch(`/api/ordenes/${id}/completar`);
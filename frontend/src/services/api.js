import axios from 'axios';

export const getVecinos = () => axios.get('/api/vecinos');
export const createVecino = (data) => axios.post('/api/vecinos', data);
export const getVecinoById = (id) => axios.get(`/api/vecinos/${id}`);
export const updateVecino = (id, data) => axios.put(`/api/vecinos/${id}`, data);
export const deleteVecino = (id) => axios.delete(`/api/vecinos/${id}`);

export const getOrdenes = () => axios.get('/api/ordenes');
export const createOrden = (data) => axios.post('/api/ordenes', data);
export const getOrdenById = (id) => axios.get(`/api/ordenes/${id}`);
export const updateOrden = (id, data) => axios.put(`/api/ordenes/${id}`, data);
export const deleteOrden = (id) => axios.delete(`/api/ordenes/${id}`);
export const addVisita = (id, data) => axios.post(`/api/ordenes/${id}/visitas`, data);
export const completarOrden = (id) => axios.patch(`/api/ordenes/${id}/completar`);
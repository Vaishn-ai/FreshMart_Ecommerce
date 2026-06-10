import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

export default api;

export const authAPI = {
  login: (data) => api.post('/auth/login/', data),
  register: (data) => api.post('/auth/register/', data),
};

export const productAPI = {
  list: (params) => api.get('/products/', { params }),
  categories: () => api.get('/categories/'),
};

export const cartAPI = {
  get: (uid) => api.get(`/users/${uid}/cart/`),
  add: (uid, data) => api.post(`/users/${uid}/cart/add/`, data),
  update: (uid, iid, data) =>
    api.put(`/users/${uid}/cart/items/${iid}/`, data),
  remove: (uid, iid) =>
    api.delete(`/users/${uid}/cart/items/${iid}/remove/`),
  clear: (uid) =>
    api.delete(`/users/${uid}/cart/clear/`),
};

export const orderAPI = {
  list: (uid) => api.get(`/users/${uid}/orders/`),
  create: (uid, data) =>
    api.post(`/users/${uid}/orders/create/`, data),
};

export const userAPI = {
  get: (uid) => api.get(`/users/${uid}/`),
  addresses: (uid) => api.get(`/users/${uid}/addresses/`),
  paymentMethods: (uid) =>
    api.get(`/users/${uid}/payment-methods/`),
};
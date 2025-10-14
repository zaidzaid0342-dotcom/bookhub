import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

// Request interceptor to add the token to every request
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      sessionStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const registerUser = (userData) => api.post('/auth/register', userData);
export const loginUser = (userData) => api.post('/auth/login', userData);
export const getCurrentUser = () => api.get('/auth/user');

// Book API
export const addBook = (bookData, config) => api.post('/books', bookData, config);
export const getBookById = (id) => api.get(`/books/${id}`);
export const searchBooks = (params) => api.get('/books/search', { params });
export const getAllBooksWithoutFilter = () => api.get('/books');
export const getAvailableBooks = () => api.get('/books', { params: { status: 'available' } });
export const getAllBooks = (status) => {
  if (status) {
    return api.get('/books', { params: { status } });
  }
  return api.get('/books');
};
export const makeOffer = (id, offerData) => api.post(`/books/offer/${id}`, offerData);
export const getBookOffers = (id) => api.get(`/books/offers/${id}`);
export const respondToOffer = (id, responseData) => api.put(`/books/offer/${id}`, responseData);
export const getUserOffers = () => api.get('/users/offers');

// User API
export const getUserProfile = () => api.get('/users/profile');
export const updateUserProfile = (userData) => api.put('/users/profile', userData);
export const getUserBooks = () => api.get('/users/mybooks');

// Admin API
export const getAllUsers = () => api.get('/admin/users');
export const getUserById = (id) => api.get(`/admin/users/${id}`);
export const updateUser = (id, userData) => api.put(`/admin/users/${id}`, userData);
export const deleteUser = (id) => api.delete(`/admin/users/${id}`);
export const adminGetAllBooks = () => api.get('/admin/books');
export const adminDeleteBook = (id) => api.delete(`/admin/books/${id}`);

export default api;
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://bouctou-poulet-back-mali.onrender.com/bouctou_poulet',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: false // true si tu utilises des cookies
});

export default api;

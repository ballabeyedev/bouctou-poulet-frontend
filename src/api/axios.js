import axios from 'axios';

const api = axios.create({
  baseURL: 'https://bouctou-poulet-back.onrender.com/bouctou_poulet',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: false
});

export default api;

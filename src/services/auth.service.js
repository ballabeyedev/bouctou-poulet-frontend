import api from '../api/axios';

export const login = async (data) => {
  console.log('🔑 Tentative de login avec :', data);
  try {
    const response = await api.post('/auth/login', data);
    console.log('🎉 Login réussi :', response.data);
    return response;
  } catch (err) {
    console.error('❌ Login échoué :', err.response?.status, err.response?.data);
    throw err;
  }
};

import api from '../api/axios';

export const produit = (data) => {
  return api.get('/client/liste-produit-client', data);
};

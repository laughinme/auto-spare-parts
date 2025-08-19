import { useContext } from 'react';
import { AuthContext } from './AuthContextObject.js';

export const useAuth = () => {
  return useContext(AuthContext);
};



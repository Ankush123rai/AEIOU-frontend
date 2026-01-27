import { httpClient } from './httpClient';


export const authService = {
  login: (email: string, password: string, rememberMe: boolean) => {
    
    return httpClient.post(
      '/user/login',
      { email, password, rememberMe },
      { requiresAuth: false }
    );
  },
  
  logout: () => {
    
    return Promise.resolve();
  },
  
  forgotPassword: (email: string) => {
    return httpClient.post<{ message: string }>(
      '/user/forgot-password',
      { email },
      { requiresAuth: false }
    );
  },
  
  setNewPassword: (token: string, password: string) => {
    return httpClient.put<{ message: string }>(
      '/user/set-password',
      { token, password },
    );
  }
};
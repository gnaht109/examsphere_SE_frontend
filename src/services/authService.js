const BASE_URL = 'http://localhost:8080/api';

export const authService = {
  login: async (username, password) => {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    
    const result = await response.json();
    
    if (result.code === 1000) {
      // Store the token so we stay logged in after a page refresh
      localStorage.setItem('token', result.data.token);
      return result.data;
    }
    throw new Error(result.message || 'Login failed');
  },

  logout: () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
};
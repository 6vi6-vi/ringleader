import { create } from 'zustand';

const useAuthStore = create((set) => ({
  token: localStorage.getItem('token') || null,
  role: localStorage.getItem('role') || null,
  fullName: localStorage.getItem('fullName') || null,
  isAuthenticated: !!localStorage.getItem('token'),

  login: (token, role, fullName) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('fullName', fullName);
    set({ token, role, fullName, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('fullName');
    set({ token: null, role: null, fullName: null, isAuthenticated: false });
  },
}));

export default useAuthStore;
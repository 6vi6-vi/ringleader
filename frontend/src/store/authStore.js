import { create } from 'zustand';

const useAuthStore = create((set) => ({
  token: localStorage.getItem('token') || null,
  role: localStorage.getItem('role') || null,
  fullName: localStorage.getItem('fullName') || null,
  avatarUrl: localStorage.getItem('avatarUrl') || null,
  isAuthenticated: !!localStorage.getItem('token'),

  login: (token, role, fullName, avatarUrl) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('fullName', fullName);
    if (avatarUrl) localStorage.setItem('avatarUrl', avatarUrl);
    set({ token, role, fullName, avatarUrl: avatarUrl || null, isAuthenticated: true });
  },

  setAvatar: (avatarUrl) => {
    localStorage.setItem('avatarUrl', avatarUrl);
    set({ avatarUrl });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('fullName');
    localStorage.removeItem('avatarUrl');
    set({ token: null, role: null, fullName: null, avatarUrl: null, isAuthenticated: false });
  },
}));

export default useAuthStore;
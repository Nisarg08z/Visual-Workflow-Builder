import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI, User } from '../lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await authAPI.login(email, password);
          const token = response.access_token;
          
          // Store token
          localStorage.setItem('auth-token', token);
          
          // Get user info
          const user = await authAPI.getCurrentUser();
          
          set({ 
            user, 
            token, 
            isAuthenticated: true, 
            isLoading: false 
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (userData: { name: string; email: string; password: string }) => {
        set({ isLoading: true });
        try {
          const response = await authAPI.register(userData);
          const token = response.access_token;
          
          // Store token
          localStorage.setItem('auth-token', token);
          
          // Get user info
          const user = await authAPI.getCurrentUser();
          
          set({ 
            user, 
            token, 
            isAuthenticated: true, 
            isLoading: false 
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('auth-token');
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false 
        });
      },

      updateUser: (updatedUser) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...updatedUser } });
        }
      },

      checkAuth: async () => {
        const token = localStorage.getItem('auth-token');
        if (token) {
          try {
            const user = await authAPI.getCurrentUser();
            set({ 
              user, 
              token, 
              isAuthenticated: true 
            });
          } catch (error) {
            // Token is invalid, clear it
            localStorage.removeItem('auth-token');
            set({ 
              user: null, 
              token: null, 
              isAuthenticated: false 
            });
          }
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        token: state.token,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);
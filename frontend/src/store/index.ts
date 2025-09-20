import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState, User, AuthState } from '../types';

interface AuthActions {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  setUser: (user: User | null) => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

interface AppActions extends AuthActions {
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  initializeData: () => void;
}

type Store = AppState & AppActions;

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      // Initial state
      auth: {
        user: null,
        isAuthenticated: false,
        token: null,
      },
      users: [],
      products: [],
      boms: [],
      workCenters: [],
      manufacturingOrders: [],
      workOrders: [],
      stockMoves: [],
      loading: false,
      error: null,

      // Auth actions
      login: async (email: string, password: string): Promise<boolean> => {
        set({ loading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Mock login - check against mock users
          const mockUser: User = {
            id: '1',
            email,
            firstName: 'John',
            lastName: 'Doe',
            role: email.includes('admin') ? 'Admin' : 'ManufacturingManager',
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          const mockToken = 'mock-jwt-token-' + Date.now();

          set({
            auth: {
              user: mockUser,
              isAuthenticated: true,
              token: mockToken,
            },
            loading: false,
          });

          // Initialize app data after login
          get().initializeData();
          
          return true;
        } catch (error) {
          set({ 
            loading: false, 
            error: 'Login failed. Please try again.' 
          });
          return false;
        }
      },

      logout: () => {
        set({
          auth: {
            user: null,
            isAuthenticated: false,
            token: null,
          },
          users: [],
          products: [],
          boms: [],
          workCenters: [],
          manufacturingOrders: [],
          workOrders: [],
          stockMoves: [],
        });
      },

      setUser: (user: User | null) => {
        set(state => ({
          auth: {
            ...state.auth,
            user,
          }
        }));
      },

      updateProfile: async (data: Partial<User>) => {
        const { auth } = get();
        if (auth.user) {
          const updatedUser = { ...auth.user, ...data, updatedAt: new Date() };
          set(state => ({
            auth: {
              ...state.auth,
              user: updatedUser,
            }
          }));
        }
      },

      // App actions
      setLoading: (loading: boolean) => set({ loading }),
      setError: (error: string | null) => set({ error }),

      initializeData: () => {
        // This will be populated with mock data
        // For now, just clear any existing error
        set({ error: null });
      },
    }),
    {
      name: 'trackmint-storage',
      partialize: (state) => ({ 
        auth: state.auth 
      }),
    }
  )
);

// Selectors
export const useAuth = () => useStore(state => state.auth);
export const useUser = () => useStore(state => state.auth.user);
export const useIsAuthenticated = () => useStore(state => state.auth.isAuthenticated);
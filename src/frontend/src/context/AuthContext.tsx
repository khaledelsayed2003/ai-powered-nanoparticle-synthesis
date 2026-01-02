import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { loginUser, logoutUser, setAuthHeader, getAccessToken, verifyAuthToken, getUserDetails } from '../services/authService';
import { useSnackbar } from './SnackbarContext'; // To show feedback

interface AuthContextType {
  isAuthenticated: boolean;
  user: { username: string } | null; // Simple user object for now
  loading: boolean; // Add loading state
  login: (credentials: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // Initially true
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = getAccessToken();
      if (token) {
        try {
          const verifiedUser = await verifyAuthToken(token);
          if (verifiedUser) {
            setIsAuthenticated(true);
            setUser(verifiedUser);
          } else {
            // Token invalid or expired, logout
            logoutUser();
            setIsAuthenticated(false);
            setUser(null);
          }
        } catch (error) {
          console.error('Error verifying token:', error);
          logoutUser();
          setIsAuthenticated(false);
          setUser(null);
        }
      }
      setLoading(false); // Authentication check complete
    };

    checkAuthStatus();
  }, []); // Run only once on mount

  const login = async (credentials: any) => {
    setLoading(true); // Start loading during login attempt
    try {
      await loginUser(credentials);
      const userDetails = await getUserDetails(); // Fetch user details after login
      setIsAuthenticated(true);
      setUser(userDetails); // Set the user details from the dedicated endpoint
      showSnackbar('Logged in successfully!', 'success');
    } catch (err: any) {
      showSnackbar(`Login failed: ${err.message}`, 'error');
      setIsAuthenticated(false);
      setUser(null);
      throw err;
    } finally {
      setLoading(false); // Stop loading after login attempt
    }
  };

  const logout = () => {
    logoutUser();
    setIsAuthenticated(false);
    setUser(null);
    setAuthHeader(null);
    showSnackbar('Logged out successfully.', 'info');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

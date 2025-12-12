import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // Import jwtDecode

const API_BASE_URL = 'http://localhost:8000/api'; // Assuming Django backend runs on port 8000

interface AuthTokens {
  access: string;
  refresh: string;
}

interface DecodedToken {
  user_id: number;
  username: string;
  exp: number;
  // Add other claims as needed
}

interface UserDetails {
  username: string;
  email?: string;
}

interface AuthResponse {
  tokens: AuthTokens;
  user: UserDetails;
}

export const registerUser = async (userData: any): Promise<any> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/register/`, userData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('An unknown error occurred during registration.');
  }
};

export const loginUser = async (credentials: any): Promise<AuthResponse> => {
  try {
    const response = await axios.post<AuthTokens>(`${API_BASE_URL}/token/`, credentials);
    const { access, refresh } = response.data;

    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    setAuthHeader(access); // Set header immediately after successful login

    const decodedToken: DecodedToken = jwtDecode(access);
    const user = { username: decodedToken.username || 'User' }; // Extract username from token

    return { tokens: { access, refresh }, user };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('An unknown error occurred during login.');
  }
};

export const logoutUser = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  setAuthHeader(null); // Clear header on logout
};

export const getAccessToken = (): string | null => {
  return localStorage.getItem('access_token');
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem('refresh_token');
};

export const setAuthHeader = (token: string | null) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

export const verifyAuthToken = async (token: string): Promise<UserDetails | null> => {
  try {
    // Django Simple JWT's verify endpoint expects a 'token' field
    await axios.post(`${API_BASE_URL}/token/verify/`, { token });
    setAuthHeader(token); // Set header if token is valid
    const decodedToken: DecodedToken = jwtDecode(token);
    return { username: decodedToken.username || 'User' };
  } catch (error) {
    console.error('Token verification failed:', error);
    logoutUser(); // Log out if token verification fails
    return null;
  }
};

// Interceptor to handle token refresh automatically
axios.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = getRefreshToken();
        if (refreshToken) {
          const response = await axios.post<{ access: string }>(`${API_BASE_URL}/token/refresh/`, {
            refresh: refreshToken,
          });
          const newAccessToken = response.data.access;
          localStorage.setItem('access_token', newAccessToken);
          setAuthHeader(newAccessToken);
          // Retry original request with new token
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          return axios(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        logoutUser();
        // Redirect to login page or show error, AuthContext will handle it
      }
    }
    return Promise.reject(error);
  }
);

// This initial setup should ideally be done within AuthProvider's useEffect
// const initialAccessToken = getAccessToken();
// if (initialAccessToken) {
//   setAuthHeader(initialAccessToken);
// }

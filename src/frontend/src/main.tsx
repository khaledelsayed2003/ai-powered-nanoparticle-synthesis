import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'; // Import Navigate
import App from './App.tsx';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import UploadPage from './pages/UploadPage';
import HistoryPage from './pages/HistoryPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { PredictionProvider } from './context/PredictionContext';
import { SnackbarProvider } from './context/SnackbarContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute'; // Import ProtectedRoute

// Define a basic MUI theme
const theme = createTheme({
  palette: {
    mode: 'light', // Can be 'dark' or 'light'
    primary: {
      main: '#004d40', // Deep teal
      light: '#39796b',
      dark: '#00251a',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#4db6ac', // Lighter teal/cyan
      light: '#82e9de',
      dark: '#00867d',
      contrastText: '#000000',
    },
    background: {
      default: '#f4f6f8', // A very light gray, almost white
      paper: '#ffffff',
    },
    text: {
      primary: '#212121',
      secondary: '#757575',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Slightly rounded buttons
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Slightly rounded cards/papers
        },
      },
    },
  },
});

// Placeholder components for routes
// const HomePage = () => <div>Welcome to the Nanoparticle Synthesis App!</div>; // Removed HomePage
const NotFoundPage = () => <div>404 - Page Not Found</div>;


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Provides a consistent baseline to build upon. */}
      <BrowserRouter>
        <SnackbarProvider>
          <AuthProvider>
            <PredictionProvider>
              <Routes>
                <Route path="/" element={<App />}>
                  <Route index element={<Navigate to="/upload" replace />} /> {/* Redirect from root to /upload */}
                  <Route path="login" element={<LoginPage />} />
                  <Route path="register" element={<RegisterPage />} />
                  {/* Protected Routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="upload" element={<UploadPage />} />
                    <Route path="history" element={<HistoryPage />} />
                  </Route>
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Routes>
            </PredictionProvider>
          </AuthProvider>
        </SnackbarProvider>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,
);
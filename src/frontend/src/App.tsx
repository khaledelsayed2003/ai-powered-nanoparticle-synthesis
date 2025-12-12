import React, { useState, useMemo, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Container, Box, Button, LinearProgress, IconButton, CssBaseline } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { Outlet, Link } from 'react-router-dom';
import { usePrediction } from './context/PredictionContext';
import { useAuth } from './context/AuthContext'; // Import useAuth hook

function App() {
  const { loading } = usePrediction();
  const { isAuthenticated, user, logout } = useAuth(); // Get auth state and logout function
  const [mode, setMode] = useState<'light' | 'dark'>(() => {
    const savedMode = localStorage.getItem('themeMode') as 'light' | 'dark';
    return savedMode || 'light';
  });

  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
    }),
    [],
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === 'light'
            ? {
                // palette values for light mode
                primary: {
                  main: '#2e7d32', // Darker Green
                },
                secondary: {
                  main: '#66bb6a', // Lighter Green
                },
                background: {
                  default: '#f5f5f5', // Light grey background
                  paper: '#ffffff',
                },
              }
            : {
                // palette values for dark mode
                primary: {
                  main: '#66bb6a', // Lighter Green
                },
                secondary: {
                  main: '#a5d6a7', // Even lighter green
                },
                background: {
                  default: '#121212',
                  paper: '#1e1e1e',
                },
                text: {
                  primary: '#66bb6a', // Green text for dark mode
                  secondary: '#a5d6a7',
                }
              }),
        },
        typography: {
          fontFamily: 'Montserrat, sans-serif',
          h6: {
            fontWeight: 700, // Make AppBar title bolder
          }
        },
      }),
    [mode],
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              AI-Powered Nanoparticle Synthesis
            </Typography>

            <Button color="inherit" component={Link} to="/upload">
              Upload
            </Button>
            <Button color="inherit" component={Link} to="/history">
              History
            </Button>

            {isAuthenticated ? (
              <>
                <Typography variant="body1" color="inherit" sx={{ mx: 2 }}>
                  Hello, {user?.username || 'User'}
                </Typography>
                <Button color="inherit" onClick={logout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button color="inherit" component={Link} to="/login">
                  Login
                </Button>
                <Button color="inherit" component={Link} to="/register">
                  Register
                </Button>
              </>
            )}

            <IconButton sx={{ ml: 1 }} onClick={colorMode.toggleColorMode} color="inherit">
              {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Toolbar>
          {loading && <LinearProgress color="secondary" />}
        </AppBar>
        <Container component="main" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
          <Outlet />
        </Container>
        <Box component="footer" sx={{ py: 3, px: 2, mt: 'auto', backgroundColor: (theme) => theme.palette.mode === 'light' ? theme.palette.grey[200] : theme.palette.grey[800] }}>
          <Container maxWidth="sm">
            <Typography variant="body2" color="text.secondary" align="center">
              © 2025 – Biomedical & Software Engineering Departments
            </Typography>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
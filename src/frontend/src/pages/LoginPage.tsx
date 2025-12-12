import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Paper, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import useAuth hook
import { useSnackbar } from '../context/SnackbarContext'; // Import useSnackbar hook

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
  const navigate = useNavigate();
  const { login } = useAuth(); // Get login function from AuthContext
  const { showSnackbar } = useSnackbar(); // Get showSnackbar function from SnackbarContext

  const validate = () => {
    const newErrors: { username?: string; password?: string } = {};
    if (!username) newErrors.username = 'Username or email is required';
    if (!password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (validate()) {
      try {
        await login({ username, password }); // Use the login function from AuthContext
        navigate('/'); // Redirect to home or dashboard after successful login
      } catch (error: any) {
        // Errors are already handled by AuthContext and SnackbarContext
        // We can just log them here or do nothing as snackbar will show
        console.error('Login error in component:', error);
        // showSnackbar(error.message || 'Login failed', 'error'); // AuthContext already shows snackbar
      }
    }
  };

  return (
    <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400, width: '100%' }}>
        <Typography variant="h5" component="h1" align="center" gutterBottom>
          Login
        </Typography>
        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <TextField
            label="Username or Email"
            variant="outlined"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            error={!!errors.username}
            helperText={errors.username}
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!errors.password}
            helperText={errors.password}
          />
          <Button type="submit" variant="contained" color="primary" fullWidth size="large">
            Login
          </Button>
        </form>
        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
          Don't have an account?{' '}
          <Link component="button" onClick={() => navigate('/register')} variant="body2">
            Register
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default LoginPage;
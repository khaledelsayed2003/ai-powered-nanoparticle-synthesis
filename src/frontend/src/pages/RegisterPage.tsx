import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Paper, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../services/authService'; // Import registerUser service
import { useSnackbar } from '../context/SnackbarContext'; // Import useSnackbar hook

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ username?: string; email?: string; password?: string; confirmPassword?: string; nonFieldErrors?: string }>({});
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar(); // Get showSnackbar function from SnackbarContext

  const validate = () => {
    const newErrors: { username?: string; email?: string; password?: string; confirmPassword?: string } = {};
    if (!username) newErrors.username = 'Username is required';
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters long';
    if (!confirmPassword) newErrors.confirmPassword = 'Confirm Password is required';
    else if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (validate()) {
      try {
        await registerUser({ username, email, password, password2: confirmPassword });
        showSnackbar('Registration successful! Please log in.', 'success');
        navigate('/login'); // Redirect to login page after successful registration
      } catch (err: any) {
        let errorMessages: string[] = [];
        try {
          const backendErrors = JSON.parse(err.message);
          for (const key in backendErrors) {
            if (Array.isArray(backendErrors[key])) {
              backendErrors[key].forEach((msg: string) => {
                if (key === 'non_field_errors') {
                  errorMessages.push(msg);
                } else {
                  // Set field-specific errors if available
                  setErrors(prev => ({ ...prev, [key]: msg }));
                }
              });
            }
          }
          if (backendErrors.non_field_errors) {
            setErrors(prev => ({ ...prev, nonFieldErrors: backendErrors.non_field_errors.join(', ') }));
          }
        } catch (parseError) {
          errorMessages.push('An unexpected error occurred during registration.');
        }
        
        if (errorMessages.length > 0) {
          showSnackbar(`Registration failed: ${errorMessages.join(' ')}`, 'error');
        } else if (err.message) {
           showSnackbar(`Registration failed: ${err.message}`, 'error');
        } else {
           showSnackbar('An unknown error occurred during registration.', 'error');
        }
        console.error('Registration error in component:', err);
      }
    }
  };

  return (
    <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400, width: '100%' }}>
        <Typography variant="h5" component="h1" align="center" gutterBottom>
          Register
        </Typography>
        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {errors.nonFieldErrors && (
            <Typography color="error" align="center">
              {errors.nonFieldErrors}
            </Typography>
          )}
          <TextField
            label="Username"
            variant="outlined"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            error={!!errors.username}
            helperText={errors.username}
          />
          <TextField
            label="Email"
            type="email"
            variant="outlined"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!errors.email}
            helperText={errors.email}
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
          <TextField
            label="Confirm Password"
            type="password"
            variant="outlined"
            fullWidth
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
          />
          <Button type="submit" variant="contained" color="primary" fullWidth size="large">
            Register
          </Button>
        </form>
        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
          Already have an account?{' '}
          <Link component="button" onClick={() => navigate('/login')} variant="body2">
            Login
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default RegisterPage;
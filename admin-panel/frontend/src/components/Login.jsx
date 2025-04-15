import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Paper, 
  Typography, 
  Container,
  CircularProgress,
  Alert
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { login } from '../services/auth';

function Login({ onLoginSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await login();
      
      if (result.success) {
        onLoginSuccess();
      } else {
        setError(result.error || 'Authentication failed');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h4" gutterBottom>
            Admin Panel
          </Typography>
          
          <Typography variant="subtitle1" gutterBottom sx={{ mb: 3 }}>
            Enterprise Device Management System
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 3 }}>
              {error}
            </Alert>
          )}

          <Button
            variant="contained"
            color="primary"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <GoogleIcon />}
            onClick={handleGoogleLogin}
            disabled={loading}
            fullWidth
            sx={{ mt: 2 }}
          >
            {loading ? 'Signing in...' : 'Sign in with Google'}
          </Button>
        </Paper>
      </Box>
    </Container>
  );
}

export default Login;
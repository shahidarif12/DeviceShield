import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Paper, 
  Typography, 
  Container,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { login } from '../services/auth';

function Login({ onLoginSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDevOption, setShowDevOption] = useState(false);

  // Check if we're in development mode
  useEffect(() => {
    setShowDevOption(import.meta.env.DEV === true);
  }, []);

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

  const handleDevLogin = () => {
    // Skip Firebase and directly call the success handler for development
    localStorage.setItem('auth_token', 'dev-mode-token-123456');
    onLoginSuccess();
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
          <AdminPanelSettingsIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
          
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
          
          {showDevOption && (
            <>
              <Divider sx={{ width: '100%', my: 3 }}>
                <Typography variant="caption" color="text.secondary">
                  DEVELOPMENT ONLY
                </Typography>
              </Divider>
              
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<LockOpenIcon />}
                onClick={handleDevLogin}
                fullWidth
              >
                Development Login (Skip Auth)
              </Button>
              
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                For local development only. Not available in production.
              </Typography>
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
}

export default Login;
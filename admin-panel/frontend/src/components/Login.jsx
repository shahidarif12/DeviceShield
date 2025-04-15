import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, TextField, Typography, Paper, Grid, Divider } from '@mui/material';
import { signInWithGoogle, signInWithEmail } from '../firebase/auth';
import { authAPI } from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // First try with firebase (if configured)
      try {
        const { user } = await signInWithEmail(email, password);
        
        // If in development mode, we'll get a special flag
        if (user.developmentMode) {
          // Store mock token in localStorage
          localStorage.setItem('auth_token', `dev-token-${Math.random().toString(36).substring(2)}`);
          navigate('/');
          return;
        }
        
        // Get the ID token from Firebase
        const idToken = await user.getIdToken();
        
        // Send this token to our backend
        const { access_token } = await authAPI.loginWithFirebase(idToken);
        
        // Store JWT token in localStorage
        localStorage.setItem('auth_token', access_token);
        
        // Redirect to dashboard
        navigate('/');
      } catch (firebaseError) {
        // If Firebase fails (or not configured), try with direct API login
        console.log('Firebase auth failed, trying API login:', firebaseError);
        
        const { access_token } = await authAPI.login(email, password);
        localStorage.setItem('auth_token', access_token);
        navigate('/');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.detail || err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      
      const { user, developmentMode } = await signInWithGoogle();
      
      // If in development mode, we'll get a special flag
      if (developmentMode) {
        // Store mock token in localStorage
        localStorage.setItem('auth_token', `dev-token-${Math.random().toString(36).substring(2)}`);
        navigate('/');
        return;
      }
      
      // Get the ID token from Firebase
      const idToken = await user.getIdToken();
      
      // Send this token to our backend
      const { access_token } = await authAPI.loginWithFirebase(idToken);
      
      // Store JWT token in localStorage
      localStorage.setItem('auth_token', access_token);
      
      // Redirect to dashboard
      navigate('/');
    } catch (err) {
      console.error('Google login error:', err);
      setError(err.message || 'Google authentication failed');
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
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Device Management Admin
          </Typography>
          
          <Box component="form" onSubmit={handleEmailLogin} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            
            {error && (
              <Typography color="error" sx={{ mt: 2 }}>
                {error}
              </Typography>
            )}
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              Sign In
            </Button>
            
            <Divider sx={{ my: 2 }}>or</Divider>
            
            <Button
              fullWidth
              variant="outlined"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              Sign In with Google
            </Button>
            
            <Grid container sx={{ mt: 2 }}>
              <Grid item xs>
                <Typography variant="caption" color="text.secondary">
                  For development: Use any email with password "admin123"
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
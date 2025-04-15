import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, CircularProgress } from '@mui/material';

// Components
import Dashboard from './components/Dashboard';
import Login from './components/Login';

// Services
import { isAuthenticated, checkAuthStatus } from './services/auth';

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#03a9f4',
    },
  },
});

function App() {
  const [authChecked, setAuthChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const authStatus = await checkAuthStatus();
      setAuthenticated(authStatus);
      setAuthChecked(true);
    };

    checkAuth();
  }, []);

  // Protected route wrapper
  const ProtectedRoute = ({ children }) => {
    if (!authChecked) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
          <CircularProgress />
        </Box>
      );
    }

    if (!authenticated) {
      return <Navigate to="/login" />;
    }

    return children;
  };

  if (!authChecked) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
          <CircularProgress />
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/login" 
            element={authenticated ? <Navigate to="/" /> : <Login onLoginSuccess={() => setAuthenticated(true)} />} 
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Divider, 
  Container, 
  Grid, 
  Paper, 
  Button,
  CircularProgress
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  PhoneAndroid as DevicesIcon,
  Map as MapIcon,
  History as LogsIcon,
  Code as CommandIcon,
  ExitToApp as LogoutIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon
} from '@mui/icons-material';
import { signOut } from '../firebase/auth';
import { devicesAPI, authAPI } from '../services/api';

// Placeholder for device list
const DeviceList = ({ devices, loading, onSelectDevice }) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!devices || devices.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          No devices registered yet
        </Typography>
      </Box>
    );
  }

  return (
    <List>
      {devices.map((device) => (
        <ListItem 
          button 
          key={device.id} 
          onClick={() => onSelectDevice(device)}
          sx={{
            borderLeft: '4px solid',
            borderLeftColor: device.status === 'online' ? 'success.main' : 'warning.main',
          }}
        >
          <ListItemIcon>
            <DevicesIcon color={device.status === 'online' ? 'success' : 'warning'} />
          </ListItemIcon>
          <ListItemText 
            primary={device.name || device.id} 
            secondary={`Last seen: ${new Date(device.last_seen).toLocaleString()}`} 
          />
        </ListItem>
      ))}
    </List>
  );
};

// Main Dashboard component
const Dashboard = ({ toggleDarkMode, darkMode }) => {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDevice, setSelectedDevice] = useState(null);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      localStorage.removeItem('auth_token');
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const response = await devicesAPI.getAll();
      setDevices(response);
      setError('');
    } catch (err) {
      console.error('Error fetching devices:', err);
      setError('Failed to load devices. Please try again.');
      
      // If authentication error, redirect to login
      if (err.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Verify token validity
        await authAPI.verifyToken();
      } catch (err) {
        console.error('Auth verification failed:', err);
        navigate('/login');
      }
    };

    const token = localStorage.getItem('auth_token');
    if (!token) {
      navigate('/login');
    } else {
      checkAuth();
      fetchDevices();
    }
  }, [navigate]);

  // Drawer content
  const drawerContent = (
    <Box sx={{ width: 250 }} role="presentation">
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" noWrap component="div">
          Admin Panel
        </Typography>
        <IconButton onClick={toggleDarkMode} color="inherit">
          {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
      </Box>
      <Divider />
      <List>
        <ListItem button>
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
        <ListItem button>
          <ListItemIcon>
            <DevicesIcon />
          </ListItemIcon>
          <ListItemText primary="Devices" />
        </ListItem>
        <ListItem button>
          <ListItemIcon>
            <MapIcon />
          </ListItemIcon>
          <ListItemText primary="Location Map" />
        </ListItem>
        <ListItem button>
          <ListItemIcon>
            <LogsIcon />
          </ListItemIcon>
          <ListItemText primary="Logs" />
        </ListItem>
        <ListItem button>
          <ListItemIcon>
            <CommandIcon />
          </ListItemIcon>
          <ListItemText primary="Commands" />
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem button onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={toggleDrawer}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Device Management
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer}
      >
        {drawerContent}
      </Drawer>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: '100%',
          mt: 8
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                  Device Overview
                </Typography>
                {error && (
                  <Typography color="error" sx={{ mb: 2 }}>
                    {error}
                  </Typography>
                )}
                <DeviceList 
                  devices={devices} 
                  loading={loading} 
                  onSelectDevice={(device) => setSelectedDevice(device)} 
                />
              </Paper>
            </Grid>
            
            {selectedDevice && (
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h5" component="h2" gutterBottom>
                    Selected Device: {selectedDevice.name || selectedDevice.id}
                  </Typography>
                  <Typography variant="body1">
                    Device details will be displayed here
                  </Typography>
                </Paper>
              </Grid>
            )}
            
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                  Device Management System
                </Typography>
                <Typography variant="body1">
                  The device management system is still under development. More features will be added soon.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Dashboard;
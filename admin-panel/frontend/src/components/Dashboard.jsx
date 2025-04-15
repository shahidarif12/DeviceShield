import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Drawer, 
  AppBar, 
  Toolbar, 
  Typography, 
  Divider, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  IconButton, 
  Container, 
  Paper, 
  CssBaseline,
  Avatar,
  Menu,
  MenuItem,
  Tooltip
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  ChevronLeft as ChevronLeftIcon, 
  Dashboard as DashboardIcon, 
  Devices as DevicesIcon, 
  Place as PlaceIcon, 
  ListAlt as ListAltIcon, 
  Send as SendIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { logout } from '../services/auth';
import { useNavigate } from 'react-router-dom';

// Components
import DeviceList from './DeviceList';
import DeviceDetails from './DeviceDetails';
import LocationMap from './LocationMap';
import LogViewer from './LogViewer';
import CommandCenter from './CommandCenter';

// API
import { getDevices } from '../services/api';

const drawerWidth = 240;

const AppBarStyled = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerStyled = styled(Drawer, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  '& .MuiDrawer-paper': {
    position: 'relative',
    whiteSpace: 'nowrap',
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    boxSizing: 'border-box',
    ...(!open && {
      overflowX: 'hidden',
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: theme.spacing(7),
      [theme.breakpoints.up('sm')]: {
        width: theme.spacing(9),
      },
    }),
  },
}));

const sections = [
  { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
  { id: 'devices', label: 'Devices', icon: <DevicesIcon /> },
  { id: 'location', label: 'Location Map', icon: <PlaceIcon /> },
  { id: 'logs', label: 'Log Viewer', icon: <ListAltIcon /> },
  { id: 'commands', label: 'Command Center', icon: <SendIcon /> },
];

function Dashboard() {
  const [open, setOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDevices();

    // Set up real-time updates or polling
    const interval = setInterval(fetchDevices, 30000); // Poll every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const fetchDevices = async () => {
    try {
      const data = await getDevices();
      setDevices(data);
      if (data.length > 0 && !selectedDevice) {
        setSelectedDevice(data[0]);
      } else if (selectedDevice) {
        // Update selected device with latest data
        const updatedDevice = data.find(device => device.id === selectedDevice.id);
        if (updatedDevice) {
          setSelectedDevice(updatedDevice);
        }
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const handleUserMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <Box>
            <Typography variant="h5" gutterBottom>
              Dashboard Overview
            </Typography>
            <DeviceList 
              devices={devices} 
              selectedDevice={selectedDevice} 
              onSelectDevice={setSelectedDevice} 
              loading={loading}
            />
            {selectedDevice && <DeviceDetails device={selectedDevice} />}
          </Box>
        );
      case 'devices':
        return (
          <Box>
            <Typography variant="h5" gutterBottom>
              Manage Devices
            </Typography>
            <DeviceList 
              devices={devices} 
              selectedDevice={selectedDevice} 
              onSelectDevice={setSelectedDevice} 
              loading={loading}
            />
            {selectedDevice && <DeviceDetails device={selectedDevice} />}
          </Box>
        );
      case 'location':
        return <LocationMap devices={devices} selectedDevice={selectedDevice} />;
      case 'logs':
        return <LogViewer devices={devices} selectedDevice={selectedDevice} onSelectDevice={setSelectedDevice} />;
      case 'commands':
        return <CommandCenter devices={devices} selectedDevice={selectedDevice} onSelectDevice={setSelectedDevice} />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBarStyled position="absolute" open={open}>
        <Toolbar
          sx={{
            pr: '24px', // keep right padding when drawer closed
          }}
        >
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={toggleDrawer}
            sx={{
              marginRight: '36px',
              ...(open && { display: 'none' }),
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            component="h1"
            variant="h6"
            color="inherit"
            noWrap
            sx={{ flexGrow: 1 }}
          >
            Enterprise Device Management
          </Typography>
          <Tooltip title="Account settings">
            <IconButton color="inherit" onClick={handleUserMenuOpen}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>A</Avatar>
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleUserMenuClose}
            onClick={handleUserMenuClose}
          >
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBarStyled>
      <DrawerStyled variant="permanent" open={open}>
        <Toolbar
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            px: [1],
          }}
        >
          <IconButton onClick={toggleDrawer}>
            <ChevronLeftIcon />
          </IconButton>
        </Toolbar>
        <Divider />
        <List component="nav">
          {sections.map((section) => (
            <ListItem 
              button 
              key={section.id} 
              onClick={() => setActiveSection(section.id)}
              selected={activeSection === section.id}
            >
              <ListItemIcon>
                {section.icon}
              </ListItemIcon>
              <ListItemText primary={section.label} />
            </ListItem>
          ))}
        </List>
      </DrawerStyled>
      <Box
        component="main"
        sx={{
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? theme.palette.grey[100]
              : theme.palette.grey[900],
          flexGrow: 1,
          height: '100vh',
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Toolbar />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flex: 1 }}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 200px)' }}>
            {renderSection()}
          </Paper>
        </Container>
      </Box>
    </Box>
  );
}

export default Dashboard;

import React from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Skeleton,
  Stack
} from '@mui/material';
import {
  SignalCellular4Bar as SignalIcon,
  SignalCellular0Bar as NoSignalIcon,
  Smartphone as SmartphoneIcon
} from '@mui/icons-material';

function DeviceList({ devices, selectedDevice, onSelectDevice, loading }) {
  const getStatusColor = (lastSeen) => {
    if (!lastSeen) return 'error';
    
    const lastSeenDate = new Date(lastSeen);
    const now = new Date();
    const diffMinutes = Math.floor((now - lastSeenDate) / (1000 * 60));
    
    if (diffMinutes < 5) return 'success';
    if (diffMinutes < 60) return 'warning';
    return 'error';
  };

  const getTimeAgo = (lastSeen) => {
    if (!lastSeen) return 'Never';
    
    const lastSeenDate = new Date(lastSeen);
    const now = new Date();
    const diffMinutes = Math.floor((now - lastSeenDate) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  if (loading) {
    return (
      <Box sx={{ mt: 2, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Devices
        </Typography>
        <Grid container spacing={2}>
          {[1, 2, 3].map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Skeleton variant="rectangular" height={24} width="80%" />
                  <Skeleton variant="text" sx={{ mt: 1 }} />
                  <Skeleton variant="text" sx={{ mt: 1 }} width="60%" />
                  <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                    <Skeleton variant="rectangular" width={60} height={24} />
                    <Skeleton variant="rectangular" width={60} height={24} />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (!devices || devices.length === 0) {
    return (
      <Box sx={{ mt: 2, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Devices
        </Typography>
        <Card>
          <CardContent>
            <Typography variant="body1" color="text.secondary" align="center">
              No devices registered yet
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Devices ({devices.length})
      </Typography>
      <Grid container spacing={2}>
        {devices.map((device) => (
          <Grid item xs={12} sm={6} md={4} key={device.id}>
            <Card 
              sx={{ 
                height: '100%', 
                cursor: 'pointer',
                border: selectedDevice && selectedDevice.id === device.id ? 2 : 0,
                borderColor: 'primary.main'
              }}
              onClick={() => onSelectDevice(device)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" component="div">
                    {device.name || device.model || 'Unknown Device'}
                  </Typography>
                  <SmartphoneIcon />
                </Box>
                
                <Typography color="text.secondary" sx={{ mb: 1 }}>
                  {device.model} {device.manufacturer ? `(${device.manufacturer})` : ''}
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    ID: {device.id}
                  </Typography>
                  <Typography variant="body2">
                    {device.os_version || 'Unknown OS'}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
                  <Chip 
                    icon={getStatusColor(device.last_seen) === 'success' ? <SignalIcon /> : <NoSignalIcon />}
                    label={device.last_seen ? `Last seen: ${getTimeAgo(device.last_seen)}` : 'Offline'}
                    color={getStatusColor(device.last_seen)}
                    size="small"
                  />
                  
                  <Chip 
                    label={device.battery_level !== undefined ? `${device.battery_level}%` : 'Unknown'}
                    color={
                      device.battery_level > 50 ? 'success' : 
                      device.battery_level > 20 ? 'warning' : 'error'
                    }
                    size="small"
                    variant="outlined"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default DeviceList;
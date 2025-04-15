import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Divider, 
  Grid, 
  Chip, 
  Button,
  Tabs,
  Tab
} from '@mui/material';
import { 
  Smartphone as SmartphoneIcon, 
  Battery90 as BatteryIcon,
  Storage as StorageIcon,
  Wifi as WifiIcon,
  Android as AndroidIcon
} from '@mui/icons-material';
import { sendCommand } from '../services/api';

function DeviceDetails({ device }) {
  const [activeTab, setActiveTab] = useState(0);
  const [commandLoading, setCommandLoading] = useState(false);
  
  if (!device) {
    return (
      <Box p={2}>
        <Typography variant="body1" align="center">
          Select a device to view details.
        </Typography>
      </Box>
    );
  }
  
  // Format last seen time
  const formatLastSeen = (timestamp) => {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleString();
  };
  
  // Determine if device is online
  const isDeviceOnline = () => {
    const lastSeenTime = device.lastSeen || 0;
    const currentTime = Date.now();
    const timeDifference = currentTime - lastSeenTime;
    
    // Consider device online if seen in the last 15 minutes
    return timeDifference < 15 * 60 * 1000;
  };
  
  const handleRequestLocation = async () => {
    try {
      setCommandLoading(true);
      await sendCommand(device.id, 'get_location', {});
    } catch (error) {
      console.error('Failed to send location request:', error);
    } finally {
      setCommandLoading(false);
    }
  };
  
  const handleSyncLogs = async () => {
    try {
      setCommandLoading(true);
      await sendCommand(device.id, 'sync_logs', {});
    } catch (error) {
      console.error('Failed to send sync logs command:', error);
    } finally {
      setCommandLoading(false);
    }
  };
  
  return (
    <Paper sx={{ mb: 3 }}>
      <Box p={2} bgcolor="primary.main" color="white">
        <Typography variant="h6">
          Device Details
        </Typography>
      </Box>
      <Divider />
      
      <Box p={2}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box display="flex" alignItems="center" mb={2}>
              <SmartphoneIcon fontSize="large" sx={{ mr: 2 }} />
              <Box>
                <Typography variant="h6">
                  {device.model || 'Unknown Device'}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {device.manufacturer} | {device.osVersion}
                </Typography>
              </Box>
            </Box>
            
            <Typography variant="body2" gutterBottom>
              <strong>Device ID:</strong> {device.id}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Last Seen:</strong> {formatLastSeen(device.lastSeen)}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Status:</strong> 
              <Chip 
                label={isDeviceOnline() ? 'Online' : 'Offline'} 
                color={isDeviceOnline() ? 'success' : 'default'} 
                size="small" 
                sx={{ ml: 1 }} 
              />
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box display="flex" flexDirection="column" height="100%" justifyContent="center">
              <Grid container spacing={2}>
                {device.batteryLevel !== undefined && (
                  <Grid item xs={6}>
                    <Box display="flex" alignItems="center">
                      <BatteryIcon sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        Battery: {device.batteryLevel}%
                        {device.isCharging && ' (Charging)'}
                      </Typography>
                    </Box>
                  </Grid>
                )}
                
                {device.networkType && (
                  <Grid item xs={6}>
                    <Box display="flex" alignItems="center">
                      <WifiIcon sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        Network: {device.networkType}
                      </Typography>
                    </Box>
                  </Grid>
                )}
                
                {device.osVersion && (
                  <Grid item xs={6}>
                    <Box display="flex" alignItems="center">
                      <AndroidIcon sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        Android: {device.osVersion}
                      </Typography>
                    </Box>
                  </Grid>
                )}
                
                {device.availableStorage !== undefined && (
                  <Grid item xs={6}>
                    <Box display="flex" alignItems="center">
                      <StorageIcon sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        Storage: {Math.round(device.availableStorage / 1024 / 1024)} MB free
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Box>
      
      <Divider />
      
      <Box p={2}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={1}>
          <Button 
            variant="outlined" 
            onClick={handleRequestLocation}
            disabled={commandLoading || !isDeviceOnline()}
          >
            Request Location
          </Button>
          <Button 
            variant="outlined" 
            onClick={handleSyncLogs}
            disabled={commandLoading || !isDeviceOnline()}
          >
            Sync Logs
          </Button>
        </Box>
      </Box>
      
      <Divider />
      
      <Box>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab label="Recent Activity" />
          <Tab label="Location History" />
          <Tab label="Device Info" />
        </Tabs>
        
        <Box p={2}>
          {activeTab === 0 && (
            <Box>
              <Typography variant="body2" color="textSecondary">
                Recent device activity will be displayed here.
              </Typography>
            </Box>
          )}
          
          {activeTab === 1 && (
            <Box>
              <Typography variant="body2" color="textSecondary">
                Location history will be displayed here.
              </Typography>
            </Box>
          )}
          
          {activeTab === 2 && (
            <Box>
              <Typography variant="body2" color="textSecondary">
                Detailed device information will be displayed here.
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Paper>
  );
}

export default DeviceDetails;

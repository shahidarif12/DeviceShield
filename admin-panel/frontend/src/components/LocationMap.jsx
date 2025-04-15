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
  Grid
} from '@mui/material';
import { getDeviceLocations } from '../services/api';

function LocationMap({ devices, selectedDevice }) {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('24h');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  
  useEffect(() => {
    // Load Google Maps script
    const googleMapsScript = document.createElement('script');
    googleMapsScript.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places`;
    googleMapsScript.async = true;
    googleMapsScript.defer = true;
    window.document.body.appendChild(googleMapsScript);
    
    googleMapsScript.addEventListener('load', () => {
      setMapLoaded(true);
    });
    
    return () => {
      // Clean up the script when the component unmounts
      window.document.body.removeChild(googleMapsScript);
    };
  }, []);
  
  useEffect(() => {
    if (mapLoaded && !map) {
      initializeMap();
    }
  }, [mapLoaded]);
  
  useEffect(() => {
    if (selectedDevice) {
      fetchLocations(selectedDevice.id, timeRange);
    } else if (devices && devices.length > 0) {
      fetchLocations(devices[0].id, timeRange);
    }
  }, [selectedDevice, devices, timeRange]);
  
  useEffect(() => {
    if (map && locations.length > 0) {
      updateMapMarkers();
    }
  }, [map, locations]);
  
  const initializeMap = () => {
    const mapInstance = new window.google.maps.Map(document.getElementById('map'), {
      center: { lat: 37.7749, lng: -122.4194 }, // Default center (San Francisco)
      zoom: 10,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });
    
    setMap(mapInstance);
  };
  
  const fetchLocations = async (deviceId, range) => {
    try {
      setLoading(true);
      const data = await getDeviceLocations(deviceId, range);
      setLocations(data);
    } catch (error) {
      console.error('Error fetching device locations:', error);
      setLocations([]);
    } finally {
      setLoading(false);
    }
  };
  
  const updateMapMarkers = () => {
    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    
    if (locations.length === 0) return;
    
    const newMarkers = [];
    const bounds = new window.google.maps.LatLngBounds();
    
    // Create markers for each location
    locations.forEach((location, index) => {
      const position = {
        lat: location.latitude,
        lng: location.longitude
      };
      
      bounds.extend(position);
      
      const marker = new window.google.maps.Marker({
        position,
        map,
        title: new Date(location.timestamp).toLocaleString(),
        label: index === 0 ? 'Latest' : ''
      });
      
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div>
            <h3>${selectedDevice?.model || 'Device'}</h3>
            <p>Time: ${new Date(location.timestamp).toLocaleString()}</p>
            <p>Accuracy: ${location.accuracy} meters</p>
          </div>
        `
      });
      
      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });
      
      newMarkers.push(marker);
    });
    
    // Create a path connecting the points in chronological order
    const sortedLocations = [...locations].sort((a, b) => a.timestamp - b.timestamp);
    
    const path = new window.google.maps.Polyline({
      path: sortedLocations.map(loc => ({ lat: loc.latitude, lng: loc.longitude })),
      geodesic: true,
      strokeColor: '#3f51b5',
      strokeOpacity: 1.0,
      strokeWeight: 2
    });
    
    path.setMap(map);
    newMarkers.push(path);
    
    // Adjust the map to fit all markers
    map.fitBounds(bounds);
    
    // Zoom out a bit for better context
    const listener = window.google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
      if (map.getZoom() > 16) {
        map.setZoom(16);
      }
    });
    
    setMarkers(newMarkers);
  };
  
  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };
  
  const formatDateTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString();
  };
  
  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Paper>
            <Box p={2} bgcolor="primary.main" color="white" display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">
                Location Map
              </Typography>
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
            </Box>
            <Divider />
            
            <Box height="500px" position="relative">
              {(loading || !mapLoaded) && (
                <Box 
                  position="absolute"
                  width="100%"
                  height="100%"
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  zIndex={10}
                  bgcolor="rgba(255, 255, 255, 0.7)"
                >
                  <CircularProgress />
                </Box>
              )}
              
              <div id="map" style={{ width: '100%', height: '100%' }}></div>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper>
            <Box p={2} bgcolor="primary.main" color="white">
              <Typography variant="h6">
                Location History
              </Typography>
            </Box>
            <Divider />
            
            <Box p={2} maxHeight="300px" overflow="auto">
              {loading ? (
                <Box display="flex" justifyContent="center" p={2}>
                  <CircularProgress size={24} />
                </Box>
              ) : locations.length === 0 ? (
                <Typography variant="body2" color="textSecondary" align="center">
                  No location data available for the selected device and time range.
                </Typography>
              ) : (
                <Box>
                  {locations.map((location, index) => (
                    <Box key={index} py={1} borderBottom={index < locations.length - 1 ? 1 : 0} borderColor="divider">
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                          <Typography variant="body2" color="textSecondary">
                            <strong>Time:</strong> {formatDateTime(location.timestamp)}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Typography variant="body2" color="textSecondary">
                            <strong>Coordinates:</strong> {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Typography variant="body2" color="textSecondary">
                            <strong>Accuracy:</strong> {location.accuracy} meters
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default LocationMap;

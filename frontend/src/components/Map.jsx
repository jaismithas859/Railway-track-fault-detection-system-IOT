import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import { Box, Typography, Chip, Paper, Divider, IconButton, Tooltip } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WarningIcon from '@mui/icons-material/Warning';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import LayersIcon from '@mui/icons-material/Layers';
import { ImageDisplay } from './ImageDisplay';
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import { formatCustomDateString } from './CrackList';
const createMarkerIcon = () => {
    return new Icon({
        iconUrl: markerIconPng,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
    });
};

// Custom Popup Component
const CustomPopup = ({ crack }) => (
    <Paper elevation={3} sx={{ 
        minWidth: 280,
        maxWidth: 320,
        p: 2,
        borderRadius: 2
    }}>
        <Box sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ 
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                fontSize: '1.1rem'
            }}>
                <LocationOnIcon color="primary" />
                Railway Track Crack Detected
            </Typography>
            <Chip 
                icon={<WarningIcon />}
                label={`Severity: ${crack.status.severity}`}
                color={
                    crack.status.severity === 'High' ? 'error' :
                    crack.status.severity === 'Medium' ? 'warning' : 'success'
                }
                size="small"
                sx={{ mb: 2 }}
            />
        </Box>

        {crack.img && (
            <>
                <Box sx={{ mb: 2 }}>
                    <ImageDisplay 
                        imageUrl={crack.img} 
                        width="100%" 
                        height={180}
                    />
                </Box>
                <Divider sx={{ my: 2 }} />
            </>
        )}

        <Box sx={{ 
            display: 'flex',
            flexDirection: 'column',
            gap: 1
        }}>
            <Typography variant="body2" sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1
            }}>
                <AccessTimeIcon fontSize="small" color="action" />
                {new Date(formatCustomDateString(crack.ts)).toLocaleString()}
            </Typography>
            
            <Typography variant="body2" sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1
            }}>
                <LocationOnIcon fontSize="small" color="action" />
                {`${crack.location.lat.toFixed(6)}, ${crack.location.lng.toFixed(6)}`}
            </Typography>

            {crack.status.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {crack.status.description}
                </Typography>
            )}
        </Box>
    </Paper>
);

// Map Controls Component
const MapControls = ({ onLocateMe, onChangeLayer }) => (
    <Paper sx={{
        position: 'absolute',
        top: 16,
        left: 16,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        p: 1,
        borderRadius: 1,
        bgcolor: 'rgba(255, 255, 255, 0.9)',
        boxShadow: 2
    }}>
        <Tooltip title="Find my location" placement="right">
            <IconButton onClick={onLocateMe} size="small">
                <MyLocationIcon />
            </IconButton>
        </Tooltip>
        <Tooltip title="Change map layer" placement="right">
            <IconButton onClick={onChangeLayer} size="small">
                <LayersIcon />
            </IconButton>
        </Tooltip>
    </Paper>
);

// Legend Component
const Legend = () => (
    <Paper sx={{
        position: 'absolute',
        bottom: 24,
        left: 16,
        zIndex: 1000,
        p: 1.5,
        borderRadius: 1,
        bgcolor: 'rgba(255, 255, 255, 0.9)',
        boxShadow: 2
    }}>
        <Typography variant="subtitle2" gutterBottom>
            Severity Levels
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {['High', 'Medium', 'Low'].map((severity) => (
                <Box key={severity} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                        sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            bgcolor: severity === 'High' ? 'error.main' :
                                    severity === 'Medium' ? 'warning.main' : 'success.main'
                        }}
                    />
                    <Typography variant="caption">
                        {severity}
                    </Typography>
                </Box>
            ))}
        </Box>
    </Paper>
);

// Map Center Update Component
const MapCenterUpdate = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
};

// Main Map Component
const Map = ({ crackDetections }) => {
    const [mapLayer, setMapLayer] = useState('streets');
    const defaultPosition = crackDetections?.[0]?.location 
    ? [crackDetections[0].location.lat, crackDetections[0].location.lng]
    : [12.97160, 77.59457];

    console.log('Crack Detections:', crackDetections); // Debug log


    const handleLocateMe = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                const map = document.querySelector('.leaflet-container')?._leaflet_map;
                if (map) {
                    map.setView([latitude, longitude], 15);
                }
            });
        }
    };

    const handleChangeLayer = () => {
        setMapLayer(prev => prev === 'streets' ? 'satellite' : 'streets');
    };

    return (
        <Box 
            sx={{ 
                position: 'relative',
                height: { xs: '400px', sm: '500px', md: '600px' },
                width: '100%',
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: 3,
                '& .leaflet-container': {
                    height: '100%',
                    width: '100%',
                    zIndex: 1
                },
                '& .leaflet-control-container': {
                    zIndex: 2
                }
            }}
        >
            

            <MapContainer 
                center={defaultPosition} 
                zoom={13} 
                zoomControl={false}
                style={{ height: '100%', width: '100%' }}
            >
                <ZoomControl position="bottomright" />
                
                <TileLayer
                    url={mapLayer === 'streets' 
                        ? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    }
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />

                {crackDetections.map((crack, index) => {
                    console.log('Processing crack:', crack); // Debug log
                    if (!crack.location || !crack.location.lat || !crack.location.lng) {
                        console.warn('Invalid location for crack:', crack);
                        return null;
                    }

                    return (
                    <Marker
                        key={`${crack.location.lat}-${crack.location.lng}-${crack.ts}`}
                        position={[crack.location.lat, crack.location.lng]}
                        icon={createMarkerIcon()}
                    >
                        <Popup>
                            <CustomPopup crack={crack} />
                        </Popup>
                    </Marker>
                    );
                })}
            </MapContainer>

            <MapControls 
                onLocateMe={handleLocateMe}
                onChangeLayer={handleChangeLayer}
            />
            <Legend />
        </Box>
    );
};

export default Map;
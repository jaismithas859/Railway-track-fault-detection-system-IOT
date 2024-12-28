import React, { useState, useEffect } from 'react';
import { List, ListItem, ListItemText, Paper, Typography } from '@mui/material';
import { downloadImage } from '../imageUtils';
import { Box, CircularProgress } from '@mui/material';

const ImageDisplay = ({ imageUrl }) => {
    const [localImageUrl, setLocalImageUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadImage = async () => {
            try {
                setLoading(true);
                const url = await downloadImage(imageUrl);
                if (url) {
                    setLocalImageUrl(url);
                    setError(null);
                } else {
                    setError('Failed to load image');
                }
            } catch (err) {
                setError('Error loading image');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (imageUrl) {
            loadImage();
        }

        // Cleanup function to revoke object URL
        return () => {
            if (localImageUrl) {
                URL.revokeObjectURL(localImageUrl);
            }
        };
    }, [imageUrl]);

    if (loading) {
        return (
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                width: 100,
                height: 100 
            }}>
                <CircularProgress size={24} />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ 
                width: 100, 
                height: 100, 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'grey.200',
                borderRadius: 1
            }}>
                <Typography variant="caption" color="error">
                    {error}
                </Typography>
            </Box>
        );
    }

    return (
        <Box
            component="img"
            src={localImageUrl}
            alt="Crack"
            sx={{
                width: 100,
                height: 100,
                objectFit: 'cover',
                borderRadius: 1,
                cursor: 'pointer'
            }}
            onClick={() => window.open(localImageUrl, '_blank')}
        />
    );
};
function formatCustomDateString(dateString) {
    // Extract components from the string
    const year = dateString.slice(0, 4);
    const month = dateString.slice(4, 6);
    const day = dateString.slice(6, 8);
    const hour = dateString.slice(9, 11);
    const minute = dateString.slice(11, 13);
    const second = dateString.slice(13, 15);
  
    // Format the string into a standard date-time format
    return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
  }
  
const CrackList = ({ crackDetections }) => {
    
    return (
        <Paper sx={{ p: 2, maxHeight: 300, overflow: 'auto' }}>
            <Typography variant="h6" gutterBottom>
                Recent Detections
            </Typography>
            <List>
                {crackDetections.map((crack, index) => (
                    <ListItem key={index}>
                        <ListItemText
                            primary={`Crack detected at ${new Date(formatCustomDateString(crack.ts)).toLocaleString()}`}
                            secondary={`Location: ${crack.location.lat}, ${crack.location.lng} | Severity: ${crack.status.severity}`}
                        />
                        {crack.img && (
                                    <ImageDisplay imageUrl={crack.img} />
                                )}
                    </ListItem>
                ))}
            </List>
        </Paper>
    );
};

export { CrackList, formatCustomDateString };
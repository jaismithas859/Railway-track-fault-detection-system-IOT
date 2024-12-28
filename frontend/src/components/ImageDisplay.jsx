import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { downloadImage } from '../imageUtils';

export const ImageDisplay = ({ imageUrl, width = 100, height = 100 }) => {
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
                width,
                height
            }}>
                <CircularProgress size={24} />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ 
                width, 
                height, 
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
                width,
                height,
                objectFit: 'cover',
                borderRadius: 1,
                cursor: 'pointer'
            }}
            onClick={() => window.open(localImageUrl, '_blank')}
        />
    );
};
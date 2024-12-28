import React, { useState } from 'react';
import { 
    Button, 
    Box, 
    CircularProgress, 
    Alert, 
    Card,
    CardMedia,
    CardContent,
    Typography,
    Chip
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import axios from 'axios';

const ImageUpload = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [prediction, setPrediction] = useState(null);
    const [uploadedImage, setUploadedImage] = useState(null);

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreview(URL.createObjectURL(file));
            setError(null);
            setPrediction(null);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError('Please select a file first');
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);

        setLoading(true);
        setError(null);
        setPrediction(null);

        try {
            const response = await axios.post('http://localhost:8000/api/upload', formData, {
                headers: {
                    'Content-Type': 'image/jpg',
                },
            });

            setUploadedImage(`http://localhost:8000${response.data.filepath}`);
            setPrediction({
                isCrack: response.data.is_crack,
                confidence: response.data.confidence
            });
        } catch (err) {
            setError(err.response?.data?.error || 'Error uploading file');
            console.error('Upload error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
            <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                id="image-upload-input"
                onChange={handleFileSelect}
            />
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <label htmlFor="image-upload-input">
                    <Button
                        variant="contained"
                        component="span"
                        startIcon={<CloudUploadIcon />}
                        fullWidth
                    >
                        Select Image
                    </Button>
                </label>

                {(preview || uploadedImage) && (
                    <Card sx={{ mt: 2 }}>
                        <CardMedia
                            component="img"
                            image={uploadedImage || preview}
                            alt="Preview"
                            sx={{ 
                                height: 400, 
                                objectFit: 'contain',
                                bgcolor: 'background.default' 
                            }}
                        />
                        {prediction && (
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Chip
                                        icon={prediction.isCrack ? <WarningIcon /> : <CheckCircleIcon />}
                                        label={prediction.isCrack ? 'Crack Detected' : 'No Crack Detected'}
                                        color={prediction.isCrack ? 'error' : 'success'}
                                        variant="outlined"
                                    />
                                    <Typography variant="body2" color="text.secondary">
                                        Confidence: {(prediction.confidence * 100).toFixed(2)}%
                                    </Typography>
                                </Box>
                            </CardContent>
                        )}
                    </Card>
                )}

                {selectedFile && (
                    <Typography variant="body2" color="textSecondary">
                        Selected: {selectedFile.name}
                    </Typography>
                )}

                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleUpload}
                    disabled={!selectedFile || loading}
                    sx={{ mt: 2 }}
                >
                    {loading ? <CircularProgress size={24} /> : 'Upload and Analyze'}
                </Button>

                {error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {error}
                    </Alert>
                )}
            </Box>
        </Box>
    );
};

export default ImageUpload;
import React from 'react';
import { Paper, Typography } from '@mui/material';
import ImageUpload from '../components/ImageUpload';

const Prediction = () => {
    return (
        <div className='flex flex-col items-center justify-center h-screen'>
            <Paper elevation={3} sx={{ p: 2 }}>
                            <Typography variant="h6">Crack Detection ML Model</Typography>
                            <ImageUpload />
                        </Paper>
        </div>
    );
}

export default Prediction;
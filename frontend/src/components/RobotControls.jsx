import React, { useState } from 'react';
import { Button, ButtonGroup } from '@mui/material';
import axios from 'axios';

const RobotControls = () => {
    const [isRunning, setIsRunning] = useState(false);
    const API_BASE_URL = 'http://localhost:8000'; // Updated to local Flask server

    const handleStart = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/start`);
            if (response.data.status === 'Robot started') {
                setIsRunning(true);
            }
        } catch (error) {
            console.error('Error starting robot:', error);
        }
    };

    const handleStop = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/stop`);
            if (response.data.status === 'Robot stopped') {
                setIsRunning(false);
            }
        } catch (error) {
            console.error('Error stopping robot:', error);
        }
    };

    return (
        <ButtonGroup variant="contained">
            <Button 
                color="success" 
                onClick={handleStart}
                disabled={isRunning}
            >
                Start Robot
            </Button>
            <Button 
                color="error" 
                onClick={handleStop}
                disabled={isRunning}
            >
                Stop Robot
            </Button>
        </ButtonGroup>
    );
};

export default RobotControls;
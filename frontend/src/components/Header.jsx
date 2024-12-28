import React from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';
import RobotControls from './RobotControls';
import { Button } from '@mui/material';
import { Link } from 'react-router-dom';

const Header = () => {
    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    Railway Track Crack Detection System
                </Typography>
                <Button variant="contained" color="primary">
                    <Link to="/prediction">Prediction Model</Link>
                </Button>
                <RobotControls />
            </Toolbar>
        </AppBar>
    );
};

export default Header;
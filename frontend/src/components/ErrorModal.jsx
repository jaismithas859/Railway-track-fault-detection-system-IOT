import React from 'react';
import {
    Modal,
    Box,
    Typography,
    Button,
    IconButton,
    Paper,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const ErrorModal = ({ open, onClose, message, status = 'error' }) => {
    const getIcon = () => {
        switch (status) {
            case 'success':
                return <CheckCircleOutlineIcon color="success" sx={{ fontSize: 60 }} />;
            case 'error':
                return <ErrorOutlineIcon color="error" sx={{ fontSize: 60 }} />;
            default:
                return <InfoOutlinedIcon color="info" sx={{ fontSize: 60 }} />;
        }
    };

    const getColor = () => {
        switch (status) {
            case 'success':
                return 'success';
            case 'error':
                return 'error';
            default:
                return 'info';
        }
    };

    const getTitle = () => {
        switch (status) {
            case 'success':
                return 'Success';
            case 'error':
                return 'Error Detected';
            default:
                return 'Information';
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="message-modal-title"
            aria-describedby="message-modal-description"
        >
            <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: { xs: '90%', sm: 400 },
                bgcolor: 'background.paper',
                borderRadius: 2,
                boxShadow: 24,
                p: 4,
            }}>
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                    }}
                >
                    <CloseIcon />
                </IconButton>

                <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    gap: 2
                }}>
                    {getIcon()}
                    
                    <Typography 
                        id="message-modal-title" 
                        variant="h6" 
                        component="h2"
                        textAlign="center"
                    >
                        {getTitle()}
                    </Typography>

                    <Paper 
                        elevation={0} 
                        sx={{ 
                            bgcolor: `${getColor()}.light`,
                            p: 2,
                            width: '100%',
                            borderRadius: 1
                        }}
                    >
                        <Typography 
                            id="message-modal-description" 
                            color={`${getColor()}.contrastText`}
                            textAlign="center"
                        >
                            {message}
                        </Typography>
                    </Paper>

                    <Button 
                        variant="contained" 
                        onClick={onClose}
                        color={getColor()}
                        sx={{ mt: 2 }}
                    >
                        Close
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default ErrorModal;
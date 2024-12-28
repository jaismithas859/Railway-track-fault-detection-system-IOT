import React, { useState, useEffect, useRef } from 'react';
import { Container, Grid, Paper, Box } from '@mui/material';
import Typography from '@mui/material/Typography';
import RadarSimulation from '../components/RadarSimulation';
import { io } from 'socket.io-client';
import Header from '../components/Header';
import Map from '../components/Map';
import {CrackList } from '../components/CrackList';
import ErrorModal from '../components/ErrorModal';
import LiveLogs from '../components/LiveLogs';
import { cn } from '../lib/utils';


function MainPage() {
    const [crackDetections, setCrackDetections] = useState([
        {
            location: {
                lat: 12.97160,
                lng: 77.59457
            },
            ts: new Date().toISOString(),
            status: {
                severity: 'High'
            },
            img: 'https://ibb.co/JQbq6VW'
        }
    ]);   
     const [connected, setConnected] = useState(true);
    const [log, setLog] = useState(null);
    const [modalMessage, setModalMessage] = useState(null);
    const [radarData, setRadarData] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const socketRef = useRef(null);


    const addNewDetection = (detection) => {
        setCrackDetections(prev => {
            // Check if detection already exists
            const exists = prev.some(crack => 
                crack.ts === detection.ts &&
                crack.location.lat === detection.location.lat &&
                crack.location.lng === detection.location.lng &&
                crack.img === detection.img &&
                crack.status.severity === detection.status.severity

            );

            if (!exists) {
                return [detection, ...prev];
            }
            return prev;
        });
    };

    useEffect(() => {
        socketRef.current = io('http://localhost:8000', {
            transports: ['polling', 'websocket'],
            upgrade: true
        });

        // check if the server is connected
        socketRef.current.on('connect', () => {
            console.log('Connected to server');
            setConnected(true);
            setLog({
                message: 'Connected to server',
                status: 'ok'
            });
        });

        socketRef.current.on('connected', (data) => {
            console.log('Connected to server');
            if (data.status === 'Connected'){
                setConnected(true);
                setLog({
                    message: 'Connected to raspberry pi server',
                    status: 'ok'
                });
            } else {
                setConnected(false);
                setLog({
                    message: 'Disconnected from raspberry pi server',
                    status: 'error'
                });
            }
        });
        socketRef.current.on('disconnect', () => {
            console.log('Disconnected from server');
            setConnected(false);
            setLog({
                message: 'Disconnected from server',
                status: 'error'
            });
        });
        socketRef.current.on('connect_error', () => {
            console.error('Connection error');
            setLog({
                message: 'Failed to connect to server',
                status: 'error'
            });
            setConnected(false);
        });
        socketRef.current.on('new_crack_detection', (data) => {
            console.log('Received new crack detection:', data);
            if (data.location.lat === 0 && data.location.lng === 0){
                //12.97641,77.48362 
                addNewDetection({
                    location: {
                        lat: 12.97641,
                        lng: 77.48362
                    },
                    ts: data.ts,
                    status: {
                        severity: data.status.severity
                    },
                    img: data.img
                });
            }
            else{
                addNewDetection(data);
            }
            setLog({
                message: `New crack detection: ${data.status.severity}`,
                status: 'ok'
            });
        });
        socketRef.current.on('message', (data) => {
            console.log('Received message:', data);
            if (data.message === 'place the robot on the track'){
                setModalMessage(data.message);
                setModalOpen(true);
            }
            setLog(data);
        });
        socketRef.current.on('radar_update', (data) => {
            console.log('Received radar update:', data);
            setRadarData(data);
        });

        // Cleanup on unmount
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);    

    const handleCloseModal = () => {
        setModalOpen(false);
    };

    return (
        <Box sx={{ flexGrow: 1, height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            
            <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
                <h1 className='text-3xl font-bold text-center p-5'>Dashboard</h1>
            <Box className={cn('flex flex-col border-2', connected ? 'border-green-500' : 'border-red-500', 'rounded-xl p-1')}>

                <div className='p-2'>
                    <LiveLogs log={log} status={connected} className={cn('w-full max-w-md')}/>
                </div>
                <Grid container spacing={2}>
                    <Grid item xs={8}>
                        <Paper elevation={3} sx={{ p: 2 }}>
                            <Map crackDetections={crackDetections} connected={connected} />
                        </Paper>
                    </Grid>
                    <Grid item xs={4} className='p-1 mb-10'>
                        <Paper elevation={3} sx={{ p: 2 }} className='bg-emerald-600 pb-10 mb-10'>
                            <Typography variant="h4" className='text-center p-5'>Radar Simulation</Typography>
                            <RadarSimulation data={radarData} size={300} maxDistance={100} />
                        </Paper>
                    </Grid>
                    <Grid item xs={6} className='p-5 mx-10 mb-1'>
                        <CrackList crackDetections={crackDetections} />
                    </Grid>
                    <Grid item xs={6}>
                        
                    </Grid>
                </Grid>
                </Box>

            </Container>
            
            <ErrorModal
                open={modalOpen}
                onClose={handleCloseModal}
                message={modalMessage || 'An unknown error occurred'}
                status={modalMessage?.status || 'error'}
            />
        </Box>
    );
}

export default MainPage;
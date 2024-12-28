import React from 'react';
import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

const RecentDetections = () => {
    const [detections, setDetections] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        fetch('http://localhost:8000/api/detections')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(response => {
                console.log('Raw response:', response);
                
                // Handle different possible response structures
                let detectionsArray = [];
                
                if (response?.detections?.data?.detections) {
                    // Standard structure
                    detectionsArray = response.detections.data.detections;
                } else if (response?.detections) {
                    // Alternative structure
                    detectionsArray = response.detections;
                } else if (Array.isArray(response)) {
                    // Direct array response
                    detectionsArray = response;
                }
                
                if (!Array.isArray(detectionsArray)) {
                    console.error('Could not find detections array in response:', response);
                    detectionsArray = [];
                }
                
                setDetections(detectionsArray);
            })
            .catch(error => {
                console.error('Error fetching detections:', error);
                setDetections([]);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    if (error) {
        return <div className="text-red-500">Error: {error}</div>;
    }

    return (
        <div>
            <h1 className='text-3xl font-bold text-center p-5'>Recent Detections</h1>
            {detections.length === 0 ? (
                <div className="text-center p-5">No detections found</div>
            ) : (
                detections.map((detection, index) => (
                    <TableContainer key={index} component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Location</TableCell>
                                    <TableCell>Timestamp</TableCell>
                                    <TableCell>Image</TableCell>
                                    <TableCell>Severity</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow>
                                    <TableCell>
                                        {`${detection.location.lat}, ${detection.location.lng}`}
                                    </TableCell>
                                    <TableCell>
                                        {detection.ts 
                                            ? new Date(detection.ts).toLocaleString()
                                            : 'Timestamp not available'}
                                    </TableCell>
                                    <TableCell>
                                        {detection.img 
                                            ? <img 
                                                src={`${detection.img}`} 
                                                alt="Detection" 
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'placeholder-image.jpg';
                                                }}
                                            />
                                            : 'Image not available'}
                                    </TableCell>
                                    <TableCell>
                                        {detection.status.severity || 'Severity not available'}
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                ))
            )}
        </div>
    );
};

export default RecentDetections; 
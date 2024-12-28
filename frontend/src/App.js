import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainPage from './pages/MainPage';
import Prediction from './pages/Prediction';
import RecentDetections from './pages/RecentDetections';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Prediction page */}
                <Route path="/prediction" element={<Prediction />} />
                
                {/* Main system page */}
                <Route path="/" element={<MainPage />} />

                {/* Recent detections page */}
                <Route path="/detections" element={<RecentDetections />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
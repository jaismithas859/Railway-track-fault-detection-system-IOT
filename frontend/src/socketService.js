import io from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000'; // Updated to local Flask server

class SocketService {
    socket = null;

    connect() {
        this.socket = io(SOCKET_URL, {
            transports: ['polling'],
            upgrade: false
        });

        this.socket.on('connect', () => {
            console.log('Connected to local server');
        });

        this.socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
        }
    }

    onCrackDetection(callback) {
        this.socket.on('new_crack_detection', callback);
    }

    onRadarUpdate(callback) {
        this.socket.on('radar_update', callback);
    }
}

export default new SocketService();
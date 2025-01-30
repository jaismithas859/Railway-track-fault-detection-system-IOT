from flask import Flask, jsonify, request, send_file
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import time
import socketio
import requests
from tensorflow import keras
from tensorflow.keras.preprocessing import image
from PIL import Image
import numpy as np
import os
from werkzeug.utils import secure_filename


app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": ["*"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})
pi_sio = socketio.Client(    logger=True,
    engineio_logger=True,
    reconnection=True,
    reconnection_attempts=10,
    reconnection_delay=1,
    reconnection_delay_max=5,
    randomization_factor=0.5
)
# Initialize Flask-SocketIO for browser connections
socketio = SocketIO(app, cors_allowed_origins="*")

# Initialize Socket.IO client for Raspberry Pi connection

RASPBERRY_PI_URL = 'http://192.168.186.239:5000'


IMG_HEIGHT = 299  # Xception required input size
IMG_WIDTH = 299

UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'railmodel.keras')

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
    
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 8 * 1024 * 1024  # 8MB max file size

model = keras.models.load_model(MODEL_PATH)

# Connect to Raspberry Pi
@pi_sio.event
def connect():
    print("Connected to Raspberry Pi!")

@pi_sio.event
def disconnect():
    print("Disconnected from Raspberry Pi!")

# Handle crack detection events from Raspberry Pi
@pi_sio.on('crack_detected')
def handle_crack_detection(data):
    print(f"Received crack detection from Pi: {data}")
    print(data.keys())
    print(data['img'])
    # Forward to browser clients
    socketio.emit('new_crack_detection', data)


@pi_sio.on('radar_update')
def handle_radar_update(data):
    print(f"Received radar update from Pi: {data}")
    # Forward to browser clients
    socketio.emit('radar_update', data)

@pi_sio.on('message')
def handle_message(data):
    print(f"Received message from Pi: {data}")
    # Forward to browser clients
    socketio.emit('message', data)

@pi_sio.on('test')
def handle_test(data):
    print(f"Received test from Pi: {data}")
    # Forward to browser clients
    socketio.emit('test', data)


# Routes for browser clients
@app.route('/health')
def health_check():
    return jsonify({'status': 'ok'})

@app.route('/api/start')
def start_robot():
    try:
        response = requests.post(f'{RASPBERRY_PI_URL}/api/start')
        return jsonify(response.json())
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)})

@app.route('/api/stop')
def stop_robot():
    try:
        response = requests.post(f'{RASPBERRY_PI_URL}/api/stop')
        return jsonify(response.json())
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)})

@app.route('/api/detections')
def get_detections():
    try:
        response = requests.get(f'{RASPBERRY_PI_URL}/api/get_detections')
        print(response.json())
        return jsonify(response.json())
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)})

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def predict_crack(image_path):
    try:
        # Load and preprocess the image
        img = image.load_img(image_path, target_size=(IMG_HEIGHT, IMG_WIDTH))
        img_array = image.img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0)  # Add batch dimension
        img_array = img_array / 255.0  # Normalize pixel values
        prediction = model.predict(img_array)
        print(prediction)
        if prediction[0][0] < 0.53:
            is_crack = True
            #  IMG_20201114_102417.jpg
            print("Defective")
        else:
            is_crack = False
            print("Non defective")
        return {
            'is_crack': is_crack,
            'confidence': float(prediction[0][0]),
            'status': 'success'
        }
    except Exception as e:
        return {
            'status': 'error',
            'error': str(e)
        }
    

@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Get prediction
        prediction_result = predict_crack(filepath)
        
        if prediction_result['status'] == 'success':
            return jsonify({
                'message': 'File uploaded and analyzed successfully',
                'filename': filename,
                'filepath': f'/uploads/{filename}',
                'is_crack': prediction_result['is_crack'],
                'confidence': prediction_result['confidence']
            }), 200
        else:
            return jsonify({
                'error': 'Prediction failed',
                'details': prediction_result['error']
            }), 500
    
    return jsonify({'error': 'File type not allowed'}), 400

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_file(os.path.join(app.config['UPLOAD_FOLDER'], filename))

@app.route('/proxy/image/<path:filename>')
def proxy_image(filename):
    try:
        # Clean up the filename by removing any URL components
        clean_filename = filename.split('/')[-1]  # Get the last part of the path
        
        # Remove any remaining URL parameters or fragments
        clean_filename = clean_filename.split('?')[0].split('#')[0]
        
        # Construct the clean URL for the image request
        url = f"{RASPBERRY_PI_URL}/images/detected_cracks/{clean_filename}"
        
        print(f"Requesting image from: {url}")  # Debug log
        
        # Make the GET request to the Raspberry Pi server
        response = requests.get(url, stream=True)
        
        # Check if the request was successful
        if response.status_code == 200:
            # Forward the image directly to the client
            return send_file(
                response.raw,
                mimetype=response.headers['content-type'],
                as_attachment=False
            )
        else:
            return jsonify({"error": "Failed to retrieve image"}), response.status_code
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Socket events for browser clients
@socketio.on('connect')
def handle_connect():
    print('Browser client connected')

@socketio.on('disconnect')
def handle_disconnect():
    print('Browser client disconnected')



def connect_to_raspberry_pi(max_retries=3, initial_delay=1):
    attempt = 0
    delay = initial_delay
    
    while attempt < max_retries:
        try:
            pi_sio.connect(RASPBERRY_PI_URL)
            socketio.emit('connected', {
                'status': 'Connected',
                'attempt': attempt + 1
            })
            return True
            
        except Exception as e:
            attempt += 1
            if attempt < max_retries:
                socketio.emit('connected', {
                    'status': f'Connection attempt {attempt} failed. Retrying in {delay} seconds...'
                })
                print(f"Failed attempt {attempt}: {e}. Retrying in {delay} seconds...")
                time.sleep(delay)
                delay *= 2  # Exponential backoff
            else:
                socketio.emit('connected', {
                    'status': 'Disconnected',
                    'error': str(e)
                })
                print(f"Failed to connect after {max_retries} attempts: {e}")
                return False

if __name__ == '__main__':
    # Connect to Raspberry Pi
    
    connect_to_raspberry_pi()
    
    # Start Flask server
    socketio.run(app, host='0.0.0.0', port=8000, debug=True, use_reloader=True)
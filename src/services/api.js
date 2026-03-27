import axios from 'axios';

// Replace with your local IP address for physical device testing
// Use 10.0.2.2 for Android Emulator, or localhost for Web
const BASE_URL = 'http://localhost:8000'; 

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

export default api;

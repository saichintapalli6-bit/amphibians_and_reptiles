import axios from 'axios';
import { Platform } from 'react-native';

// ─── BASE URL ────────────────────────────────────────────────────────────────
// Now our backend is live on Render! 🚀
// ─────────────────────────────────────────────────────────────────────────────
const LOCAL_DEV_IP = 'http://192.168.31.216:8000';
const LOCAL_DEV_WEB = 'http://127.0.0.1:8000';
const RENDER_URL    = 'https://amphibians-and-reptiles.onrender.com';

// ── Choose RENDER_URL for production or LOCAL_DEV_WEB for local testing 🚀 ──
export const BASE_URL = LOCAL_DEV_WEB;

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000, // 60 seconds for heavy ml predictions
  headers: {
    'Content-Type': 'application/json',
    'Accept':       'application/json',
  },
});

export default api;

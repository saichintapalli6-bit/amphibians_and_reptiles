import axios from 'axios';
import { Platform } from 'react-native';

// ─── BASE URL ────────────────────────────────────────────────────────────────
// Now our backend is live on Render! 🚀
// ─────────────────────────────────────────────────────────────────────────────
const LOCAL_DEV_URL = 'http://192.168.31.216:8000';
const RENDER_URL    = 'https://amphibians-and-reptiles.onrender.com';

// ── Choose RENDER_URL for production (Render) 🚀 ──
export const BASE_URL = RENDER_URL;

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept':       'application/json',
  },
});

export default api;

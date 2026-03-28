import axios from 'axios';
import { Platform } from 'react-native';

// ─── BASE URL ────────────────────────────────────────────────────────────────
// Now our backend is live on Railway! 🚀
// ─────────────────────────────────────────────────────────────────────────────
const RAILWAY_URL = 'https://daring-vibrancy-production-6c17.up.railway.app';

// ── Choose RAILWAY_URL to communicate with live production backend 🚀 ──
export const BASE_URL = RAILWAY_URL;

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000, // 60 seconds for heavy ml predictions
  headers: {
    'Content-Type': 'application/json',
    'Accept':       'application/json',
  },
});

export default api;

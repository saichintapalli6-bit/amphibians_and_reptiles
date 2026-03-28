import axios from 'axios';
import { Platform } from 'react-native';

// ─── BASE URL ────────────────────────────────────────────────────────────────
// Now our backend is live on Render! 🚀
// ─────────────────────────────────────────────────────────────────────────────
const RENDER_URL = 'https://amphibians-and-reptiles.onrender.com';

// ── Choose RENDER_URL to communicate with live production backend 🚀 ──
export const BASE_URL = RENDER_URL;

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000, // 60 seconds for heavy ml predictions
  headers: {
    'Content-Type': 'application/json',
    'Accept':       'application/json',
  },
});

export default api;

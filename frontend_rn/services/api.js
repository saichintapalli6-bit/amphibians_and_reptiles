import axios from 'axios';
import { Platform } from 'react-native';

// ─── BASE URL ────────────────────────────────────────────────────────────────
// Web browser (PC)  → localhost:8000
// Mobile (Expo Go, Wi-Fi) → PC's Wi-Fi IP:8000  (same router required)
// ─────────────────────────────────────────────────────────────────────────────
const PC_WIFI_IP = '192.168.31.216';   // ← PC's current Wi-Fi IP

export const BASE_URL =
  Platform.OS === 'web'
    ? 'http://localhost:8000'
    : `http://${PC_WIFI_IP}:8000`;

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept':       'application/json',
  },
});

export default api;

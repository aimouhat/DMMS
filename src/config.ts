// Get the current hostname or use the IP address
const API_HOST = window.location.hostname || '0.0.0.0';
const API_PORT = '3001';

export const API_URL = `http://${API_HOST}:${API_PORT}/api`;
export const WS_URL = `ws://${API_HOST}:${API_PORT}/ws`;
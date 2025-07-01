import axios from "axios";

// Ordered connection attempts with descriptions
const API_ENDPOINTS = [
  {
    url: "https://53a3-2402-d000-8110-24c-71a9-d44d-c3f7-3797.ngrok-free.app", // Your current WiFi IP (from ipconfig)
    label: "Primary WiFi Connection"
  },
  {
    url: "http://10.0.2.2:8000",     // Android emulator special address
    label: "Android Emulator"
  },
  {
    url: "http://localhost:8000",     // For local browser testing
    label: "Localhost"
  }
];

export const getPrediction = async () => {
  let lastError = null;

  for (const endpoint of API_ENDPOINTS) {
    try {
      console.log(`Attempting: ${endpoint.label} (${endpoint.url})`);

      const response = await axios.get(`${endpoint.url}/predict`, {
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });

      console.log(`✅ Connected to ${endpoint.label}`);
      return response.data;

    } catch (error) {
      lastError = error;
      console.warn(`❌ Failed ${endpoint.label}:`, error.message);
    }
  }

  throw new Error(
    `Cannot connect to server. Tried:\n` +
    API_ENDPOINTS.map(e => `• ${e.label} (${e.url})`).join('\n') +
    `\n\nFinal error: ${lastError?.message}`
  );
};
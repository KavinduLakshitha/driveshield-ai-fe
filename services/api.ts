import axios, { AxiosError } from "axios";

interface ApiEndpoint {
  url: string;
  label: string;
}

// interface PredictionResponse {
//   prediction?: any;
//   data?: any;
//   risk?: any;
// }

interface Location {
  latitude: number;
  longitude: number;
}

interface Weather {
  "Temperature(F)"?: number;
  "Humidity(%)"?: number;
  "Visibility(mi)"?: number;
  "Wind_Speed(mph)"?: number;
  "Precipitation(in)"?: number;
  [key: string]: any;
}

interface PredictionResponse {
  risk: string;
  weather: Weather;
  daylight_status: string;
  location: Location;
  probability: number;
  safety_tips: string[];
}

// Ordered connection attempts with descriptions
const API_ENDPOINTS: ApiEndpoint[] = [
  {
    url: "http://192.168.8.162:8000",
    label: "Ethernet Connection"
  },
  {
    url: "https://53a3-2402-d000-8110-24c-71a9-d44d-c3f7-3797.ngrok-free.app",
    label: "Primary WiFi Connection"
  },
  {
    url: "http://10.0.2.2:8000",
    label: "Android Emulator"
  },
  {
    url: "http://localhost:8000",
    label: "Localhost"
  }
];

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (error instanceof AxiosError) {
    return error.message || 'Network error occurred';
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unknown error occurred';
};

// export const getPrediction = async (): Promise<PredictionResponse> => {
//   let lastError: unknown = null;

//   for (const endpoint of API_ENDPOINTS) {
//     try {
//       console.log(`Attempting: ${endpoint.label} (${endpoint.url})`);

//       const response = await axios.get<PredictionResponse>(`${endpoint.url}/predict`, {
//         timeout: 10000,
//         headers: {
//           'Accept': 'application/json',
//           'Cache-Control': 'no-cache'
//         }
//       });

//       console.log(`✅ Connected to ${endpoint.label}`);
//       return response.data;

//     } catch (error: unknown) {
//       lastError = error;
//       const errorMessage = getErrorMessage(error);
//       console.warn(`❌ Failed ${endpoint.label}:`, errorMessage);
//     }
//   }

//   const finalErrorMessage = getErrorMessage(lastError);
//   throw new Error(
//     `Cannot connect to server. Tried:\n` +
//     API_ENDPOINTS.map(e => `• ${e.label} (${e.url})`).join('\n') +
//     `\n\nFinal error: ${finalErrorMessage}`
//   );
// };.

export const getPrediction = async (): Promise<PredictionResponse> => {
  let lastError: unknown = null;

  for (const endpoint of API_ENDPOINTS) {
    try {
      console.log(`Attempting: ${endpoint.label} (${endpoint.url})`);

      const response = await axios.get<PredictionResponse>(`${endpoint.url}/predict`, {
        timeout: 15000, // Increased timeout
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });

      console.log(`✅ Connected to ${endpoint.label}`);
      return {
        risk: response.data.risk || "",
        weather: response.data.weather || {},
        daylight_status: response.data.daylight_status || "",
        location: response.data.location || { latitude: 0, longitude: 0 },
        probability: response.data.probability || 0,
        safety_tips: response.data.safety_tips || []
      };

    } catch (error: unknown) {
      lastError = error;
      const errorMessage = getErrorMessage(error);
      console.warn(`❌ Failed ${endpoint.label}:`, errorMessage);
    }
  }

  const finalErrorMessage = getErrorMessage(lastError);
  throw new Error(
    `Cannot connect to server. Tried:\n` +
    API_ENDPOINTS.map(e => `• ${e.label} (${e.url})`).join('\n') +
    `\n\nFinal error: ${finalErrorMessage}`
  );
};
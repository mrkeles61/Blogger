// API Configuration
// For Android emulator, use: http://10.0.2.2:4000
// For iOS simulator, use: http://localhost:4000
// For physical device, use your computer's IP address: http://YOUR_IP:4000

import { Platform } from "react-native";

// Default to Android emulator address
// Change this based on your testing environment
const getApiBase = () => {
  if (__DEV__) {
    // Development mode
    if (Platform.OS === "android") {
      return "http://10.0.2.2:4000"; // Android emulator
    } else if (Platform.OS === "ios") {
      return "http://localhost:4000"; // iOS simulator
    }
  }
  // Production - replace with your production API URL
  return "http://localhost:4000";
};

export const API_BASE = getApiBase();


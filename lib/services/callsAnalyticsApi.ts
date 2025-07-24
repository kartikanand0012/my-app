import { callVolumeData, callDurationData, callOutcomeData, callStats } from "../mocks/calls-analytics";
import { apiClient } from "../api-client";
import { API_CONFIG, ENDPOINTS } from "../config";

export async function fetchCallVolumeData() {
  if (API_CONFIG.USE_MOCK_API) {
    return new Promise<typeof callVolumeData>((resolve) =>
      setTimeout(() => resolve(callVolumeData), 500)
    );
  }

  try {
    const response = await apiClient.get(ENDPOINTS.ANALYTICS.CALLS_ANALYTICS);
    return response.data?.callVolumeData || [];
  } catch (error) {
    console.error('Error fetching call volume data:', error);
    return callVolumeData.map(item => ({ ...item, isMockData: true }));
  }
}

export async function fetchCallDurationData() {
  if (API_CONFIG.USE_MOCK_API) {
    return new Promise<typeof callDurationData>((resolve) =>
      setTimeout(() => resolve(callDurationData), 500)
    );
  }

  try {
    const response = await apiClient.get(ENDPOINTS.ANALYTICS.CALLS_ANALYTICS);
    return response.data?.callDurationData || [];
  } catch (error) {
    console.error('Error fetching call duration data:', error);
    return callDurationData.map(item => ({ ...item, isMockData: true }));
  }
}

export async function fetchCallOutcomeData() {
  if (API_CONFIG.USE_MOCK_API) {
    return new Promise<typeof callOutcomeData>((resolve) =>
      setTimeout(() => resolve(callOutcomeData), 500)
    );
  }

  try {
    const response = await apiClient.get(ENDPOINTS.ANALYTICS.CALLS_ANALYTICS);
    return response.data?.callOutcomeData || [];
  } catch (error) {
    console.error('Error fetching call outcome data:', error);
    return callOutcomeData.map(item => ({ ...item, isMockData: true }));
  }
}

export async function fetchCallStats() {
  if (API_CONFIG.USE_MOCK_API) {
    return new Promise<typeof callStats>((resolve) =>
      setTimeout(() => resolve(callStats), 500)
    );
  }

  try {
    const response = await apiClient.get(ENDPOINTS.ANALYTICS.CALLS_ANALYTICS);
    return response.data?.callStats || callStats;
  } catch (error) {
    console.error('Error fetching call stats:', error);
    return { ...callStats, isMockData: true };
  }
} 
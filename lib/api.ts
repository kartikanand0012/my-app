import { dashboardData } from './mocks/dashboard';

const USE_MOCK_API = true; // Set to false to use real API

export async function fetchDashboardData() {
  if (USE_MOCK_API) {
    // Simulate network delay
    return new Promise((resolve) => setTimeout(() => resolve(dashboardData), 500));
  }
  // Replace with real API call
  // return fetch('/api/dashboard').then(res => res.json());
} 
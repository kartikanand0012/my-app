import { errorData, savedQueries, scheduledReports } from "../mocks/error-analysis-dashboard";
import { apiClient } from "../api-client";
import { API_CONFIG, ENDPOINTS } from "../config";

export async function fetchErrorData() {
  if (API_CONFIG.USE_MOCK_API) {
    return new Promise<typeof errorData>((resolve) =>
      setTimeout(() => resolve(errorData), 500)
    );
  }

  try {
    const response = await apiClient.get(ENDPOINTS.ANALYTICS.ADMIN_DASHBOARD);
    
    // Transform backend error analysis data
    const transformedData = response.data?.error_analysis?.map((item: any) => ({
      category: item.failure_category || 'Unknown',
      count: item.count || 0,
      percentage: item.percentage || 0,
      trend: 'stable' // Default trend
    })) || [];
    
    return transformedData.length > 0 ? transformedData : errorData;
  } catch (error) {
    console.error('Error fetching error data:', error);
    return errorData;
  }
}

export async function fetchSavedQueries() {
  if (API_CONFIG.USE_MOCK_API) {
    return new Promise<typeof savedQueries>((resolve) =>
      setTimeout(() => resolve(savedQueries), 500)
    );
  }

  // For now, return mock data as we don't have a saved queries endpoint
  return new Promise<typeof savedQueries>((resolve) =>
    setTimeout(() => resolve(savedQueries), 500)
  );
}

export async function fetchScheduledReports() {
  if (API_CONFIG.USE_MOCK_API) {
    return new Promise<typeof scheduledReports>((resolve) =>
      setTimeout(() => resolve(scheduledReports), 500)
    );
  }

  // For now, return mock data as we don't have a scheduled reports endpoint
  return new Promise<typeof scheduledReports>((resolve) =>
    setTimeout(() => resolve(scheduledReports), 500)
  );
} 
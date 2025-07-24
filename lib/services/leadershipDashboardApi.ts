import { mockLeadershipAgents } from "../mocks/leadership-dashboard";
import { apiClient } from "../api-client";
import { API_CONFIG, ENDPOINTS } from "../config";

export async function fetchLeadershipAgents(params?: {
  search?: string;
  team?: string;
  location?: string;
  rank_start?: number;
  rank_end?: number;
}) {
  if (API_CONFIG.USE_MOCK_API) {
    await new Promise((res) => setTimeout(res, 300));
    return mockLeadershipAgents;
  }

  try {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.team) queryParams.append('team', params.team);
    if (params?.location) queryParams.append('location', params.location);
    if (params?.rank_start) queryParams.append('rank_start', params.rank_start.toString());
    if (params?.rank_end) queryParams.append('rank_end', params.rank_end.toString());
    
    const url = `${ENDPOINTS.ANALYTICS.LEADERSHIP_DASHBOARD}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiClient.get(url);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching leadership agents:', error);
    return mockLeadershipAgents.map(agent => ({ ...agent, isMockData: true }));
  }
} 
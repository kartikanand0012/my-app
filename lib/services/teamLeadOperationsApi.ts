import { teamMembers } from "../mocks/team-lead-operations";
import { apiClient } from "../api-client";
import { API_CONFIG, ENDPOINTS } from "../config";

export async function fetchTeamMembers(params?: {
  team?: string;
  shift?: string;
  status?: string;
}) {
  if (API_CONFIG.USE_MOCK_API) {
    return new Promise<typeof teamMembers>((resolve) =>
      setTimeout(() => resolve(teamMembers), 500)
    );
  }

  try {
    const queryParams = new URLSearchParams();
    if (params?.team) queryParams.append('team', params.team);
    if (params?.shift) queryParams.append('shift', params.shift);
    if (params?.status) queryParams.append('status', params.status);
    
    const url = `${ENDPOINTS.ANALYTICS.TEAM_OPERATIONS}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiClient.get(url);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching team members:', error);
    return teamMembers.map(member => ({ ...member, isMockData: true }));
  }
} 
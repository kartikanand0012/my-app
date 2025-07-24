import { agentPerformanceLeaderboard, agentPerformanceData } from "../mocks/agent-performance";
import { apiClient } from "../api-client";
import { API_CONFIG, ENDPOINTS } from "../config";

export async function fetchAgentPerformanceLeaderboard() {
  if (API_CONFIG.USE_MOCK_API) {
    return new Promise<typeof agentPerformanceLeaderboard>((resolve) =>
      setTimeout(() => resolve(agentPerformanceLeaderboard), 500)
    );
  }

  try {
    const response = await apiClient.get(ENDPOINTS.ANALYTICS.AGENT_PERFORMANCE);
    return response.data?.leaderboard || [];
  } catch (error) {
    console.error('Error fetching agent performance leaderboard:', error);
    return agentPerformanceLeaderboard.map(item => ({ ...item, isMockData: true }));
  }
}

export async function fetchAgentPerformanceData() {
  if (API_CONFIG.USE_MOCK_API) {
    return new Promise<typeof agentPerformanceData>((resolve) =>
      setTimeout(() => resolve(agentPerformanceData), 500)
    );
  }

  try {
    const response = await apiClient.get(ENDPOINTS.ANALYTICS.AGENT_PERFORMANCE);
    return response.data?.individualData || null;
  } catch (error) {
    console.error('Error fetching agent performance data:', error);
    return { ...agentPerformanceData, isMockData: true };
  }
} 
import { agentPerformanceLeaderboard, agentPerformanceData } from "../mocks/agent-performance";

export async function fetchAgentPerformanceLeaderboard() {
  return new Promise<typeof agentPerformanceLeaderboard>((resolve) =>
    setTimeout(() => resolve(agentPerformanceLeaderboard), 500)
  );
}

export async function fetchAgentPerformanceData() {
  return new Promise<typeof agentPerformanceData>((resolve) =>
    setTimeout(() => resolve(agentPerformanceData), 500)
  );
} 
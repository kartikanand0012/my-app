import { aiFlags, agentMetrics } from "../mocks/ai-monitoring";

export async function fetchAIFlags() {
  return new Promise<typeof aiFlags>((resolve) =>
    setTimeout(() => resolve(aiFlags), 500)
  );
}

export async function fetchAgentMetrics() {
  return new Promise<typeof agentMetrics>((resolve) =>
    setTimeout(() => resolve(agentMetrics), 500)
  );
} 
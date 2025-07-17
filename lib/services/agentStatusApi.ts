import { agentStatusList } from "../mocks/agent-status";

export async function fetchAgentStatusList() {
  return new Promise<typeof agentStatusList>((resolve) =>
    setTimeout(() => resolve(agentStatusList), 500)
  );
} 
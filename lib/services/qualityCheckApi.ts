import { initialFlaggedCalls, agentNames } from "../mocks/quality-check";

export async function fetchFlaggedCalls() {
  return new Promise<typeof initialFlaggedCalls>((resolve) =>
    setTimeout(() => resolve(initialFlaggedCalls), 500)
  );
}

export async function fetchAgentNames() {
  return new Promise<typeof agentNames>((resolve) =>
    setTimeout(() => resolve(agentNames), 500)
  );
} 
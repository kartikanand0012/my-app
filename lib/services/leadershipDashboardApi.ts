import { mockLeadershipAgents } from "../mocks/leadership-dashboard";

export async function fetchLeadershipAgents() {
  await new Promise((res) => setTimeout(res, 300));
  return mockLeadershipAgents;
} 
import { teamMembers } from "../mocks/team-lead-operations";

export async function fetchTeamMembers() {
  return new Promise<typeof teamMembers>((resolve) =>
    setTimeout(() => resolve(teamMembers), 500)
  );
} 
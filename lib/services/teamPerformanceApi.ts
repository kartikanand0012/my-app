import { teamPerformanceData, monthlyTrends } from "../mocks/team-performance";

export async function fetchTeamPerformanceData() {
  return new Promise<typeof teamPerformanceData>((resolve) =>
    setTimeout(() => resolve(teamPerformanceData), 500)
  );
}

export async function fetchMonthlyTrends() {
  return new Promise<typeof monthlyTrends>((resolve) =>
    setTimeout(() => resolve(monthlyTrends), 500)
  );
} 
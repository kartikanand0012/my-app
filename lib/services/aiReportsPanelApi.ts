import { recentReports, aiInsights } from "../mocks/ai-reports-panel";

export async function fetchRecentReports() {
  return new Promise<typeof recentReports>((resolve) =>
    setTimeout(() => resolve(recentReports), 500)
  );
}

export async function fetchAIInsights() {
  return new Promise<typeof aiInsights>((resolve) =>
    setTimeout(() => resolve(aiInsights), 500)
  );
} 
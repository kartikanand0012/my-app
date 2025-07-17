import { errorData, savedQueries, scheduledReports } from "../mocks/error-analysis-dashboard";

export async function fetchErrorData() {
  return new Promise<typeof errorData>((resolve) =>
    setTimeout(() => resolve(errorData), 500)
  );
}

export async function fetchSavedQueries() {
  return new Promise<typeof savedQueries>((resolve) =>
    setTimeout(() => resolve(savedQueries), 500)
  );
}

export async function fetchScheduledReports() {
  return new Promise<typeof scheduledReports>((resolve) =>
    setTimeout(() => resolve(scheduledReports), 500)
  );
} 
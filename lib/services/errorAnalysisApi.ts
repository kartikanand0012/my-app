import { errorSolutions, weeklyErrorTrend } from "../mocks/error-analysis";

export async function fetchErrorSolutions() {
  return new Promise<typeof errorSolutions>((resolve) =>
    setTimeout(() => resolve(errorSolutions), 500)
  );
}

export async function fetchWeeklyErrorTrend() {
  return new Promise<typeof weeklyErrorTrend>((resolve) =>
    setTimeout(() => resolve(weeklyErrorTrend), 500)
  );
} 
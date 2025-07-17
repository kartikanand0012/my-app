import { testCases } from "../mocks/test-case-runner";

export async function fetchTestCases() {
  return new Promise<typeof testCases>((resolve) =>
    setTimeout(() => resolve(testCases), 500)
  );
} 
export const testCases = [
  {
    id: "TC_001",
    name: "Break Duration Detection",
    description: "Verify AI correctly identifies agents with excessive break time",
    category: "ai_detection",
    status: "pending",
    expectedResult: {
      flagGenerated: true,
      flagType: "break_duration",
      confidence: ">= 80",
      agentId: "AGT_001",
    },
  },
  // ...other test cases
]; 
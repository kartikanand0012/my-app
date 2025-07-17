
export const dashboardData = {
  stats: {
    users: 120,
    active: 87,
    errors: 3,
  },
  recentActivities: [
    { id: 1, action: "Login", user: "Alice", time: "2024-06-01T10:00:00Z" },
    { id: 2, action: "Upload", user: "Bob", time: "2024-06-01T10:05:00Z" },
  ],
  performanceData: [
    { name: "Mon", calls: 45, success: 89, errors: 3 },
    { name: "Tue", calls: 52, success: 92, errors: 2 },
    { name: "Wed", calls: 48, success: 87, errors: 4 },
    { name: "Thu", calls: 51, success: 94, errors: 1 },
    { name: "Fri", calls: 47, success: 89, errors: 3 },
  ],
  errorDistribution: [
    { name: "Document Quality", value: 35, color: "#ef4444" },
    { name: "Network Issues", value: 28, color: "#f59e0b" },
    { name: "Identity Verification", value: 22, color: "#3b82f6" },
    { name: "System Timeout", value: 15, color: "#10b981" },
  ],
  teamStats: {
    totalAgents: 25,
    activeAgents: 23,
    totalCalls: 1247,
    successRate: 91.2,
    totalErrors: 47,
    avgCallDuration: 8.5,
  },
  agentStats: {
    callsToday: 47,
    successRate: 89.4,
    errorsToday: 3,
    avgDuration: 8.2,
    rank: 4,
    activeHours: 7.5,
  },
}; 
export const agentPerformanceLeaderboard = [
  {
    rank: 1,
    id: "AGT_005",
    name: "Vikram Singh",
    avatar: "/placeholder.svg?height=32&width=32",
    score: 2450,
    successRate: 98.0,
    callsCompleted: 49,
    trend: "up",
  },
  {
    rank: 2,
    id: "AGT_002",
    name: "Priya Sharma",
    avatar: "/placeholder.svg?height=32&width=32",
    score: 2380,
    successRate: 96.2,
    callsCompleted: 52,
    trend: "up",
  },
  // ...other leaderboard entries
];

export const agentPerformanceData = {
  id: "AGT_001",
  name: "Rajesh Kumar",
  avatar: "/placeholder.svg?height=32&width=32",
  rank: 4,
  todayStats: {
    callsCompleted: 47,
    successRate: 89.4,
    errorCount: 3,
    avgCallDuration: 8.2,
    breakTime: 45,
    activeHours: 7.5,
  },
  weeklyTrend: [
    { day: "Mon", calls: 52, successRate: 91.2, errors: 2 },
    { day: "Tue", calls: 48, successRate: 87.5, errors: 4 },
    { day: "Wed", calls: 51, successRate: 92.1, errors: 1 },
    { day: "Thu", calls: 49, successRate: 88.8, errors: 3 },
    { day: "Fri", calls: 47, successRate: 89.4, errors: 3 },
  ],
  hourlyCallsData: [
    { hour: "09:00", calls: 6, loginTime: "09:00" },
    { hour: "10:00", calls: 8 },
    { hour: "11:00", calls: 7 },
    { hour: "12:00", calls: 4 },
    { hour: "13:00", calls: 3 },
    { hour: "14:00", calls: 6 },
    { hour: "15:00", calls: 8 },
    { hour: "16:00", calls: 5, logoutTime: "17:00" },
  ],
  monthlyStats: {
    totalCalls: 1247,
    avgSuccessRate: 89.8,
    totalErrors: 67,
    improvement: 2.3,
  },
}; 
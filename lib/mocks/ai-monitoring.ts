export const aiFlags = [
  {
    id: "FLAG_001",
    agentId: "AGT_001",
    agentName: "Rajesh Kumar",
    flagType: "break_duration",
    severity: "high",
    description: "Extended break duration detected: 45 minutes in last 2 hours",
    detectedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    confidence: 92,
    evidence: {
      totalBreakTime: 45,
      expectedBreakTime: 20,
      breakFrequency: 3,
      timePattern: "Frequent breaks during peak hours",
    },
    status: "active",
    autoResolved: false,
  },
  // ...other flags
];

export const agentMetrics = [
  {
    agentId: "AGT_001",
    agentName: "Rajesh Kumar",
    totalBreakTime: 45,
    callsHandled: 12,
    avgCallDuration: 8.5,
    approvalRate: 89,
    rejectionRate: 11,
    engagementScore: 72,
    lastActivity: "2024-01-15 15:45:00",
    shift: "Morning",
    status: "break",
  },
  // ...other agent metrics
]; 
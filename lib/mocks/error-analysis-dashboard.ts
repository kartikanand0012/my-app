export const errorData = [
  {
    id: "ERR_001",
    uuid: "550e8400-e29b-41d4-a716-446655440001",
    agentId: "AGT_001",
    agentName: "Rajesh Kumar",
    type: "Document Quality",
    date: "2024-01-15",
    time: "14:30",
    description: "Customer document was blurry, requested re-capture",
    videoId: "VID_001_20240115_1430",
    status: "pending",
  },
  // ...other errors
];

export const savedQueries = [
  {
    id: "Q001",
    name: "Daily Error Summary",
    query: "Generate a summary of all errors from today with agent performance impact",
    filters: { dateRange: "today", includeVideos: true },
    createdAt: "2024-01-15",
  },
  // ...other queries
];

export const scheduledReports = [
  {
    id: "SR001",
    name: "Daily Error Alert",
    queryId: "Q001",
    schedule: "daily-16:00",
    recipients: ["team-lead", "admin"],
    template: "alert",
    status: "active",
    lastRun: "2024-01-15 16:00",
    nextRun: "2024-01-16 16:00",
  },
  // ...other scheduled reports
]; 
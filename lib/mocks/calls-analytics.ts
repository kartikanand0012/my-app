export const callVolumeData = [
  { time: "09:00", calls: 45, successful: 42, failed: 3 },
  { time: "10:00", calls: 60, successful: 55, failed: 5 },
  { time: "11:00", calls: 52, successful: 48, failed: 4 },
  { time: "12:00", calls: 38, successful: 35, failed: 3 },
  { time: "13:00", calls: 70, successful: 65, failed: 5 },
  { time: "14:00", calls: 80, successful: 75, failed: 5 },
  { time: "15:00", calls: 90, successful: 85, failed: 5 },
  { time: "16:00", calls: 77, successful: 70, failed: 7 },
  { time: "17:00", calls: 66, successful: 60, failed: 6 },
  { time: "18:00", calls: 54, successful: 50, failed: 4 },
];

export const callDurationData = [
  { agent: "Agent 1", avgDuration: 8.2, calls: 47 },
  { agent: "Agent 2", avgDuration: 7.5, calls: 52 },
  { agent: "Agent 3", avgDuration: 9.1, calls: 39 },
  { agent: "Agent 4", avgDuration: 8.7, calls: 44 },
  { agent: "Agent 5", avgDuration: 7.9, calls: 50 },
  { agent: "Agent 6", avgDuration: 8.4, calls: 41 },
  { agent: "Agent 7", avgDuration: 8.0, calls: 46 },
  { agent: "Agent 8", avgDuration: 7.8, calls: 48 },
  { agent: "Agent 9", avgDuration: 9.0, calls: 43 },
  { agent: "Agent 10", avgDuration: 8.3, calls: 45 },
];

export const callOutcomeData = [
  { day: "Mon", successful: 89, failed: 11 },
  { day: "Tue", successful: 92, failed: 8 },
  { day: "Wed", successful: 95, failed: 5 },
  { day: "Thu", successful: 87, failed: 13 },
  { day: "Fri", successful: 90, failed: 10 },
  { day: "Sat", successful: 85, failed: 15 },
  { day: "Sun", successful: 80, failed: 20 },
  { day: "Next Mon", successful: 93, failed: 7 },
  { day: "Next Tue", successful: 91, failed: 9 },
  { day: "Next Wed", successful: 88, failed: 12 },
];

export const callStats = {
  totalCalls: 1247,
  successfulCalls: 1138,
  failedCalls: 109,
  avgDuration: 8.5,
  peakHour: "10:00 AM",
  successRate: 91.2,
}; 
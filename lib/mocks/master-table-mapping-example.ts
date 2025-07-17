// Example: Mapping mock data to master table headers
// Master Table Headers:
// id, session_id, is_active, session_assigned_to_agent, started_at, ended_at, recording_url, recording_path, room_id, uuid, agent_id, agent_email, is_user_active, is_agent_active, user_joined_at, agent_joined_at, latitude, longitude, city, is_location_in_india, user_ip, vkyc_code, vkyc_code_verification_status, vkyc_code_verified_at, last_action, session_end_call_reason, created_at, updated_at, recording_dms_id, priority_score, vkyc_user_session_details_id, product_flow, __is_deleted, __source_lsn, __source_timestamp, year, month, day, __data_partition, __data_offset, itc_flag, kyc_type, language, user_value_category

// --- Example 1: agentStatusList (from agent-status.ts) ---
const agentStatusList = [
  {
    id: "AGT_001", // maps to: agent_id (or id if agent is the session owner)
    name: "Rajesh Kumar", // not in master table, but could be used for display
    employeeId: "EMP001", // not in master table
    avatar: "/placeholder.svg?height=32&width=32", // not in master table
    currentStatus: "break", // could map to is_active (if 'active'/'break' logic is defined)
    shift: "morning", // not in master table
    loginTime: "09:00:00", // could map to agent_joined_at (if date included)
    totalBreakTime: 45, // not in master table
    currentBreakStart: "15:30:00", // not in master table
    callsToday: 12, // not in master table
    callsInProgress: 0, // not in master table
    avgCallDuration: 8.5, // not in master table
    approvalRate: 89, // not in master table
    rejectionRate: 11, // not in master table
    lastActivity: "15:29:45", // could map to last_action
    flagCount: 2, // not in master table
    engagementScore: 72, // not in master table
    location: "Mumbai", // maps to city
    workstation: "WS-001", // not in master table
  },
];

// --- Example 2: agentPerformanceData (from agent-performance.ts) ---
const agentPerformanceData = {
  id: "AGT_001", // maps to: agent_id
  name: "Rajesh Kumar", // not in master table
  avatar: "/placeholder.svg?height=32&width=32", // not in master table
  rank: 4, // not in master table
  todayStats: {
    callsCompleted: 47, // not in master table
    successRate: 89.4, // not in master table
    errorCount: 3, // not in master table
    avgCallDuration: 8.2, // not in master table
    breakTime: 45, // not in master table
    activeHours: 7.5, // not in master table
  },
  // ...other stats omitted for brevity
};

// --- Example 3: initialFlaggedCalls (from quality-check.ts) ---
const initialFlaggedCalls = [
  {
    callId: "VKYC_QC_001", // could map to session_id or vkyc_user_session_details_id
    agentId: "AGT_005", // maps to agent_id
    agentName: "Arjun Patel", // not in master table
    callDate: "2023-10-25", // could map to started_at or created_at
    videoUrl: "/placeholder.mp4", // could map to recording_url
    flags: [
      { type: "sop", description: "Did not state the full closing script.", timestamp: "04:15" },
      // ...
    ], // not in master table
    status: "pending_review", // not in master table
  },
];

// --- Example 4: mockLeadershipAgents (from leadership-dashboard.ts) ---
const mockLeadershipAgents = [
  {
    id: "AGT_001", // maps to agent_id
    uuid: "some-uuid-value", // maps to uuid
    name: "Rajesh Kumar", // not in master table
    email: "rajesh.kumar@vykc.co", // maps to agent_email
    avatar: "/placeholder.svg?height=64&width=64&query=Rajesh", // not in master table
    rank: 1, // not in master table
    score: 2450, // could map to priority_score
    monthlyStats: {
      totalCalls: 1400, // not in master table
      successRate: 98, // not in master table
      errorRate: 2, // not in master table
      customerRating: 4.9, // not in master table
      improvement: 5, // not in master table
    },
    team: "Alpha", // not in master table
    location: "Mumbai", // maps to city
  },
];

// --- Example 5: errorData (from error-analysis-dashboard.ts) ---
const errorData = [
  {
    id: "ERR_001", // could map to id
    uuid: "550e8400-e29b-41d4-a716-446655440001", // maps to uuid
    agentId: "AGT_001", // maps to agent_id
    agentName: "Rajesh Kumar", // not in master table
    type: "Document Quality", // not in master table
    date: "2024-01-15", // could map to started_at or created_at
    time: "14:30", // could be part of started_at
    description: "Customer document was blurry, requested re-capture", // not in master table
    videoId: "VID_001_20240115_1430", // could map to recording_dms_id
    status: "pending", // not in master table
  },
];

// --- Example 6: teamMembers (from team-lead-operations.ts) ---
const teamMembers = [
  {
    id: "AGT_001", // maps to agent_id
    uuid: "AGT-550e8400-e29b-41d4-a716-446655440001", // maps to uuid
    name: "Rajesh Kumar", // not in master table
    avatar: "/placeholder.svg?height=32&width=32", // not in master table
    status: "active", // could map to is_active
    todayErrors: 3, // not in master table
    errorTypes: ["Document Quality", "Network Issue"], // not in master table
    callsToday: 47, // not in master table
    successRate: 89.4, // not in master table
    lastError: "Document quality issue at 14:30", // not in master table
    videoRecordingId: "VID_001_20240115_1430", // could map to recording_dms_id
    shift: "Morning", // not in master table
    team: "Team A", // not in master table
  },
];

// --- Example 7: checkpoints (from checkpoint-validator.ts) ---
const checkpoints = [
  {
    id: "CP_001", // could map to id
    name: "Database Connectivity", // not in master table
    description: "Verify connection to Apache Superset and data sources", // not in master table
    category: "system", // not in master table
    status: "pending", // not in master table
    priority: "critical", // not in master table
    validationRules: [
      "Database connection established",
      "Query execution successful",
      "Data retrieval within acceptable time",
      "Connection pool healthy",
    ], // not in master table
  },
];

// --- Example 8: testCases (from test-case-runner.ts) ---
const testCases = [
  {
    id: "TC_001", // could map to id
    name: "Break Duration Detection", // not in master table
    description: "Verify AI correctly identifies agents with excessive break time", // not in master table
    category: "ai_detection", // not in master table
    status: "pending", // not in master table
    expectedResult: {
      flagGenerated: true, // not in master table
      flagType: "break_duration", // not in master table
      confidence: ">= 80", // not in master table
      agentId: "AGT_001", // maps to agent_id
    },
  },
];

// --- Example 9: callVolumeData (from calls-analytics.ts) ---
const callVolumeData = [
  { time: "09:00", calls: 45, successful: 42, failed: 3 }, // no direct mapping
];
const callDurationData = [
  { agent: "Agent 1", avgDuration: 8.2, calls: 47 }, // no direct mapping
];
const callOutcomeData = [
  { day: "Mon", successful: 89, failed: 11 }, // no direct mapping
];
const callStats = {
  totalCalls: 1247, // not in master table
  successfulCalls: 1138, // not in master table
  failedCalls: 109, // not in master table
  avgDuration: 8.5, // not in master table
  peakHour: "10:00 AM", // not in master table
  successRate: 91.2, // not in master table
};

// --- Example 10: recentReports (from ai-reports-panel.ts) ---
const recentReports = [
  {
    id: 1, // could map to id
    type: "Daily Performance", // not in master table
    recipient: "Sarah Wilson", // not in master table
    status: "sent", // not in master table
    timestamp: "2024-01-15 09:00", // could map to created_at
    summary: "Great performance today! 52 calls completed with 96.8% success rate.", // not in master table
    improvements: ["Consider reducing average call duration by 30 seconds", "Focus on document quality checks"], // not in master table
  },
];

// --- Example 11: teamPerformanceData (from team-performance.ts) ---
const teamPerformanceData = [
  { name: "Document Verification", teamAvg: 92, topPerformer: 98, benchmark: 90 }, // no direct mapping
];
const monthlyTrends = [
  { month: "Jan", calls: 3240, successRate: 91.2 }, // could map month to month
];

// --- Example 12: errorSolutions (from error-analysis.ts) ---
const errorSolutions = [
  {
    errorType: "Document Quality Issues", // not in master table
    commonCauses: ["Poor lighting", "Blurry images", "Incomplete documents"], // not in master table
    solutions: [
      "Guide customer to improve lighting conditions",
      "Request document re-capture with better focus",
      "Verify all required fields are visible",
    ], // not in master table
    preventionTips: "Use document quality checklist before proceeding", // not in master table
    successRate: 89, // not in master table
  },
];
const weeklyErrorTrend = [
  { week: "Week 1", errors: 89, resolved: 84, pending: 5 }, // no direct mapping
];

// --- Example 13: flagList (from flag-management.ts) ---
const flagList = [
  {
    id: "FLAG_001", // could map to id
    agentId: "AGT_001", // maps to agent_id
    agentName: "Rajesh Kumar", // not in master table
    flagType: "break_duration", // not in master table
    severity: "high", // not in master table
    status: "active", // could map to is_active
    description: "Extended break duration detected: 45 minutes in last 2 hours during peak time", // not in master table
    detectedAt: "2024-01-15T15:30:00Z", // could map to started_at or created_at
    confidence: 92, // not in master table
    evidence: {
      totalBreakTime: 45,
      expectedBreakTime: 20,
      breakFrequency: 3,
      timePattern: "Frequent breaks during peak hours (2-4 PM)",
      callsLost: 8,
      impactScore: 85,
    }, // not in master table
    escalated: false, // not in master table
    autoGenerated: true, // not in master table
  },
];

// --- Example 14: aiFlags and agentMetrics (from ai-monitoring.ts) ---
const aiFlags = [
  {
    id: "FLAG_001", // could map to id
    agentId: "AGT_001", // maps to agent_id
    agentName: "Rajesh Kumar", // not in master table
    flagType: "break_duration", // not in master table
    severity: "high", // not in master table
    description: "Extended break duration detected: 45 minutes in last 2 hours", // not in master table
    detectedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // could map to started_at or created_at
    confidence: 92, // not in master table
    evidence: {
      totalBreakTime: 45,
      expectedBreakTime: 20,
      breakFrequency: 3,
      timePattern: "Frequent breaks during peak hours",
    }, // not in master table
    status: "active", // could map to is_active
    autoResolved: false, // not in master table
  },
];
const agentMetrics = [
  {
    agentId: "AGT_001", // maps to agent_id
    agentName: "Rajesh Kumar", // not in master table
    totalBreakTime: 45, // not in master table
    callsHandled: 12, // not in master table
    avgCallDuration: 8.5, // not in master table
    approvalRate: 89, // not in master table
    rejectionRate: 11, // not in master table
    engagementScore: 72, // not in master table
    lastActivity: "2024-01-15 15:45:00", // could map to last_action
    shift: "Morning", // not in master table
    status: "break", // could map to is_active
  },
];

// --- Example 15: dashboardData (from dashboard.ts) ---
const dashboardData = {
  stats: {
    users: 120, // not in master table
    active: 87, // not in master table
    errors: 3, // not in master table
  },
  recentActivities: [
    { id: 1, action: "Login", user: "Alice", time: "2024-06-01T10:00:00Z" }, // could map id to id, time to created_at
  ],
  performanceData: [
    { name: "Mon", calls: 45, success: 89, errors: 3 }, // no direct mapping
  ],
  errorDistribution: [
    { name: "Document Quality", value: 35, color: "#ef4444" }, // no direct mapping
  ],
  teamStats: {
    totalAgents: 25, // not in master table
    activeAgents: 23, // not in master table
    totalCalls: 1247, // not in master table
    successRate: 91.2, // not in master table
    totalErrors: 47, // not in master table
    avgCallDuration: 8.5, // not in master table
  },
  agentStats: {
    callsToday: 47, // not in master table
    successRate: 89.4, // not in master table
    errorsToday: 3, // not in master table
    avgDuration: 8.2, // not in master table
    rank: 4, // not in master table
    activeHours: 7.5, // not in master table
  },
};

// --- Summary Table ---
// | Master Table Header         | agentStatusList | agentPerformanceData | initialFlaggedCalls | mockLeadershipAgents |
// |----------------------------|-----------------|---------------------|---------------------|---------------------|
// | id                         | id              | id                  | callId (maybe)      | id                  |
// | session_id                 |                 |                     | callId              |                     |
// | is_active                  | currentStatus   |                     |                     |                     |
// | session_assigned_to_agent  |                 |                     |                     |                     |
// | started_at                 |                 |                     | callDate            |                     |
// | ended_at                   |                 |                     |                     |                     |
// | recording_url              |                 |                     | videoUrl            |                     |
// | recording_path             |                 |                     |                     |                     |
// | room_id                    |                 |                     |                     |                     |
// | uuid                       |                 |                     |                     | uuid                |
// | agent_id                   | id              | id                  | agentId             | id                  |
// | agent_email                |                 |                     |                     | email               |
// | is_user_active             |                 |                     |                     |                     |
// | is_agent_active            |                 |                     |                     |                     |
// | user_joined_at             |                 |                     |                     |                     |
// | agent_joined_at            | loginTime       |                     |                     |                     |
// | latitude                   |                 |                     |                     |                     |
// | longitude                  |                 |                     |                     |                     |
// | city                       | location        |                     |                     | location            |
// | is_location_in_india       |                 |                     |                     |                     |
// | user_ip                    |                 |                     |                     |                     |
// | vkyc_code                  |                 |                     |                     |                     |
// | vkyc_code_verification_status|                |                     |                     |                     |
// | vkyc_code_verified_at      |                 |                     |                     |                     |
// | last_action                | lastActivity    |                     |                     |                     |
// | session_end_call_reason    |                 |                     |                     |                     |
// | created_at                 |                 |                     | callDate            |                     |
// | updated_at                 |                 |                     |                     |                     |
// | recording_dms_id           |                 |                     |                     |                     |
// | priority_score             |                 |                     |                     | score               |
// | vkyc_user_session_details_id|                |                     | callId (maybe)      |                     |
// | product_flow               |                 |                     |                     |                     |
// | __is_deleted               |                 |                     |                     |                     |
// | __source_lsn               |                 |                     |                     |                     |
// | __source_timestamp         |                 |                     |                     |                     |
// | year                       |                 |                     |                     |                     |
// | month                      |                 |                     |                     |                     |
// | day                        |                 |                     |                     |                     |
// | __data_partition           |                 |                     |                     |                     |
// | __data_offset              |                 |                     |                     |                     |
// | itc_flag                   |                 |                     |                     |                     |
// | kyc_type                   |                 |                     |                     |                     |
// | language                   |                 |                     |                     |                     |
// | user_value_category        |                 |                     |                     |                     |
//
// Fields not present in the mock data are left blank. Some fields may require transformation or additional data to fully populate the master table. 

// --- Example: Populating master table with mock data from calls-analytics.ts ---
// We'll use callVolumeData, callDurationData, callOutcomeData, and callStats to create a sample row.

const masterTableRowFromCallsAnalytics = {
  id: 1, // Not present in mock, assigned for example
  session_id: undefined, // Not present in mock
  is_active: undefined, // Not present in mock
  session_assigned_to_agent: undefined, // Not present in mock
  started_at: undefined, // Not present in mock
  ended_at: undefined, // Not present in mock
  recording_url: undefined, // Not present in mock
  recording_path: undefined, // Not present in mock
  room_id: undefined, // Not present in mock
  uuid: undefined, // Not present in mock
  agent_id: undefined, // Not present in mock
  agent_email: undefined, // Not present in mock
  is_user_active: undefined, // Not present in mock
  is_agent_active: undefined, // Not present in mock
  user_joined_at: undefined, // Not present in mock
  agent_joined_at: undefined, // Not present in mock
  latitude: undefined, // Not present in mock
  longitude: undefined, // Not present in mock
  city: undefined, // Not present in mock
  is_location_in_india: undefined, // Not present in mock
  user_ip: undefined, // Not present in mock
  vkyc_code: undefined, // Not present in mock
  vkyc_code_verification_status: undefined, // Not present in mock
  vkyc_code_verified_at: undefined, // Not present in mock
  last_action: undefined, // Not present in mock
  session_end_call_reason: undefined, // Not present in mock
  created_at: undefined, // Not present in mock
  updated_at: undefined, // Not present in mock
  recording_dms_id: undefined, // Not present in mock
  priority_score: undefined, // Not present in mock
  vkyc_user_session_details_id: undefined, // Not present in mock
  product_flow: undefined, // Not present in mock
  __is_deleted: undefined, // Not present in mock
  __source_lsn: undefined, // Not present in mock
  __source_timestamp: undefined, // Not present in mock
  year: undefined, // Not present in mock
  month: undefined, // Not present in mock
  day: undefined, // Not present in mock
  __data_partition: undefined, // Not present in mock
  __data_offset: undefined, // Not present in mock
  itc_flag: undefined, // Not present in mock
  kyc_type: undefined, // Not present in mock
  language: undefined, // Not present in mock
  user_value_category: undefined, // Not present in mock
  // Custom fields from calls-analytics mock:
  call_time: "09:00", // from callVolumeData[0].time
  calls: 45, // from callVolumeData[0].calls
  successful_calls: 42, // from callVolumeData[0].successful
  failed_calls: 3, // from callVolumeData[0].failed
  avg_call_duration: 8.2, // from callDurationData[0].avgDuration
  agent: "Agent 1", // from callDurationData[0].agent
  total_calls: 1247, // from callStats.totalCalls
  success_rate: 91.2, // from callStats.successRate
};
// Note: Most master table fields are not present in calls-analytics mock data. Only call stats and agent name/duration are available.
// You would need to join with other tables or enrich this data to fully populate a master table row. 
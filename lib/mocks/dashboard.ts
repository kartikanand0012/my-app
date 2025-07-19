export const dashboardData = {
  overview: {
    total_calls: 1250,
    successful_calls: 1125,
    failed_calls: 125,
    success_rate: 90.0,
    average_call_duration: "4m 32s",
    active_agents: 15,
    peak_hour: "14:00-15:00",
    total_sessions: 1380
  },
  quality_metrics: {
    video_quality_score: 8.7,
    audio_quality_score: 9.1,
    connection_stability: 94.2,
    document_clarity: 87.5,
    total_quality_checks: 1250,
    passed_checks: 1088,
    failed_checks: 162
  },
  agent_performance: {
    top_performers: [
      { agent_id: 107292, name: "Rajesh Kumar", calls_handled: 85, success_rate: 95.3 },
      { agent_id: 107293, name: "Priya Sharma", calls_handled: 78, success_rate: 94.9 },
      { agent_id: 107294, name: "Amit Patel", calls_handled: 82, success_rate: 92.7 }
    ],
    average_resolution_time: "3m 45s",
    customer_satisfaction: 4.6
  },
  error_analysis: {
    common_errors: [
      { type: "Connection Timeout", count: 45, percentage: 36.0 },
      { type: "Document Quality", count: 32, percentage: 25.6 },
      { type: "Audio Issues", count: 28, percentage: 22.4 },
      { type: "Authentication Failed", count: 20, percentage: 16.0 }
    ],
    total_errors: 125,
    resolved_errors: 98,
    pending_errors: 27
  },
  trends: {
    hourly_call_volume: [
      { hour: "00:00", calls: 12 },
      { hour: "01:00", calls: 8 },
      { hour: "02:00", calls: 5 },
      { hour: "03:00", calls: 3 },
      { hour: "04:00", calls: 4 },
      { hour: "05:00", calls: 7 },
      { hour: "06:00", calls: 15 },
      { hour: "07:00", calls: 28 },
      { hour: "08:00", calls: 45 },
      { hour: "09:00", calls: 67 },
      { hour: "10:00", calls: 89 },
      { hour: "11:00", calls: 102 },
      { hour: "12:00", calls: 95 },
      { hour: "13:00", calls: 88 },
      { hour: "14:00", calls: 125 },
      { hour: "15:00", calls: 118 },
      { hour: "16:00", calls: 98 },
      { hour: "17:00", calls: 75 },
      { hour: "18:00", calls: 52 },
      { hour: "19:00", calls: 38 },
      { hour: "20:00", calls: 25 },
      { hour: "21:00", calls: 18 },
      { hour: "22:00", calls: 14 },
      { hour: "23:00", calls: 10 }
    ],
    daily_success_rate: [
      { date: "Mon", rate: 89.5 },
      { date: "Tue", rate: 91.2 },
      { date: "Wed", rate: 88.7 },
      { date: "Thu", rate: 92.1 },
      { date: "Fri", rate: 90.8 },
      { date: "Sat", rate: 87.3 },
      { date: "Sun", rate: 85.9 }
    ]
  },
  isMockData: false
};
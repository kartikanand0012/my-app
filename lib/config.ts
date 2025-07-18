export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  USE_MOCK_API: process.env.NEXT_PUBLIC_USE_MOCK_API === 'true' || false,
};

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    PROFILE: '/auth/profile',
  },
  AI_AGENT: {
    QUERY: '/ai-agent/query',
    QUERY_HISTORY: '/ai-agent/query/history',
    PROMPTS: '/ai-agent/prompts',
    PROMPTS_USE: '/ai-agent/prompts',
    REPORT_GENERATE: '/ai-agent/report/generate',
    SCHEDULE: '/ai-agent/schedule',
    TEAMS_SEND: '/ai-agent/teams/send',
    TEAMS_TEST: '/ai-agent/teams/test',
    SESSION: '/ai-agent/session',
  },
  ANALYTICS: {
    AI_QUERY: '/analytics/ai-query',
    DASHBOARD_OVERVIEW: '/analytics/dashboard-overview',
    AGENT_PERFORMANCE: '/analytics/agent-performance',
    CALLS_ANALYTICS: '/analytics/calls-analytics',
    LEADERSHIP_DASHBOARD: '/analytics/leadership-dashboard',
    TEAM_OPERATIONS: '/analytics/team-operations',
    AI_MONITORING: '/analytics/ai-monitoring',
    QUALITY_CHECK: '/analytics/quality-check',
    ERROR_ANALYSIS_DASHBOARD: '/analytics/error-analysis-dashboard',
    ERROR_ANALYSIS_SOLUTIONS: '/analytics/error-analysis-solutions',
    AGENT: '/analytics/agent',
    TEAM_OVERVIEW: '/analytics/team-overview',
    ADMIN_DASHBOARD: '/analytics/admin-dashboard',
  },
  CALL_DATA: {
    UPLOAD: '/call-data/upload',
    STATS: '/call-data/stats',
  },
  QUALITY_CHECK: {
    UPLOAD: '/quality-check/upload',
    ANALYZE: '/quality-check/analyze',
    VIDEOS: '/quality-check/videos',
    FLAGGED: '/quality-check/flagged',
    STATS: '/quality-check/stats',
  },
};
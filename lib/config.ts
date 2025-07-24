export const API_CONFIG = {
  BASE_URL: 'http://localhost:3001/api',
  //BASE_URL: 'https://my-app-be-u7uh.onrender.com/api',
  USE_MOCK_API: process.env.NEXT_PUBLIC_USE_MOCK_API === 'true' || false,
};

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
    DASHBOARD_STATS: '/auth/dashboard/stats',
    AGENTS: '/auth/agents',
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
    // Agent Performance APIs
    AGENT_PROFILE: '/analytics/agent-profile',
    AGENT_WEEKLY_TREND: '/analytics/agent-weekly-trend',
    AGENT_HOURLY_CALLS: '/analytics/agent-hourly-calls',
    AGENT_MONTHLY_STATS: '/analytics/agent-monthly-stats',
    LEADERBOARD: '/analytics/leaderboard',
    ALL_AGENTS: '/analytics/all-agents',
    
    // Legacy endpoints (for backward compatibility)
    DASHBOARD_OVERVIEW: '/analytics/dashboard-overview',
    CALLS_ANALYTICS: '/analytics/calls-analytics',
    LEADERSHIP_DASHBOARD: '/analytics/leadership-dashboard',
    TEAM_OPERATIONS: '/analytics/team-operations',
    AI_MONITORING: '/analytics/ai-monitoring',
    QUALITY_CHECK: '/analytics/quality-check',
  },
  ERROR_ANALYTICS: {
    // Error Analysis APIs
    ERROR_STATS: '/error-analytics/error-stats',
    ERROR_TREND: '/error-analytics/error-trend',
    ERROR_TYPES_DISTRIBUTION: '/error-analytics/error-types-distribution',
    ERROR_DETAILS: '/error-analytics/error-details',
    ACKNOWLEDGE_ERROR: '/error-analytics/error',
    APPROVE_ERROR: '/error-analytics/error',
    
    // AI Reporting APIs
    SAVED_QUERIES: '/error-analytics/saved-queries',
    SAVE_QUERY: '/error-analytics/save-query',
    SCHEDULED_REPORTS: '/error-analytics/scheduled-reports',
    GENERATE_AI_REPORT: '/error-analytics/generate-ai-report',
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

export const AI_BACKEND_URL = process.env.NEXT_PUBLIC_AI_BACKEND_URL || 'https://ai-vkyc-backend.onrender.com';
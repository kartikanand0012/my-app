import { dashboardData } from './mocks/dashboard';
import { apiClient } from './api-client';
import { API_CONFIG, ENDPOINTS } from './config';

export async function fetchDashboardData(userRole: string) {
  if (API_CONFIG.USE_MOCK_API) {
    // Simulate network delay
    return new Promise((resolve) => setTimeout(() => resolve(dashboardData), 500));
  }
  
  try {
    const response = await apiClient.get(ENDPOINTS.ANALYTICS.DASHBOARD_OVERVIEW);
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    // Fallback to mock data with indicator
    return { ...dashboardData, isMockData: true };
  }
}

export async function executeAIQuery(query: string, useAIAgent: boolean = true) {
  if (API_CONFIG.USE_MOCK_API) {
    // Mock AI query response
    return {
      success: true,
      data: {
        query,
        sql_query: useAIAgent ? `SELECT * FROM quality_check_videos WHERE analysis_status = 'failed'` : query,
        results: [
          { session_id: 'mock-123', agent_id: 107292, status: 'failed', reason: 'Customer disconnected' },
          { session_id: 'mock-124', agent_id: 107293, status: 'failed', reason: 'Technical issue' }
        ],
        row_count: 2,
        execution_time: 150,
        success: true
      }
    };
  }

  try {
    const response = await apiClient.post(ENDPOINTS.AI_AGENT.QUERY, {
      query_text: query,
      use_ai_agent: useAIAgent,
      query_type: useAIAgent ? 'ai_natural' : 'select'
    });
    return response.data;
  } catch (error) {
    console.error('Error executing AI query:', error);
    throw error;
  }
}

export async function generateAIReport(reportType: string, parameters?: any) {
  if (API_CONFIG.USE_MOCK_API) {
    return {
      success: true,
      data: {
        report_type: reportType,
        data: [
          { error_type: 'Connection Timeout', error_count: 15, last_occurrence: new Date() },
          { error_type: 'Authentication Failed', error_count: 8, last_occurrence: new Date() }
        ],
        insights: "• Connection timeouts are the most frequent error (15 occurrences)\\n• Authentication failures suggest possible credential issues\\n• Consider implementing retry mechanisms for timeouts",
        generated_at: new Date().toISOString(),
        parameters: parameters
      }
    };
  }

  try {
    const response = await apiClient.post(ENDPOINTS.AI_AGENT.REPORT_GENERATE, {
      report_type: reportType,
      parameters: parameters || {}
    });
    return response.data;
  } catch (error) {
    console.error('Error generating AI report:', error);
    throw error;
  }
}

export async function sendTeamsNotification(message: string, channel: string, taggedUsers: string[], reportData?: any) {
  if (API_CONFIG.USE_MOCK_API) {
    return {
      success: true,
      data: {
        message: 'Mock Teams notification sent successfully',
        timestamp: new Date().toISOString()
      }
    };
  }

  try {
    const response = await apiClient.post(ENDPOINTS.AI_AGENT.TEAMS_SEND, {
      message,
      teams_channel: channel,
      tagged_users: taggedUsers,
      report_data: reportData
    });
    return response.data;
  } catch (error) {
    console.error('Error sending Teams notification:', error);
    throw error;
  }
}

export async function testTeamsConnection() {
  if (API_CONFIG.USE_MOCK_API) {
    return {
      success: true,
      data: {
        message: 'Mock Teams connection test successful',
        timestamp: new Date().toISOString()
      }
    };
  }

  try {
    const response = await apiClient.post(ENDPOINTS.AI_AGENT.TEAMS_TEST);
    return response.data;
  } catch (error) {
    console.error('Error testing Teams connection:', error);
    throw error;
  }
}

// Admin Prompts API functions
export async function getAdminPrompts(promptType?: string, category?: string) {
  if (API_CONFIG.USE_MOCK_API) {
    return {
      success: true,
      data: {
        prompts: [
          {
            id: 1,
            prompt_name: 'Daily Failed Calls Analysis',
            prompt_description: 'Analyze all failed calls for a specific date',
            prompt_template: 'Show me all failed calls on {{date}} and analyze the failure reasons',
            prompt_type: 'query',
            category: 'Quality Analysis',
            usage_count: 5,
            created_by_name: 'admin',
            created_at: new Date().toISOString()
          }
        ]
      }
    };
  }

  try {
    const params = new URLSearchParams();
    if (promptType) params.append('prompt_type', promptType);
    if (category) params.append('category', category);
    
    const url = `${ENDPOINTS.AI_AGENT.PROMPTS}${params.toString() ? '?' + params.toString() : ''}`;
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching admin prompts:', error);
    throw error;
  }
}

export async function createAdminPrompt(promptData: {
  prompt_name: string;
  prompt_description: string;
  prompt_template: string;
  prompt_type: string;
  category?: string;
}) {
  if (API_CONFIG.USE_MOCK_API) {
    return {
      success: true,
      data: {
        id: Date.now(),
        ...promptData,
        created_at: new Date().toISOString()
      }
    };
  }

  try {
    const response = await apiClient.post(ENDPOINTS.AI_AGENT.PROMPTS, promptData);
    return response.data;
  } catch (error) {
    console.error('Error creating admin prompt:', error);
    throw error;
  }
}

export async function useAdminPrompt(promptId: number, variables: Record<string, string>) {
  if (API_CONFIG.USE_MOCK_API) {
    return {
      success: true,
      data: {
        result: {
          query: 'Mock processed query',
          results: [{ id: 1, status: 'mock' }],
          row_count: 1,
          execution_time: 100
        }
      }
    };
  }

  try {
    const response = await apiClient.post(`${ENDPOINTS.AI_AGENT.PROMPTS_USE}/${promptId}/use`, {
      variables
    });
    return response.data;
  } catch (error) {
    console.error('Error using admin prompt:', error);
    throw error;
  }
}

export async function getQueryHistory(limit?: number, offset?: number) {
  if (API_CONFIG.USE_MOCK_API) {
    return {
      success: true,
      data: {
        queries: [
          {
            id: 1,
            query_text: 'Show me failed calls',
            success: true,
            execution_time: 150,
            query_type: 'ai_natural',
            created_at: new Date().toISOString()
          }
        ]
      }
    };
  }

  try {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    
    const url = `${ENDPOINTS.AI_AGENT.QUERY_HISTORY}${params.toString() ? '?' + params.toString() : ''}`;
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching query history:', error);
    throw error;
  }
}

export async function getScheduledReports() {
  if (API_CONFIG.USE_MOCK_API) {
    return {
      success: true,
      data: {
        scheduled_reports: [
          {
            id: 1,
            report_type: 'daily_summary',
            schedule_time: '09:00:00',
            schedule_days: 'daily',
            teams_channel: '#ai-reports',
            is_active: true,
            created_at: new Date().toISOString()
          }
        ]
      }
    };
  }

  try {
    const response = await apiClient.get(ENDPOINTS.AI_AGENT.SCHEDULE);
    return response.data;
  } catch (error) {
    console.error('Error fetching scheduled reports:', error);
    throw error;
  }
}

export async function createScheduledReport(reportData: {
  report_type: string;
  schedule_time: string;
  schedule_days: string;
  teams_channel: string;
  tagged_users: string[];
  query_config: any;
}) {
  if (API_CONFIG.USE_MOCK_API) {
    return {
      success: true,
      data: {
        scheduled_report: {
          id: Date.now(),
          ...reportData,
          created_at: new Date().toISOString()
        }
      }
    };
  }

  try {
    const response = await apiClient.post(ENDPOINTS.AI_AGENT.SCHEDULE, reportData);
    return response.data;
  } catch (error) {
    console.error('Error creating scheduled report:', error);
    throw error;
  }
}

export async function updateScheduledReport(reportId: number, updates: { 
  is_active?: boolean;
  report_type?: string;
  schedule_time?: string;
  schedule_days?: string;
  teams_channel?: string;
  tagged_users?: string[];
  query_config?: any;
}) {
  if (API_CONFIG.USE_MOCK_API) {
    return {
      success: true,
      data: {
        scheduled_report: {
          id: reportId,
          ...updates,
          updated_at: new Date().toISOString()
        }
      }
    };
  }

  try {
    const response = await apiClient.put(`${ENDPOINTS.AI_AGENT.SCHEDULE}/${reportId}`, updates);
    return response.data;
  } catch (error) {
    console.error('Error updating scheduled report:', error);
    throw error;
  }
}

export async function deleteScheduledReport(reportId: number) {
  if (API_CONFIG.USE_MOCK_API) {
    return {
      success: true,
      message: 'Scheduled report deleted successfully'
    };
  }

  try {
    const response = await apiClient.delete(`${ENDPOINTS.AI_AGENT.SCHEDULE}/${reportId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting scheduled report:', error);
    throw error;
  }
}

export async function toggleScheduler(enabled: boolean) {
  if (API_CONFIG.USE_MOCK_API) {
    return {
      success: true,
      message: `Scheduler ${enabled ? 'enabled' : 'disabled'} successfully`,
      data: { enabled }
    };
  }

  try {
    const response = await apiClient.post(`${ENDPOINTS.AI_AGENT.SCHEDULER_TOGGLE}`, { enabled });
    return response.data;
  } catch (error) {
    console.error('Error toggling scheduler:', error);
    throw error;
  }
}

export async function getSchedulerStatus() {
  if (API_CONFIG.USE_MOCK_API) {
    return {
      success: true,
      data: {
        enabled: true,
        active_tasks: 3,
        tasks: [1, 2, 3]
      }
    };
  }

  try {
    const response = await apiClient.get(`${ENDPOINTS.AI_AGENT.SCHEDULER_STATUS}`);
    return response.data;
  } catch (error) {
    console.error('Error getting scheduler status:', error);
    throw error;
  }
}

export async function exportReportAsCSV(reportType: string, parameters: any = {}) {
  if (API_CONFIG.USE_MOCK_API) {
    return new Blob(['mock,csv,data\n1,2,3'], { type: 'text/csv' });
  }

  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.AI_AGENT.EXPORT_CSV}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: JSON.stringify({
        report_type: reportType,
        parameters: parameters
      })
    });

    if (!response.ok) {
      throw new Error('Failed to export CSV');
    }

    return await response.blob();
  } catch (error) {
    console.error('Error exporting CSV:', error);
    throw error;
  }
}

export async function getPredefinedReportTemplates() {
  if (API_CONFIG.USE_MOCK_API) {
    return {
      success: true,
      data: {
        templates: [
          {
            id: 'low_acceptance_agents',
            name: 'Low Acceptance Rate Agents',
            description: 'Agents with acceptance rate below 60%',
            category: 'Performance'
          }
        ]
      }
    };
  }

  try {
    const response = await apiClient.get(`${ENDPOINTS.AI_AGENT.REPORT_TEMPLATES}`);
    return response.data;
  } catch (error) {
    console.error('Error getting report templates:', error);
    throw error;
  }
}
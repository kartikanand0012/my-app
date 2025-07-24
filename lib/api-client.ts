import { API_CONFIG, ENDPOINTS } from './config';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
  }

  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = this.getToken();
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // ===== AGENT PERFORMANCE APIs =====
  async getAgentProfile(agentId: string, dateRange?: string): Promise<ApiResponse<any>> {
    const url = `${ENDPOINTS.ANALYTICS.AGENT_PROFILE}/${agentId}${dateRange ? `?date_range=${dateRange}` : ''}`;
    return this.get(url);
  }

  async getAgentWeeklyTrend(agentId: string, dateRange?: string): Promise<ApiResponse<any>> {
    const url = `${ENDPOINTS.ANALYTICS.AGENT_WEEKLY_TREND}/${agentId}${dateRange ? `?date_range=${dateRange}` : ''}`;
    return this.get(url);
  }

  async getAgentHourlyCalls(agentId: string, date?: string): Promise<ApiResponse<any>> {
    const url = `${ENDPOINTS.ANALYTICS.AGENT_HOURLY_CALLS}/${agentId}${date ? `?date=${date}` : ''}`;
    return this.get(url);
  }

  async getAgentMonthlyStats(agentId: string, month?: string): Promise<ApiResponse<any>> {
    const url = `${ENDPOINTS.ANALYTICS.AGENT_MONTHLY_STATS}/${agentId}${month ? `?month=${month}` : ''}`;
    return this.get(url);
  }

  async getLeaderboard(limit?: number, dateRange?: string): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    if (limit) params.set('limit', limit.toString());
    if (dateRange) params.set('date_range', dateRange);
    const url = `${ENDPOINTS.ANALYTICS.LEADERBOARD}${params.toString() ? `?${params.toString()}` : ''}`;
    return this.get(url);
  }

  async getAllAgents(dateRange?: string): Promise<ApiResponse<any>> {
    const url = `${ENDPOINTS.ANALYTICS.ALL_AGENTS}${dateRange ? `?date_range=${dateRange}` : ''}`;
    return this.get(url);
  }

  // ===== ERROR ANALYTICS APIs =====
  async getErrorStats(dateRange?: string): Promise<ApiResponse<any>> {
    const url = `${ENDPOINTS.ERROR_ANALYTICS.ERROR_STATS}${dateRange ? `?date_range=${dateRange}` : ''}`;
    return this.get(url);
  }

  async getErrorTrend(days?: number): Promise<ApiResponse<any>> {
    const url = `${ENDPOINTS.ERROR_ANALYTICS.ERROR_TREND}${days ? `?days=${days}` : ''}`;
    return this.get(url);
  }

  async getErrorTypesDistribution(dateRange?: string): Promise<ApiResponse<any>> {
    const url = `${ENDPOINTS.ERROR_ANALYTICS.ERROR_TYPES_DISTRIBUTION}${dateRange ? `?date_range=${dateRange}` : ''}`;
    return this.get(url);
  }

  async getErrorDetails(filters: {
    date_range?: string;
    search?: string;
    status_filter?: string;
    type_filter?: string;
    uuid_filter?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.set(key, value.toString());
      }
    });
    const url = `${ENDPOINTS.ERROR_ANALYTICS.ERROR_DETAILS}${params.toString() ? `?${params.toString()}` : ''}`;
    return this.get(url);
  }

  async acknowledgeError(errorId: string): Promise<ApiResponse<any>> {
    return this.post(`${ENDPOINTS.ERROR_ANALYTICS.ACKNOWLEDGE_ERROR}/${errorId}/acknowledge`);
  }

  async approveError(errorId: string): Promise<ApiResponse<any>> {
    return this.post(`${ENDPOINTS.ERROR_ANALYTICS.APPROVE_ERROR}/${errorId}/approve`);
  }

  async getSavedQueries(): Promise<ApiResponse<any>> {
    return this.get(ENDPOINTS.ERROR_ANALYTICS.SAVED_QUERIES);
  }

  async saveQuery(data: { name: string; query: string; filters: any }): Promise<ApiResponse<any>> {
    return this.post(ENDPOINTS.ERROR_ANALYTICS.SAVE_QUERY, data);
  }

  async getScheduledReports(): Promise<ApiResponse<any>> {
    return this.get(ENDPOINTS.ERROR_ANALYTICS.SCHEDULED_REPORTS);
  }

  async generateAIReport(data: { query: string; filters: any }): Promise<ApiResponse<any>> {
    return this.post(ENDPOINTS.ERROR_ANALYTICS.GENERATE_AI_REPORT, data);
  }

  // ===== NEW ERROR ANALYSIS DASHBOARD APIs =====
  async getDetailedErrorList(filters: {
    page?: number;
    limit?: number;
    date_filter?: string;
    error_type_filter?: string;
    agent_id_filter?: string;
    search?: string;
  } = {}): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.set(key, value.toString());
      }
    });
    const url = `${ENDPOINTS.ERROR_ANALYTICS.DETAILED_ERROR_LIST}${params.toString() ? `?${params.toString()}` : ''}`;
    return this.get(url);
  }

  async getAgentRejectionPieChart(dateRange?: string): Promise<ApiResponse<any>> {
    const url = `${ENDPOINTS.ERROR_ANALYTICS.AGENT_REJECTION_PIE_CHART}${dateRange ? `?date_range=${dateRange}` : ''}`;
    return this.get(url);
  }

  async getIAErrorTypesPieChart(dateRange?: string): Promise<ApiResponse<any>> {
    const url = `${ENDPOINTS.ERROR_ANALYTICS.IA_ERROR_TYPES_PIE_CHART}${dateRange ? `?date_range=${dateRange}` : ''}`;
    return this.get(url);
  }

  async getErrorTrendsChart(period?: string, chartType?: string): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    if (period) params.set('period', period);
    if (chartType) params.set('chart_type', chartType);
    const url = `${ENDPOINTS.ERROR_ANALYTICS.ERROR_TRENDS_CHART}${params.toString() ? `?${params.toString()}` : ''}`;
    return this.get(url);
  }

  async syncErrorAnalysisTable(): Promise<ApiResponse<any>> {
    return this.post(ENDPOINTS.ERROR_ANALYTICS.SYNC_ERROR_ANALYSIS);
  }

  // ===== DASHBOARD OVERVIEW APIs =====
  async getDashboardStats(): Promise<ApiResponse<any>> {
    return this.get(ENDPOINTS.AUTH.DASHBOARD_STATS);
  }

  async uploadFile<T>(endpoint: string, file: File, additionalData?: any): Promise<ApiResponse<T>> {
    const token = this.getToken();
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  }
}

export const apiClient = new ApiClient();
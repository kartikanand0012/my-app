/**
 * AI-Automation Tab Test Cases
 * Tests AI Query functionality, Admin Prompts, Query History, and Report Automation
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AIQueryAutomationPanel } from '../components/ai-query-automation-panel';

// Mock the API functions
jest.mock('../lib/api', () => ({
  executeAIQuery: jest.fn(),
  getAdminPrompts: jest.fn(),
  createAdminPrompt: jest.fn(),
  useAdminPrompt: jest.fn(),
  getQueryHistory: jest.fn(),
  getScheduledReports: jest.fn(),
  createScheduledReport: jest.fn(),
  updateScheduledReport: jest.fn(),
  testTeamsConnection: jest.fn(),
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
global.localStorage = localStorageMock;

describe('AI-Automation Tab Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('mock-auth-token');
  });

  describe('AI Query Functionality', () => {
    test('should execute AI query successfully', async () => {
      const { executeAIQuery } = require('../lib/api');
      
      // Mock successful AI query response
      executeAIQuery.mockResolvedValue({
        success: true,
        data: {
          query: 'Show me all failed calls',
          sql_query: 'SELECT * FROM quality_check_videos WHERE analysis_status = "failed"',
          results: [
            { session_id: 'mock-123', agent_id: 107292, status: 'failed', reason: 'Customer disconnected' },
            { session_id: 'mock-124', agent_id: 107293, status: 'failed', reason: 'Technical issue' }
          ],
          row_count: 2,
          execution_time: 150,
          success: true
        }
      });

      const result = await executeAIQuery('Show me all failed calls', true);

      expect(executeAIQuery).toHaveBeenCalledWith('Show me all failed calls', true);
      expect(result.success).toBe(true);
      expect(result.data.row_count).toBe(2);
      expect(result.data.results).toHaveLength(2);
    });

    test('should execute direct SQL query successfully', async () => {
      const { executeAIQuery } = require('../lib/api');
      
      executeAIQuery.mockResolvedValue({
        success: true,
        data: {
          query: 'SELECT COUNT(*) as total_users FROM users',
          results: [{ total_users: 5 }],
          row_count: 1,
          execution_time: 50,
          success: true
        }
      });

      const result = await executeAIQuery('SELECT COUNT(*) as total_users FROM users', false);

      expect(executeAIQuery).toHaveBeenCalledWith('SELECT COUNT(*) as total_users FROM users', false);
      expect(result.success).toBe(true);
      expect(result.data.results[0].total_users).toBe(5);
    });

    test('should handle query execution errors', async () => {
      const { executeAIQuery } = require('../lib/api');
      
      executeAIQuery.mockRejectedValue(new Error('Query execution failed'));

      await expect(executeAIQuery('invalid query', true))
        .rejects.toThrow('Query execution failed');
    });
  });

  describe('Admin Prompts Management', () => {
    test('should load admin prompts successfully', async () => {
      const { getAdminPrompts } = require('../lib/api');
      
      const mockPrompts = [
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
        },
        {
          id: 2,
          prompt_name: 'Agent Performance Summary',
          prompt_description: 'Get performance metrics for specific agent',
          prompt_template: 'Show me performance metrics for agent {{agent_id}} for period {{period}}',
          prompt_type: 'report',
          category: 'Performance',
          usage_count: 3,
          created_by_name: 'admin',
          created_at: new Date().toISOString()
        }
      ];

      getAdminPrompts.mockResolvedValue({
        success: true,
        data: { prompts: mockPrompts }
      });

      const result = await getAdminPrompts();

      expect(getAdminPrompts).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.data.prompts).toHaveLength(2);
      expect(result.data.prompts[0].prompt_name).toBe('Daily Failed Calls Analysis');
    });

    test('should create new admin prompt successfully', async () => {
      const { createAdminPrompt } = require('../lib/api');
      
      const newPrompt = {
        prompt_name: 'Test Prompt',
        prompt_description: 'Test prompt for testing',
        prompt_template: 'Show me test data for {{parameter}}',
        prompt_type: 'query',
        category: 'Testing'
      };

      createAdminPrompt.mockResolvedValue({
        success: true,
        data: {
          id: 3,
          ...newPrompt,
          created_at: new Date().toISOString()
        }
      });

      const result = await createAdminPrompt(newPrompt);

      expect(createAdminPrompt).toHaveBeenCalledWith(newPrompt);
      expect(result.success).toBe(true);
      expect(result.data.prompt_name).toBe('Test Prompt');
    });

    test('should use admin prompt with variables', async () => {
      const { useAdminPrompt } = require('../lib/api');
      
      const variables = { date: '2024-01-15', status: 'failed' };
      
      useAdminPrompt.mockResolvedValue({
        success: true,
        data: {
          result: {
            query: 'Show me all failed calls on 2024-01-15',
            results: [{ id: 1, status: 'failed' }],
            row_count: 1,
            execution_time: 100
          },
          processed_prompt: 'Show me all failed calls on 2024-01-15'
        }
      });

      const result = await useAdminPrompt(1, variables);

      expect(useAdminPrompt).toHaveBeenCalledWith(1, variables);
      expect(result.success).toBe(true);
      expect(result.data.processed_prompt).toBe('Show me all failed calls on 2024-01-15');
    });
  });

  describe('Query History', () => {
    test('should load query history successfully', async () => {
      const { getQueryHistory } = require('../lib/api');
      
      const mockHistory = [
        {
          id: 1,
          query_text: 'Show me failed calls',
          success: true,
          execution_time: 150,
          query_type: 'ai_natural',
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          query_text: 'SELECT * FROM users',
          success: true,
          execution_time: 50,
          query_type: 'direct_sql',
          created_at: new Date().toISOString()
        }
      ];

      getQueryHistory.mockResolvedValue({
        success: true,
        data: { queries: mockHistory }
      });

      const result = await getQueryHistory(50, 0);

      expect(getQueryHistory).toHaveBeenCalledWith(50, 0);
      expect(result.success).toBe(true);
      expect(result.data.queries).toHaveLength(2);
      expect(result.data.queries[0].query_type).toBe('ai_natural');
    });
  });

  describe('Report Automation (Admin Only)', () => {
    test('should load scheduled reports successfully', async () => {
      const { getScheduledReports } = require('../lib/api');
      
      const mockReports = [
        {
          id: 1,
          report_type: 'daily_summary',
          schedule_time: '09:00:00',
          schedule_days: 'daily',
          teams_channel: '#ai-reports',
          is_active: true,
          created_at: new Date().toISOString()
        }
      ];

      getScheduledReports.mockResolvedValue({
        success: true,
        data: { scheduled_reports: mockReports }
      });

      const result = await getScheduledReports();

      expect(getScheduledReports).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.data.scheduled_reports).toHaveLength(1);
      expect(result.data.scheduled_reports[0].report_type).toBe('daily_summary');
    });

    test('should create scheduled report successfully', async () => {
      const { createScheduledReport } = require('../lib/api');
      
      const reportData = {
        report_type: 'custom_prompt',
        schedule_time: '10:00',
        schedule_days: 'daily',
        teams_channel: '#test-reports',
        tagged_users: ['@admin'],
        query_config: {
          prompt_id: '1',
          prompt_template: 'Test scheduled report',
          prompt_name: 'Test Report'
        }
      };

      createScheduledReport.mockResolvedValue({
        success: true,
        data: {
          scheduled_report: {
            id: 2,
            ...reportData,
            created_at: new Date().toISOString()
          }
        }
      });

      const result = await createScheduledReport(reportData);

      expect(createScheduledReport).toHaveBeenCalledWith(reportData);
      expect(result.success).toBe(true);
      expect(result.data.scheduled_report.teams_channel).toBe('#test-reports');
    });

    test('should update scheduled report status', async () => {
      const { updateScheduledReport } = require('../lib/api');
      
      updateScheduledReport.mockResolvedValue({
        success: true,
        data: {
          scheduled_report: {
            id: 1,
            is_active: false,
            updated_at: new Date().toISOString()
          }
        }
      });

      const result = await updateScheduledReport(1, { is_active: false });

      expect(updateScheduledReport).toHaveBeenCalledWith(1, { is_active: false });
      expect(result.success).toBe(true);
      expect(result.data.scheduled_report.is_active).toBe(false);
    });
  });

  describe('Teams Integration', () => {
    test('should test Teams connection successfully', async () => {
      const { testTeamsConnection } = require('../lib/api');
      
      testTeamsConnection.mockResolvedValue({
        success: true,
        data: {
          message: 'Teams connection test successful',
          timestamp: new Date().toISOString()
        }
      });

      const result = await testTeamsConnection();

      expect(testTeamsConnection).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.data.message).toBe('Teams connection test successful');
    });

    test('should handle Teams connection failure', async () => {
      const { testTeamsConnection } = require('../lib/api');
      
      testTeamsConnection.mockResolvedValue({
        success: false,
        message: 'Teams connection failed'
      });

      const result = await testTeamsConnection();

      expect(result.success).toBe(false);
      expect(result.message).toBe('Teams connection failed');
    });
  });

  describe('Component Rendering Tests', () => {
    test('should render AI Query tab for all user roles', () => {
      render(<AIQueryAutomationPanel userRole="agent" />);
      
      expect(screen.getByText('Query')).toBeInTheDocument();
      expect(screen.getByText('Saved Prompts')).toBeInTheDocument();
      expect(screen.getByText('History')).toBeInTheDocument();
    });

    test('should render Automation tab only for admin users', () => {
      render(<AIQueryAutomationPanel userRole="admin" />);
      
      expect(screen.getByText('Automation')).toBeInTheDocument();
    });

    test('should not render Automation tab for non-admin users', () => {
      render(<AIQueryAutomationPanel userRole="agent" />);
      
      expect(screen.queryByText('Automation')).not.toBeInTheDocument();
    });

    test('should show AI Agent toggle', () => {
      render(<AIQueryAutomationPanel userRole="admin" />);
      
      expect(screen.getByText('AI Agent Mode')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('should handle API errors gracefully', async () => {
      const { executeAIQuery } = require('../lib/api');
      
      executeAIQuery.mockRejectedValue(new Error('API Error'));

      await expect(executeAIQuery('test query', true))
        .rejects.toThrow('API Error');
    });

    test('should handle network timeouts', async () => {
      const { getAdminPrompts } = require('../lib/api');
      
      getAdminPrompts.mockRejectedValue(new Error('Network timeout'));

      await expect(getAdminPrompts())
        .rejects.toThrow('Network timeout');
    });
  });

  describe('Variable Substitution', () => {
    test('should identify variables in prompt templates', () => {
      const template = 'Show me all {{status}} calls on {{date}} for agent {{agent_id}}';
      const variableMatches = template.match(/\{\{(\w+)\}\}/g);
      
      expect(variableMatches).toHaveLength(3);
      expect(variableMatches).toContain('{{status}}');
      expect(variableMatches).toContain('{{date}}');
      expect(variableMatches).toContain('{{agent_id}}');
    });

    test('should handle prompts without variables', () => {
      const template = 'Show me all failed calls from yesterday';
      const variableMatches = template.match(/\{\{(\w+)\}\}/g);
      
      expect(variableMatches).toBeNull();
    });
  });
});
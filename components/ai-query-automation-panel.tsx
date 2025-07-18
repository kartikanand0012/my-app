'use client';

import { useState, useEffect } from 'react';
import { 
  executeAIQuery,
  getAdminPrompts,
  createAdminPrompt,
  useAdminPrompt,
  getQueryHistory,
  getScheduledReports,
  createScheduledReport,
  updateScheduledReport,
  testTeamsConnection
} from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Database, 
  History, 
  Code, 
  Send, 
  Clock, 
  Calendar, 
  Users, 
  MessageSquare, 
  Settings, 
  Play, 
  Pause, 
  Trash2, 
  Plus,
  CheckCircle,
  AlertCircle,
  Loader2,
  Save,
  Edit,
  Star,
  TrendingUp
} from 'lucide-react';

interface QueryResult {
  query: string;
  results: any[];
  row_count: number;
  execution_time: number;
  sql_query?: string;
  success: boolean;
}

interface QueryHistoryItem {
  id: number;
  query_text: string;
  response_text?: string;
  execution_time: number;
  success: boolean;
  created_at: string;
  query_type: string;
}

interface AdminPrompt {
  id: number;
  prompt_name: string;
  prompt_description: string;
  prompt_template: string;
  prompt_type: string;
  category: string;
  usage_count: number;
  created_by_name: string;
  created_at: string;
  last_used?: string;
}

interface ScheduledReport {
  id: number;
  report_type: string;
  schedule_time: string;
  schedule_days: string;
  teams_channel: string;
  tagged_users: string[];
  is_active: boolean;
  last_executed?: string;
  created_at: string;
}

export function AIQueryAutomationPanel({ userRole }: { userRole: string }) {
  // Query state
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [useAIAgent, setUseAIAgent] = useState(true);
  const [activeTab, setActiveTab] = useState('query');

  // Data state
  const [queryHistory, setQueryHistory] = useState<QueryHistoryItem[]>([]);
  const [adminPrompts, setAdminPrompts] = useState<AdminPrompt[]>([]);
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([]);

  // Dialog state
  const [showCreatePromptDialog, setShowCreatePromptDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showVariablesDialog, setShowVariablesDialog] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<AdminPrompt | null>(null);

  // Form state
  const [promptForm, setPromptForm] = useState({
    prompt_name: '',
    prompt_description: '',
    prompt_template: '',
    prompt_type: 'query',
    category: ''
  });

  const [scheduleForm, setScheduleForm] = useState({
    report_type: '',
    schedule_time: '09:00',
    schedule_days: 'daily',
    teams_channel: '#ai-reports',
    tagged_users: [''],
    prompt_id: ''
  });

  const [promptVariables, setPromptVariables] = useState<Record<string, string>>({});

  useEffect(() => {
    loadAdminPrompts();
    loadQueryHistory();
    if (userRole === 'admin') {
      loadScheduledReports();
    }
  }, [userRole]);

  const loadQueryHistory = async () => {
    try {
      const response = await getQueryHistory(50, 0);
      if (response.queries.length>0) {
        setQueryHistory(response.queries);
      }
    } catch (error) {
      console.error('Failed to load query history:', error);
    }
  };

  const loadAdminPrompts = async () => {
    try {
      const response = await getAdminPrompts();
      console.log('RESPONSE', response);
      if (response.prompts.length>0) {
        setAdminPrompts(response.prompts);
      }
    } catch (error) {
      console.error('Failed to load admin prompts:', error);
    }
  };

  const loadScheduledReports = async () => {
    try {
      const response = await getScheduledReports();
      if (response.success) {
        setScheduledReports(response.data.scheduled_reports);
      }
    } catch (error) {
      console.error('Failed to load scheduled reports:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError('');
    setResult(null);
    setSuccess('');

    try {
      const response = await executeAIQuery(query, useAIAgent);
      if (response.success) {
        setResult(response.data);
        setSuccess('Query executed successfully!');
        loadQueryHistory(); // Refresh history
      } else {
        setError(response.message || 'Query execution failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Query execution failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await createAdminPrompt(promptForm);
      if (response.success) {
        setSuccess('Prompt saved successfully!');
        setShowCreatePromptDialog(false);
        setPromptForm({
          prompt_name: '',
          prompt_description: '',
          prompt_template: '',
          prompt_type: 'query',
          category: ''
        });
        loadAdminPrompts();
      } else {
        setError(response.message || 'Failed to save prompt');
      }
    } catch (error) {
      setError('Failed to save prompt');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUsePrompt = async (prompt: AdminPrompt) => {
    // Check if prompt has variables
    const variableMatches = prompt.prompt_template.match(/\{\{(\w+)\}\}/g);
    
    if (variableMatches && variableMatches.length > 0) {
      // Show variables dialog
      const variables: Record<string, string> = {};
      variableMatches.forEach(match => {
        const varName = match.replace('{{', '').replace('}}', '');
        variables[varName] = '';
      });
      setPromptVariables(variables);
      setSelectedPrompt(prompt);
      setShowVariablesDialog(true);
    } else {
      // Use prompt directly
      executePrompt(prompt, {});
    }
  };

  const executePrompt = async (prompt: AdminPrompt, variables: Record<string, string>) => {
    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await useAdminPrompt(prompt.id, variables);
      if (response.success) {
        setResult(response.data.result);
        setQuery(response.data.processed_prompt || prompt.prompt_template);
        setSuccess('Prompt executed successfully!');
        setShowVariablesDialog(false);
        loadQueryHistory();
        loadAdminPrompts(); // Refresh to update usage count
      } else {
        setError(response.message || 'Failed to execute prompt');
      }
    } catch (error) {
      setError('Failed to execute prompt');
    } finally {
      setIsLoading(false);
    }
  };

  const handleScheduleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const selectedPromptData = adminPrompts.find(p => p.id.toString() === scheduleForm.prompt_id);
      
      const response = await createScheduledReport({
        report_type: 'custom_prompt',
        schedule_time: scheduleForm.schedule_time,
        schedule_days: scheduleForm.schedule_days,
        teams_channel: scheduleForm.teams_channel,
        tagged_users: scheduleForm.tagged_users.filter(user => user.trim()),
        query_config: {
          prompt_id: scheduleForm.prompt_id,
          prompt_template: selectedPromptData?.prompt_template || '',
          prompt_name: selectedPromptData?.prompt_name || ''
        }
      });

      if (response.success) {
        setSuccess('Report scheduled successfully!');
        setShowScheduleDialog(false);
        loadScheduledReports();
      } else {
        setError(response.message || 'Failed to schedule report');
      }
    } catch (error) {
      setError('Failed to schedule report');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestTeamsConnection = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await testTeamsConnection();
      if (response.success) {
        setSuccess('Teams connection test successful!');
      } else {
        setError('Teams connection test failed');
      }
    } catch (error) {
      setError('Teams connection test failed');
    } finally {
      setIsLoading(false);
    }
  };

  const renderResults = () => {
    if (!result) return null;

    if (result.results.length === 0) {
      return (
        <Alert>
          <Database className="h-4 w-4" />
          <AlertDescription>
            No results found for your query.
          </AlertDescription>
        </Alert>
      );
    }

    const columns = Object.keys(result.results[0]);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Database className="h-4 w-4" />
              <span>{result.row_count} rows</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{result.execution_time}ms</span>
            </div>
          </div>
          {result.sql_query && (
            <Badge variant="outline" className="text-xs font-mono">
              SQL: {result.sql_query.substring(0, 50)}...
            </Badge>
          )}
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column}>{column}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.results.slice(0, 50).map((row, index) => (
                <TableRow key={index}>
                  {columns.map((column) => (
                    <TableCell key={column}>
                      {typeof row[column] === 'boolean' ? (
                        <Badge variant={row[column] ? 'default' : 'secondary'}>
                          {row[column] ? 'Yes' : 'No'}
                        </Badge>
                      ) : (
                        <span className="max-w-xs truncate block">
                          {row[column]?.toString() || 'N/A'}
                        </span>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {result.results.length > 50 && (
          <p className="text-sm text-gray-600 text-center">
            Showing first 50 results of {result.row_count} total rows
          </p>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Query & Automation Hub
        </CardTitle>
        <CardDescription>
          Execute AI-powered queries, manage admin prompts, and automate reports with Teams integration
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="query" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Query
            </TabsTrigger>
            <TabsTrigger value="prompts" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Saved Prompts
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              History
            </TabsTrigger>
            {userRole === 'admin' && (
              <TabsTrigger value="automation" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Automation
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="query" className="space-y-6">
            {/* AI Agent Toggle */}
            <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
              <div className="space-y-1">
                <Label htmlFor="ai-agent-toggle" className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  AI Agent Mode
                </Label>
                <p className="text-sm text-gray-600">
                  {useAIAgent 
                    ? "AI will convert your natural language to SQL queries" 
                    : "Direct SQL query execution mode"}
                </p>
              </div>
              <Switch
                id="ai-agent-toggle"
                checked={useAIAgent}
                onCheckedChange={setUseAIAgent}
              />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-2">
                <Textarea
                  placeholder={useAIAgent 
                    ? "e.g., Show me all failed calls from yesterday and analyze the failure patterns"
                    : "SELECT * FROM quality_check_videos WHERE..."
                  }
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 min-h-[100px]"
                  rows={4}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button type="submit" disabled={isLoading || !query.trim()}>
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : useAIAgent ? (
                      <Brain className="h-4 w-4" />
                    ) : (
                      <Code className="h-4 w-4" />
                    )}
                    <span className="ml-2">
                      {isLoading ? 'Executing...' : useAIAgent ? 'AI Query' : 'SQL Query'}
                    </span>
                  </Button>
                  
                  {userRole === 'admin' && query.trim() && (
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => {
                        setPromptForm(prev => ({ ...prev, prompt_template: query }));
                        setShowCreatePromptDialog(true);
                      }}
                    >
                      <Save className="h-4 w-4 mr-1" />
                      Save as Prompt
                    </Button>
                  )}
                </div>
                
                <Badge variant="outline" className="text-xs">
                  {useAIAgent ? 'AI-Powered' : 'Direct SQL'}
                </Badge>
              </div>
            </form>

            {/* Results Display */}
            {renderResults()}
          </TabsContent>

          <TabsContent value="prompts" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Admin Saved Prompts</h3>
              {userRole === 'admin' && (
                <Dialog open={showCreatePromptDialog} onOpenChange={setShowCreatePromptDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Prompt
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create New Admin Prompt</DialogTitle>
                      <DialogDescription>
                        Save reusable prompts for queries and reports
                      </DialogDescription>
                    </DialogHeader>
                    
                    <form onSubmit={handleCreatePrompt} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="prompt_name">Prompt Name</Label>
                          <Input
                            id="prompt_name"
                            value={promptForm.prompt_name}
                            onChange={(e) => setPromptForm(prev => ({ ...prev, prompt_name: e.target.value }))}
                            placeholder="e.g., Daily Error Analysis"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="category">Category</Label>
                          <Input
                            id="category"
                            value={promptForm.category}
                            onChange={(e) => setPromptForm(prev => ({ ...prev, category: e.target.value }))}
                            placeholder="e.g., Quality Analysis"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="prompt_type">Type</Label>
                        <Select 
                          value={promptForm.prompt_type} 
                          onValueChange={(value) => setPromptForm(prev => ({ ...prev, prompt_type: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="query">Query</SelectItem>
                            <SelectItem value="report">Report</SelectItem>
                            <SelectItem value="automation">Automation</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="prompt_description">Description</Label>
                        <Textarea
                          id="prompt_description"
                          value={promptForm.prompt_description}
                          onChange={(e) => setPromptForm(prev => ({ ...prev, prompt_description: e.target.value }))}
                          placeholder="Describe what this prompt does..."
                          rows={2}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="prompt_template">Prompt Template</Label>
                        <Textarea
                          id="prompt_template"
                          value={promptForm.prompt_template}
                          onChange={(e) => setPromptForm(prev => ({ ...prev, prompt_template: e.target.value }))}
                          placeholder="e.g., Show me all {{status}} calls from {{date}} for agent {{agent_id}}"
                          rows={4}
                          required
                        />
                        <p className="text-xs text-gray-500">
                          Use &#123;&#123;variable_name&#125;&#125; for dynamic values
                        </p>
                      </div>

                      <div className="flex items-center gap-2 pt-4">
                        <Button type="submit" disabled={isLoading}>
                          {isLoading ? 'Creating...' : 'Create Prompt'}
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setShowCreatePromptDialog(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {adminPrompts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {adminPrompts.map((prompt) => (
                  <Card key={prompt.id} className="p-4 hover:bg-gray-50 cursor-pointer">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h4 className="font-medium">{prompt.prompt_name}</h4>
                          <p className="text-sm text-gray-600">{prompt.prompt_description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {prompt.prompt_type}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <TrendingUp className="h-3 w-3" />
                            {prompt.usage_count}
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-100 p-2 rounded text-xs font-mono">
                        {prompt.prompt_template.substring(0, 150)}
                        {prompt.prompt_template.length > 150 && '...'}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          {prompt.category && (
                            <Badge variant="secondary" className="text-xs mr-2">
                              {prompt.category}
                            </Badge>
                          )}
                          by {prompt.created_by_name}
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleUsePrompt(prompt)}
                          disabled={isLoading}
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Use
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Star className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No saved prompts yet</p>
                {userRole === 'admin' && (
                  <p className="text-sm">Create your first reusable prompt to get started</p>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Query History</h3>
              <Button variant="outline" size="sm" onClick={loadQueryHistory}>
                <History className="h-4 w-4 mr-1" />
                Refresh
              </Button>
            </div>
            
            {queryHistory.length > 0 ? (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {queryHistory.map((historyItem) => (
                  <div 
                    key={historyItem.id} 
                    className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      setQuery(historyItem.query_text);
                      setActiveTab('query');
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant={historyItem.success ? 'default' : 'destructive'}>
                        {historyItem.query_type}
                      </Badge>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        {historyItem.execution_time}ms
                        <span>{new Date(historyItem.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 truncate">
                      {historyItem.query_text}
                    </p>
                    {historyItem.success && (
                      <p className="text-xs text-green-600 mt-1">
                        ✓ Query executed successfully
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No query history available</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={loadQueryHistory}
                  className="mt-2"
                >
                  Load History
                </Button>
              </div>
            )}
          </TabsContent>

          {userRole === 'admin' && (
            <TabsContent value="automation" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Report Automation</h3>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={handleTestTeamsConnection}>
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Test Teams
                  </Button>
                  <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Schedule Report
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-xl">
                      <DialogHeader>
                        <DialogTitle>Schedule Automated Report</DialogTitle>
                        <DialogDescription>
                          Schedule a saved prompt to run automatically and send results to Teams
                        </DialogDescription>
                      </DialogHeader>
                      
                      <form onSubmit={handleScheduleReport} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="prompt_id">Select Prompt</Label>
                          <Select 
                            value={scheduleForm.prompt_id} 
                            onValueChange={(value) => setScheduleForm(prev => ({ ...prev, prompt_id: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Choose a saved prompt" />
                            </SelectTrigger>
                            <SelectContent>
                              {adminPrompts.filter(p => p.prompt_type === 'report' || p.prompt_type === 'query').map((prompt) => (
                                <SelectItem key={prompt.id} value={prompt.id.toString()}>
                                  {prompt.prompt_name} ({prompt.prompt_type})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="schedule_time">Time</Label>
                            <Input
                              id="schedule_time"
                              type="time"
                              value={scheduleForm.schedule_time}
                              onChange={(e) => setScheduleForm(prev => ({ ...prev, schedule_time: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="schedule_days">Frequency</Label>
                            <Select 
                              value={scheduleForm.schedule_days} 
                              onValueChange={(value) => setScheduleForm(prev => ({ ...prev, schedule_days: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="teams_channel">Teams Channel</Label>
                          <Input
                            id="teams_channel"
                            placeholder="#ai-reports"
                            value={scheduleForm.teams_channel}
                            onChange={(e) => setScheduleForm(prev => ({ ...prev, teams_channel: e.target.value }))}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Tagged Users</Label>
                          {scheduleForm.tagged_users.map((user, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <Input
                                placeholder="@username"
                                value={user}
                                onChange={(e) => {
                                  const newUsers = [...scheduleForm.tagged_users];
                                  newUsers[index] = e.target.value;
                                  setScheduleForm(prev => ({ ...prev, tagged_users: newUsers }));
                                }}
                              />
                              {scheduleForm.tagged_users.length > 1 && (
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  size="sm"
                                  className="text-black"
                                  onClick={() => {
                                    const newUsers = scheduleForm.tagged_users.filter((_, i) => i !== index);
                                    setScheduleForm(prev => ({ ...prev, tagged_users: newUsers }));
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            className="text-black"
                            onClick={() => setScheduleForm(prev => ({ 
                              ...prev, 
                              tagged_users: [...prev.tagged_users, ''] 
                            }))}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add User
                          </Button>
                        </div>

                        <div className="flex items-center gap-2 pt-4">
                          <Button type="submit" disabled={isLoading || !scheduleForm.prompt_id} className="text-white">
                            {isLoading ? 'Scheduling...' : 'Schedule Report'}
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            className="text-black"
                            onClick={() => setShowScheduleDialog(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {scheduledReports.length > 0 ? (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Report</TableHead>
                        <TableHead>Schedule</TableHead>
                        <TableHead>Teams Channel</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Executed</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {scheduledReports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell>
                            <div className="font-medium">
                              {report.report_type}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <Clock className="h-3 w-3" />
                              {report.schedule_time} ({report.schedule_days})
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{report.teams_channel}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={report.is_active ? 'default' : 'secondary'}>
                              {report.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {report.last_executed ? (
                              <span className="text-sm text-gray-600">
                                {new Date(report.last_executed).toLocaleString()}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400">Never</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-black"
                              onClick={async () => {
                                try {
                                  const response = await updateScheduledReport(report.id, { is_active: !report.is_active });
                                  
                                  if (response.success) {
                                    loadScheduledReports();
                                    setSuccess(`Report ${!report.is_active ? 'activated' : 'deactivated'}`);
                                  }
                                } catch (error) {
                                  setError('Failed to update report status');
                                }
                              }}
                            >
                              {report.is_active ? (
                                <Pause className="h-4 w-4" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No scheduled reports yet</p>
                  <p className="text-sm">Create automated reports using your saved prompts</p>
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>

        {/* Variables Dialog */}
        <Dialog open={showVariablesDialog} onOpenChange={setShowVariablesDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Prompt Variables</DialogTitle>
              <DialogDescription>
                Fill in the variables for: {selectedPrompt?.prompt_name}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {Object.keys(promptVariables).map((variable) => (
                <div key={variable} className="space-y-2">
                  <Label htmlFor={variable}>{variable}</Label>
                  <Input
                    id={variable}
                    value={promptVariables[variable]}
                    onChange={(e) => setPromptVariables(prev => ({
                      ...prev,
                      [variable]: e.target.value
                    }))}
                    placeholder={`Enter value for ${variable}`}
                  />
                </div>
              ))}
              
              <div className="flex items-center gap-2 pt-4">
                <Button 
                  onClick={() => selectedPrompt && executePrompt(selectedPrompt, promptVariables)}
                  disabled={isLoading}
                  className="text-white"
                >
                  {isLoading ? 'Executing...' : 'Execute Prompt'}
                </Button>
                <Button 
                  variant="outline" 
                  className="text-black"
                  onClick={() => setShowVariablesDialog(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Status Messages */}
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="mt-4">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
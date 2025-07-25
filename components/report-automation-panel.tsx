'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { API_CONFIG, ENDPOINTS } from '@/lib/config';
import { Calendar, Clock, FileText, MessageSquare, Plus, Settings, Trash2, Users } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { 
  Play, 
  Pause, 
  CheckCircle,
  AlertCircle,
  Brain,
  Send
} from 'lucide-react';

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

interface ReportTemplate {
  type: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  prompt_template: string;
}

export function ReportAutomationPanel() {
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('reports');

  // Form state
  const [formData, setFormData] = useState({
    report_type: '',
    schedule_time: '09:00',
    schedule_days: 'daily',
    teams_channel: '#ai-reports',
    tagged_users: [''],
    custom_prompt: ''
  });

  const reportTemplates: ReportTemplate[] = [
    {
      type: 'error_report',
      name: 'Daily Error Report',
      description: 'Summary of errors and issues from the past 24 hours',
      icon: <AlertCircle className="h-5 w-5 text-red-500" />,
      prompt_template: 'Generate a comprehensive error report for the past 24 hours including error counts, top error types, and recommended actions.'
    },
    {
      type: 'daily_summary',
      name: 'Daily Operations Summary',
      description: 'Overall performance and quality metrics for the day',
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      prompt_template: 'Create a daily operations summary including call volumes, quality scores, compliance rates, and key performance indicators.'
    },
    {
      type: 'quality_report',
      name: 'Quality Assurance Report',
      description: 'Weekly quality analysis and agent performance insights',
      icon: <Brain className="h-5 w-5 text-blue-500" />,
      prompt_template: 'Provide a detailed quality assurance report with agent performance analysis, quality trends, and improvement recommendations.'
    }
  ];

  useEffect(() => {
    loadScheduledReports();
  }, []);

  const loadScheduledReports = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.AI_AGENT.SCHEDULE}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setScheduledReports(data.data.scheduled_reports);
      } else {
        setError('Failed to load scheduled reports');
      }
    } catch (error) {
      console.error('Error loading scheduled reports:', error);
      setError('Failed to load scheduled reports');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const reportTemplate = reportTemplates.find(t => t.type === formData.report_type);
      const queryConfig = {
        prompt: formData.custom_prompt || reportTemplate?.prompt_template,
        template_type: formData.report_type
      };

      const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.AI_AGENT.SCHEDULE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          ...formData,
          tagged_users: formData.tagged_users.filter(user => user.trim()),
          query_config: queryConfig
        })
      });

      const data = await response.json();
      if (data.success) {
        setSuccess('Report scheduled successfully!');
        setShowCreateDialog(false);
        loadScheduledReports();
        resetForm();
      } else {
        setError(data.message || 'Failed to schedule report');
      }
    } catch (error) {
      console.error('Error creating scheduled report:', error);
      setError('Failed to schedule report');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleReportStatus = async (reportId: number, isActive: boolean) => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.AI_AGENT.SCHEDULE}/${reportId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ is_active: isActive })
      });

      const data = await response.json();
      if (data.success) {
        loadScheduledReports();
        setSuccess(`Report ${isActive ? 'activated' : 'deactivated'} successfully`);
      } else {
        setError('Failed to update report status');
      }
    } catch (error) {
      console.error('Error updating report status:', error);
      setError('Failed to update report status');
    }
  };

  const testTeamsConnection = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.AI_AGENT.TEAMS_TEST}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setSuccess('Teams connection test successful!');
      } else {
        setError('Teams connection test failed');
      }
    } catch (error) {
      console.error('Teams connection test error:', error);
      setError('Teams connection test failed');
    } finally {
      setIsLoading(false);
    }
  };

  const sendTestReport = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Generate a test report first
      const reportResponse = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.AI_AGENT.REPORT_GENERATE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          report_type: 'daily_summary',
          parameters: { test: true }
        })
      });

      const reportData = await reportResponse.json();
      if (!reportData.success) {
        throw new Error('Failed to generate test report');
      }

      // Send test report to Teams
      const teamsResponse = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.AI_AGENT.TEAMS_SEND}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          teams_channel: formData.teams_channel,
          tagged_users: formData.tagged_users.filter(user => user.trim()),
          report_data: reportData.data
        })
      });

      const teamsData = await teamsResponse.json();
      if (teamsData.success) {
        setSuccess('Test report sent to Teams successfully!');
      } else {
        setError('Failed to send test report to Teams');
      }
    } catch (error) {
      console.error('Error sending test report:', error);
      setError('Failed to send test report');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      report_type: '',
      schedule_time: '09:00',
      schedule_days: 'daily',
      teams_channel: '#ai-reports',
      tagged_users: [''],
      custom_prompt: ''
    });
  };

  const addTaggedUser = () => {
    setFormData(prev => ({
      ...prev,
      tagged_users: [...prev.tagged_users, '']
    }));
  };

  const updateTaggedUser = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      tagged_users: prev.tagged_users.map((user, i) => i === index ? value : user)
    }));
  };

  const removeTaggedUser = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tagged_users: prev.tagged_users.filter((_, i) => i !== index)
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Report Automation & Teams Integration
        </CardTitle>
        <CardDescription>
          Schedule automated AI-generated reports and send them to Microsoft Teams channels
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="reports">Scheduled Reports</TabsTrigger>
            <TabsTrigger value="templates">Report Templates</TabsTrigger>
            <TabsTrigger value="settings">Teams Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Active Scheduled Reports</h3>
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule New Report
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Schedule New Report</DialogTitle>
                    <DialogDescription>
                      Create an automated report that will be sent to your Teams channel
                    </DialogDescription>
                  </DialogHeader>
                  
                  <form onSubmit={handleCreateReport} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="report_type">Report Type</Label>
                        <Select 
                          value={formData.report_type} 
                          onValueChange={(value) => setFormData(prev => ({ ...prev, report_type: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select report type" />
                          </SelectTrigger>
                          <SelectContent>
                            {reportTemplates.map((template) => (
                              <SelectItem key={template.type} value={template.type}>
                                <div className="flex items-center gap-2">
                                  {template.icon}
                                  {template.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="schedule_days">Frequency</Label>
                        <Select 
                          value={formData.schedule_days} 
                          onValueChange={(value) => setFormData(prev => ({ ...prev, schedule_days: value }))}
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

                      <div className="space-y-2">
                        <Label htmlFor="schedule_time">Time</Label>
                        <Input
                          id="schedule_time"
                          type="time"
                          value={formData.schedule_time}
                          onChange={(e) => setFormData(prev => ({ ...prev, schedule_time: e.target.value }))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="teams_channel">Teams Channel</Label>
                        <Input
                          id="teams_channel"
                          placeholder="#ai-reports"
                          value={formData.teams_channel}
                          onChange={(e) => setFormData(prev => ({ ...prev, teams_channel: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Tagged Users</Label>
                      {formData.tagged_users.map((user, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            placeholder="@username"
                            value={user}
                            onChange={(e) => updateTaggedUser(index, e.target.value)}
                          />
                          {formData.tagged_users.length > 1 && (
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm"
                              onClick={() => removeTaggedUser(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button type="button" variant="outline" size="sm" onClick={addTaggedUser}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add User
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="custom_prompt">Custom Prompt (Optional)</Label>
                      <Textarea
                        id="custom_prompt"
                        placeholder="Override the default report prompt with your custom instructions..."
                        value={formData.custom_prompt}
                        onChange={(e) => setFormData(prev => ({ ...prev, custom_prompt: e.target.value }))}
                        rows={3}
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-4">
                      <Button type="submit" disabled={isLoading || !formData.report_type}>
                        {isLoading ? 'Creating...' : 'Schedule Report'}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={sendTestReport}
                        disabled={isLoading || !formData.teams_channel}
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Send Test
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {scheduledReports.length > 0 ? (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Report Type</TableHead>
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
                          <div className="flex items-center gap-2">
                            {reportTemplates.find(t => t.type === report.report_type)?.icon}
                            <span className="font-medium">
                              {reportTemplates.find(t => t.type === report.report_type)?.name || report.report_type}
                            </span>
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
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleReportStatus(report.id, !report.is_active)}
                            >
                              {report.is_active ? (
                                <Pause className="h-4 w-4" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
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
                <p className="text-sm">Create your first automated report to get started</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <h3 className="text-lg font-semibold">Available Report Templates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reportTemplates.map((template) => (
                <Card key={template.type} className="p-4">
                  <div className="flex items-start gap-3">
                    {template.icon}
                    <div className="space-y-2">
                      <h4 className="font-medium">{template.name}</h4>
                      <p className="text-sm text-gray-600">{template.description}</p>
                      <div className="bg-gray-50 p-2 rounded text-xs">
                        <strong>Prompt:</strong> {template.prompt_template}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <h3 className="text-lg font-semibold">Teams Integration Settings</h3>
            
            <div className="space-y-4">
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Teams Connection Status</h4>
                    <p className="text-sm text-gray-600">Test your Microsoft Teams webhook connection</p>
                  </div>
                  <Button onClick={testTeamsConnection} disabled={isLoading}>
                    {isLoading ? 'Testing...' : 'Test Connection'}
                  </Button>
                </div>
              </Card>

              <Card className="p-4">
                <div className="space-y-3">
                  <h4 className="font-medium">Configuration</h4>
                  <div className="text-sm text-gray-600 space-y-2">
                    <p><strong>Environment:</strong> {process.env.NODE_ENV === 'production' ? 'Production' : 'Development (Mock Mode)'}</p>
                    <p><strong>AI Agent:</strong> OpenAI GPT Integration</p>
                    <p><strong>Teams Integration:</strong> Microsoft Teams Webhook</p>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

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
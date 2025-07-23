"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Calendar,
  Clock,
  Users,
  MessageSquare,
  Plus,
  Edit,
  Trash,
  Send,
  CheckCircle,
  AlertTriangle,
  Play,
  Pause
} from "lucide-react"
import { apiClient } from "@/lib/api-client"

interface ScheduledReport {
  id: number
  report_type: 'daily' | 'hourly' | 'weekly' | 'monthly'
  schedule_expression: string
  filters: any
  teams_channel: string
  tag_agents: boolean
  custom_message: string
  is_active: boolean
  last_run?: string
  next_run: string
  created_at: string
}

interface ReportRun {
  id: number
  run_date: string
  status: 'completed' | 'failed'
  agents_tagged: string[]
  teams_message_id?: string
  error_message?: string
}

export function QCScheduledReports() {
  const [reports, setReports] = useState<ScheduledReport[]>([])
  const [reportRuns, setReportRuns] = useState<ReportRun[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingReport, setEditingReport] = useState<ScheduledReport | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [formData, setFormData] = useState({
    report_type: 'daily' as const,
    schedule_time: '09:00',
    schedule_day: '1', // For weekly reports
    teams_channel: 'general',
    tag_agents: true,
    custom_message: '',
    filters: {
      error_types: [] as string[],
      priority: [] as string[],
      min_flagged_items: 1
    }
  })

  useEffect(() => {
    loadScheduledReports()
    loadReportRuns()
  }, [])

  const loadScheduledReports = async () => {
    try {
      const response = await apiClient.get('/quality-check/scheduled-reports')
      if (response.success) {
        setReports(response.data.reports)
      }
    } catch (error) {
      console.error('Failed to load scheduled reports:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadReportRuns = async () => {
    try {
      const response = await apiClient.get('/quality-check/report-runs?limit=10')
      if (response.success) {
        setReportRuns(response.data.runs)
      }
    } catch (error) {
      console.error('Failed to load report runs:', error)
    }
  }

  const createReport = async () => {
    try {
      const scheduleExpression = generateCronExpression()
      
      const payload = {
        report_type: formData.report_type,
        schedule_expression: scheduleExpression,
        filters: formData.filters,
        teams_channel: formData.teams_channel,
        tag_agents: formData.tag_agents,
        custom_message: formData.custom_message
      }

      const response = await apiClient.post('/quality-check/scheduled-reports', payload)
      
      if (response.success) {
        setIsCreateDialogOpen(false)
        resetForm()
        loadScheduledReports()
      }
    } catch (error) {
      console.error('Failed to create scheduled report:', error)
    }
  }

  const updateReport = async () => {
    if (!editingReport) return

    try {
      const scheduleExpression = generateCronExpression()
      
      const payload = {
        report_type: formData.report_type,
        schedule_expression: scheduleExpression,
        filters: formData.filters,
        teams_channel: formData.teams_channel,
        tag_agents: formData.tag_agents,
        custom_message: formData.custom_message
      }

      const response = await apiClient.put(`/quality-check/scheduled-reports/${editingReport.id}`, payload)
      
      if (response.success) {
        setEditingReport(null)
        resetForm()
        loadScheduledReports()
      }
    } catch (error) {
      console.error('Failed to update scheduled report:', error)
    }
  }

  const deleteReport = async (reportId: number) => {
    if (!confirm('Are you sure you want to delete this scheduled report?')) return

    try {
      const response = await apiClient.delete(`/quality-check/scheduled-reports/${reportId}`)
      if (response.success) {
        loadScheduledReports()
      }
    } catch (error) {
      console.error('Failed to delete scheduled report:', error)
    }
  }

  const toggleReportStatus = async (reportId: number, isActive: boolean) => {
    try {
      const response = await apiClient.put(`/quality-check/scheduled-reports/${reportId}/toggle`, {
        is_active: !isActive
      })
      if (response.success) {
        loadScheduledReports()
      }
    } catch (error) {
      console.error('Failed to toggle report status:', error)
    }
  }

  const runReportNow = async (reportId: number) => {
    try {
      const response = await apiClient.post(`/quality-check/scheduled-reports/${reportId}/run`)
      if (response.success) {
        loadReportRuns()
      }
    } catch (error) {
      console.error('Failed to run report:', error)
    }
  }

  const generateCronExpression = () => {
    const [hour, minute] = formData.schedule_time.split(':')
    
    switch (formData.report_type) {
      case 'hourly':
        return `${minute} * * * *` // Every hour at specified minute
      case 'daily':
        return `${minute} ${hour} * * *` // Every day at specified time
      case 'weekly':
        return `${minute} ${hour} * * ${formData.schedule_day}` // Every week on specified day
      case 'monthly':
        return `${minute} ${hour} 1 * *` // First day of every month
      default:
        return `${minute} ${hour} * * *`
    }
  }

  const resetForm = () => {
    setFormData({
      report_type: 'daily',
      schedule_time: '09:00',
      schedule_day: '1',
      teams_channel: 'general',
      tag_agents: true,
      custom_message: '',
      filters: {
        error_types: [],
        priority: [],
        min_flagged_items: 1
      }
    })
  }

  const editReport = (report: ScheduledReport) => {
    setEditingReport(report)
    
    // Parse cron expression back to form data
    const cronParts = report.schedule_expression.split(' ')
    const minute = cronParts[0]
    const hour = cronParts[1]
    const dayOfWeek = cronParts[4]
    
    setFormData({
      report_type: report.report_type,
      schedule_time: `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`,
      schedule_day: dayOfWeek !== '*' ? dayOfWeek : '1',
      teams_channel: report.teams_channel,
      tag_agents: report.tag_agents,
      custom_message: report.custom_message,
      filters: report.filters || {
        error_types: [],
        priority: [],
        min_flagged_items: 1
      }
    })
  }

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case 'hourly': return <Clock className="h-4 w-4" />
      case 'daily': return <Calendar className="h-4 w-4" />
      case 'weekly': return <Calendar className="h-4 w-4" />
      case 'monthly': return <Calendar className="h-4 w-4" />
      default: return <Calendar className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-blue-600" />
                Scheduled QC Reports
              </CardTitle>
              <CardDescription>
                Automated quality check reports sent to Microsoft Teams with agent tagging
              </CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Report
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingReport ? 'Edit Scheduled Report' : 'Create Scheduled Report'}
                  </DialogTitle>
                  <DialogDescription>
                    Configure automated QC reports to be sent to your Teams channels
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="report-type">Report Frequency</Label>
                    <Select 
                      value={formData.report_type} 
                      onValueChange={(value: any) => setFormData({...formData, report_type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="schedule-time">Time</Label>
                      <Input
                        id="schedule-time"
                        type="time"
                        value={formData.schedule_time}
                        onChange={(e) => setFormData({...formData, schedule_time: e.target.value})}
                      />
                    </div>
                    
                    {formData.report_type === 'weekly' && (
                      <div className="grid gap-2">
                        <Label htmlFor="schedule-day">Day of Week</Label>
                        <Select 
                          value={formData.schedule_day} 
                          onValueChange={(value) => setFormData({...formData, schedule_day: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Monday</SelectItem>
                            <SelectItem value="2">Tuesday</SelectItem>
                            <SelectItem value="3">Wednesday</SelectItem>
                            <SelectItem value="4">Thursday</SelectItem>
                            <SelectItem value="5">Friday</SelectItem>
                            <SelectItem value="6">Saturday</SelectItem>
                            <SelectItem value="0">Sunday</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="teams-channel">Teams Channel</Label>
                    <Input
                      id="teams-channel"
                      placeholder="general, quality-team, etc."
                      value={formData.teams_channel}
                      onChange={(e) => setFormData({...formData, teams_channel: e.target.value})}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="tag-agents"
                      checked={formData.tag_agents}
                      onCheckedChange={(checked) => setFormData({...formData, tag_agents: checked})}
                    />
                    <Label htmlFor="tag-agents">Tag agents with errors in Teams message</Label>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="custom-message">Custom Message (Optional)</Label>
                    <Textarea
                      id="custom-message"
                      placeholder="Add a custom message to include with the report..."
                      value={formData.custom_message}
                      onChange={(e) => setFormData({...formData, custom_message: e.target.value})}
                      rows={3}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label>Report Filters</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm">Error Types</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {['language', 'body_language', 'sop'].map(type => (
                            <Badge
                              key={type}
                              variant={formData.filters.error_types.includes(type) ? 'default' : 'outline'}
                              className="cursor-pointer capitalize"
                              onClick={() => {
                                const types = formData.filters.error_types.includes(type)
                                  ? formData.filters.error_types.filter(t => t !== type)
                                  : [...formData.filters.error_types, type]
                                setFormData({...formData, filters: {...formData.filters, error_types: types}})
                              }}
                            >
                              {type.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm">Priority</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {['high', 'medium', 'low'].map(priority => (
                            <Badge
                              key={priority}
                              variant={formData.filters.priority.includes(priority) ? 'default' : 'outline'}
                              className="cursor-pointer capitalize"
                              onClick={() => {
                                const priorities = formData.filters.priority.includes(priority)
                                  ? formData.filters.priority.filter(p => p !== priority)
                                  : [...formData.filters.priority, priority]
                                setFormData({...formData, filters: {...formData.filters, priority: priorities}})
                              }}
                            >
                              {priority}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => {
                    setIsCreateDialogOpen(false)
                    setEditingReport(null)
                    resetForm()
                  }}>
                    Cancel
                  </Button>
                  <Button onClick={editingReport ? updateReport : createReport}>
                    {editingReport ? 'Update Report' : 'Create Report'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Scheduled Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Scheduled Reports ({reports.length})</CardTitle>
          <CardDescription>Manage your automated QC reporting schedule</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Teams Channel</TableHead>
                <TableHead>Next Run</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getReportTypeIcon(report.report_type)}
                      <span className="capitalize">{report.report_type}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-mono text-sm">{report.schedule_expression}</p>
                      {report.last_run && (
                        <p className="text-xs text-gray-500">
                          Last: {new Date(report.last_run).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-blue-500" />
                      <span>#{report.teams_channel}</span>
                      {report.tag_agents && (
                        <Badge variant="outline" className="text-xs">
                          <Users className="h-3 w-3 mr-1" />
                          Tags
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">
                      {new Date(report.next_run).toLocaleString()}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={report.is_active}
                        onCheckedChange={() => toggleReportStatus(report.id, report.is_active)}
                      />
                      <Badge variant={report.is_active ? 'default' : 'secondary'}>
                        {report.is_active ? 'Active' : 'Paused'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => runReportNow(report.id)}
                        title="Run now"
                      >
                        <Send className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          editReport(report)
                          setIsCreateDialogOpen(true)
                        }}
                        title="Edit"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteReport(report.id)}
                        title="Delete"
                      >
                        <Trash className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {reports.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="mx-auto h-12 w-12 mb-4" />
              <p>No scheduled reports configured</p>
              <p className="text-sm">Create your first automated QC report</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Report Runs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Report Runs</CardTitle>
          <CardDescription>History of automated report executions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Run Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Agents Tagged</TableHead>
                <TableHead>Teams Message</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportRuns.map((run) => (
                <TableRow key={run.id}>
                  <TableCell>
                    {new Date(run.run_date).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={run.status === 'completed' ? 'default' : 'destructive'}>
                      {run.status === 'completed' ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <AlertTriangle className="h-3 w-3 mr-1" />
                      )}
                      {run.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {run.agents_tagged.map((agent, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          @{agent}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {run.teams_message_id ? (
                      <Badge variant="outline" className="text-xs">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Sent
                      </Badge>
                    ) : (
                      <span className="text-sm text-gray-500">
                        {run.error_message || 'No message'}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {reportRuns.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Clock className="mx-auto h-12 w-12 mb-4" />
              <p>No report runs yet</p>
              <p className="text-sm">Report execution history will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  AlertTriangle,
  Video,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  CalendarIcon,
  Bot,
  Send,
  Save,
  Settings,
  MessageSquare,
  FileSpreadsheet,
  Users,
  Tag,
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { format } from "date-fns"
import { useMockApi } from "../lib/hooks/useMockApi";
import { fetchErrorData, fetchSavedQueries, fetchScheduledReports } from "../lib/services/errorAnalysisDashboardApi";

interface ErrorAnalysisDashboardProps {
  userRole: "admin" | "team-lead" | "agent"
  selectedAgent?: string | null
}

interface ErrorData {
  id: string
  uuid: string
  agentId: string
  agentName: string
  type: string
  date: string
  time: string
  description: string
  videoId: string
  status: "pending" | "approved" | "rejected" | "acknowledged"
  approvedBy?: string
  acknowledgedAt?: string
}

interface SavedQuery {
  id: string
  name: string
  query: string
  filters: any
  createdAt: string
}

interface ScheduledReport {
  id: string
  name: string
  queryId: string
  schedule: string
  recipients: string[]
  template: string
  status: "active" | "paused"
  lastRun?: string
  nextRun: string
}

export function ErrorAnalysisDashboard({ userRole, selectedAgent }: ErrorAnalysisDashboardProps) {
  const { data: errors, loading: errorsLoading, error: errorsError } = useMockApi(fetchErrorData);
  const { data: savedQueries, loading: queriesLoading, error: queriesError } = useMockApi(fetchSavedQueries);
  const { data: scheduledReports, loading: reportsLoading, error: reportsError } = useMockApi(fetchScheduledReports);
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [uuidFilter, setUuidFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [aiQuery, setAiQuery] = useState("");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [autoReportEnabled, setAutoReportEnabled] = useState(true);
  const [customMessage, setCustomMessage] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("standard");
  const [tagAllUsers, setTagAllUsers] = useState(false);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);

  if (errorsLoading || queriesLoading || reportsLoading) return <div>Loading...</div>;
  if (errorsError || queriesError || reportsError) return <div>Error loading error analysis dashboard data.</div>;

  const handleVideoAccess = (videoId: string) => {
    alert(`Opening video recording: ${videoId}\n\nThis would redirect to your video system.`)
  }

  const handleApproveError = (errorId: string) => {
    // This function will need to be updated to use the actual errors data
    // For now, it will just log a message
    console.log(`Approving error with ID: ${errorId}`)
  }

  const handleRejectError = (errorId: string) => {
    // This function will need to be updated to use the actual errors data
    // For now, it will just log a message
    console.log(`Rejecting error with ID: ${errorId}`)
  }

  const handleAcknowledgeError = (errorId: string) => {
    // This function will need to be updated to use the actual errors data
    // For now, it will just log a message
    console.log(`Acknowledging error with ID: ${errorId}`)
  }

  const handleGenerateAIReport = async () => {
    setIsGeneratingReport(true)
    // Simulate AI report generation
    await new Promise((resolve) => setTimeout(resolve, 3000))
    console.log("AI Report generated with query:", aiQuery)
    setIsGeneratingReport(false)
  }

  const handleSaveQuery = () => {
    // This function will need to be updated to use the actual savedQueries data
    // For now, it will just log a message
    console.log("Saving query:", aiQuery)
  }

  // Filter errors based on search and filters
  const filteredErrors = errors?.filter((error) => {
    const matchesSearch =
      error.agentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      error.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      error.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || error.status === statusFilter
    const matchesType = typeFilter === "all" || error.type === typeFilter
    const matchesUuid = !uuidFilter || error.uuid.toLowerCase().includes(uuidFilter.toLowerCase())

    const matchesDateRange =
      (!dateFrom || new Date(error.date) >= dateFrom) && (!dateTo || new Date(error.date) <= dateTo)

    return matchesSearch && matchesStatus && matchesType && matchesUuid && matchesDateRange
  })

  // Separate today's and past errors
  const todayErrors = filteredErrors?.filter((error) => error.date === "2024-01-15")
  const pastErrors = filteredErrors?.filter((error) => error.date !== "2024-01-15")

  // Error analytics data
  const errorStats = {
    total: errors?.length || 0,
    today: todayErrors?.length || 0,
    pending: errors?.filter((e) => e.status === "pending").length || 0,
    approved: errors?.filter((e) => e.status === "approved").length || 0,
    acknowledged: errors?.filter((e) => e.status === "acknowledged").length || 0,
  }

  const errorTrendData = [
    { date: "Jan 10", count: 2 },
    { date: "Jan 11", count: 4 },
    { date: "Jan 12", count: 1 },
    { date: "Jan 13", count: 3 },
    { date: "Jan 14", count: 2 },
    { date: "Jan 15", count: 3 },
  ]

  const errorTypesData = [
    { type: "Document Quality", count: 8, percentage: 35 },
    { type: "Network Issue", count: 6, percentage: 26 },
    { type: "Identity Verification", count: 5, percentage: 22 },
    { type: "System Timeout", count: 4, percentage: 17 },
  ]

  const COLORS = ["#ef4444", "#f59e0b", "#3b82f6", "#10b981"]

  return (
    <div className="space-y-6">
      {/* AI-Powered Automated Reporting System */}
      {(userRole === "admin" || userRole === "team-lead") && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <Bot className="w-5 h-5" />
                <span>AI-Powered Automated Reporting System</span>
              </span>
              <div className="flex items-center space-x-2">
                <Switch id="auto-reports" checked={autoReportEnabled} onCheckedChange={setAutoReportEnabled} />
                <Label htmlFor="auto-reports" className="text-sm">
                  Auto Reports
                </Label>
              </div>
            </CardTitle>
            <CardDescription>
              Use AI to generate intelligent reports, schedule automated notifications, and manage team communications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* AI Query Interface */}
            <div className="space-y-4">
              <Label htmlFor="ai-query">AI Query Generator</Label>
              <Textarea
                id="ai-query"
                placeholder="Ask AI to generate reports... e.g., 'Generate a summary of today's errors with performance impact analysis and recommendations'"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                rows={3}
              />
              <div className="flex space-x-2">
                <Button onClick={handleGenerateAIReport} disabled={isGeneratingReport}>
                  <Bot className="w-4 h-4 mr-2" />
                  {isGeneratingReport ? "Generating..." : "Generate AI Report"}
                </Button>
                <Button variant="outline" onClick={handleSaveQuery}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Query
                </Button>
              </div>
            </div>

            {/* Saved Queries */}
            <div className="space-y-4">
              <h4 className="font-medium">Saved Queries</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedQueries?.map((query) => (
                  <div key={query.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium">{query.name}</h5>
                      <Badge variant="outline">{query.createdAt}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{query.query}</p>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => setAiQuery(query.query)}>
                        Load Query
                      </Button>
                      <Button size="sm" variant="outline">
                        <Settings className="w-3 h-3 mr-1" />
                        Schedule
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Report Scheduling */}
            <div className="space-y-4">
              <h4 className="font-medium">Scheduled Reports</h4>
              <div className="space-y-3">
                {scheduledReports?.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileSpreadsheet className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium">{report.name}</p>
                        <p className="text-sm text-gray-600">
                          Next run: {report.nextRun} | Recipients: {report.recipients.join(", ")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant="outline"
                        className={
                          report.status === "active"
                            ? "text-green-600 border-green-200"
                            : "text-gray-600 border-gray-200"
                        }
                      >
                        {report.status}
                      </Badge>
                      <Button size="sm" variant="outline">
                        <Settings className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Team Communication Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium">Team Communication</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch id="tag-all" checked={tagAllUsers} onCheckedChange={setTagAllUsers} />
                    <Label htmlFor="tag-all" className="text-sm">
                      Tag all team members
                    </Label>
                  </div>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select message template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard Report</SelectItem>
                      <SelectItem value="alert">Error Alert</SelectItem>
                      <SelectItem value="detailed">Detailed Analysis</SelectItem>
                      <SelectItem value="summary">Executive Summary</SelectItem>
                    </SelectContent>
                  </Select>
                  <Textarea
                    placeholder="Custom message to include with reports..."
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Quick Actions</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm">
                    <Send className="w-3 h-3 mr-1" />
                    Send Now
                  </Button>
                  <Button variant="outline" size="sm">
                    <MessageSquare className="w-3 h-3 mr-1" />
                    Teams Settings
                  </Button>
                  <Button variant="outline" size="sm">
                    <Users className="w-3 h-3 mr-1" />
                    Manage Recipients
                  </Button>
                  <Button variant="outline" size="sm">
                    <Tag className="w-3 h-3 mr-1" />
                    Tag Settings
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search errors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Input placeholder="Filter by UUID..." value={uuidFilter} onChange={(e) => setUuidFilter(e.target.value)} />

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="acknowledged">Acknowledged</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Error Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Document Quality">Document Quality</SelectItem>
                <SelectItem value="Network Issue">Network Issue</SelectItem>
                <SelectItem value="Identity Verification">Identity Verification</SelectItem>
                <SelectItem value="System Timeout">System Timeout</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start text-left font-normal bg-transparent">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFrom ? format(dateFrom, "PPP") : "From date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start text-left font-normal bg-transparent">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateTo ? format(dateTo, "PPP") : "To date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* Error Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Errors</p>
                <p className="text-2xl font-bold text-gray-900">{errorStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Errors</p>
                <p className="text-2xl font-bold text-gray-900">{errorStats.today}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {(userRole === "admin" || userRole === "team-lead") && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <XCircle className="w-8 h-8 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                  <p className="text-2xl font-bold text-gray-900">{errorStats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {userRole === "agent" ? "Acknowledged" : "Approved"}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {userRole === "agent" ? errorStats.acknowledged : errorStats.approved}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold">Avg</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Daily Average</p>
                <p className="text-2xl font-bold text-gray-900">2.1</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Analysis Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Error Trend</CardTitle>
            <CardDescription>Daily error count over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={errorTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#ef4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Error Types Distribution</CardTitle>
            <CardDescription>Breakdown by error category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={errorTypesData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  label={({ type, percentage }) => `${type}: ${percentage}%`}
                >
                  {errorTypesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Team Lead Error Approval Section */}
      {(userRole === "admin" || userRole === "team-lead") && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Error Approval & Management</span>
            </CardTitle>
            <CardDescription>
              Review and approve team member errors before they appear in agent dashboards
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Error Management Table */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>UUID</TableHead>
                    <TableHead>Agent</TableHead>
                    <TableHead>Date/Time</TableHead>
                    <TableHead>Error Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Video</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredErrors?.map((error) => (
                    <TableRow key={error.id}>
                      <TableCell className="font-mono text-xs">{error.uuid}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="text-xs">
                              {error.agentName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{error.agentName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {error.date} {error.time}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-red-600 border-red-200">
                          {error.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="text-sm text-gray-600 truncate">{error.description}</p>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            error.status === "approved"
                              ? "text-green-600 border-green-200"
                              : error.status === "rejected"
                                ? "text-red-600 border-red-200"
                                : error.status === "acknowledged"
                                  ? "text-blue-600 border-blue-200"
                                  : "text-yellow-600 border-yellow-200"
                          }
                        >
                          {error.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleVideoAccess(error.videoId)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Video className="w-4 h-4 mr-1" />
                          Watch
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          {error.status === "pending" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleApproveError(error.id)}
                                className="text-green-600 hover:text-green-800"
                              >
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRejectError(error.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          {error.status === "approved" && (
                            <Button variant="outline" size="sm" disabled>
                              Approved
                            </Button>
                          )}
                          {error.status === "acknowledged" && (
                            <Button variant="outline" size="sm" disabled>
                              Acknowledged
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-600">
                Showing 1-{filteredErrors?.length || 0} of {errors?.length || 0} errors
              </p>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Details Tables */}
      <Card>
        <CardHeader>
          <CardTitle>Error Details</CardTitle>
          <CardDescription>
            {userRole === "agent"
              ? "Your error history and acknowledgment status"
              : "Detailed error records for analysis"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="today" className="space-y-4">
            <TabsList>
              <TabsTrigger value="today">Today's Errors ({todayErrors?.length || 0})</TabsTrigger>
              <TabsTrigger value="past">Past Errors ({pastErrors?.length || 0})</TabsTrigger>
            </TabsList>

            <TabsContent value="today">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>UUID</TableHead>
                    {(userRole === "admin" || userRole === "team-lead") && <TableHead>Agent</TableHead>}
                    <TableHead>Time</TableHead>
                    <TableHead>Error Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Video</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {todayErrors?.map((error) => (
                    <TableRow key={error.id}>
                      <TableCell className="font-mono text-xs">{error.uuid}</TableCell>
                      {(userRole === "admin" || userRole === "team-lead") && (
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Avatar className="w-6 h-6">
                              <AvatarFallback className="text-xs">
                                {error.agentName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{error.agentName}</span>
                          </div>
                        </TableCell>
                      )}
                      <TableCell className="font-medium">{error.time}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-red-600 border-red-200">
                          {error.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="text-sm text-gray-600 truncate">{error.description}</p>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            error.status === "acknowledged"
                              ? "text-green-600 border-green-200"
                              : error.status === "approved"
                                ? "text-blue-600 border-blue-200"
                                : "text-yellow-600 border-yellow-200"
                          }
                        >
                          {error.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleVideoAccess(error.videoId)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Video className="w-4 h-4 mr-1" />
                          Watch
                        </Button>
                      </TableCell>
                      <TableCell>
                        {userRole === "agent" && error.status === "approved" && (
                          <Button variant="outline" size="sm" onClick={() => handleAcknowledgeError(error.id)}>
                            Acknowledge
                          </Button>
                        )}
                        {error.status === "acknowledged" && (
                          <Button variant="outline" size="sm" disabled>
                            Acknowledged
                          </Button>
                        )}
                        {(userRole === "admin" || userRole === "team-lead") && error.status === "pending" && (
                          <div className="flex space-x-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApproveError(error.id)}
                              className="text-green-600 hover:text-green-800"
                            >
                              Approve
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="past">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>UUID</TableHead>
                    {(userRole === "admin" || userRole === "team-lead") && <TableHead>Agent</TableHead>}
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Error Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Video</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pastErrors?.map((error) => (
                    <TableRow key={error.id}>
                      <TableCell className="font-mono text-xs">{error.uuid}</TableCell>
                      {(userRole === "admin" || userRole === "team-lead") && (
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Avatar className="w-6 h-6">
                              <AvatarFallback className="text-xs">
                                {error.agentName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{error.agentName}</span>
                          </div>
                        </TableCell>
                      )}
                      <TableCell>{error.date}</TableCell>
                      <TableCell className="font-medium">{error.time}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-red-600 border-red-200">
                          {error.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="text-sm text-gray-600 truncate">{error.description}</p>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            error.status === "acknowledged"
                              ? "text-green-600 border-green-200"
                              : error.status === "approved"
                                ? "text-blue-600 border-blue-200"
                                : "text-yellow-600 border-yellow-200"
                          }
                        >
                          {error.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleVideoAccess(error.videoId)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Video className="w-4 h-4 mr-1" />
                          Watch
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" disabled>
                          {error.status === "acknowledged" ? "Acknowledged" : "Completed"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

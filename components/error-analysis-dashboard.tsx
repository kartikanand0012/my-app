"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"
import { useDashboard } from "@/lib/dashboard-context"
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
  const { user } = useAuth()
  const {
    errorStats,
    errorTrendData,
    errorTypesData,
    errorDetails,
    savedQueries: contextSavedQueries,
    scheduledReports: contextScheduledReports,
    loading: contextLoading,
    error: contextError,
    refreshErrorData
  } = useDashboard()

  // Local states for error analysis specific functionality
  const [dateFrom, setDateFrom] = useState<Date>()
  const [dateTo, setDateTo] = useState<Date>()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [uuidFilter, setUuidFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  
  // Local error data with filters applied
  const [filteredErrors, setFilteredErrors] = useState<ErrorData[]>([])

  // AI Reporting System States
  const [aiQuery, setAiQuery] = useState("")
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>(contextSavedQueries || [])
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>(contextScheduledReports || [])
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const [autoReportEnabled, setAutoReportEnabled] = useState(true)
  const [customMessage, setCustomMessage] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState("standard")
  const [tagAllUsers, setTagAllUsers] = useState(false)
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([])
  const [openVideoId, setOpenVideoId] = useState<string | null>(null)

  // Update local states when context data changes
  useEffect(() => {
    setSavedQueries(contextSavedQueries || [])
    setScheduledReports(contextScheduledReports || [])
  }, [contextSavedQueries, contextScheduledReports])

  // Fetch filtered error details when filters change
  const fetchFilteredErrorDetails = async () => {
    try {
      const filters = {
        date_range: getDateRangeString(),
        search: searchTerm || undefined,
        status_filter: statusFilter !== 'all' ? statusFilter : undefined,
        type_filter: typeFilter !== 'all' ? typeFilter : undefined,
        uuid_filter: uuidFilter || undefined,
        page: currentPage,
        limit: 50
      }
      
      const response = await apiClient.getErrorDetails(filters)
      if (response.success && response.data) {
        setFilteredErrors(response.data.errors || [])
      } else {
        setFilteredErrors([])
      }
    } catch (err) {
      console.error('Error fetching filtered error details:', err)
      setFilteredErrors([])
    }
  }

  // Fetch filtered data when filter parameters change
  useEffect(() => {
    if (searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || uuidFilter || dateFrom || dateTo) {
      fetchFilteredErrorDetails()
    } else {
      // Use context data when no filters are applied
      setFilteredErrors(errorDetails || [])
    }
  }, [searchTerm, statusFilter, typeFilter, uuidFilter, dateFrom, dateTo, currentPage, errorDetails])

  const handleVideoAccess = (videoId: string) => {
    setOpenVideoId(videoId)
  }

  const handleApproveError = async (errorId: string) => {
    try {
      const response = await apiClient.approveError(errorId)
      if (response.success) {
        // Refresh error data after approval
        await refreshErrorData()
        fetchFilteredErrorDetails()
      }
    } catch (err) {
      console.error('Error approving error:', err)
      alert('Failed to approve error')
    }
  }

  const handleAcknowledgeError = async (errorId: string) => {
    try {
      const response = await apiClient.acknowledgeError(errorId)
      if (response.success) {
        // Refresh error data after acknowledgment
        await refreshErrorData()
        fetchFilteredErrorDetails()
      }
    } catch (err) {
      console.error('Error acknowledging error:', err)
      alert('Failed to acknowledge error')
    }
  }

  const handleGenerateAIReport = async () => {
    if (!aiQuery.trim()) return
    
    setIsGeneratingReport(true)
    try {
      const filters = {
        date_range: getDateRangeString(),
        status_filter: statusFilter !== 'all' ? statusFilter : undefined,
        type_filter: typeFilter !== 'all' ? typeFilter : undefined
      }
      
      const response = await apiClient.generateAIReport({ query: aiQuery, filters })
      if (response.success) {
        alert('AI Report generated successfully!')
        console.log('AI Report generated:', response.data)
      } else {
        alert('Failed to generate AI report')
      }
    } catch (err) {
      console.error('Error generating AI report:', err)
      alert('Failed to generate AI report')
    } finally {
      setIsGeneratingReport(false)
    }
  }

  const handleSaveQuery = async () => {
    if (!aiQuery.trim()) return
    
    try {
      const queryData = {
        name: `Query ${savedQueries.length + 1}`,
        query: aiQuery,
        filters: {
          dateFrom: dateFrom?.toISOString(),
          dateTo: dateTo?.toISOString(),
          statusFilter,
          typeFilter
        }
      }
      
      const response = await apiClient.saveQuery(queryData)
      if (response.success) {
        alert('Query saved successfully!')
        // Refresh saved queries
        const queriesResponse = await apiClient.getSavedQueries()
        if (queriesResponse.success && queriesResponse.data) {
          setSavedQueries(queriesResponse.data)
        }
      } else {
        alert('Failed to save query')
      }
    } catch (err) {
      console.error('Error saving query:', err)
      alert('Failed to save query')
    }
  }

  // Helper function to get date range string
  const getDateRangeString = () => {
    if (dateFrom && dateTo) {
      return `${format(dateFrom, 'yyyy-MM-dd')}_${format(dateTo, 'yyyy-MM-dd')}`
    }
    return 'today'
  }

  // Separate today's and past errors
  const today = new Date().toISOString().split('T')[0]
  const todayErrors = filteredErrors.filter((error) => error.date === today)
  const pastErrors = filteredErrors.filter((error) => error.date !== today)

  // Show loading state
  if (contextLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading error analysis data...</p>
      </div>
    )
  }

  // Show error state
  if (contextError) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-600 mb-4">
          <XCircle className="h-8 w-8 mx-auto mb-2" />
          <p className="text-lg font-semibold">Error Loading Data</p>
          <p className="text-sm">{contextError}</p>
        </div>
        <button 
          onClick={() => refreshErrorData()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    )
  }

  // Show NO DATA AVAILABLE if no error data
  if (!filteredErrors.length && !errorStats) {
    return (
      <div className="p-8 text-center">
        <div className="text-gray-600">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
          <p className="text-lg font-semibold">NO DATA AVAILABLE</p>
          <p className="text-sm">No error analysis data found.</p>
        </div>
      </div>
    )
  }

  const COLORS = ["#ef4444", "#f59e0b", "#3b82f6", "#10b981"]

  return (
    <>
      <div className="space-y-6">
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
                  <p className="text-2xl font-bold text-gray-900">{errorStats?.total || 0}</p>
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
                  <p className="text-2xl font-bold text-gray-900">{errorStats?.today || 0}</p>
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
                    <p className="text-2xl font-bold text-gray-900">{errorStats?.pending || 0}</p>
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
                    {userRole === "agent" ? (errorStats?.acknowledged || 0) : (errorStats?.approved || 0)}
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
                  <p className="text-2xl font-bold text-gray-900">{errorStats?.dailyAverage || 0}</p>
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
              {errorTrendData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={errorTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#ef4444" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-500">
                  <div className="text-center">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                    <p>NO DATA AVAILABLE</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Error Types Distribution</CardTitle>
              <CardDescription>Breakdown by error category</CardDescription>
            </CardHeader>
            <CardContent>
              {errorTypesData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={errorTypesData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={40}
                      fill="#8884d8"
                      dataKey="count"
                      label={({ type, count }) => `${type}: ${count}`}
                    >
                      {errorTypesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-500">
                  <div className="text-center">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                    <p>NO DATA AVAILABLE</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

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
                <TabsTrigger value="today">Today's Errors ({todayErrors.length})</TabsTrigger>
                <TabsTrigger value="past">Past Errors ({pastErrors.length})</TabsTrigger>
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
                    {todayErrors.length > 0 ? todayErrors.map((error) => (
                      <TableRow key={error.id}>
                        <TableCell className="font-mono text-xs">{error.uuid}</TableCell>
                        {(userRole === "admin" || userRole === "team-lead") && (
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Avatar className="w-6 h-6">
                                <AvatarFallback className="text-xs">
                                  {error.agentName
                                    ?.split(" ")
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
                    )) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <div className="text-gray-500">
                            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                            <p>NO DATA AVAILABLE</p>
                            <p className="text-sm">No errors found for today.</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
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
                    {pastErrors.length > 0 ? pastErrors.map((error) => (
                      <TableRow key={error.id}>
                        <TableCell className="font-mono text-xs">{error.uuid}</TableCell>
                        {(userRole === "admin" || userRole === "team-lead") && (
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Avatar className="w-6 h-6">
                                <AvatarFallback className="text-xs">
                                  {error.agentName
                                    ?.split(" ")
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
                    )) : (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8">
                          <div className="text-gray-500">
                            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                            <p>NO DATA AVAILABLE</p>
                            <p className="text-sm">No past errors found.</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
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
                  {savedQueries.length > 0 ? savedQueries.map((query) => (
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
                  )) : (
                    <div className="col-span-2 text-center py-8 text-gray-500">
                      <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                      <p>NO DATA AVAILABLE</p>
                      <p className="text-sm">No saved queries found.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Report Scheduling */}
              <div className="space-y-4">
                <h4 className="font-medium">Scheduled Reports</h4>
                <div className="space-y-3">
                  {scheduledReports.length > 0 ? scheduledReports.map((report) => (
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
                  )) : (
                    <div className="text-center py-8 text-gray-500">
                      <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                      <p>NO DATA AVAILABLE</p>
                      <p className="text-sm">No scheduled reports found.</p>
                    </div>
                  )}
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
      </div>
      {/* Video Modal */}
      <Dialog open={!!openVideoId} onOpenChange={() => setOpenVideoId(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Watch Call Video</DialogTitle>
          </DialogHeader>
          {openVideoId && (
            <video
              src={openVideoId.startsWith('http') ? openVideoId : `/api/videos/${openVideoId}`}
              controls
              autoPlay
              style={{ width: "100%", borderRadius: 8 }}
            >
              Your browser does not support the video tag.
            </video>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
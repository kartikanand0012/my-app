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
import { useAuth } from "@/lib/auth-context"
import { useDashboard } from "@/lib/dashboard-context"
import { apiClient } from "@/lib/api-client"

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
  category?: string
  severity?: string
  sessionId?: string
  sessionStartedAt?: string
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
    refreshErrorData,
    loadErrorDetails
  } = useDashboard()

  // Local states for error analysis specific functionality
  const [dateFrom, setDateFrom] = useState<Date>()
  const [dateTo, setDateTo] = useState<Date>()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [uuidFilter, setUuidFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [errors, setErrors] = useState<ErrorData[]>([])
  const [filteredErrors, setFilteredErrors] = useState<ErrorData[]>([])

  // AI Reporting System States
  const [aiQuery, setAiQuery] = useState("")
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>([])
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([])
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const [autoReportEnabled, setAutoReportEnabled] = useState(true)
  const [customMessage, setCustomMessage] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState("standard")
  const [tagAllUsers, setTagAllUsers] = useState(false)
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([])
  const [openVideoId, setOpenVideoId] = useState<string | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)

  // Load error details when component mounts (on-demand loading)
  useEffect(() => {
    if (!contextLoading && errorDetails.length === 0) {
      console.log('🔄 Loading error details for error analysis dashboard...')
      loadErrorDetails()
    }
  }, [contextLoading, errorDetails.length, loadErrorDetails])

  // Fetch filtered error details using NEW detailed error list API
  const fetchFilteredErrorDetails = async () => {
    try {
      const filters = {
        date_filter: getDateFilterString(),
        search: searchTerm || undefined,
        error_type_filter: typeFilter !== 'all' ? typeFilter : undefined,
        agent_id_filter: selectedAgent || undefined,
        page: currentPage,
        limit: 50
      }
      
      const response = await apiClient.getDetailedErrorList(filters)
      if (response.success && response.data && response.data.errors) {
        // Transform the new API data format to match the expected format
        const transformedErrors = response.data.errors.map((error: any) => ({
          id: error.uuid,
          uuid: error.uuid,
          agentId: error.agentId?.toString() || '',
          agentName: error.agentName,
          type: error.errorType,
          date: new Date(error.sessionStartedAt).toLocaleDateString(),
          time: new Date(error.sessionStartedAt).toLocaleTimeString(),
          description: error.rejectionReason || error.reviewComments || 'Error detected',
          videoId: error.sessionId,
          status: (error.errorType === 'agent_rejected' ? 'acknowledged' : 
                 error.errorType === 'ia_flagged_critical' ? 'pending' : 'approved') as "pending" | "approved" | "rejected" | "acknowledged",
          category: error.agentRejectionCategory || error.iaErrorCategory,
          severity: error.errorSeverity,
          sessionId: error.sessionId
        }))
        setFilteredErrors(transformedErrors)
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
      console.log('🔍 Applying filters, fetching filtered error details...')
      fetchFilteredErrorDetails()
    } else {
      // Use context data when no filters are applied, but transform it first
      console.log('📋 No filters applied, using context data:', errorDetails?.length || 0, 'items')
      if (errorDetails && errorDetails.length > 0) {
        // Transform context data to match expected format
        const transformedErrors = errorDetails.map((error: any) => ({
          id: error.uuid || error.id,
          uuid: error.uuid || error.id,
          agentId: error.agentId?.toString() || '',
          agentName: error.agentName || 'Unknown Agent',
          type: error.errorType || error.type || 'Unknown',
          date: error.sessionStartedAt ? new Date(error.sessionStartedAt).toLocaleDateString() : new Date().toLocaleDateString(),
          time: error.sessionStartedAt ? new Date(error.sessionStartedAt).toLocaleTimeString() : '',
          description: error.rejectionReason || error.reviewComments || error.description || 'Error detected',
          videoId: error.sessionId || error.videoId || '',
          status: (error.errorType === 'agent_rejected' ? 'acknowledged' : 
                 error.errorType === 'ia_flagged_critical' ? 'pending' : 'approved') as "pending" | "approved" | "rejected" | "acknowledged",
          category: error.agentRejectionCategory || error.iaErrorCategory || error.category,
          severity: error.errorSeverity || error.severity,
          sessionId: error.sessionId || error.videoId,
          sessionStartedAt: error.sessionStartedAt
        }))
        setFilteredErrors(transformedErrors)
      } else {
        setFilteredErrors([])
      }
    }
  }, [errorDetails, searchTerm, statusFilter, typeFilter, uuidFilter, dateFrom, dateTo, currentPage, selectedAgent])

  // Initialize sample data
  useEffect(() => {
    // Generate sample error data based on user role
    const generateErrorData = (): ErrorData[] => {
      const baseErrors: ErrorData[] = [
        {
          id: "ERR_001",
          uuid: "550e8400-e29b-41d4-a716-446655440001",
          agentId: "AGT_001",
          agentName: "Rajesh Kumar",
          type: "Document Quality",
          date: "2024-01-15",
          time: "14:30",
          description: "Customer document was blurry, requested re-capture",
          videoId: "VID_001_20240115_1430",
          status: userRole === "agent" ? "approved" : "pending",
        },
        {
          id: "ERR_002",
          uuid: "550e8400-e29b-41d4-a716-446655440002",
          agentId: "AGT_002",
          agentName: "Priya Sharma",
          type: "Network Issue",
          date: "2024-01-15",
          time: "13:15",
          description: "Connection dropped during verification process",
          videoId: "VID_002_20240115_1315",
          status: "approved",
          approvedBy: "Team Lead",
          acknowledgedAt: "2024-01-15 13:45",
        },
        {
          id: "ERR_003",
          uuid: "550e8400-e29b-41d4-a716-446655440003",
          agentId: "AGT_003",
          agentName: "Amit Patel",
          type: "System Timeout",
          date: "2024-01-15",
          time: "15:45",
          description: "System timeout while processing biometric data",
          videoId: "VID_003_20240115_1545",
          status: userRole === "agent" ? "approved" : "pending",
        },
        {
          id: "ERR_004",
          uuid: "550e8400-e29b-41d4-a716-446655440004",
          agentId: "AGT_001",
          agentName: "Rajesh Kumar",
          type: "Audio Issue",
          date: "2024-01-14",
          time: "13:15",
          description: "Audio quality was poor during customer interaction",
          videoId: "VID_001_20240114_1315",
          status: "acknowledged",
          approvedBy: "Team Lead",
          acknowledgedAt: "2024-01-14 14:00",
        },
        {
          id: "ERR_005",
          uuid: "550e8400-e29b-41d4-a716-446655440005",
          agentId: "AGT_002",
          agentName: "Priya Sharma",
          type: "Identity Verification",
          date: "2024-01-13",
          time: "11:30",
          description: "Identity verification failed due to poor lighting",
          videoId: "VID_002_20240113_1130",
          status: "acknowledged",
          approvedBy: "Team Lead",
          acknowledgedAt: "2024-01-13 12:00",
        },
      ]

      return baseErrors
    }

    // Generate sample saved queries
    const generateSavedQueries = (): SavedQuery[] => [
      {
        id: "Q001",
        name: "Daily Error Summary",
        query: "Generate a summary of all errors from today with agent performance impact",
        filters: { dateRange: "today", includeVideos: true },
        createdAt: "2024-01-15",
      },
      {
        id: "Q002",
        name: "Weekly Team Performance",
        query: "Analyze team error patterns and provide improvement recommendations",
        filters: { dateRange: "week", groupBy: "agent" },
        createdAt: "2024-01-10",
      },
    ]

    // Generate sample scheduled reports
    const generateScheduledReports = (): ScheduledReport[] => [
      {
        id: "SR001",
        name: "Daily Error Alert",
        queryId: "Q001",
        schedule: "daily-16:00",
        recipients: ["team-lead", "admin"],
        template: "alert",
        status: "active",
        lastRun: "2024-01-15 16:00",
        nextRun: "2024-01-16 16:00",
      },
      {
        id: "SR002",
        name: "Weekly Performance Report",
        queryId: "Q002",
        schedule: "weekly-monday-09:00",
        recipients: ["all-agents", "management"],
        template: "detailed",
        status: "active",
        nextRun: "2024-01-22 09:00",
      },
    ]

    setErrors(generateErrorData())
    setSavedQueries(generateSavedQueries())
    setScheduledReports(generateScheduledReports())
  }, [userRole])

  const handleVideoAccess = (videoId: string) => {
    alert(`Opening video recording: ${videoId}\n\nThis would redirect to your video system.`)
  }

  const handleApproveError = (errorId: string) => {
    setErrors(
      errors.map((error) =>
        error.id === errorId ? { ...error, status: "approved", approvedBy: "Current User" } : error,
      ),
    )
  }

  const handleRejectError = (errorId: string) => {
    setErrors(errors.map((error) => (error.id === errorId ? { ...error, status: "rejected" } : error)))
  }

  const handleAcknowledgeError = (errorId: string) => {
    setErrors(
      errors.map((error) =>
        error.id === errorId ? { ...error, status: "acknowledged", acknowledgedAt: new Date().toISOString() } : error,
      ),
    )
  }

  const handleGenerateAIReport = async () => {
    setIsGeneratingReport(true)
    // Simulate AI report generation
    await new Promise((resolve) => setTimeout(resolve, 3000))
    console.log("AI Report generated with query:", aiQuery)
    setIsGeneratingReport(false)
  }

  const handleSaveQuery = () => {
    const newQuery: SavedQuery = {
      id: `Q${String(savedQueries.length + 1).padStart(3, "0")}`,
      name: `Query ${savedQueries.length + 1}`,
      query: aiQuery,
      filters: { dateFrom, dateTo, statusFilter, typeFilter },
      createdAt: new Date().toISOString().split("T")[0],
    }
    setSavedQueries([...savedQueries, newQuery])
    alert("Query saved successfully!")
  }

  const handleSyncErrorAnalysis = async () => {
    if (userRole !== 'admin') {
      alert('Only administrators can sync error analysis data')
      return
    }
    
    setIsSyncing(true)
    try {
      const response = await apiClient.syncErrorAnalysisTable()
      if (response.success) {
        alert('Error analysis data synced successfully!')
        // Refresh all error data after sync
        await refreshErrorData()
        fetchFilteredErrorDetails()
      } else {
        alert('Failed to sync error analysis data')
      }
    } catch (err) {
      console.error('Error syncing error analysis:', err)
      alert('Failed to sync error analysis data')
    } finally {
      setIsSyncing(false)
    }
  }

  // Helper function to get date range string (for legacy APIs)
  const getDateRangeString = () => {
    if (dateFrom && dateTo) {
      return `${format(dateFrom, 'yyyy-MM-dd')}_${format(dateTo, 'yyyy-MM-dd')}`
    }
    return 'today'
  }

  // Helper function to get date filter string (for NEW APIs)
  const getDateFilterString = () => {
    if (dateFrom && dateTo) {
      const diffTime = Math.abs(dateTo.getTime() - dateFrom.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      if (diffDays <= 1) return 'today'
      if (diffDays <= 7) return 'this_week'
      if (diffDays <= 30) return 'this_month'
      return 'all'
    }
    return 'today'
  }

  // Separate today's and past errors with better date handling
  const today = new Date().toLocaleDateString() // Use local date format for comparison
  const todayErrors = filteredErrors.filter((error) => {
    const errorDate = new Date(error.sessionStartedAt || error.date).toLocaleDateString()
    return errorDate === today
  })
  const pastErrors = filteredErrors.filter((error) => {
    const errorDate = new Date(error.sessionStartedAt || error.date).toLocaleDateString()
    return errorDate !== today
  })

  console.log('📊 Error analysis data:', {
    totalFiltered: filteredErrors.length,
    todayCount: todayErrors.length,
    pastCount: pastErrors.length,
    contextErrorDetails: errorDetails.length,
    sampleError: filteredErrors[0]
  })

  // Local error analytics data (fallback when context data is not available)
  const localErrorStats = {
    total: errors.length,
    today: todayErrors.length,
    pending: errors.filter((e) => e.status === "pending").length,
    approved: errors.filter((e) => e.status === "approved").length,
    acknowledged: errors.filter((e) => e.status === "acknowledged").length,
  }

  const localErrorTrendData = [
    { date: "Jan 10", count: 2 },
    { date: "Jan 11", count: 4 },
    { date: "Jan 12", count: 1 },
    { date: "Jan 13", count: 3 },
    { date: "Jan 14", count: 2 },
    { date: "Jan 15", count: 3 },
  ]

  const localErrorTypesData = [
    { type: "Document Quality", count: 8, percentage: 35 },
    { type: "Network Issue", count: 6, percentage: 26 },
    { type: "Identity Verification", count: 5, percentage: 22 },
    { type: "System Timeout", count: 4, percentage: 17 },
  ]

  const COLORS = ["#ef4444", "#f59e0b", "#3b82f6", "#10b981"]

  return (
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
                <SelectItem value="agent_rejected">Agent Rejected</SelectItem>
                <SelectItem value="ia_flagged_critical">IA Flagged Critical</SelectItem>
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
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Error Analysis Filters</h3>
              {userRole === 'admin' && (
                <Button 
                  onClick={handleSyncErrorAnalysis}
                  disabled={isSyncing}
                  variant="outline"
                  size="sm"
                >
                  {isSyncing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      Syncing...
                    </>
                  ) : (
                    <>
                      <Settings className="w-4 h-4 mr-2" />
                      Sync Data
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Errors</p>
                <p className="text-2xl font-bold text-gray-900">{errorStats?.today_errors || errorStats?.today || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <XCircle className="w-8 h-8 text-red-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Agent Rejected</p>
                <p className="text-2xl font-bold text-gray-900">{errorStats?.agent_rejected || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">IA Flagged Critical</p>
                <p className="text-2xl font-bold text-gray-900">{errorStats?.ia_flagged || 0}</p>
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
                <p className="text-2xl font-bold text-gray-900">{errorStats?.daily_average || errorStats?.dailyAverage || 0}</p>
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
              <LineChart data={errorTrendData || localErrorTrendData}>
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
                  data={errorTypesData || localErrorTypesData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={40}
                  fill="#8884d8"
                  dataKey="count"
                  label={({ type, count }) => `${type}: ${count}`}
                >
                  {(errorTypesData || localErrorTypesData).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
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
                  {todayErrors.map((error) => (
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
                  {pastErrors.map((error) => (
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
                {savedQueries.map((query) => (
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
                {scheduledReports.map((report) => (
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
    </div>
  )
}

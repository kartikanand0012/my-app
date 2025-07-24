"use client"

import { useState, useEffect, useCallback, useRef } from "react"
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
  const [reportHistory, setReportHistory] = useState<any[]>([])
  const [activeReports, setActiveReports] = useState<any[]>([])
  const [loadingSavedQueries, setLoadingSavedQueries] = useState(false)
  const [loadingScheduledReports, setLoadingScheduledReports] = useState(false)
  const [savingQuery, setSavingQuery] = useState(false)
  const [queryName, setQueryName] = useState("")
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [generatedReport, setGeneratedReport] = useState<any>(null)
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  const [chatMessages, setChatMessages] = useState<Array<{id: string, type: 'user' | 'ai', content: string, timestamp: Date, isTyping?: boolean}>>([{
    id: '1',
    type: 'ai',
    content: 'Hello! I\'m your AI assistant for error analysis. I can help you generate reports, analyze trends, and provide insights. What would you like to know about your error data?',
    timestamp: new Date()
  }])
  const [isTyping, setIsTyping] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Load error trends data only once on mount
  const hasLoadedTrends = useRef(false)
  useEffect(() => {
    if (hasLoadedTrends.current) return
    
    const loadErrorTrendsData = async () => {
      try {
        const response = await apiClient.getErrorTrendsChart('30_days', 'daily')
        if (response.success && response.data?.chartData) {
          console.log('📊 Error trends data loaded:', response.data.chartData.length, 'data points')
          hasLoadedTrends.current = true
        }
      } catch (error) {
        console.error('Error loading trends data:', error)
      }
    }

    loadErrorTrendsData()
  }, [])

  // Cleanup effect to clear all timers on unmount
  useEffect(() => {
    return () => {
      if (debouncedFetchRef.current) {
        clearTimeout(debouncedFetchRef.current)
      }
    }
  }, [])

  // Load error details only once when component mounts
  const hasInitiallyLoaded = useRef(false)
  useEffect(() => {
    if (!hasInitiallyLoaded.current && !contextLoading) {
      console.log('🔄 Initial load of error details...')
      hasInitiallyLoaded.current = true
      loadErrorDetails()
    }
  }, [contextLoading, loadErrorDetails])

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

  // Debounced fetch function to prevent multiple API calls
  const debouncedFetchRef = useRef<NodeJS.Timeout | null>(null)
  const lastFetchParamsRef = useRef<string>('')
  

  // Create debounced function outside useEffect
  const debouncedFetchFilteredErrorDetails = useCallback(() => {
    const currentParams = JSON.stringify({
      searchTerm, statusFilter, typeFilter, uuidFilter, 
      dateFrom: dateFrom?.toISOString(), dateTo: dateTo?.toISOString(), 
      currentPage, selectedAgent
    })
    
    // Skip if parameters haven't changed
    if (lastFetchParamsRef.current === currentParams) {
      console.log('⏭️ Skipping API call - parameters unchanged')
      return
    }
    
    if (debouncedFetchRef.current) {
      clearTimeout(debouncedFetchRef.current)
    }
    
    debouncedFetchRef.current = setTimeout(() => {
      console.log('🔍 Making API call after debounce')
      lastFetchParamsRef.current = currentParams
      fetchFilteredErrorDetails()
    }, 500)
  }, [searchTerm, statusFilter, typeFilter, uuidFilter, dateFrom, dateTo, currentPage, selectedAgent])

  // Simplified filter logic - only call API when actual filters are applied
  useEffect(() => {
    const hasActiveFilters = searchTerm.trim() || 
                           statusFilter !== 'all' || 
                           typeFilter !== 'all' || 
                           uuidFilter.trim() || 
                           dateFrom || 
                           dateTo
    
    if (hasActiveFilters) {
      console.log('🔍 Filters detected, calling debounced API')
      debouncedFetchFilteredErrorDetails()
    } else {
      console.log('📋 No filters, using context data')
      // Clear any pending API calls
      if (debouncedFetchRef.current) {
        clearTimeout(debouncedFetchRef.current)
        debouncedFetchRef.current = null
      }
      
      // Transform context data only when it changes
      if (errorDetails?.length > 0) {
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
  }, [searchTerm, statusFilter, typeFilter, uuidFilter, dateFrom, dateTo, debouncedFetchFilteredErrorDetails])

  // Transform context data when errorDetails change (minimal dependency)
  useEffect(() => {
    const hasActiveFilters = searchTerm.trim() || 
                           statusFilter !== 'all' || 
                           typeFilter !== 'all' || 
                           uuidFilter.trim() || 
                           dateFrom || 
                           dateTo
    
    // Only use context data when no filters are active
    if (!hasActiveFilters && errorDetails?.length >= 0) {
      console.log('📊 Context data changed, transforming...')
      if (errorDetails.length > 0) {
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
  }, [errorDetails])

  // Load saved queries, scheduled reports, and team members only once
  const hasLoadedAPIData = useRef(false)
  useEffect(() => {
    if (hasLoadedAPIData.current) return
    
    const loadAPIData = async () => {
      if (userRole === 'admin' || userRole === 'team-lead') {
        hasLoadedAPIData.current = true
        await loadSavedQueries()
        await loadScheduledReports()
        await loadTeamMembers()
      }
    }
    loadAPIData()
  }, [userRole])

  // Load saved queries from API
  const loadSavedQueries = async () => {
    try {
      setLoadingSavedQueries(true)
      const response = await apiClient.getSavedQueries()
      if (response.success && response.data) {
        setSavedQueries(response.data)
      }
    } catch (error) {
      console.error('Error loading saved queries:', error)
    } finally {
      setLoadingSavedQueries(false)
    }
  }

  // Load scheduled reports from API
  const loadScheduledReports = async () => {
    try {
      setLoadingScheduledReports(true)
      const response = await apiClient.getScheduledReports()
      if (response.success && response.data) {
        setScheduledReports(response.data)
        // Filter active reports for the active reports table
        setActiveReports(response.data.filter((report: any) => report.status === 'active'))
      }
    } catch (error) {
      console.error('Error loading scheduled reports:', error)
    } finally {
      setLoadingScheduledReports(false)
    }
  }

  // Load team members for tagging functionality
  const loadTeamMembers = async () => {
    try {
      const response = await apiClient.getAllAgents()
      if (response.success && response.data) {
        setTeamMembers(response.data)
      }
    } catch (error) {
      console.error('Error loading team members:', error)
    }
  }

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
    if (!aiQuery.trim()) {
      return
    }

    // Add user message to chat
    const userMessageId = Date.now().toString()
    const userMessage = {
      id: userMessageId,
      type: 'user' as const,
      content: aiQuery.trim(),
      timestamp: new Date()
    }
    
    setChatMessages(prev => [...prev, userMessage])
    
    // Clear input and show typing indicator
    const currentQuery = aiQuery.trim()
    setAiQuery('')
    setIsGeneratingReport(true)
    setIsTyping(true)
    
    // Scroll to bottom
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)

    try {
      const currentFilters = {
        dateFrom: dateFrom ? format(dateFrom, 'yyyy-MM-dd') : undefined,
        dateTo: dateTo ? format(dateTo, 'yyyy-MM-dd') : undefined,
        statusFilter,
        typeFilter,
        searchTerm,
        tagAllUsers,
        selectedRecipients,
        customMessage,
        selectedTemplate
      }

      // Simulate API delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1000))

      const response = await apiClient.generateAIReport({
        query: currentQuery,
        filters: currentFilters
      })

      setIsTyping(false)

      if (response.success && response.data) {
        // Add AI response to chat
        const aiResponse = {
          id: (Date.now() + 1).toString(),
          type: 'ai' as const,
          content: formatAIResponse(response.data),
          timestamp: new Date()
        }
        
        setChatMessages(prev => [...prev, aiResponse])
        setGeneratedReport(response.data)
        
        // Send notifications if team members are tagged
        if (tagAllUsers || selectedRecipients.length > 0) {
          await handleSendTeamNotification(response.data)
          
          // Add notification message
          const notificationMessage = {
            id: (Date.now() + 2).toString(),
            type: 'ai' as const,
            content: `✅ Report sent to ${tagAllUsers ? 'all team members' : `${selectedRecipients.length} selected team members`}`,
            timestamp: new Date()
          }
          setChatMessages(prev => [...prev, notificationMessage])
        }
      } else {
        // Add error message to chat
        const errorMessage = {
          id: (Date.now() + 1).toString(),
          type: 'ai' as const,
          content: `❌ I apologize, but I encountered an error while generating the report: ${response.message || 'Unknown error'}. Please try rephrasing your request or contact support if the issue persists.`,
          timestamp: new Date()
        }
        setChatMessages(prev => [...prev, errorMessage])
      }
    } catch (error) {
      setIsTyping(false)
      console.error('Error generating AI report:', error)
      
      // Add error message to chat
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai' as const,
        content: `❌ I'm sorry, but I'm having trouble connecting to my analysis engine right now. Please check your connection and try again in a moment.`,
        timestamp: new Date()
      }
      setChatMessages(prev => [...prev, errorMessage])
    } finally {
      setIsGeneratingReport(false)
      setIsTyping(false)
      
      // Scroll to bottom after response
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }
  
  // Format AI response for better readability
  const formatAIResponse = (data: any) => {
    if (!data) return "I've generated your report, but it seems to be empty. Please try a more specific query.";

    let response = "📊 **Analysis Complete!**\n\n";

    if (data.summary) {
      response += `**Summary:**\n${data.summary}\n\n`;
    }

    if (data.recommendations && Array.isArray(data.recommendations)) {
      response += "**Key Recommendations:**\n";
      data.recommendations.forEach((rec: string, index: number) => {
        response += `${index + 1}. ${rec}\n`;
      });
      response += "\n";
    }

    if (data.data) {
      response += "**Key Metrics:**\n";
      if (data.data.totalErrors) response += `• Total Errors: ${data.data.totalErrors}\n`;
      if (data.data.topErrorTypes) response += `• Top Error Types: ${data.data.topErrorTypes.join(', ')}\n`;
      if (data.data.affectedAgents) response += `• Affected Agents: ${data.data.affectedAgents}\n`;
      response += "\n";
    }

    response += "Is there anything specific you'd like me to elaborate on or any other analysis you need?";

    return response;
  }

  const handleSaveQuery = async () => {
    if (!aiQuery.trim()) {
      alert('Please enter a query before saving')
      return
    }

    if (!queryName.trim()) {
      setShowSaveDialog(true)
      return
    }

    setSavingQuery(true)
    try {
      const currentFilters = {
        dateFrom: dateFrom ? format(dateFrom, 'yyyy-MM-dd') : undefined,
        dateTo: dateTo ? format(dateTo, 'yyyy-MM-dd') : undefined,
        statusFilter,
        typeFilter,
        searchTerm
      }

      const response = await apiClient.saveQuery({
        name: queryName,
        query: aiQuery,
        filters: currentFilters
      })

      if (response.success) {
        alert('Query saved successfully!')
        setQueryName('')
        setShowSaveDialog(false)
        await loadSavedQueries() // Reload saved queries
      } else {
        alert('Failed to save query: ' + (response.message || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error saving query:', error)
      alert('Failed to save query. Please try again.')
    } finally {
      setSavingQuery(false)
    }
  }

  const handleLoadQuery = (query: SavedQuery) => {
    setAiQuery(query.query)
    // Apply saved filters if any
    if (query.filters) {
      if (query.filters.dateFrom) setDateFrom(new Date(query.filters.dateFrom))
      if (query.filters.dateTo) setDateTo(new Date(query.filters.dateTo))
      if (query.filters.statusFilter) setStatusFilter(query.filters.statusFilter)
      if (query.filters.typeFilter) setTypeFilter(query.filters.typeFilter)
    }
    alert(`Query "${query.name}" loaded successfully!`)
  }

  const handleSendTeamNotification = async (reportData: any) => {
    try {
      // This would integrate with your Teams integration API
      console.log('Sending team notification with report:', reportData)
      alert('Team members have been notified about the report!')
    } catch (error) {
      console.error('Error sending team notification:', error)
    }
  }

  const handleScheduleReport = async (queryId: string) => {
    // This would open a scheduling dialog
    alert(`Scheduling functionality for query ${queryId} - To be implemented with full scheduling UI`)
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
        //await fetchFilteredErrorDetails()
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
    { date: "Jul 10", agentRejected: 20, iaFlagged: 5, totalErrors: 25 },
    { date: "Jul 11", agentRejected: 15, iaFlagged: 3, totalErrors: 18 },
    { date: "Jul 12", agentRejected: 25, iaFlagged: 8, totalErrors: 33 },
    { date: "Jul 13", agentRejected: 18, iaFlagged: 4, totalErrors: 22 },
    { date: "Jul 14", agentRejected: 22, iaFlagged: 6, totalErrors: 28 },
    { date: "Jul 15", agentRejected: 30, iaFlagged: 10, totalErrors: 40 },
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <p className="text-2xl font-bold text-gray-900">{errorStats?.sessions_today || errorStats?.today_errors || errorStats?.today || 0}</p>
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
              <LineChart data={errorTrendData && errorTrendData.length > 0 ? errorTrendData : localErrorTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'agentRejected') return [value, 'Agent Rejected']
                    if (name === 'iaFlagged') return [value, 'IA Flagged']
                    if (name === 'totalErrors') return [value, 'Total Errors']
                    return [value, name]
                  }}
                />
                <Line type="monotone" dataKey="agentRejected" stroke="#ef4444" strokeWidth={2} name="Agent Rejected" />
                <Line type="monotone" dataKey="iaFlagged" stroke="#f59e0b" strokeWidth={2} name="IA Flagged" />
                <Line type="monotone" dataKey="totalErrors" stroke="#6366f1" strokeWidth={2} name="Total Errors" />
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
            {/* AI Chat Interface */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold">Chat with AI Assistant</Label>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setChatMessages([{
                      id: Date.now().toString(),
                      type: 'ai',
                      content: 'Hello! I\'m your AI assistant for error analysis. I can help you generate reports, analyze trends, and provide insights. What would you like to know about your error data?',
                      timestamp: new Date()
                    }])
                  }}
                >
                  Clear Chat
                </Button>
              </div>
              
              {/* Chat Messages Area */}
              <div className="border rounded-lg p-4 h-96 overflow-y-auto bg-gray-50 space-y-4">
                {chatMessages.map((message) => (
                  <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-lg p-3 ${
                      message.type === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white border shadow-sm'
                    }`}>
                      {message.type === 'ai' && (
                        <div className="flex items-center space-x-2 mb-2">
                          <Bot className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-600">AI Assistant</span>
                        </div>
                      )}
                      <div className={`text-sm ${message.type === 'user' ? 'text-white' : 'text-gray-800'}`}>
                        {message.isTyping ? (
                          <div className="flex items-center space-x-1">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                            </div>
                            <span className="text-gray-500 ml-2">AI is thinking...</span>
                          </div>
                        ) : (
                          <div className="whitespace-pre-wrap">{message.content}</div>
                        )}
                      </div>
                      <div className={`text-xs mt-2 ${
                        message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white border shadow-sm rounded-lg p-3 max-w-[80%]">
                      <div className="flex items-center space-x-2 mb-2">
                        <Bot className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-600">AI Assistant</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                        <span className="text-gray-500 ml-2 text-sm">Analyzing your request...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              
              {/* Chat Input */}
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Textarea
                    placeholder="Ask me anything about error analysis... e.g., 'Show me today's critical errors' or 'Generate a performance report'"
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    rows={2}
                    className="resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        if (aiQuery.trim()) {
                          handleGenerateAIReport()
                        }
                      }
                    }}
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <Button 
                    onClick={handleGenerateAIReport} 
                    disabled={isGeneratingReport || !aiQuery.trim()}
                    className="h-full"
                  >
                    {isGeneratingReport ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowSaveDialog(true)} 
                    disabled={!aiQuery.trim()}
                    size="sm"
                  >
                    <Save className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Quick Actions:</Label>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setAiQuery("Generate a summary of today's errors with performance impact analysis")}
                  >
                    Daily Summary
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setAiQuery("Show me the top error types and their trends")}
                  >
                    Error Trends
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setAiQuery("Analyze agent performance and provide recommendations")}
                  >
                    Agent Analysis
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setAiQuery("Generate a detailed report for management")}
                  >
                    Management Report
                  </Button>
                </div>
              </div>
            </div>

            {/* Saved Queries */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Saved Queries ({savedQueries.length})</h4>
                {loadingSavedQueries && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                )}
              </div>
              {savedQueries.length === 0 && !loadingSavedQueries ? (
                <div className="text-center py-8 text-gray-500">
                  <FileSpreadsheet className="h-8 w-8 mx-auto mb-2" />
                  <p>No saved queries yet. Save your first query above!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {savedQueries.map((query) => (
                    <div key={query.id} className="p-3 border rounded-lg hover:border-blue-300 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium truncate">{query.name}</h5>
                        <Badge variant="outline">{query.createdAt}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{query.query}</p>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleLoadQuery(query)}>
                          Load Query
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleScheduleReport(query.id)}>
                          <Settings className="w-3 h-3 mr-1" />
                          Schedule
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Active Scheduled Reports Table */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Active Scheduled Reports ({activeReports.length})</h4>
                {loadingScheduledReports && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                )}
              </div>
              {activeReports.length === 0 && !loadingScheduledReports ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-8 w-8 mx-auto mb-2" />
                  <p>No active scheduled reports</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Report Name</TableHead>
                        <TableHead>Schedule</TableHead>
                        <TableHead>Next Run</TableHead>
                        <TableHead>Recipients</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeReports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell className="font-medium">{report.name}</TableCell>
                          <TableCell>{report.schedule}</TableCell>
                          <TableCell>{report.nextRun}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {report.recipients.slice(0, 2).map((recipient: string) => (
                                <Badge key={recipient} variant="outline" className="text-xs">
                                  {recipient}
                                </Badge>
                              ))}
                              {report.recipients.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{report.recipients.length - 2}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="text-green-600 border-green-200"
                            >
                              {report.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              <Button size="sm" variant="outline">
                                <Settings className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Send className="w-3 h-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>

            {/* Recent Report Runs */}
            <div className="space-y-4">
              <h4 className="font-medium">Recent Report Runs</h4>
              {reportHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileSpreadsheet className="h-8 w-8 mx-auto mb-2" />
                  <p>No recent report runs</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reportHistory.map((run) => (
                    <div key={run.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          run.status === 'success' ? 'bg-green-500' : 
                          run.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                        }`} />
                        <div>
                          <p className="font-medium">{run.reportName}</p>
                          <p className="text-sm text-gray-600">
                            {run.executedAt} | Duration: {run.duration}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant="outline"
                          className={
                            run.status === 'success'
                              ? "text-green-600 border-green-200"
                              : run.status === 'failed'
                              ? "text-red-600 border-red-200"
                              : "text-yellow-600 border-yellow-200"
                          }
                        >
                          {run.status}
                        </Badge>
                        <Button size="sm" variant="outline">
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Team Communication Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium">Team Communication</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch id="tag-all" checked={tagAllUsers} onCheckedChange={setTagAllUsers} />
                    <Label htmlFor="tag-all" className="text-sm">
                      Tag all team members ({teamMembers.length})
                    </Label>
                  </div>
                  
                  {!tagAllUsers && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Select specific team members:</Label>
                      <div className="max-h-32 overflow-y-auto border rounded-lg p-2">
                        {teamMembers.map((member) => (
                          <div key={member.id} className="flex items-center space-x-2 py-1">
                            <input
                              type="checkbox"
                              id={`member-${member.id}`}
                              checked={selectedRecipients.includes(member.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedRecipients([...selectedRecipients, member.id])
                                } else {
                                  setSelectedRecipients(selectedRecipients.filter(id => id !== member.id))
                                }
                              }}
                              className="rounded"
                            />
                            <Label htmlFor={`member-${member.id}`} className="text-sm cursor-pointer">
                              {member.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
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
                  <Button variant="outline" size="sm" onClick={() => handleSendTeamNotification(generatedReport)}>
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
                
                {selectedRecipients.length > 0 && (
                  <div className="mt-4">
                    <Label className="text-sm font-medium">Selected Recipients:</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedRecipients.map((recipientId) => {
                        const member = teamMembers.find(m => (m.agent_id || m.id) === recipientId)
                        return member ? (
                          <Badge key={recipientId} variant="outline" className="text-xs">
                            {member.agent_name || member.name}
                          </Badge>
                        ) : null
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Query Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Save Query</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="query-name">Query Name</Label>
                <Input
                  id="query-name"
                  value={queryName}
                  onChange={(e) => setQueryName(e.target.value)}
                  placeholder="Enter a name for this query"
                />
              </div>
              <div>
                <Label>Query Preview</Label>
                <p className="text-sm bg-gray-100 p-2 rounded">{aiQuery}</p>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveQuery} disabled={!queryName.trim() || savingQuery}>
                {savingQuery ? 'Saving...' : 'Save Query'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

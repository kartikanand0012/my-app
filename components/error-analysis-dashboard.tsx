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
import { API_CONFIG } from "@/lib/config"
import { DonutChart } from "@/components/ui/donut-chart";

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
    agentErrorTypesData,
    iaErrorTypesData,
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
  const [todayCurrentPage, setTodayCurrentPage] = useState(1)
  const [pastCurrentPage, setPastCurrentPage] = useState(1)
  const [errors, setErrors] = useState<ErrorData[]>([])
  const [filteredErrors, setFilteredErrors] = useState<ErrorData[]>([])
  const itemsPerPage = 10

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
    content: 'Hello! I\'m your Smart AI Agent for error analysis. I can help you with:\n\n🤖 **Natural Language Queries** - Ask questions in plain English\n📊 **Real-time Data Analysis** - Get insights from your database\n📈 **Excel Report Generation** - Download comprehensive reports\n📝 **Query History** - Track your previous questions\n\nTry asking me things like:\n• "Show me all active agents"\n• "What are the most common error types?"\n• "Show me today\'s error analysis"\n• "Generate a performance report"\n\nWhat would you like to know about your error data?',
    timestamp: new Date()
  }])
  const [isTyping, setIsTyping] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Enhanced functionality states
  const [reportTemplates, setReportTemplates] = useState<any[]>([])
  const [selectedReportTemplate, setSelectedReportTemplate] = useState("")
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingReport, setEditingReport] = useState<any>(null)
  const [loadingTemplates, setLoadingTemplates] = useState(false)
  const [sendingReport, setSendingReport] = useState(false)
  const [loadingDailyReport, setLoadingDailyReport] = useState(false)
  const [loadingWeeklyReport, setLoadingWeeklyReport] = useState(false)
  const [schedulingDaily, setSchedulingDaily] = useState(false)
  const [schedulingWeekly, setSchedulingWeekly] = useState(false)
  const [systemStatus, setSystemStatus] = useState<any>(null)
  const [loadingSystemStatus, setLoadingSystemStatus] = useState(false)

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

  // Cleanup effect to clear debounced timers on unmount
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
      loadReportTemplates()
    }
  }, [contextLoading, loadErrorDetails])

  // Load report templates from backend
  const loadReportTemplates = async () => {
    setLoadingTemplates(true)
    try {
      const response = await apiClient.getReportTemplates()
      if (response.success && response.data?.templates) {
        setReportTemplates(response.data.templates)
        console.log('📋 Loaded report templates:', response.data.templates.length)
      }
    } catch (error) {
      console.error('Error loading report templates:', error)
    } finally {
      setLoadingTemplates(false)
    }
  }

  // Fetch filtered error details using OPTIMIZED vkyc_details-based API
  const fetchFilteredErrorDetails = async () => {
    try {
      console.log('🔍 Fetching filtered error details with optimized API...')
      
      const filters = {
        date_filter: getDateFilterString(),
        search: searchTerm?.trim() || undefined,
        error_type_filter: typeFilter !== 'all' ? typeFilter : undefined,
        agent_id_filter: selectedAgent || undefined,
        page: currentPage,
        limit: 10
      }
      
      console.log('📋 API filters:', filters)
      
      const response = await apiClient.getDetailedErrorList(filters)
      console.log('✅ API response:', response)
      
      if (response.success && response.data && response.data.errors) {
        // Transform the optimized API data format to match the expected frontend format
        const transformedErrors = response.data.errors.map((error: any) => ({
          id: error.uuid,
          uuid: error.uuid,
          agentId: error.agentId?.toString() || '',
          agentName: error.agentName || 'Unknown Agent',
          type: error.errorType,
          date: error.sessionStartedAt ? new Date(error.sessionStartedAt).toLocaleDateString() : new Date().toLocaleDateString(),
          time: error.sessionStartedAt ? new Date(error.sessionStartedAt).toLocaleTimeString() : '',
          description: error.rejectionReason || error.reviewComments || 'Error detected',
          videoId: error.sessionId,
          status: (error.errorType === 'agent_rejected' ? 'acknowledged' : 
                 error.errorType === 'ia_flagged_critical' ? 'pending' : 'approved') as "pending" | "approved" | "rejected" | "acknowledged",
          category: error.agentRejectionCategory || error.iaErrorCategory,
          severity: error.errorSeverity,
          sessionId: error.sessionId,
          sessionStartedAt: error.sessionStartedAt,
          // Additional fields for better data handling
          vkycStatus: error.vkycStatus,
          reviewStatus: error.reviewStatus,
          reviewComments: error.reviewComments,
          rejectionReason: error.rejectionReason
        }))
        
        console.log('📊 Transformed errors:', transformedErrors.length, 'records')
        setFilteredErrors(transformedErrors)
      } else {
        console.log('❌ No error data received from API')
        setFilteredErrors([])
      }
    } catch (err) {
      console.error('❌ Error fetching filtered error details:', err)
      setFilteredErrors([])
    }
  }

  // Parameter tracking for API calls
  const lastFetchParamsRef = useRef<string>('')
  

  // Debounced API call for search inputs to prevent excessive API calls
  const debouncedFetchRef = useRef<NodeJS.Timeout | null>(null)
  const fetchFilteredErrorDetailsDebounced = useCallback(() => {
    const currentParams = JSON.stringify({
      searchTerm: searchTerm?.trim() || '', 
      statusFilter, 
      typeFilter, 
      uuidFilter: uuidFilter?.trim() || '', 
      dateFrom: dateFrom?.toISOString() || '', 
      dateTo: dateTo?.toISOString() || '', 
      currentPage, 
      selectedAgent: selectedAgent || ''
    })
    
    // Skip if parameters haven't changed
    if (lastFetchParamsRef.current === currentParams) {
      return
    }
    
    // Clear existing timeout
    if (debouncedFetchRef.current) {
      clearTimeout(debouncedFetchRef.current)
    }
    
    // Set new timeout for search debouncing
    debouncedFetchRef.current = setTimeout(() => {
      lastFetchParamsRef.current = currentParams
      fetchFilteredErrorDetails()
    }, 300) // 300ms debounce for search inputs
  }, [searchTerm, statusFilter, typeFilter, uuidFilter, dateFrom, dateTo, currentPage, selectedAgent])

  // Reset pagination when filters change
  useEffect(() => {
    setTodayCurrentPage(1)
    setPastCurrentPage(1)
  }, [searchTerm, statusFilter, typeFilter, uuidFilter, dateFrom, dateTo, selectedAgent])

  // IMMEDIATE filter logic - no debouncing for instant response
  useEffect(() => {
    const hasActiveFilters = (searchTerm?.trim()) || 
                           statusFilter !== 'all' || 
                           typeFilter !== 'all' || 
                           (uuidFilter?.trim()) || 
                           dateFrom || 
                           dateTo ||
                           selectedAgent
    
    if (hasActiveFilters) {
      // Call the debounced function for search inputs
      fetchFilteredErrorDetailsDebounced()
    } else {
      // Use context data when no filters are active - this prevents unnecessary API calls
      if (errorDetails && Array.isArray(errorDetails)) {
        // Only transform if we have data
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
      } else {
        setFilteredErrors([])
      }
    }
  }, [searchTerm, statusFilter, typeFilter, uuidFilter, dateFrom, dateTo, currentPage, selectedAgent, fetchFilteredErrorDetailsDebounced])

  // Optimized context data transformation - only updates when errorDetails actually change
  useEffect(() => {
    const hasActiveFilters = (searchTerm?.trim()) || 
                           statusFilter !== 'all' || 
                           typeFilter !== 'all' || 
                           (uuidFilter?.trim()) || 
                           dateFrom || 
                           dateTo ||
                           selectedAgent
    
    // Only update from context data when no filters are active and errorDetails has changed
    if (!hasActiveFilters && errorDetails) {
      if (Array.isArray(errorDetails) && errorDetails.length > 0) {
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
  }, [errorDetails, searchTerm, statusFilter, typeFilter, uuidFilter, dateFrom, dateTo, selectedAgent])

  // Load saved queries, scheduled reports, and team members only once
  const hasLoadedAPIData = useRef(false)
  useEffect(() => {
    if (hasLoadedAPIData.current) return
    
    const loadAPIData = async () => {
      if (userRole === 'admin' || userRole === 'team-lead') {
        hasLoadedAPIData.current = true
        await loadSavedQueries()
        await loadQueryHistory() // Load query history from Smart AI Agent API
        await loadScheduledReports()
        await loadTeamMembers()
        await loadSystemStatus() // Load system status from Smart AI Agent API
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

  // Load query history from Smart AI Agent API
  const loadQueryHistory = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/smart-ai/history?limit=20`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })
      const data = await response.json()
      if (data.success && data.data?.history) {
        // Transform the history data to match our format
        const transformedHistory = data.data.history.map((item: any) => ({
          id: item.id,
          name: `Query ${item.id}`,
          query: item.query_text,
          filters: {},
          createdAt: new Date(item.created_at).toLocaleDateString()
        }))
        setSavedQueries(transformedHistory)
      }
    } catch (error) {
      console.error('Error loading query history:', error)
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

  // Get system status from Smart AI Agent API
  const loadSystemStatus = async () => {
    try {
      setLoadingSystemStatus(true)
      const response = await fetch(`${API_CONFIG.BASE_URL}/smart-ai/status`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })
      const data = await response.json()
      if (data.success && data.data) {
        setSystemStatus(data.data)
      }
    } catch (error) {
      console.error('Error loading system status:', error)
    } finally {
      setLoadingSystemStatus(false)
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
      // Use Smart AI Agent API for natural language query processing
      const response = await fetch(`${API_CONFIG.BASE_URL}/smart-ai/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          query_text: currentQuery
        })
      })

      const data = await response.json()
      setIsTyping(false)

      if (data.success && data.data) {
        // Add AI response to chat with improved formatting
        const aiResponse = {
          id: (Date.now() + 1).toString(),
          type: 'ai' as const,
          content: formatAIResponse(data.data),
          timestamp: new Date()
        }
        
        setChatMessages(prev => [...prev, aiResponse])
        setGeneratedReport(data.data)
        
        // Send notifications if team members are tagged
        if (tagAllUsers || selectedRecipients.length > 0) {
          await handleSendTeamNotification(data.data)
          
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
          content: `❌ I apologize, but I encountered an error while processing your query: ${data.message || 'Unknown error'}. Please try rephrasing your request or contact support if the issue persists.`,
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
    if (!data) return "I've processed your query, but it seems to be empty. Please try a more specific question.";

    let response = "🤖 **AI Analysis Complete!**\n\n";

    // Use the response from the Smart AI Agent API
    if (data.response) {
      response += `${data.response}\n\n`;
    }

    // Add data insights if available
    if (data.data && Array.isArray(data.data) && data.data.length > 0) {
      response += `📊 **Data Summary:**\n`;
      response += `• Total Records: ${data.rowCount || data.data.length}\n`;
      
      // Show sample data if available
      if (data.data.length <= 5) {
        response += `• Sample Data: ${data.data.length} record(s) found\n`;
      } else {
        response += `• Sample Data: Showing first 5 of ${data.data.length} records\n`;
      }
      response += "\n";
    }

    // Add SQL query if available (for transparency)
    if (data.sqlGenerated) {
      response += `🔍 **Generated SQL:**\n\`\`\`sql\n${data.sqlGenerated}\n\`\`\`\n\n`;
    }

    // Add execution time if available
    if (data.execution_time_ms) {
      response += `⏱️ **Query executed in:** ${data.execution_time_ms}ms\n\n`;
    }

    response += "💡 **What would you like to do next?**\n";
    response += "• Ask follow-up questions\n";
    response += "• Generate an Excel report\n";
    response += "• Save this query for later\n";
    response += "• Schedule automated reports";

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

  // Generate and download Excel report using Smart AI Agent API
  const handleGenerateExcelReport = async () => {
    try {
      setIsGeneratingReport(true)
      
      // Show generating message in chat
      const generatingMessage = {
        id: Date.now().toString(),
        type: 'ai' as const,
        content: '📊 Generating comprehensive Excel report with AI insights... This may take a moment.',
        timestamp: new Date()
      }
      setChatMessages(prev => [...prev, generatingMessage])
      
      // Use Smart AI Agent API for Excel generation
      const response = await fetch(`${API_CONFIG.BASE_URL}/smart-ai/excel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          query_text: "Generate a comprehensive error analysis report with all error types, agent performance, and trends",
          report_name: `Error_Analysis_Report_${new Date().toISOString().split('T')[0]}`
        })
      })
      
      const data = await response.json()
      
      if (data.success && data.data?.filename) {
        // Add success message to chat
        const successMessage = {
          id: (Date.now() + 1).toString(),
          type: 'ai' as const,
          content: `✅ Excel report "${data.data.filename}" generated successfully! The report includes:\n\n📈 Comprehensive error analysis\n👥 Agent performance insights\n❌ Error type breakdown\n📊 Trend analysis and recommendations\n\nClick the download button below to save the report.`,
          timestamp: new Date()
        }
        setChatMessages(prev => [...prev, successMessage])
        
        // Trigger download using Smart AI Agent API
        const downloadResponse = await fetch(`${API_CONFIG.BASE_URL}/smart-ai/download/${data.data.filename}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        })
        
        if (downloadResponse.ok) {
          const blob = await downloadResponse.blob()
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = data.data.filename
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          window.URL.revokeObjectURL(url)
          
          // Add download confirmation to chat
          const downloadMessage = {
            id: (Date.now() + 2).toString(),
            type: 'ai' as const,
            content: '📥 Report downloaded successfully! You can now open it in Excel to view the detailed analysis.',
            timestamp: new Date()
          }
          setChatMessages(prev => [...prev, downloadMessage])
        } else {
          throw new Error('Failed to download the report')
        }
      } else {
        throw new Error(data.message || 'Failed to generate Excel report')
      }
    } catch (error: any) {
      console.error('Error generating Excel report:', error)
      
      const errorMessage = {
        id: Date.now().toString(),
        type: 'ai' as const,
        content: `❌ I encountered an error while generating the Excel report: ${error.message || 'Unknown error'}. Please try again or contact support if the issue persists.`,
        timestamp: new Date()
      }
      setChatMessages(prev => [...prev, errorMessage])
    } finally {
      setIsGeneratingReport(false)
    }
  }

  // Enhanced functionality for Load and Schedule buttons
  const handleLoadReport = async (templateId: string) => {
    try {
      setIsGeneratingReport(true)
      
      const template = reportTemplates.find(t => t.id === templateId)
      if (!template) return
      
      const reportMessage = {
        id: Date.now().toString(),
        type: 'user' as const,
        content: `Load ${template.name} report`,
        timestamp: new Date()
      }
      setChatMessages(prev => [...prev, reportMessage])
      
      // Generate report using Smart AI Agent API
      const response = await fetch(`${API_CONFIG.BASE_URL}/smart-ai/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          query_text: `Generate a ${template.name} report: ${template.description}`
        })
      })
      
      const data = await response.json()
      
      if (data.success && data.data) {
        const aiResponse = {
          id: (Date.now() + 1).toString(),
          type: 'ai' as const,
          content: formatAIResponse(data.data),
          timestamp: new Date()
        }
        setChatMessages(prev => [...prev, aiResponse])
      } else {
        const errorResponse = {
          id: (Date.now() + 1).toString(),
          type: 'ai' as const,
          content: `❌ Failed to load ${template.name} report: ${data.message || 'Unknown error'}`,
          timestamp: new Date()
        }
        setChatMessages(prev => [...prev, errorResponse])
      }
    } catch (error) {
      console.error('Error loading report:', error)
      const errorResponse = {
        id: (Date.now() + 1).toString(),
        type: 'ai' as const,
        content: '❌ Failed to load report due to network error. Please try again.',
        timestamp: new Date()
      }
      setChatMessages(prev => [...prev, errorResponse])
    } finally {
      setIsGeneratingReport(false)
    }
  }

  const handleScheduleReport = (templateId: string) => {
    const template = reportTemplates.find(t => t.id === templateId)
    if (template) {
      setSelectedReportTemplate(templateId)
      setShowScheduleModal(true)
    }
  }

  const handleEditReport = (report: any) => {
    setEditingReport(report)
    setShowEditModal(true)
  }

  const handleTriggerReport = async (reportId: string) => {
    try {
      setSendingReport(true)
      const response = await apiClient.triggerScheduledReport(reportId)
      
      if (response.success) {
        alert('Report triggered successfully! It will be sent to the configured channels.')
      } else {
        alert('Failed to trigger report: ' + response.message)
      }
    } catch (error) {
      console.error('Error triggering report:', error)
      alert('Failed to trigger report')
    } finally {
      setSendingReport(false)
    }
  }

  const handleSendNow = async () => {
    try {
      setSendingReport(true)
      
      const payload = {
        message: customMessage,
        template: selectedReportTemplate,
        recipients: selectedRecipients,
        tagAllUsers: tagAllUsers,
        errorData: filteredErrors.slice(0, 20),
        filters: {
          dateFrom: dateFrom ? format(dateFrom, 'yyyy-MM-dd') : undefined,
          dateTo: dateTo ? format(dateTo, 'yyyy-MM-dd') : undefined,
          statusFilter,
          typeFilter,
          searchTerm
        },
        timestamp: new Date().toISOString()
      }
      
      console.log('🚀 SEND NOW PAYLOAD:', JSON.stringify(payload, null, 2))
      
      const response = await apiClient.sendTeamsNotification(payload)
      
      if (response.success) {
        alert('Report sent successfully to Teams!')
        
        // Add success message to chat
        const successMessage = {
          id: Date.now().toString(),
          type: 'ai' as const,
          content: `✅ Report sent successfully to Teams! Recipients: ${tagAllUsers ? 'All team members' : selectedRecipients.join(', ')}`,
          timestamp: new Date()
        }
        setChatMessages(prev => [...prev, successMessage])
      } else {
        alert('Failed to send report: ' + response.message)
      }
    } catch (error) {
      console.error('Error sending report:', error)
      alert('Failed to send report')
    } finally {
      setSendingReport(false)
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
  const allTodayErrors = filteredErrors.filter((error) => {
    const errorDate = new Date(error.sessionStartedAt || error.date).toLocaleDateString()
    return errorDate === today
  })
  const allPastErrors = filteredErrors.filter((error) => {
    const errorDate = new Date(error.sessionStartedAt || error.date).toLocaleDateString()
    return errorDate !== today
  })

  // Paginated data
  const todayStartIndex = (todayCurrentPage - 1) * itemsPerPage
  const pastStartIndex = (pastCurrentPage - 1) * itemsPerPage
  const todayErrors = allTodayErrors.slice(todayStartIndex, todayStartIndex + itemsPerPage)
  const pastErrors = allPastErrors.slice(pastStartIndex, pastStartIndex + itemsPerPage)
  
  // Calculate total pages
  const todayTotalPages = Math.ceil(allTodayErrors.length / itemsPerPage)
  const pastTotalPages = Math.ceil(allPastErrors.length / itemsPerPage)

  // Performance optimization: Removed console.log to improve typing performance

  // Local error analytics data (fallback when context data is not available)
  const localErrorStats = {
    total: errors.length,
    today: allTodayErrors.length,
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

  const agentErrorDistribution = agentErrorTypesData.map((item, index) => ({
    name: item.type || item.errorType,
    value: item.count || item.value,
    color: ["#ef4444", "#f59e0b", "#3b82f6", "#10b981", "#8b5cf6"][index % 5]
  }));
  const iaErrorDistribution = iaErrorTypesData.map((item, index) => ({
    name: item.type || item.errorType,
    value: item.count || item.value,
    color: ["#ef4444", "#f59e0b", "#3b82f6", "#10b981", "#8b5cf6"][index % 5]
  }));

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
        <div className="flex flex-col md:flex-row gap-6">
          <Card className="flex-1 p-2" style={{height:'450px'}}>
            <DonutChart
              data={iaErrorDistribution}
              title="IA Error Types"
              description="Breakdown of IA error types"
              height={130}
              alignLeft={true}
            />
          </Card>
        </div>
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
              <TabsTrigger value="today">Today's Errors ({allTodayErrors.length})</TabsTrigger>
              <TabsTrigger value="past">Past Errors ({allPastErrors.length})</TabsTrigger>
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
              
              {/* Today's Errors Pagination */}
              {todayTotalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-600">
                    Showing {todayStartIndex + 1} to {Math.min(todayStartIndex + itemsPerPage, allTodayErrors.length)} of {allTodayErrors.length} entries
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTodayCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={todayCurrentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {todayCurrentPage} of {todayTotalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTodayCurrentPage(prev => Math.min(prev + 1, todayTotalPages))}
                      disabled={todayCurrentPage === todayTotalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
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
              
              {/* Past Errors Pagination */}
              {pastTotalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-600">
                    Showing {pastStartIndex + 1} to {Math.min(pastStartIndex + itemsPerPage, allPastErrors.length)} of {allPastErrors.length} entries
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPastCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={pastCurrentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {pastCurrentPage} of {pastTotalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPastCurrentPage(prev => Math.min(prev + 1, pastTotalPages))}
                      disabled={pastCurrentPage === pastTotalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
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
                <div className="flex items-center space-x-4">
                  <Label className="text-lg font-semibold">Chat with AI Assistant</Label>
                  {systemStatus && (
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        systemStatus.status === 'operational' ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <span className="text-sm text-gray-600">
                        {systemStatus.status === 'operational' ? 'System Online' : 'System Offline'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {loadingSystemStatus && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setChatMessages([{
                        id: Date.now().toString(),
                        type: 'ai',
                        content: `Hello! I'm your Smart AI Agent for error analysis. I can help you with:\n\n🤖 **Natural Language Queries** - Ask questions in plain English\n📊 **Real-time Data Analysis** - Get insights from your database\n📈 **Excel Report Generation** - Download comprehensive reports\n📝 **Query History** - Track your previous questions\n\n${systemStatus ? `\n🟢 **System Status:** ${systemStatus.status}\n🔧 **Capabilities:** ${systemStatus.capabilities?.join(', ')}` : ''}\n\nTry asking me things like:\n• "Show me all active agents"\n• "What are the most common error types?"\n• "Show me today's error analysis"\n• "Generate a performance report"\n\nWhat would you like to know about your error data?`,
                        timestamp: new Date()
                      }])
                    }}
                  >
                    Clear Chat
                  </Button>
                </div>
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
                          <div className="whitespace-pre-wrap break-words">{message.content}</div>
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
                    className="resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-150"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        if (aiQuery.trim()) {
                          handleGenerateAIReport()
                        }
                      }
                    }}
                    disabled={isGeneratingReport}
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
              <div className="space-y-4">
                <Label className="text-sm font-medium">Quick Actions:</Label>
                
                {/* Daily Error Summary */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Daily Error Summary</Label>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleLoadReport('daily_error_summary')}
                      disabled={loadingDailyReport}
                    >
                      {loadingDailyReport ? 'Loading...' : 'Load'}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleScheduleReport('daily_error_summary')}
                      disabled={schedulingDaily}
                    >
                      {schedulingDaily ? 'Scheduling...' : 'Schedule'}
                    </Button>
                  </div>
                </div>
                
                {/* Weekly Team Performance */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Weekly Team Performance</Label>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleLoadReport('agent_performance_weekly')}
                      disabled={loadingWeeklyReport}
                    >
                      {loadingWeeklyReport ? 'Loading...' : 'Load'}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleScheduleReport('agent_performance_weekly')}
                      disabled={schedulingWeekly}
                    >
                      {schedulingWeekly ? 'Scheduling...' : 'Schedule'}
                    </Button>
                  </div>
                </div>
                
                {/* Other Quick Actions */}
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setAiQuery("Show me all error types and their distribution")}
                  >
                    Error Types
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setAiQuery("Show me all active agents and their performance")}
                  >
                    Active Agents
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setAiQuery("Show me today's error analysis")}
                  >
                    Today's Errors
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setAiQuery("Show me agent performance metrics")}
                  >
                    Performance
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleGenerateExcelReport}
                    disabled={isGeneratingReport}
                    className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                  >
                    <FileSpreadsheet className="w-3 h-3 mr-1" />
                    {isGeneratingReport ? 'Generating...' : 'Excel Report'}
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
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleEditReport(report)}
                                title="Edit Report Settings"
                              >
                                <Settings className="w-3 h-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleTriggerReport(report.id)}
                                disabled={sendingReport}
                                title="Trigger Report Now"
                                className="text-blue-600 hover:text-blue-800"
                              >
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
                  
                  {/* Teams Report Templates */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Report Template</Label>
                    <Select value={selectedReportTemplate} onValueChange={setSelectedReportTemplate}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select report template" />
                      </SelectTrigger>
                      <SelectContent>
                        {loadingTemplates ? (
                          <SelectItem value="loading" disabled>Loading templates...</SelectItem>
                        ) : reportTemplates.length > 0 ? (
                          reportTemplates.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-templates" disabled>No templates available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
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
                <div className="grid grid-cols-1 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleSendNow}
                    disabled={sendingReport}
                    className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                  >
                    <Send className="w-3 h-3 mr-1" />
                    {sendingReport ? 'Sending...' : 'Send Now'}
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

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Schedule Report</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="schedule-type">Schedule Type</Label>
                <Select defaultValue="daily">
                  <SelectTrigger>
                    <SelectValue placeholder="Select schedule type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="schedule-time">Time</Label>
                <Input
                  id="schedule-time"
                  type="time"
                  defaultValue="09:00"
                />
              </div>
              <div>
                <Label htmlFor="schedule-recipients">Recipients</Label>
                <Textarea
                  id="schedule-recipients"
                  placeholder="Enter email addresses separated by commas"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setShowScheduleModal(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                alert('Report scheduled successfully!')
                setShowScheduleModal(false)
              }}>
                Schedule Report
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Report Modal */}
      {showEditModal && editingReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">Edit Report Settings</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Report Name</Label>
                <Input
                  id="edit-name"
                  defaultValue={editingReport.name}
                />
              </div>
              <div>
                <Label htmlFor="edit-schedule">Schedule</Label>
                <Input
                  id="edit-schedule"
                  defaultValue={editingReport.schedule}
                />
              </div>
              <div>
                <Label htmlFor="edit-recipients">Recipients</Label>
                <Textarea
                  id="edit-recipients"
                  defaultValue={editingReport.recipients.join(', ')}
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="edit-active" defaultChecked={editingReport.status === 'active'} />
                <Label htmlFor="edit-active">Active</Label>
              </div>
              <div>
                <Label htmlFor="edit-tags">Tagged Users</Label>
                <div className="space-y-2">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`edit-member-${member.id}`}
                        defaultChecked={editingReport.recipients.includes(member.name)}
                        className="rounded"
                      />
                      <Label htmlFor={`edit-member-${member.id}`} className="text-sm cursor-pointer">
                        {member.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="edit-message">Custom Message</Label>
                <Textarea
                  id="edit-message"
                  placeholder="Custom message for this report..."
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                alert('Report settings updated successfully!')
                setShowEditModal(false)
              }}>
                Update Report
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

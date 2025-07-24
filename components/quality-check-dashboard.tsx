"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ShieldCheck,
  Video,
  MessageCircleWarning,
  BookOpenCheck,
  UserX,
  AlertTriangle,
  Filter,
  CheckCircle,
  Clock,
  Users,
  Calculator,
  Loader2,
  Calendar,
  Bot,
  Upload,
  Activity,
  MessageSquare,
} from "lucide-react"
import { format, subDays, startOfMonth, endOfMonth, subMonths, isWithinInterval, parseISO } from "date-fns"
import { QualityCheckAPI } from "@/lib/api/quality-check-api"
import { WorkflowEntityData, FlaggedCall, FLAG_TYPES } from "@/lib/mock-data/quality-check-data"
import { QCCSVUpload } from "./qc-csv-upload"
import { AISubAgentTracker } from "./ai-subagent-tracker"
import { QCScheduledReports } from "./qc-scheduled-reports"
import { VideoUploadAnalyzer } from "./video-upload-analyzer"
import { AITestConsole } from "./ai-test-console"
import ReactMarkdown from 'react-markdown';
import { AI_BACKEND_URL } from "@/lib/config";

type DateFilterType = "all" | "today" | "yesterday" | "this_month" | "last_3_months" | "custom"

export function QualityCheckDashboard() {
  const [flaggedCalls, setFlaggedCalls] = useState<FlaggedCall[]>([])
  const [workflowEntityData, setWorkflowEntityData] = useState<WorkflowEntityData[]>([])
  const [selectedCall, setSelectedCall] = useState<FlaggedCall | null>(null)
  const [samplingPercentage, setSamplingPercentage] = useState(5)
  const [activeQueueTab, setActiveQueueTab] = useState("pending")
  const [activeMainTab, setActiveMainTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFlags, setSelectedFlags] = useState<string[]>([])
  const [dateFilter, setDateFilter] = useState<DateFilterType>("all")
  const [customDateRange, setCustomDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Centralized date filtering logic
  const filterByDate = useCallback((call: FlaggedCall): boolean => {
    if (dateFilter === "all") return true
    
    try {
      const callDate = parseISO(call.callDate)
      const today = new Date()
      
      switch (dateFilter) {
        case "today":
          return format(callDate, "yyyy-MM-dd") === format(today, "yyyy-MM-dd")
        case "yesterday":
          const yesterday = subDays(today, 1)
          return format(callDate, "yyyy-MM-dd") === format(yesterday, "yyyy-MM-dd")
        case "this_month":
          const monthStart = startOfMonth(today)
          const monthEnd = endOfMonth(today)
          return isWithinInterval(callDate, { start: monthStart, end: monthEnd })
        case "last_3_months":
          const threeMonthsAgo = subMonths(today, 3)
          return callDate >= threeMonthsAgo
        case "custom":
          if (!customDateRange.from || !customDateRange.to) return true
          return isWithinInterval(callDate, { start: customDateRange.from, end: customDateRange.to })
        default:
          return true
      }
    } catch (error) {
      console.error("Date filtering error:", error)
      return true
    }
  }, [dateFilter, customDateRange])

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const [workflowResponse, flaggedResponse] = await Promise.all([
          QualityCheckAPI.getWorkflowEntityData(),
          QualityCheckAPI.getFlaggedCalls()
        ])

        if (workflowResponse.success) {
          setWorkflowEntityData(workflowResponse.data || [])
        } else {
          setError(workflowResponse.error || "Failed to load workflow entity data")
        }

        if (flaggedResponse.success) {
          setFlaggedCalls(flaggedResponse.data || [])
        } else {
          setError(flaggedResponse.error || "Failed to load flagged calls")
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load data"
        setError(errorMessage)
        console.error("Data loading error:", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // Calculate dynamic workflow data based on date filter
  const dynamicWorkflowData = useMemo(() => {
    const dateFilteredCalls = flaggedCalls.filter(filterByDate)
    const totalFlaggedInPeriod = dateFilteredCalls.length
    const totalCallsInPeriod = totalFlaggedInPeriod * 20 // Assuming 5% sampling rate
    
    return {
      totalCalls: totalCallsInPeriod,
      callsToScan: totalFlaggedInPeriod,
      entities: [
        {
          entity: "IA Approved",
          totalCalls: Math.round(totalCallsInPeriod * 0.3),
          approved: Math.round(totalCallsInPeriod * 0.3),
          rejected: 0,
          callsToScan: Math.round(totalFlaggedInPeriod * 0.3)
        },
        {
          entity: "IA Rejected", 
          totalCalls: Math.round(totalCallsInPeriod * 0.7),
          approved: 0,
          rejected: Math.round(totalCallsInPeriod * 0.7),
          callsToScan: Math.round(totalFlaggedInPeriod * 0.7)
        },
        {
          entity: "QA Approved",
          totalCalls: Math.round(totalCallsInPeriod * 1.0),
          approved: Math.round(totalCallsInPeriod * 1.0),
          rejected: 0,
          callsToScan: Math.round(totalFlaggedInPeriod * 1.0)
        },
        {
          entity: "QA Rejected",
          totalCalls: Math.round(totalCallsInPeriod * 0.5),
          approved: 0,
          rejected: Math.round(totalCallsInPeriod * 0.5),
          callsToScan: Math.round(totalFlaggedInPeriod * 0.5)
        }
      ]
    }
  }, [flaggedCalls, filterByDate])

  const totalCallsFromEntities = useMemo(() => dynamicWorkflowData.totalCalls, [dynamicWorkflowData])
  const totalCallsToScan = useMemo(() => dynamicWorkflowData.callsToScan, [dynamicWorkflowData])

  const stats = useMemo(() => {
    const dateFilteredCalls = flaggedCalls.filter(filterByDate)
    const totalFlagged = dateFilteredCalls.filter(c => c.status === "flag_approved").length
    const pendingReview = dateFilteredCalls.filter(c => c.status === "pending_review").length
    const approvedFlags = dateFilteredCalls.filter(c => c.status === "flag_approved").length
    const rejectedFlags = dateFilteredCalls.filter(c => c.status === "flag_rejected").length
    const reviewed = approvedFlags + rejectedFlags
    
    return { totalFlagged, pendingReview, reviewed, approvedFlags, rejectedFlags }
  }, [flaggedCalls, filterByDate])

  const filteredCalls = useMemo(() => {
    return flaggedCalls
      .filter((call) => {
        if (searchTerm === "") return true
        const searchLower = searchTerm.toLowerCase()
        return (
          call.callId.toLowerCase().includes(searchLower) ||
          call.agentId.toLowerCase().includes(searchLower) ||
          call.agentName.toLowerCase().includes(searchLower)
        )
      })
      .filter((call) => {
        if (selectedFlags.length === 0) return true
        return call.flags.some((flag) => selectedFlags.includes(flag.type))
      })
      .filter(filterByDate)
  }, [flaggedCalls, searchTerm, selectedFlags, filterByDate])

  const pendingCalls = useMemo(() => 
    filteredCalls.filter((c) => c.status === "pending_review"), 
    [filteredCalls]
  )
  
  const reviewedCalls = useMemo(() => 
    filteredCalls.filter((c) => c.status === "flag_approved" || c.status === "flag_rejected"), 
    [filteredCalls]
  )

  const getFlagIcon = useCallback((type: "body_language" | "language" | "sop") => {
    switch (type) {
      case "body_language":
        return <UserX className="w-4 h-4 text-orange-500" />
      case "language":
        return <MessageCircleWarning className="w-4 h-4 text-red-500" />
      case "sop":
        return <BookOpenCheck className="w-4 h-4 text-blue-500" />
      default:
        return null
    }
  }, [])

  const handleUpdateStatus = useCallback(async (callId: string, status: FlaggedCall["status"]) => {
    try {
      const reviewer = "Current User" // In real app, this would be the logged-in user
      const response = await QualityCheckAPI.updateFlaggedCallStatus(callId, status, reviewer)
      
      if (response.success) {
        setFlaggedCalls((prev) =>
          prev.map((call) => (call.callId === callId ? response.data : call))
        )
        setSelectedCall(null)
      } else {
        console.error("Failed to update status:", response.error)
        setError(response.error || "Failed to update call status")
      }
    } catch (error) {
      console.error("Error updating status:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      setError(`Failed to update call status: ${errorMessage}`)
    }
  }, [])

  const handleApproveFlag = useCallback(async (callId: string) => {
    await handleUpdateStatus(callId, "flag_approved")
  }, [handleUpdateStatus])

  const handleRejectFlag = useCallback(async (callId: string) => {
    await handleUpdateStatus(callId, "flag_rejected")
  }, [handleUpdateStatus])

  const getDateFilterLabel = useCallback(() => {
    const labels = {
      all: "All time",
      today: "Today",
      yesterday: "Yesterday",
      this_month: "This month",
      last_3_months: "Last 3 months",
      custom: "Custom range"
    }
    return labels[dateFilter]
  }, [dateFilter])

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-indigo-600" />
              AI Quality Check Dashboard
            </CardTitle>
            <CardDescription>
              AI-powered post-approval analysis of VKYC calls for quality assurance and compliance.
            </CardDescription>
          </CardHeader>
        </Card>
        
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-indigo-600" />
            <p className="text-gray-600">Loading quality check data...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-indigo-600" />
              AI Quality Check Dashboard
            </CardTitle>
            <CardDescription>
              AI-powered post-approval analysis of VKYC calls for quality assurance and compliance.
            </CardDescription>
          </CardHeader>
        </Card>
        
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-red-600" />
              <h3 className="text-lg font-semibold mb-2">Error Loading Data</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-indigo-600" />
            AI Quality Check Dashboard
          </CardTitle>
          <CardDescription>
            AI-powered post-approval analysis of VKYC calls for quality assurance and compliance.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Main Navigation Tabs */}
      <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            QC Overview
          </TabsTrigger>
          <TabsTrigger value="video-upload" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            Video Analysis
          </TabsTrigger>
          <TabsTrigger value="csv-upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            CSV Upload
          </TabsTrigger>
          <TabsTrigger value="ai-agents" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            AI Agents
          </TabsTrigger>
          <TabsTrigger value="ai-testing" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Test AI
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Scheduled Reports
          </TabsTrigger>
        </TabsList>

        {/* QC Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Dialog>
              <DialogTrigger asChild>
                <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Available Calls</CardTitle>
                    <Video className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalCallsFromEntities.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">{getDateFilterLabel()}</p>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Workflow Entity Call Analysis</DialogTitle>
                  <DialogDescription>
                    View call distribution by workflow entities with approval/rejection breakdown.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Entities</p>
                      <p className="text-2xl font-bold flex items-center justify-center gap-2">
                        <Users className="w-6 h-6" /> {workflowEntityData.length}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Calls</p>
                      <p className="text-2xl font-bold flex items-center justify-center gap-2">
                        <Video className="w-6 h-6" /> {totalCallsFromEntities.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Calls to Scan</p>
                      <p className="text-2xl font-bold flex items-center justify-center gap-2">
                        <Calculator className="w-6 h-6" /> {totalCallsToScan.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="sampling" className="font-medium">
                      Sampling Percentage: {samplingPercentage}%
                    </label>
                    <Slider
                      id="sampling"
                      min={1}
                      max={100}
                      step={1}
                      value={[samplingPercentage]}
                      onValueChange={(value) => setSamplingPercentage(value[0])}
                      aria-label="Sampling percentage"
                    />
                  </div>
                  <div className="relative h-72 overflow-y-auto border rounded-md">
                    <Table>
                      <TableHeader className="sticky top-0 bg-background">
                        <TableRow>
                          <TableHead>Entity</TableHead>
                          <TableHead>Total Calls</TableHead>
                          <TableHead>Calls to Scan</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dynamicWorkflowData.entities.map((entity) => (
                          <TableRow key={entity.entity}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{entity.entity}</div>
                                <div className="text-xs text-muted-foreground">
                                  {entity.approved > 0 ? `${entity.approved} approved` : `${entity.rejected} rejected`}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{entity.totalCalls}</TableCell>
                            <TableCell className="font-bold">
                              {entity.callsToScan}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Flagged Calls</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalFlagged}</div>
                <p className="text-xs text-muted-foreground">{getDateFilterLabel()} approved</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingReview}</div>
                <p className="text-xs text-muted-foreground">{getDateFilterLabel()} pending</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Reviewed Calls</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.reviewed}</div>
                <p className="text-xs text-muted-foreground">{getDateFilterLabel()} reviewed</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Flagged Call Queue</CardTitle>
              <CardDescription>Calls identified by the AI that require or have undergone manual review.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <Input
                  placeholder="Search by Call ID, Agent Name/ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                  aria-label="Search calls"
                />
                
                {/* Date Filter */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="bg-transparent" aria-label="Filter by date">
                      <Calendar className="w-4 h-4 mr-2" />
                      {dateFilter === "all" && "All Dates"}
                      {dateFilter === "today" && "Today"}
                      {dateFilter === "yesterday" && "Yesterday"}
                      {dateFilter === "this_month" && "This Month"}
                      {dateFilter === "last_3_months" && "Last 3 Months"}
                      {dateFilter === "custom" && "Custom Range"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>Filter by Date</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {(["all", "today", "yesterday", "this_month", "last_3_months", "custom"] as const).map((filter) => (
                      <DropdownMenuCheckboxItem
                        key={filter}
                        checked={dateFilter === filter}
                        onCheckedChange={() => setDateFilter(filter)}
                      >
                        {filter === "all" && "All Dates"}
                        {filter === "today" && "Today"}
                        {filter === "yesterday" && "Yesterday"}
                        {filter === "this_month" && "This Month"}
                        {filter === "last_3_months" && "Last 3 Months"}
                        {filter === "custom" && "Custom Range"}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Custom Date Range Picker */}
                {dateFilter === "custom" && (
                  <div className="flex gap-2 items-center">
                    <Input
                      type="date"
                      value={customDateRange.from ? format(customDateRange.from, "yyyy-MM-dd") : ""}
                      onChange={(e) => setCustomDateRange(prev => ({ 
                        ...prev, 
                        from: e.target.value ? new Date(e.target.value) : undefined 
                      }))}
                      className="w-40"
                      aria-label="Start date"
                    />
                    <span className="text-muted-foreground text-sm">to</span>
                    <Input
                      type="date"
                      value={customDateRange.to ? format(customDateRange.to, "yyyy-MM-dd") : ""}
                      onChange={(e) => setCustomDateRange(prev => ({ 
                        ...prev, 
                        to: e.target.value ? new Date(e.target.value) : undefined 
                      }))}
                      className="w-40"
                      aria-label="End date"
                    />
                  </div>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="ml-auto bg-transparent" aria-label="Filter by flag type">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter by Flag ({selectedFlags.length})
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Flag Type</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {FLAG_TYPES.map((flag) => (
                      <DropdownMenuCheckboxItem
                        key={flag}
                        checked={selectedFlags.includes(flag)}
                        onCheckedChange={(checked) => {
                          setSelectedFlags((prev) => 
                            checked ? [...prev, flag] : prev.filter((f) => f !== flag)
                          )
                        }}
                        className="capitalize"
                      >
                        {flag.replace("_", " ")}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <Tabs value={activeQueueTab} onValueChange={setActiveQueueTab}>
                <TabsList>
                  <TabsTrigger value="pending">Pending ({pendingCalls.length})</TabsTrigger>
                  <TabsTrigger value="reviewed">Reviewed ({reviewedCalls.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="pending">
                  <CallQueueTable calls={pendingCalls} onReview={setSelectedCall} />
                </TabsContent>
                <TabsContent value="reviewed">
                  <CallQueueTable calls={reviewedCalls} onReview={setSelectedCall} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Video Upload & Analysis Tab */}
        <TabsContent value="video-upload" className="space-y-6">
          <VideoUploadAnalyzer />
        </TabsContent>

        {/* CSV Upload Tab */}
        <TabsContent value="csv-upload" className="space-y-6">
          <QCCSVUpload />
        </TabsContent>

        {/* AI Agents Tab */}
        <TabsContent value="ai-agents" className="space-y-6">
          <AISubAgentTracker />
        </TabsContent>

        {/* AI Testing Tab */}
        <TabsContent value="ai-testing" className="space-y-6">
          <AITestConsole />
        </TabsContent>

        {/* Scheduled Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <QCScheduledReports />
        </TabsContent>
      </Tabs>

      {/* Review Call Dialog */}
      {selectedCall && (
        <Dialog open onOpenChange={() => setSelectedCall(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl">Review Call: {selectedCall.callId}</DialogTitle>
              <DialogDescription>
                Agent: {selectedCall.agentName} | Date: {selectedCall.callDate}
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              <div className="bg-black rounded-lg aspect-video flex items-center justify-center">
                <p className="text-white">Video Player Placeholder</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">AI Detected Flags</h4>
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                  {selectedCall.flags.map((flag, index) => (
                    <div key={index} className="flex items-start gap-3 p-2 border rounded-md">
                      <div className="mt-1">{getFlagIcon(flag.type)}</div>
                      <div>
                        <p className="font-medium capitalize">{flag.type.replace("_", " ")}</p>
                        <p className="text-sm text-muted-foreground">{flag.description}</p>
                        <p className="text-xs text-blue-500 font-mono">Timestamp: {flag.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter className="sm:justify-between">
              <div className="text-sm text-muted-foreground">
                {selectedCall.status === "pending_review" && "Review and approve/reject the AI flag."}
                {selectedCall.status === "flag_approved" && "Flag has been approved."}
                {selectedCall.status === "flag_rejected" && "Flag has been rejected."}
              </div>
              <div className="flex gap-2">
                {selectedCall.status === "pending_review" && (
                  <>
                    <Button variant="outline" onClick={() => handleRejectFlag(selectedCall.callId)}>
                      Reject Flag
                    </Button>
                    <Button onClick={() => handleApproveFlag(selectedCall.callId)}>
                      Approve Flag
                    </Button>
                  </>
                )}
                {selectedCall.status === "flag_approved" && (
                  <div className="text-green-600 font-medium">✓ Flag Approved</div>
                )}
                {selectedCall.status === "flag_rejected" && (
                  <div className="text-red-600 font-medium">✗ Flag Rejected</div>
                )}
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

interface CallQueueTableProps {
  calls: FlaggedCall[]
  onReview: (call: FlaggedCall) => void
}

// Custom hook for AI summary polling
function useAISummary(videoUrl: string | undefined) {
  const [aiSummary, setAiSummary] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  useEffect(() => {
    if (!videoUrl) return;
    let polling = true;
    let pollTimeout: NodeJS.Timeout | null = null;

    async function fetchSummary() {
      setAiSummary("");
      setSummaryError(null);
      setLoadingSummary(true);
      try {
        console.log("[useAISummary] Starting job for videoUrl:", videoUrl);
        // 1. POST to /analyze
        const res = await fetch(`${AI_BACKEND_URL}/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ video_link: videoUrl }),
        });
        if (!res.ok) throw new Error("Failed to start AI summary job");
        const data = await res.json();
        const jobId = data.job_id;
        console.log("[useAISummary] Received job_id:", jobId);

        // 2. Poll for result
        async function poll() {
          if (!polling) return;
          try {
            console.log(`[useAISummary] Polling for job_id: ${jobId}`);
            const resultRes = await fetch(`${AI_BACKEND_URL}/result/${jobId}`);
            if (!resultRes.ok) throw new Error("Failed to fetch AI summary result");
            const resultData = await resultRes.json();
            console.log(`[useAISummary] Poll result for job_id ${jobId}:`, resultData);
            if (resultData.status === "pending" || resultData.status === "processing") {
              pollTimeout = setTimeout(poll, 2000);
            } else {
              setAiSummary(resultData.summary || JSON.stringify(resultData));
              setLoadingSummary(false);
              polling = false;
            }
          } catch (err) {
            setSummaryError("Error fetching summary result");
            setLoadingSummary(false);
            polling = false;
            console.error("[useAISummary] Polling error:", err);
          }
        }
        poll();
      } catch (err) {
        setSummaryError("Error starting summary job");
        setLoadingSummary(false);
        console.error("[useAISummary] Error starting job:", err);
      }
    }
    fetchSummary();
    return () => {
      polling = false;
      if (pollTimeout) clearTimeout(pollTimeout);
    };
  }, [videoUrl]);

  return { aiSummary, loadingSummary, summaryError };
}

function CallQueueTable({ calls, onReview }: CallQueueTableProps) {
  const [openVideo, setOpenVideo] = useState<FlaggedCall | null>(null)
  // Only use the hook, do not declare any duplicate state
  const { aiSummary, loadingSummary, summaryError } = useAISummary(openVideo?.videoUrl);

  useEffect(() => {
    let polling = true;
    let pollTimeout: NodeJS.Timeout | null = null;

    async function fetchSummary() {
      setAiSummary("");
      setSummaryError(null);
      setLoadingSummary(true);

      try {
        // 1. POST to /analyze
        const res = await fetch(`${AI_BACKEND_URL}/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ video_link: openVideo?.videoUrl }),
        });
        if (!res.ok) throw new Error("Failed to start AI summary job");
        const data = await res.json();
        const jobId = data.job_id;

        // 2. Poll for result
        async function poll() {
          if (!polling) return;
          try {
            const resultRes = await fetch(`${AI_BACKEND_URL}/result/${jobId}`);
            if (!resultRes.ok) throw new Error("Failed to fetch AI summary result");
            const resultData = await resultRes.json();
            if (resultData.status === "pending") {
              // Try again in 2 seconds
              pollTimeout = setTimeout(poll, 2000);
            } else {
              setAiSummary(resultData.summary || JSON.stringify(resultData));
              setLoadingSummary(false);
              polling = false;
            }
          } catch (err) {
            setSummaryError("Error fetching summary result");
            setLoadingSummary(false);
            polling = false;
          }
        }
        poll();
      } catch (err) {
        setSummaryError("Error starting summary job");
        setLoadingSummary(false);
      }
    }

    if (openVideo?.videoUrl) {
      fetchSummary();
    }

    // Cleanup on unmount or when openVideo changes
    return () => {
      polling = false;
      if (pollTimeout) clearTimeout(pollTimeout);
    };
  }, [openVideo]);

  const getFlagIcon = (type: "body_language" | "language" | "sop") => {
    switch (type) {
      case "body_language":
        return <UserX className="w-4 h-4 text-orange-500" />
      case "language":
        return <MessageCircleWarning className="w-4 h-4 text-red-500" />
      case "sop":
        return <BookOpenCheck className="w-4 h-4 text-blue-500" />
      default:
        return null
    }
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Call ID</TableHead>
            <TableHead>Agent</TableHead>
            <TableHead>Flags Detected</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Review Call</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {calls.length > 0 ? (
            calls.map((call) => (
              <TableRow key={call.callId}>
                <TableCell className="font-mono text-xs">{call.callId}</TableCell>
                <TableCell className="font-medium">{call.agentName}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-2">
                    {call.flags.map((flag, index) => (
                      <Badge key={index} variant="outline" className="capitalize">
                        {getFlagIcon(flag.type)}
                        <span className="ml-1">{flag.type.replace("_", " ")}</span>
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <Badge
                      variant={
                        call.status === "pending_review"
                          ? "secondary"
                          : call.status === "flag_approved"
                            ? "default"
                            : call.status === "flag_rejected"
                              ? "outline"
                              : "destructive"
                      }
                      className="capitalize"
                    >
                      {call.status === "flag_approved" ? "Approved" : 
                       call.status === "flag_rejected" ? "Rejected" : 
                       call.status.replace("_", " ")}
                    </Badge>
                    {call.aiConfidence && (
                      <div className="text-xs text-muted-foreground">
                        AI Confidence: {(call.aiConfidence * 100).toFixed(0)}%
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setOpenVideo(call)}
                    aria-label={`Watch video for call ${call.callId}`}
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Watch Video
                  </Button>
                </TableCell>
                <TableCell className="text-right">
                  {call.status === "flag_approved" && (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      ✓ Approved
                    </Badge>
                  )}
                  {call.status === "flag_rejected" && (
                    <Badge variant="outline" className="text-red-600 border-red-600">
                      ✗ Rejected
                    </Badge>
                  )}
                  {call.status === "pending_review" && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onReview(call)}
                      aria-label={`Review call ${call.callId}`}
                    >
                      Review
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center h-24">
                No calls match the current filters.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {openVideo && (
        <Dialog open onOpenChange={() => setOpenVideo(null)}>
          <DialogContent
            style={{ width: '80vw', maxWidth: '80vw', height: '80vh', maxHeight: '80vh', padding: 0 }}
            className="p-0"
          >
            <DialogHeader className="px-6 pt-6">
              <DialogTitle>Call Video: {openVideo?.callId}</DialogTitle>
              <DialogDescription>
                Agent: {openVideo?.agentName} | Date: {openVideo?.callDate}
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col md:flex-row gap-6 px-6 pb-6" style={{height: 'calc(80vh - 96px)'}}>
              {/* Video Section */}
              <div className="flex-1 min-w-[300px] max-w-[60%] bg-black flex items-center justify-center rounded-lg" style={{height: '100%'}}>
                {openVideo?.videoUrl && (
                  openVideo.videoUrl.includes("drive.google.com") ? (
                    (() => {
                      const match = openVideo.videoUrl.match(/\/d\/([a-zA-Z0-9_-]+)/)
                      const fileId = match ? match[1] : null
                      const src = fileId ? `https://drive.google.com/file/d/${fileId}/preview` : ""
                      return fileId ? (
                        <iframe
                          src={src}
                          width="100%"
                          height="100%"
                          allow="autoplay"
                          allowFullScreen
                          style={{ border: 0, minHeight: '300px', minWidth: '300px', height: '100%', width: '100%', borderRadius: '0.5rem', background: 'black' }}
                          title="Google Drive Video Preview"
                        />
                      ) : (
                        <div className="text-white">Invalid Google Drive link</div>
                      )
                    })()
                  ) : (
                    <video
                      src={openVideo.videoUrl}
                      controls
                      autoPlay
                      className="w-full h-full rounded-lg"
                      style={{ maxHeight: '100%', maxWidth: '100%' }}
                    >
                      Your browser does not support the video tag.
                    </video>
                  )
                )}
              </div>
              {/* AI Summary Section */}
              <div
                className="flex-1 min-w-[250px] max-w-[40%] bg-gray-50 rounded-lg p-4 border overflow-auto"
                style={{ maxHeight: '100%', minHeight: 0 }}
              >
                <h4 className="font-semibold mb-2">AI Summary Report</h4>
                {loadingSummary && <div className="text-gray-500">Generating summary...</div>}
                {summaryError && <div className="text-red-600">{summaryError}</div>}
                {!loadingSummary && !summaryError && aiSummary && (
                  (() => {
                    let parsed: any = null;
                    try {
                      parsed = JSON.parse(aiSummary);
                    } catch (e) {}
                    if (parsed && typeof parsed === 'object' && (parsed.result || parsed.summary)) {
                      const result = parsed.result || {};
                      return (
                        <div className="space-y-4 text-sm text-gray-800">
                          {result.summary && (
                            <div>
                              <h5 className="font-bold mb-1">Summary</h5>
                              <ReactMarkdown>{result.summary}</ReactMarkdown>
                            </div>
                          )}
                          {result.mistakes && (
                            <div>
                              <h5 className="font-bold mb-1">Mistakes</h5>
                              <ReactMarkdown>{result.mistakes}</ReactMarkdown>
                            </div>
                          )}
                          {result.full_report && (
                            <div>
                              <h5 className="font-bold mb-1">Full Report</h5>
                              <ReactMarkdown>{result.full_report}</ReactMarkdown>
                            </div>
                          )}
                        </div>
                      );
                    }
                    return <div className="text-xs text-gray-700 bg-gray-100 p-2 rounded overflow-x-auto"><ReactMarkdown>{aiSummary}</ReactMarkdown></div>;
                  })()
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
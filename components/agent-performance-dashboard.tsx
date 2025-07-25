"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"
import { useDashboard } from "@/lib/dashboard-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Phone,
  CheckCircle,
  XCircle,
  Target,
  Activity,
  Calendar as CalendarIcon,
  Trophy,
  Crown,
  Medal,
  Search,
  Filter,
  Users,
  RefreshCw,
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { format } from "date-fns"
import { 
  AgentCardShimmer, 
  MetricsCardShimmer, 
  ProfileHeaderShimmer, 
  ChartShimmer, 
  LeaderboardShimmer, 
  MonthlySummaryShimmer,
  SearchFiltersShimmer 
} from "@/components/ui/shimmer"

interface AgentPerformanceDashboardProps {
  userRole: "admin" | "team-lead" | "agent"
  selectedAgent?: string | null
  onAgentSelect?: (agentId: string) => void
}

interface LeaderboardEntry {
  rank: number
  id: string
  name: string
  avatar: string
  score: number
  successRate: number
  callsCompleted: number
  trend: "up" | "down" | "stable"
}

interface AgentData {
  id: string
  name: string
  avatar: string
  rank: number
  todayStats: {
    callsCompleted: number
    successRate: number
    errorCount: number
    avgCallDuration: number
    breakTime: number
    activeHours: number
  }
  weeklyTrend: Array<{
    day: string
    calls: number
    successRate: number
    errors: number
  }>
  hourlyCallsData: Array<{
    hour: string
    calls: number
    loginTime?: string
    logoutTime?: string
  }>
  monthlyStats: {
    totalCalls: number
    avgSuccessRate: number
    totalErrors: number
    improvement: number
  }
}

export function AgentPerformanceDashboard({ userRole, selectedAgent, onAgentSelect }: AgentPerformanceDashboardProps) {
  const { user } = useAuth()
  const { 
    agentProfile, 
    leaderboard: contextLeaderboard, 
    allAgents: contextAllAgents,
    loading: contextLoading 
  } = useDashboard()
  
  const [agentData, setAgentData] = useState<AgentData | null>(null)
  const [dateRange, setDateRange] = useState("today")
  const [allAgents, setAllAgents] = useState<AgentData[]>([])
  const [filteredAgents, setFilteredAgents] = useState<AgentData[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  
  // Component-level loading states
  const [loadingStates, setLoadingStates] = useState({
    agents: true,
    agentProfile: true,
    leaderboard: true,
    weeklyTrend: true,
    hourlyCalls: true,
    monthlyStats: true
  })
  
  const [error, setError] = useState<string | null>(null)
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [agentIdFilter, setAgentIdFilter] = useState("")
  const [dateFrom, setDateFrom] = useState<Date>()
  const [dateTo, setDateTo] = useState<Date>()
  
  // For admin: auto-select first agent, for agents: use their own ID
  const [internalSelectedAgent, setInternalSelectedAgent] = useState<string>("")
  const currentAgentId = userRole === 'agent' ? user?.agent_id?.toString() || '' : 
                        (selectedAgent || internalSelectedAgent || '')

  // Helper to update loading state
  const updateLoadingState = (component: string, isLoading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [component]: isLoading }))
  }

  // Fetch agent profile data for the selected agent
  const fetchAgentProfile = async () => {
    if (!currentAgentId) {
      console.log('❌ No agent ID provided for profile fetch')
      updateLoadingState('agentProfile', false)
      return
    }

    try {
      updateLoadingState('agentProfile', true)
      setError(null)
      
      console.log(`📊 Fetching profile for agent: ${currentAgentId}`)
      
      const response = await apiClient.getAgentProfile(currentAgentId, dateRange)
      
      if (response.success && response.data) {
        console.log('✅ Agent profile data received:', response.data)
        
        // Transform API data to component format
        const profileData = response.data
        setAgentData({
          id: profileData.id?.toString() || currentAgentId,
          name: profileData.name || 'Unknown Agent',
          avatar: "/placeholder.svg?height=32&width=32",
          rank: profileData.rank || 0,
          todayStats: profileData.todayStats || {
            callsCompleted: 0,
            successRate: 0,
            errorCount: 0,
            avgCallDuration: 0,
            breakTime: 0,
            activeHours: 0
          },
          weeklyTrend: [],
          hourlyCallsData: [],
          monthlyStats: {
            totalCalls: 0,
            avgSuccessRate: 0,
            totalErrors: 0,
            improvement: 0
          }
        })
      } else {
        console.log('❌ No agent profile data received')
        setError('Agent profile not found')
      }
    } catch (err : any) {
      console.error('Error fetching agent profile:', err)
      setError(`Failed to load agent profile data: ${err.message}`)
    } finally {
      updateLoadingState('agentProfile', false)
    }
  }

  // Fetch weekly trend data
  const fetchWeeklyTrend = async () => {
    if (!currentAgentId) return

    try {
      updateLoadingState('weeklyTrend', true)
      const response = await apiClient.getAgentWeeklyTrend(currentAgentId, dateRange)
      if (response.success && response.data) {
        setAgentData(prev => prev ? { ...prev, weeklyTrend: response.data } : null)
      }
    } catch (err) {
      console.error('Error fetching weekly trend:', err)
    } finally {
      updateLoadingState('weeklyTrend', false)
    }
  }

  // Fetch hourly calls data
  const fetchHourlyCalls = async () => {
    if (!currentAgentId) return

    try {
      updateLoadingState('hourlyCalls', true)
      const response = await apiClient.getAgentHourlyCalls(currentAgentId)
      if (response.success && response.data) {
        setAgentData(prev => prev ? { ...prev, hourlyCallsData: response.data } : null)
      }
    } catch (err) {
      console.error('Error fetching hourly calls:', err)
    } finally {
      updateLoadingState('hourlyCalls', false)
    }
  }

  // Fetch monthly stats
  const fetchMonthlyStats = async () => {
    if (!currentAgentId) return

    try {
      updateLoadingState('monthlyStats', true)
      const response = await apiClient.getAgentMonthlyStats(currentAgentId)
      if (response.success && response.data) {
        setAgentData(prev => prev ? { ...prev, monthlyStats: response.data } : null)
      }
    } catch (err) {
      console.error('Error fetching monthly stats:', err)
    } finally {
      updateLoadingState('monthlyStats', false)
    }
  }

  // Fetch leaderboard data
  const fetchLeaderboard = async () => {
    try {
      updateLoadingState('leaderboard', true)
      const response = await apiClient.getLeaderboard(10, dateRange)
      if (response.success && response.data) {
        setLeaderboard(response.data)
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err)
      setLeaderboard([])
    } finally {
      updateLoadingState('leaderboard', false)
    }
  }

  // Fetch all agents with enhanced search and filtering (OPTIMIZED)
  const fetchAllAgents = async () => {
    if (userRole === 'agent') return

    try {
      updateLoadingState('agents', true)
      console.log('👥 Fetching all agents for admin dashboard...')
      
      // Remove limit to get ALL agents
      const response = await apiClient.getAllAgents(dateRange, searchTerm)
      if (response.success && response.data) {
        const agents = response.data.map((agent: any) => ({
          id: agent.id?.toString() || '',
          name: agent.name || 'Unknown Agent',
          avatar: agent.avatar || "/placeholder.svg?height=32&width=32",
          rank: agent.rank || 0,
          todayStats: {
            callsCompleted: agent.todayStats?.callsCompleted || 0,
            successRate: agent.todayStats?.successRate || 0,
            errorCount: agent.todayStats?.errorCount || 0,
            avgCallDuration: agent.todayStats?.avgCallDuration || 0,
            breakTime: agent.todayStats?.breakTime || 0,
            activeHours: agent.todayStats?.activeHours || 0
          },
          weeklyTrend: [],
          hourlyCallsData: [],
          monthlyStats: {
            totalCalls: 0,
            avgSuccessRate: 0,
            totalErrors: 0,
            improvement: 0
          }
        }))
        
        console.log('📊 Fetched agents:', agents.length)
        setAllAgents(agents)
        
        // Auto-select first agent if none selected and admin
        if (userRole === 'admin' && agents.length > 0 && !internalSelectedAgent) {
          console.log('🎯 Auto-selecting first agent:', agents[0].id)
          setInternalSelectedAgent(agents[0].id)
          onAgentSelect?.(agents[0].id)
        }
      } else {
        console.log('❌ No agents data received')
        setAllAgents([])
      }
    } catch (err) {
      console.error('Error fetching all agents:', err)
      setAllAgents([])
    } finally {
      updateLoadingState('agents', false)
    }
  }

  // Filter agents based on search criteria
  const filterAgents = () => {
    let filtered = allAgents
    
    if (searchTerm.trim()) {
      filtered = filtered.filter(agent => 
        agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.id.includes(searchTerm)
      )
    }
    
    if (agentIdFilter.trim()) {
      filtered = filtered.filter(agent => 
        agent.id.includes(agentIdFilter)
      )
    }
    
    setFilteredAgents(filtered)
  }

  // Filter agents when search criteria change
  useEffect(() => {
    filterAgents()
  }, [searchTerm, agentIdFilter, allAgents])

  // Refetch agents when search term changes (server-side search)
  useEffect(() => {
    if (userRole !== 'agent') {
      const debounceTimer = setTimeout(() => {
        fetchAllAgents()
      }, 300) // Debounce search
      
      return () => clearTimeout(debounceTimer)
    }
  }, [searchTerm, dateRange])

  // Handle agent selection
  const handleAgentSelect = (agentId: string) => {
    setInternalSelectedAgent(agentId)
    onAgentSelect?.(agentId)
  }

  // OPTIMIZED: Load data based on user role and current needs
  useEffect(() => {
    if (user) {
      console.log(`🎯 Loading performance data for ${userRole}, agent: ${currentAgentId}`)
      
      // Fetch all agents first for admin/team-lead
      if (userRole !== 'agent') {
        fetchAllAgents()
      }
      
      // Always fetch leaderboard
      fetchLeaderboard()
    }
  }, [user, dateRange])

  // Fetch agent-specific data when agent changes
  useEffect(() => {
    if (currentAgentId) {
      console.log(`📊 Loading data for agent: ${currentAgentId}`)
      fetchAgentProfile()
      fetchWeeklyTrend()
      fetchHourlyCalls()
      fetchMonthlyStats()
    }
  }, [currentAgentId, dateRange])

  // Global loading check - only show if all components are loading
  const isGlobalLoading = Object.values(loadingStates).every(loading => loading)
  
  if (isGlobalLoading && userRole === 'agent') {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading performance data...</p>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-600 mb-4">
          <XCircle className="h-8 w-8 mx-auto mb-2" />
          <p className="text-lg font-semibold">Error Loading Data</p>
          <p className="text-sm">{error}</p>
        </div>
        <button 
          onClick={() => {
            setError(null)
            fetchAgentProfile()
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    )
  }

  // For agents with no data, show no data message
  if (userRole === 'agent' && !agentData) {
    return (
      <div className="p-8 text-center">
        <div className="text-gray-600">
          <Activity className="h-8 w-8 mx-auto mb-2" />
          <p className="text-lg font-semibold">NO DATA AVAILABLE</p>
          <p className="text-sm">No performance data found for your account.</p>
        </div>
      </div>
    )
  }

  const currentAgentRank = agentData ? (leaderboard.find((entry) => entry.id === agentData.id)?.rank || agentData.rank) : 0

  return (
    <div className="space-y-6">
      {/* Admin/Team Lead Agent Selection */}
      {(userRole === "admin" || userRole === "team-lead") && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Team Overview ({allAgents.length} agents)</span>
            </CardTitle>
            <CardDescription>Search and filter agents to view detailed performance metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search and Filter Controls */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Filter by Agent ID..."
                  value={agentIdFilter}
                  onChange={(e) => setAgentIdFilter(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, "PPP") : "From date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setAgentIdFilter("")
                  setDateFrom(undefined)
                  setDateTo(undefined)
                }}
                className="flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reset Filters</span>
              </Button>
            </div>

            {/* Loading State with Shimmer UI */}
            {loadingStates.agents && (
              <div className="flex space-x-4 overflow-x-auto pb-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-64">
                    <AgentCardShimmer />
                  </div>
                ))}
              </div>
            )}

            {/* Agent Cards - Horizontal Scroll (5 visible) */}
            {!loadingStates.agents && (
              <div className="relative">
                <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
                  {filteredAgents.map((agent) => (
                    <div
                      key={agent.id}
                      className={`flex-shrink-0 w-64 p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md hover:scale-105 ${
                        currentAgentId === agent.id ? "border-blue-500 bg-blue-50 shadow-md" : "border-gray-200"
                      }`}
                      onClick={() => handleAgentSelect(agent.id)}
                    >
                      <div className="flex flex-col items-center space-y-3">
                        <Avatar className="w-16 h-16">
                          <AvatarImage src={agent.avatar || "/placeholder.svg"} />
                          <AvatarFallback className="text-lg">
                            {agent.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-center">
                          <p className="font-medium text-sm">{agent.name}</p>
                          <p className="text-xs text-gray-500">ID: {agent.id}</p>
                          <p className="text-xs text-gray-500">Rank #{agent.rank}</p>
                        </div>
                        <div className="flex flex-col space-y-1 w-full">
                          <Badge variant="outline" className="text-xs justify-center">
                            {agent.todayStats.successRate}% Success
                          </Badge>
                          <Badge variant="secondary" className="text-xs justify-center">
                            {agent.todayStats.callsCompleted} Calls
                          </Badge>
                        </div>
                        {currentAgentId === agent.id && (
                          <Badge className="text-xs bg-blue-600 text-white">
                            Selected
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {/* Scroll indicators */}
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none" />
              </div>
            )}

            {/* No Results Message */}
            {!loadingStates.agents && filteredAgents.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-8 w-8 mx-auto mb-2" />
                <p className="text-lg font-semibold">No agents found</p>
                <p className="text-sm">Try adjusting your search criteria</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Agent Profile Header - Show when agent is selected or for agent users */}
      {currentAgentId && (
        <>
          {loadingStates.agentProfile ? (
            <ProfileHeaderShimmer />
          ) : agentData ? (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={agentData.avatar || "/placeholder.svg"} />
                      <AvatarFallback>
                        {agentData.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-2xl font-bold">{agentData.name}</h2>
                      <p className="text-gray-600">VKYC Specialist • Rank #{currentAgentRank}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-gray-600">
                  <Activity className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-lg font-semibold">NO DATA AVAILABLE</p>
                  <p className="text-sm">No profile data found for this agent.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Date Range Control - Show when agent is selected */}
      {currentAgentId && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Performance Dashboard</h3>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="last_week">Last Week</SelectItem>
                  <SelectItem value="last_month">Last Month</SelectItem>
                  <SelectItem value="last_3_months">Last 3 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Metrics - Show when agent is selected */}
      {currentAgentId && (
        <>
          {loadingStates.agentProfile ? (
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <MetricsCardShimmer key={i} />
              ))}
            </div>
          ) : agentData ? (
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Calls Completed</p>
                      <p className="text-2xl font-bold text-gray-900">{agentData.todayStats.callsCompleted}</p>
                      <p className="text-xs text-blue-600 flex items-center mt-1">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +5 from yesterday
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Success Rate</p>
                      <p className="text-2xl font-bold text-gray-900">{agentData.todayStats.successRate}%</p>
                      <p className="text-xs text-green-600 flex items-center mt-1">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +2.1% this week
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <XCircle className="w-8 h-8 text-red-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Errors</p>
                      <p className="text-2xl font-bold text-gray-900">{agentData.todayStats.errorCount}</p>
                      <p className="text-xs text-red-600 flex items-center mt-1">
                        <TrendingDown className="w-3 h-3 mr-1" />
                        -1 from yesterday
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-8 h-8 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg Duration</p>
                      <p className="text-2xl font-bold text-gray-900">{agentData.todayStats.avgCallDuration}m</p>
                      <p className="text-xs text-purple-600 flex items-center mt-1">
                        <Target className="w-3 h-3 mr-1" />
                        Optimal range
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-8 h-8 text-orange-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Break Time</p>
                      <p className="text-2xl font-bold text-gray-900">{agentData.todayStats.breakTime}m</p>
                      <p className="text-xs text-orange-600 flex items-center mt-1">
                        <Clock className="w-3 h-3 mr-1" />
                        Within limits
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-8 h-8 text-indigo-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Hours</p>
                      <p className="text-2xl font-bold text-gray-900">{agentData.todayStats.activeHours}h</p>
                      <p className="text-xs text-indigo-600 flex items-center mt-1">
                        <Clock className="w-3 h-3 mr-1" />
                        Today
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-gray-600">
                  <Activity className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-lg font-semibold">NO METRICS DATA AVAILABLE</p>
                  <p className="text-sm">No performance metrics found for this agent.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Leadership Board Widget - Always show */}
      {loadingStates.leaderboard ? (
        <LeaderboardShimmer />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="w-5 h-5" />
              <span>Leadership Board</span>
            </CardTitle>
            <CardDescription>Top performers and current ranking</CardDescription>
          </CardHeader>
          <CardContent>
            {leaderboard.length > 0 ? (
              <div className="space-y-4">
                {/* Top 5 Performers */}
                <div className="space-y-3">
                  {leaderboard.slice(0, 5).map((entry, index) => (
                    <div
                      key={entry.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        entry.id === agentData?.id ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-8 h-8">
                          {index === 0 && <Crown className="w-6 h-6 text-yellow-500" />}
                          {index === 1 && <Medal className="w-6 h-6 text-gray-400" />}
                          {index === 2 && <Medal className="w-6 h-6 text-amber-600" />}
                          {index > 2 && <span className="text-lg font-bold text-gray-600">#{entry.rank}</span>}
                        </div>
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={entry.avatar || "/placeholder.svg"} />
                          <AvatarFallback>
                            {entry.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{entry.name}</p>
                          <p className="text-sm text-gray-600">
                            {entry.callsCompleted} calls • {entry.successRate}% success
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-blue-600 border-blue-200">
                          {entry.score} pts
                        </Badge>
                        {entry.trend === "up" && <TrendingUp className="w-4 h-4 text-green-600" />}
                        {entry.trend === "down" && <TrendingDown className="w-4 h-4 text-red-600" />}
                        {entry.trend === "stable" && <div className="w-4 h-4 bg-gray-400 rounded-full" />}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Current Agent Rank (if not in top 5) */}
                {agentData && currentAgentRank > 5 && (
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-200">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg font-bold text-blue-600">#{currentAgentRank}</span>
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={agentData.avatar || "/placeholder.svg"} />
                          <AvatarFallback>
                            {agentData.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{agentData.name} (You)</p>
                          <p className="text-sm text-gray-600">
                            {agentData.todayStats.callsCompleted} calls • {agentData.todayStats.successRate}% success
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-blue-600 border-blue-200">
                        Your Rank
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Trophy className="h-8 w-8 mx-auto mb-2" />
                <p className="text-lg font-semibold">NO LEADERBOARD DATA</p>
                <p className="text-sm">No performance rankings available.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Performance Trends Tabs - Show when agent is selected */}
      {currentAgentId && (
        <>
          {loadingStates.weeklyTrend || loadingStates.hourlyCalls ? (
            <ChartShimmer height="400px" />
          ) : agentData ? (
            <Card>
              <CardHeader>
                <CardTitle>Performance Analysis</CardTitle>
                <CardDescription>Detailed performance metrics and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="weekly" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="weekly">Weekly Trend</TabsTrigger>
                    <TabsTrigger value="hourly">Hourly Calls</TabsTrigger>
                  </TabsList>

                  <TabsContent value="weekly">
                    {agentData.weeklyTrend.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={agentData.weeklyTrend}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="day" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="calls" stroke="#3b82f6" strokeWidth={2} name="Calls" />
                          <Line type="monotone" dataKey="successRate" stroke="#10b981" strokeWidth={2} name="Success Rate %" />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Activity className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-lg font-semibold">NO WEEKLY TREND DATA</p>
                        <p className="text-sm">No weekly performance data available for this agent.</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="hourly">
                    {agentData.hourlyCallsData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={agentData.hourlyCallsData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="hour" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="calls" fill="#3b82f6" name="Calls per Hour" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Clock className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-lg font-semibold">NO HOURLY DATA</p>
                        <p className="text-sm">No hourly call data available for this agent.</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-gray-600">
                  <Activity className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-lg font-semibold">NO PERFORMANCE ANALYSIS DATA</p>
                  <p className="text-sm">No trend data available for this agent.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Monthly Summary - Show when agent is selected */}
      {currentAgentId && (
        <>
          {loadingStates.monthlyStats ? (
            <MonthlySummaryShimmer />
          ) : agentData ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5" />
                  <span>Monthly Performance Summary</span>
                </CardTitle>
                <CardDescription>Overall performance metrics for the current month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center p-4 border rounded-lg bg-gradient-to-b from-blue-50 to-blue-100">
                    <p className="text-2xl font-bold text-blue-600">{agentData.monthlyStats.totalCalls}</p>
                    <p className="text-sm text-gray-600">Total Calls</p>
                    <Progress value={85} className="mt-2 h-2" />
                  </div>
                  <div className="text-center p-4 border rounded-lg bg-gradient-to-b from-green-50 to-green-100">
                    <p className="text-2xl font-bold text-green-600">{agentData.monthlyStats.avgSuccessRate}%</p>
                    <p className="text-sm text-gray-600">Avg Success Rate</p>
                    <Progress value={agentData.monthlyStats.avgSuccessRate} className="mt-2 h-2" />
                  </div>
                  <div className="text-center p-4 border rounded-lg bg-gradient-to-b from-red-50 to-red-100">
                    <p className="text-2xl font-bold text-red-600">{agentData.monthlyStats.totalErrors}</p>
                    <p className="text-sm text-gray-600">Total Errors</p>
                    <Progress value={25} className="mt-2 h-2" />
                  </div>
                  <div className="text-center p-4 border rounded-lg bg-gradient-to-b from-purple-50 to-purple-100">
                    <p className="text-2xl font-bold text-purple-600">+{agentData.monthlyStats.improvement}%</p>
                    <p className="text-sm text-gray-600">Improvement</p>
                    <Progress value={agentData.monthlyStats.improvement * 10} className="mt-2 h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-gray-600">
                  <Target className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-lg font-semibold">NO MONTHLY SUMMARY DATA</p>
                  <p className="text-sm">No monthly performance data available for this agent.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
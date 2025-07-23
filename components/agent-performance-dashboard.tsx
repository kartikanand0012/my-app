"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Phone,
  CheckCircle,
  XCircle,
  Target,
  Activity,
  Calendar,
  Trophy,
  Crown,
  Medal,
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"

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
  const [agentData, setAgentData] = useState<AgentData | null>(null)
  const [dateRange, setDateRange] = useState("today")
  const [allAgents, setAllAgents] = useState<AgentData[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Determine which agent to show data for
  const currentAgentId = selectedAgent || user?.agent_id?.toString() || ''

  // Fetch agent profile data
  const fetchAgentProfile = async () => {
    if (!currentAgentId) return

    try {
      setLoading(true)
      setError(null)
      const response = await apiClient.getAgentProfile(currentAgentId, dateRange)
      
      if (response.success && response.data) {
        // Transform API data to component format
        const profileData = response.data
        setAgentData({
          id: profileData.id,
          name: profileData.name,
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
      }
    } catch (err) {
      console.error('Error fetching agent profile:', err)
      setError('Failed to load agent profile data')
    } finally {
      setLoading(false)
    }
  }

  // Fetch weekly trend data
  const fetchWeeklyTrend = async () => {
    if (!currentAgentId) return

    try {
      const response = await apiClient.getAgentWeeklyTrend(currentAgentId, dateRange)
      if (response.success && response.data) {
        setAgentData(prev => prev ? { ...prev, weeklyTrend: response.data } : null)
      }
    } catch (err) {
      console.error('Error fetching weekly trend:', err)
    }
  }

  // Fetch hourly calls data
  const fetchHourlyCalls = async () => {
    if (!currentAgentId) return

    try {
      const response = await apiClient.getAgentHourlyCalls(currentAgentId)
      if (response.success && response.data) {
        setAgentData(prev => prev ? { ...prev, hourlyCallsData: response.data } : null)
      }
    } catch (err) {
      console.error('Error fetching hourly calls:', err)
    }
  }

  // Fetch monthly stats
  const fetchMonthlyStats = async () => {
    if (!currentAgentId) return

    try {
      const response = await apiClient.getAgentMonthlyStats(currentAgentId)
      if (response.success && response.data) {
        setAgentData(prev => prev ? { ...prev, monthlyStats: response.data } : null)
      }
    } catch (err) {
      console.error('Error fetching monthly stats:', err)
    }
  }

  // Fetch leaderboard data
  const fetchLeaderboard = async () => {
    try {
      const response = await apiClient.getLeaderboard(10, dateRange)
      if (response.success && response.data) {
        setLeaderboard(response.data)
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err)
      // Keep empty array as fallback to show NO DATA AVAILABLE
      setLeaderboard([])
    }
  }

  // Fetch all agents (for admin/team-lead)
  const fetchAllAgents = async () => {
    if (userRole === 'agent') return

    try {
      const response = await apiClient.getAllAgents(dateRange)
      if (response.success && response.data) {
        const agents = response.data.map((agent: any) => ({
          id: agent.id,
          name: agent.name,
          avatar: agent.avatar || "/placeholder.svg?height=32&width=32",
          rank: agent.rank || 0,
          todayStats: agent.todayStats || {
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
        }))
        setAllAgents(agents)
      }
    } catch (err) {
      console.error('Error fetching all agents:', err)
      setAllAgents([])
    }
  }

  // Load all data when component mounts or key dependencies change
  useEffect(() => {
    if (user) {
      fetchAgentProfile()
      fetchWeeklyTrend()
      fetchHourlyCalls()
      fetchMonthlyStats()
      fetchLeaderboard()
      fetchAllAgents()
    }
  }, [user, currentAgentId, dateRange])

  // Show loading state
  if (loading) {
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

  // Show NO DATA AVAILABLE if no agent data
  if (!agentData) {
    return (
      <div className="p-8 text-center">
        <div className="text-gray-600">
          <Activity className="h-8 w-8 mx-auto mb-2" />
          <p className="text-lg font-semibold">NO DATA AVAILABLE</p>
          <p className="text-sm">No performance data found for the selected agent.</p>
        </div>
      </div>
    )
  }

  const currentAgentRank = leaderboard.find((entry) => entry.id === agentData.id)?.rank || agentData.rank

  return (
    <div className="space-y-6">
      {/* Agent Profile Header */}
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
      {/* Date Range Control */}
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

      {/* Agent Selection (for admin/team-lead) */}
      {(userRole === "admin" || userRole === "team-lead") && (
        <Card>
          <CardHeader>
            <CardTitle>Agent Selection</CardTitle>
            <CardDescription>Select an agent to view their detailed performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {allAgents.map((agent) => (
                <div
                  key={agent.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    selectedAgent === agent.id ? "border-blue-500 bg-blue-50" : "border-gray-200"
                  }`}
                  onClick={() => onAgentSelect?.(agent.id)}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={agent.avatar || "/placeholder.svg"} />
                      <AvatarFallback>
                        {agent.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-center">
                      <p className="font-medium text-sm">{agent.name}</p>
                      <p className="text-xs text-gray-500">Rank #{agent.rank}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {agent.todayStats.successRate}% Success
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      

      {/* Performance Metrics - Fixed to show 6 cards including Active Hours */}
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

      {/* Leadership Board Widget */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="w-5 h-5" />
            <span>Leadership Board</span>
          </CardTitle>
          <CardDescription>Top performers and your current ranking</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Top 5 Performers */}
            <div className="space-y-3">
              {leaderboard.slice(0, 5).map((entry, index) => (
                <div
                  key={entry.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    entry.id === agentData.id ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200"
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
            {currentAgentRank > 5 && (
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
        </CardContent>
      </Card>

      {/* Performance Trends Tabs */}
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
            </TabsContent>

            <TabsContent value="hourly">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={agentData.hourlyCallsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="calls" fill="#3b82f6" name="Calls per Hour" />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Monthly Summary */}
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
    </div>
  )
}

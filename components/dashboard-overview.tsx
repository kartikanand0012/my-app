"use client"

import { useDashboard } from "@/lib/dashboard-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  TrendingUp,
  TrendingDown,
  Users,
  Phone,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Target,
  Activity,
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
  Sector,
} from "recharts"
import { DonutChart } from "@/components/ui/donut-chart";

interface DashboardOverviewProps {
  userRole: "admin" | "team-lead" | "employee"
}

export function DashboardOverview({ userRole }: DashboardOverviewProps) {
  const {
    dashboardStats,
    errorStats,
    errorTrendData,
    errorTypesData,
    agentErrorTypesData, // new
    iaErrorTypesData, // new
    agentProfile,
    loading,
    error
  } = useDashboard()

  // Show loading state
  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading dashboard data...</p>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-600 mb-4">
          <XCircle className="h-8 w-8 mx-auto mb-2" />
          <p className="text-lg font-semibold">Error Loading Dashboard</p>
          <p className="text-sm">{error}</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Reload Dashboard
        </button>
      </div>
    )
  }

  // Calculate derived data
  const agentStats = agentProfile?.todayStats || {}
  const teamStats = {
    totalAgents: dashboardStats?.agents?.total_agents || 0,
    activeAgents: dashboardStats?.agents?.active_agents || 0,
    totalCalls: dashboardStats?.sessions?.total_sessions || 0,
    callsToday: dashboardStats?.sessions?.sessions_today || 0,
    successRate: dashboardStats?.performance?.approval_rate || 0,
    totalErrors: errorStats?.total_errors || errorStats?.total || 0,
    avgCallDuration: errorStats?.avgDuration || 0,
  }

  // Transform error trend data for chart - handle both old and new API formats
  const performanceData = errorTrendData.map(item => {
    // Handle new API format from error-trends-chart
    if (item.agentRejected !== undefined || item.iaFlagged !== undefined) {
      const totalCalls = (item.totalErrors || 0) + 1000 // Assume base calls
      const successRate = totalCalls > 0 ? Math.max(0, 100 - ((item.totalErrors || 0) / totalCalls) * 100) : 0
      return {
        name: item.date,
        calls: totalCalls,
        success: successRate,
        errors: item.totalErrors || 0,
        agentRejected: item.agentRejected || 0,
        iaFlagged: item.iaFlagged || 0
      }
    }
    // Handle legacy format
    return {
      name: item.date || item.day,
      calls: item.calls || item.sessions || 0,
      success: item.successRate || 0,
      errors: item.errors || item.errorCount || 0
    }
  })

  // Transform error types data for pie chart
  const errorDistribution = errorTypesData.map((item, index) => ({
    name: item.type || item.errorType,
    value: item.count || item.value,
    color: ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6'][index % 5]
  }))

  // Separate agent and IA error types for pie charts
  const agentErrorDistribution = agentErrorTypesData.map((item, index) => ({
    name: item.type || item.errorType,
    value: item.count || item.value,
    color: ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6'][index % 5]
  }))
  const iaErrorDistribution = iaErrorTypesData.map((item, index) => ({
    name: item.type || item.errorType,
    value: item.count || item.value,
    color: ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6'][index % 5]
  }))

  // Custom label renderer for Pie chart with leader line and box
  const renderBoxedLabel = ({
    cx, cy, midAngle, outerRadius, name, value
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 20;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // Box dimensions
    const boxPadding = 6;
    const text = `${name}: ${value}`;
    const fontSize = 13;
    // Estimate text width (for monospace or short labels, otherwise use a ref for real width)
    const textWidth = text.length * (fontSize * 0.6);
    const textHeight = fontSize + 4;

    // Leader line start (from arc edge)
    const sx = cx + outerRadius * Math.cos(-midAngle * RADIAN);
    const sy = cy + outerRadius * Math.sin(-midAngle * RADIAN);

    return (
      <g>
        {/* Leader line */}
        <polyline
          points={`${sx},${sy} ${x},${y}`}
          stroke="#333"
          fill="none"
        />
        {/* Label box */}
        <rect
          x={x - textWidth / 2 - boxPadding}
          y={y - textHeight / 2 - boxPadding}
          width={textWidth + boxPadding * 2}
          height={textHeight + boxPadding * 2}
          fill="#fff"
          stroke="#333"
          rx={4}
          ry={4}
          style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.04))' }}
        />
        {/* Label text */}
        <text
          x={x}
          y={y}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={fontSize}
          fill="#333"
          fontWeight={500}
        >
          {text}
        </text>
      </g>
    );
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {userRole === "employee" ? (
          <>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Phone className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Calls Today</p>
                    <p className="text-2xl font-bold text-gray-900">{agentStats.callsCompleted || 0}</p>
                    <p className="text-xs text-blue-600 flex items-center mt-1">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Today's total
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
                    <p className="text-sm font-medium text-gray-600">Approval Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{agentStats.successRate || 0}%</p>
                    <p className="text-xs text-green-600 flex items-center mt-1">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Performance
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
                    <p className="text-sm font-medium text-gray-600">Errors Today</p>
                    <p className="text-2xl font-bold text-gray-900">{agentStats.errorCount || 0}</p>
                    <p className="text-xs text-red-600 flex items-center mt-1">
                      <TrendingDown className="w-3 h-3 mr-1" />
                      Today's count
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Target className="w-8 h-8 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Current Rank</p>
                    <p className="text-2xl font-bold text-gray-900">#{agentProfile?.rank || 0}</p>
                    <p className="text-xs text-purple-600 flex items-center mt-1">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Team ranking
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Users className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Agents</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {teamStats.activeAgents}/{teamStats.totalAgents}
                    </p>
                    <p className="text-xs text-blue-600">{teamStats.totalAgents > 0 ? Math.round((teamStats.activeAgents / teamStats.totalAgents) * 100) : 0}% availability</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Phone className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Calls Today</p>
                    <p className="text-2xl font-bold text-gray-900">{teamStats.callsToday}</p>
                    <p className="text-xs text-green-600 flex items-center mt-1">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Today's sessions
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Approval Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{teamStats.successRate.toFixed(2) || 0}%</p>
                    <p className="text-xs text-emerald-600 flex items-center mt-1">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Team average
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Errors Today</p>
                    <p className="text-2xl font-bold text-gray-900">{errorStats?.today_errors || errorStats?.today || 0}</p>
                    <p className="text-xs text-red-600 flex items-center mt-1">
                      <TrendingDown className="w-3 h-3 mr-1" />
                      Today's total
                    </p>
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
                    <p className="text-xs text-orange-600 flex items-center mt-1">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Critical issues
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Performance Chart Full Width */}
      <div className="w-full mb-6">
        <Card>
          <CardHeader>
            <CardTitle>{userRole === "employee" ? "My Performance Trend" : "Team Performance Trend"}</CardTitle>
            <CardDescription>Daily performance metrics over the past week</CardDescription>
          </CardHeader>
          <CardContent>
            {performanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'calls') return [value, 'Total Calls']
                      if (name === 'success') return [`${value}%`, 'Success Rate']
                      return [value, name]
                    }}
                  />
                  <Line type="monotone" dataKey="calls" stroke="#3b82f6" strokeWidth={2} name="Total Calls" />
                  <Line type="monotone" dataKey="success" stroke="#10b981" strokeWidth={2} name="Success Rate" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                <div className="text-center">
                  <Activity className="h-8 w-8 mx-auto mb-2" />
                  <p>NO DATA AVAILABLE</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Donut Charts Row */}
      {/* Responsive grid: 2 columns if <=4, 3 columns if >4 charts */}
      <div
        className={`w-full grid gap-6
          ${[agentErrorDistribution, iaErrorDistribution].length > 4 ? 'md:grid-cols-3' : 'md:grid-cols-2'}
          grid-cols-1
        `}
      >
        <div className="flex flex-col items-stretch" >
        <Card className="p-2" style={{height:'550px'}}>
          <DonutChart
            data={agentErrorDistribution}
            title="Agent Error Types"
            description="Breakdown of agent rejection error types"
            height={110}
            alignLeft={true}
          />
          </Card>
        </div>
        <div className="flex flex-col items-stretch" >
        <Card className="p-2" style={{height:'550px'}}>
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
    </div>
  )
}
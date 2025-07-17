"use client"

import { useEffect, useState } from "react";
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
} from "recharts"
import { fetchDashboardData } from "../lib/api";

interface DashboardOverviewProps {
  userRole: "admin" | "team-lead" | "employee"
}

export function DashboardOverview({ userRole }: DashboardOverviewProps) {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData().then((data) => {
      setDashboardData(data);
      setLoading(false);
    });
  }, []);

  if (loading || !dashboardData) return <div>Loading...</div>;

  // Replace static data with data from dashboardData
  const performanceData = dashboardData.performanceData || [];
  const errorDistribution = dashboardData.errorDistribution || [];
  const teamStats = dashboardData.teamStats || {};
  const agentStats = dashboardData.agentStats || {};

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {userRole === "employee" ? (
          <>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Phone className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Calls Today</p>
                    <p className="text-2xl font-bold text-gray-900">{agentStats.callsToday}</p>
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
                    <p className="text-2xl font-bold text-gray-900">{agentStats.successRate}%</p>
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
                    <p className="text-sm font-medium text-gray-600">Errors Today</p>
                    <p className="text-2xl font-bold text-gray-900">{agentStats.errorsToday}</p>
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
                  <Target className="w-8 h-8 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Current Rank</p>
                    <p className="text-2xl font-bold text-gray-900">#{agentStats.rank}</p>
                    <p className="text-xs text-purple-600 flex items-center mt-1">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +1 this week
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
                    <p className="text-xs text-blue-600">92% availability</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Phone className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Calls</p>
                    <p className="text-2xl font-bold text-gray-900">{teamStats.totalCalls}</p>
                    <p className="text-xs text-green-600 flex items-center mt-1">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +12% this week
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
                    <p className="text-sm font-medium text-gray-600">Success Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{teamStats.successRate}%</p>
                    <p className="text-xs text-emerald-600 flex items-center mt-1">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +1.5% this month
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
                    <p className="text-sm font-medium text-gray-600">Total Errors</p>
                    <p className="text-2xl font-bold text-gray-900">{teamStats.totalErrors}</p>
                    <p className="text-xs text-red-600 flex items-center mt-1">
                      <TrendingDown className="w-3 h-3 mr-1" />
                      -8% this week
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{userRole === "employee" ? "My Performance Trend" : "Team Performance Trend"}</CardTitle>
            <CardDescription>Daily performance metrics over the past week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="calls" stroke="#3b82f6" strokeWidth={2} name="Calls" />
                <Line type="monotone" dataKey="success" stroke="#10b981" strokeWidth={2} name="Success Rate" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Error Distribution</CardTitle>
            <CardDescription>Breakdown of error types</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={errorDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {errorDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Average Call Duration</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">
                {userRole === "employee" ? agentStats.avgDuration : teamStats.avgCallDuration}m
              </p>
              <p className="text-sm text-gray-600 mt-2">Within optimal range</p>
              <Progress value={75} className="mt-4" />
            </div>
          </CardContent>
        </Card>

        {userRole === "employee" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>Active Hours Today</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{agentStats.activeHours}h</p>
                <p className="text-sm text-gray-600 mt-2">Out of 8 hours</p>
                <Progress value={(agentStats.activeHours / 8) * 100} className="mt-4" />
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Performance Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Quality Score</span>
                <Badge variant="outline" className="text-green-600 border-green-200">
                  Excellent
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Efficiency</span>
                <Badge variant="outline" className="text-blue-600 border-blue-200">
                  Above Average
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Error Rate</span>
                <Badge variant="outline" className="text-yellow-600 border-yellow-200">
                  Needs Attention
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

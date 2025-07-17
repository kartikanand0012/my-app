"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Phone, PhoneCall, PhoneOff, Clock, TrendingUp, TrendingDown, Users, Calendar, Download } from "lucide-react"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from "recharts"
import { useMockApi } from "../lib/hooks/useMockApi";
import { fetchCallVolumeData, fetchCallDurationData, fetchCallOutcomeData, fetchCallStats } from "../lib/services/callsAnalyticsApi";

interface CallsAnalyticsProps {
  userRole: "admin" | "team-lead" | "employee"
}

export function CallsAnalytics({ userRole }: CallsAnalyticsProps) {
  const { data: callVolumeData, loading: loadingVolume, error: errorVolume } = useMockApi(fetchCallVolumeData);
  const { data: callDurationData, loading: loadingDuration, error: errorDuration } = useMockApi(fetchCallDurationData);
  const { data: callOutcomeData, loading: loadingOutcome, error: errorOutcome } = useMockApi(fetchCallOutcomeData);
  const { data: callStats, loading: loadingStats, error: errorStats } = useMockApi(fetchCallStats);
  const [timeRange, setTimeRange] = useState("today");
  const [filterType, setFilterType] = useState("all");

  if (loadingVolume || loadingDuration || loadingOutcome || loadingStats) return <div>Loading...</div>;
  if (errorVolume || errorDuration || errorOutcome || errorStats) return <div>Error loading call analytics data.</div>;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Call Analytics Dashboard</h3>
            <div className="flex space-x-4">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Calls</SelectItem>
                  <SelectItem value="successful">Successful Only</SelectItem>
                  <SelectItem value="failed">Failed Only</SelectItem>
                  <SelectItem value="long">Long Duration</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Phone className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Calls</p>
                <p className="text-2xl font-bold text-gray-900">{callStats.totalCalls}</p>
                <p className="text-xs text-blue-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +12% vs yesterday
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <PhoneCall className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Successful</p>
                <p className="text-2xl font-bold text-gray-900">{callStats.successfulCalls}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {callStats.successRate}% rate
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <PhoneOff className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-gray-900">{callStats.failedCalls}</p>
                <p className="text-xs text-red-600 flex items-center mt-1">
                  <TrendingDown className="w-3 h-3 mr-1" />
                  {((callStats.failedCalls / callStats.totalCalls) * 100).toFixed(1)}% rate
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
                <p className="text-2xl font-bold text-gray-900">{callStats.avgDuration}m</p>
                <p className="text-xs text-purple-600 flex items-center mt-1">
                  <Clock className="w-3 h-3 mr-1" />
                  Optimal range
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Peak Hour</p>
                <p className="text-2xl font-bold text-gray-900">{callStats.peakHour}</p>
                <p className="text-xs text-orange-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Highest volume
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="w-8 h-8 text-indigo-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Active Agents</p>
                <p className="text-2xl font-bold text-gray-900">{userRole === "employee" ? "1" : "23"}</p>
                <p className="text-xs text-indigo-600 flex items-center mt-1">
                  <Users className="w-3 h-3 mr-1" />
                  Currently online
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Call Volume Trend</CardTitle>
            <CardDescription>Hourly call distribution throughout the day</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={callVolumeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="calls" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                <Area
                  type="monotone"
                  dataKey="successful"
                  stackId="2"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.6}
                />
                <Area type="monotone" dataKey="failed" stackId="3" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Call Success Rate</CardTitle>
            <CardDescription>Daily success vs failure rate</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={callOutcomeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="successful" fill="#10b981" name="Successful %" />
                <Bar dataKey="failed" fill="#ef4444" name="Failed %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Call Analytics</CardTitle>
          <CardDescription>In-depth analysis of call patterns and performance</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="duration" className="space-y-4">
            <TabsList>
              <TabsTrigger value="duration">Call Duration</TabsTrigger>
              <TabsTrigger value="patterns">Call Patterns</TabsTrigger>
              <TabsTrigger value="quality">Call Quality</TabsTrigger>
            </TabsList>

            <TabsContent value="duration">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={callDurationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="agent" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="avgDuration" fill="#8b5cf6" name="Avg Duration (min)" />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="patterns">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">52</p>
                  <p className="text-sm text-gray-600">Peak Hour Calls</p>
                  <Badge variant="outline" className="mt-2">
                    10:00 AM
                  </Badge>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-green-600">38</p>
                  <p className="text-sm text-gray-600">Lowest Hour Calls</p>
                  <Badge variant="outline" className="mt-2">
                    12:00 PM
                  </Badge>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">7.2m</p>
                  <p className="text-sm text-gray-600">Shortest Avg Duration</p>
                  <Badge variant="outline" className="mt-2">
                    Morning Shift
                  </Badge>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="quality">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Audio Quality</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Excellent</span>
                        <span className="text-sm font-medium">78%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: "78%" }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Connection Stability</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Stable</span>
                        <span className="text-sm font-medium">92%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: "92%" }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

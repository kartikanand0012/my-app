"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Users, AlertTriangle, CheckCircle, Clock, Activity } from "lucide-react"

export function RealTimeMetrics() {
  const [metrics, setMetrics] = useState({
    totalAgents: 45,
    activeAgents: 38,
    onBreakAgents: 4,
    flaggedAgents: 3,
    totalCalls: 1247,
    avgWaitTime: 2.3,
    successRate: 94.2,
    systemHealth: 98.5,
  })

  const [lastUpdate, setLastUpdate] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time updates
      setMetrics((prev) => ({
        ...prev,
        totalCalls: prev.totalCalls + Math.floor(Math.random() * 3),
        avgWaitTime: Math.max(1.0, prev.avgWaitTime + (Math.random() - 0.5) * 0.2),
        successRate: Math.min(100, Math.max(85, prev.successRate + (Math.random() - 0.5) * 0.5)),
        systemHealth: Math.min(100, Math.max(95, prev.systemHealth + (Math.random() - 0.5) * 0.3)),
      }))
      setLastUpdate(new Date())
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Agents</p>
              <p className="text-2xl font-bold text-gray-900">
                {metrics.activeAgents}/{metrics.totalAgents}
              </p>
              <div className="flex items-center mt-2">
                <Progress value={(metrics.activeAgents / metrics.totalAgents) * 100} className="w-20 h-2 mr-2" />
                <span className="text-xs text-green-600">
                  {Math.round((metrics.activeAgents / metrics.totalAgents) * 100)}%
                </span>
              </div>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Flagged Agents</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.flaggedAgents}</p>
              <Badge variant="outline" className="mt-1 text-red-600 border-red-200">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Needs Attention
              </Badge>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Wait Time</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.avgWaitTime.toFixed(1)}m</p>
              <Badge
                variant="outline"
                className={
                  metrics.avgWaitTime < 3
                    ? "mt-1 text-green-600 border-green-200"
                    : "mt-1 text-yellow-600 border-yellow-200"
                }
              >
                <Clock className="w-3 h-3 mr-1" />
                {metrics.avgWaitTime < 3 ? "Good" : "Monitor"}
              </Badge>
            </div>
            <Clock className="w-8 h-8 text-purple-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.successRate.toFixed(1)}%</p>
              <Badge variant="outline" className="mt-1 text-green-600 border-green-200">
                <CheckCircle className="w-3 h-3 mr-1" />
                Target Met
              </Badge>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </CardContent>
      </Card>

      {/* System Health Status */}
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>System Health Monitor</span>
            </span>
            <Badge variant="outline" className="text-green-600 border-green-200">
              <Activity className="w-3 h-3 mr-1" />
              {metrics.systemHealth.toFixed(1)}% Healthy
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>AI Engine</span>
                <span className="text-green-600">99.2%</span>
              </div>
              <Progress value={99.2} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Database</span>
                <span className="text-green-600">98.8%</span>
              </div>
              <Progress value={98.8} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>API Services</span>
                <span className="text-green-600">97.5%</span>
              </div>
              <Progress value={97.5} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Monitoring</span>
                <span className="text-green-600">99.8%</span>
              </div>
              <Progress value={99.8} className="h-2" />
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">Last updated: {lastUpdate.toLocaleTimeString()}</div>
        </CardContent>
      </Card>
    </div>
  )
}

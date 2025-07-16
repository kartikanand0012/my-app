"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Bot, AlertTriangle, Clock, Activity, Eye, TrendingDown, TrendingUp } from "lucide-react"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"

interface AIFlag {
  id: string
  agentId: string
  agentName: string
  flagType: "break_duration" | "non_engagement" | "unethical_behavior" | "performance_decline"
  severity: "low" | "medium" | "high" | "critical"
  description: string
  detectedAt: string
  confidence: number
  evidence:
    | {
        totalBreakTime: number
        expectedBreakTime: number
        breakFrequency: number
        timePattern: string
      }
    | {
        callsExpected: number
        callsHandled: number
        activeTime: number
        callFlowRate: string
        systemStatus: string
      }
    | {
        awayTime: number
        breakMarked: boolean
        lastActivity: string
        systemDetection: string
      }
    | {
        currentApprovalRate: number
        expectedRate: number
        recentCalls: number
        declinePattern: string
      }
  status: "active" | "investigating" | "resolved"
  autoResolved: boolean
}


interface AgentMetrics {
  agentId: string
  agentName: string
  totalBreakTime: number
  callsHandled: number
  avgCallDuration: number
  approvalRate: number
  rejectionRate: number
  engagementScore: number
  lastActivity: string
  shift: string
  status: "active" | "break" | "offline"
}

export function AIMonitoringDashboard() {
  const [flags, setFlags] = useState<AIFlag[]>([])
  const [agentMetrics, setAgentMetrics] = useState<AgentMetrics[]>([])
  const [monitoringActive, setMonitoringActive] = useState(true)
  const [lastScan, setLastScan] = useState(new Date())

  // Simulated AI monitoring data
  useEffect(() => {
    const generateFlags = (): AIFlag[] => [
      {
        id: "FLAG_001",
        agentId: "AGT_001",
        agentName: "Rajesh Kumar",
        flagType: "break_duration",
        severity: "high",
        description: "Extended break duration detected: 45 minutes in last 2 hours",
        detectedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        confidence: 92,
        evidence: {
          totalBreakTime: 45,
          expectedBreakTime: 20,
          breakFrequency: 3,
          timePattern: "Frequent breaks during peak hours",
        },
        status: "active",
        autoResolved: false,
      },
      {
        id: "FLAG_002",
        agentId: "AGT_002",
        agentName: "Priya Sharma",
        flagType: "non_engagement",
        severity: "critical",
        description: "No calls handled despite active status during high call flow",
        detectedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        confidence: 98,
        evidence: {
          callsExpected: 8,
          callsHandled: 0,
          activeTime: 60,
          callFlowRate: "High",
          systemStatus: "Active",
        },
        status: "active",
        autoResolved: false,
      },
      {
        id: "FLAG_003",
        agentId: "AGT_003",
        agentName: "Amit Patel",
        flagType: "unethical_behavior",
        severity: "medium",
        description: "Break status not marked while away from system",
        detectedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        confidence: 85,
        evidence: {
          awayTime: 25,
          breakMarked: false,
          lastActivity: "2024-01-15 14:30:00",
          systemDetection: "Mouse/keyboard inactive",
        },
        status: "investigating",
        autoResolved: false,
      },
      {
        id: "FLAG_004",
        agentId: "AGT_004",
        agentName: "Sneha Reddy",
        flagType: "performance_decline",
        severity: "medium",
        description: "Approval rate dropped below threshold: 78% (Expected: >85%)",
        detectedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        confidence: 88,
        evidence: {
          currentApprovalRate: 78,
          expectedRate: 85,
          recentCalls: 15,
          declinePattern: "Consistent over last 2 hours",
        },
        status: "active",
        autoResolved: false,
      },
    ]

    const generateAgentMetrics = (): AgentMetrics[] => [
      {
        agentId: "AGT_001",
        agentName: "Rajesh Kumar",
        totalBreakTime: 45,
        callsHandled: 12,
        avgCallDuration: 8.5,
        approvalRate: 89,
        rejectionRate: 11,
        engagementScore: 72,
        lastActivity: "2024-01-15 15:45:00",
        shift: "Morning",
        status: "break",
      },
      {
        agentId: "AGT_002",
        agentName: "Priya Sharma",
        totalBreakTime: 15,
        callsHandled: 0,
        avgCallDuration: 0,
        approvalRate: 0,
        rejectionRate: 0,
        engagementScore: 25,
        lastActivity: "2024-01-15 14:30:00",
        shift: "Morning",
        status: "active",
      },
      {
        agentId: "AGT_003",
        agentName: "Amit Patel",
        totalBreakTime: 25,
        callsHandled: 18,
        avgCallDuration: 7.2,
        approvalRate: 92,
        rejectionRate: 8,
        engagementScore: 88,
        lastActivity: "2024-01-15 15:50:00",
        shift: "Morning",
        status: "active",
      },
      {
        agentId: "AGT_004",
        agentName: "Sneha Reddy",
        totalBreakTime: 20,
        callsHandled: 15,
        avgCallDuration: 9.1,
        approvalRate: 78,
        rejectionRate: 22,
        engagementScore: 65,
        lastActivity: "2024-01-15 15:48:00",
        shift: "Morning",
        status: "active",
      },
    ]

    setFlags(generateFlags())
    setAgentMetrics(generateAgentMetrics())

    // Simulate real-time monitoring
    const interval = setInterval(() => {
      setLastScan(new Date())
      // Update metrics periodically
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getFlagTypeIcon = (type: string) => {
    switch (type) {
      case "break_duration":
        return <Clock className="w-4 h-4" />
      case "non_engagement":
        return <Activity className="w-4 h-4" />
      case "unethical_behavior":
        return <AlertTriangle className="w-4 h-4" />
      case "performance_decline":
        return <TrendingDown className="w-4 h-4" />
      default:
        return <AlertTriangle className="w-4 h-4" />
    }
  }

  const hourlyFlagData = [
    { hour: "09:00", flags: 2, resolved: 1 },
    { hour: "10:00", flags: 3, resolved: 2 },
    { hour: "11:00", flags: 1, resolved: 1 },
    { hour: "12:00", flags: 4, resolved: 2 },
    { hour: "13:00", flags: 2, resolved: 3 },
    { hour: "14:00", flags: 5, resolved: 3 },
    { hour: "15:00", flags: 3, resolved: 2 },
    { hour: "16:00", flags: 2, resolved: 1 },
  ]

  return (
    <div className="space-y-6">
      {/* AI Monitoring Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <Bot className="w-5 h-5" />
              <span>AI Monitoring Engine</span>
            </span>
            <div className="flex items-center space-x-4">
              <Badge
                variant="outline"
                className={monitoringActive ? "text-green-600 border-green-200" : "text-red-600 border-red-200"}
              >
                {monitoringActive ? "Active" : "Inactive"}
              </Badge>
              <Button variant="outline" size="sm" onClick={() => setMonitoringActive(!monitoringActive)}>
                {monitoringActive ? "Pause" : "Resume"} Monitoring
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Last scan: {lastScan.toLocaleTimeString()} | Confidence threshold: 80% | Auto-resolution: Enabled
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-3 border rounded-lg">
              <p className="text-2xl font-bold text-red-600">{flags.filter((f) => f.status === "active").length}</p>
              <p className="text-sm text-gray-600">Active Flags</p>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">
                {flags.filter((f) => f.status === "investigating").length}
              </p>
              <p className="text-sm text-gray-600">Under Investigation</p>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <p className="text-2xl font-bold text-green-600">{flags.filter((f) => f.status === "resolved").length}</p>
              <p className="text-sm text-gray-600">Resolved Today</p>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <p className="text-2xl font-bold text-blue-600">
                {Math.round(flags.reduce((acc, f) => acc + f.confidence, 0) / flags.length)}%
              </p>
              <p className="text-sm text-gray-600">Avg Confidence</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hourly Flag Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Flag Detection Trends</CardTitle>
          <CardDescription>Hourly breakdown of flags detected and resolved</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={hourlyFlagData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="flags" fill="#ef4444" name="Flags Detected" />
              <Bar dataKey="resolved" fill="#10b981" name="Flags Resolved" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Active Flags Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5" />
            <span>Active AI Flags</span>
          </CardTitle>
          <CardDescription>Real-time flags detected by the AI monitoring system</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead>Flag Type</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Detected</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {flags
                .filter((flag) => flag.status === "active")
                .map((flag) => (
                  <TableRow key={flag.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{flag.agentName}</p>
                        <p className="text-sm text-gray-500">{flag.agentId}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getFlagTypeIcon(flag.flagType)}
                        <span className="capitalize">{flag.flagType.replace("_", " ")}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getSeverityColor(flag.severity)}>
                        {flag.severity.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="text-sm truncate">{flag.description}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Progress value={flag.confidence} className="w-16 h-2" />
                        <span className="text-sm">{flag.confidence}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">{new Date(flag.detectedAt).toLocaleTimeString()}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          Investigate
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Agent Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Performance Metrics</CardTitle>
          <CardDescription>Real-time performance data used by AI monitoring algorithms</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Break Time</TableHead>
                <TableHead>Calls</TableHead>
                <TableHead>Approval Rate</TableHead>
                <TableHead>Engagement</TableHead>
                <TableHead>Last Activity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agentMetrics.map((agent) => (
                <TableRow key={agent.agentId}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{agent.agentName}</p>
                      <p className="text-sm text-gray-500">{agent.shift} Shift</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        agent.status === "active"
                          ? "text-green-700 border-green-200"
                          : agent.status === "break"
                            ? "text-yellow-700 border-yellow-200"
                            : "text-gray-700 border-gray-200"
                      }
                    >
                      {agent.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span className={agent.totalBreakTime > 30 ? "text-red-600" : "text-gray-900"}>
                        {agent.totalBreakTime}m
                      </span>
                      {agent.totalBreakTime > 30 && <AlertTriangle className="w-4 h-4 text-red-500" />}
                    </div>
                  </TableCell>
                  <TableCell>{agent.callsHandled}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span className={agent.approvalRate < 85 ? "text-red-600" : "text-green-600"}>
                        {agent.approvalRate}%
                      </span>
                      {agent.approvalRate < 85 ? (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      ) : (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Progress value={agent.engagementScore} className="w-16 h-2" />
                      <span className="text-sm">{agent.engagementScore}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">{agent.lastActivity}</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* AI Algorithm Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Detection Algorithms</CardTitle>
            <CardDescription>Status of individual AI detection modules</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Break Duration Monitor</p>
                    <p className="text-sm text-gray-600">Tracks excessive break patterns</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-green-600 border-green-200">
                  Active
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Activity className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="font-medium">Engagement Detector</p>
                    <p className="text-sm text-gray-600">Monitors call handling activity</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-green-600 border-green-200">
                  Active
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="font-medium">Behavior Analyzer</p>
                    <p className="text-sm text-gray-600">Detects unethical patterns</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-green-600 border-green-200">
                  Active
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <TrendingDown className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="font-medium">Performance Tracker</p>
                    <p className="text-sm text-gray-600">Monitors approval/rejection rates</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-green-600 border-green-200">
                  Active
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Configuration</CardTitle>
            <CardDescription>Current AI monitoring parameters</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <span className="font-medium">Break Duration Threshold</span>
                <Badge variant="outline">30 minutes</Badge>
              </div>
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <span className="font-medium">Minimum Approval Rate</span>
                <Badge variant="outline">85%</Badge>
              </div>
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <span className="font-medium">Engagement Score Threshold</span>
                <Badge variant="outline">70%</Badge>
              </div>
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <span className="font-medium">Confidence Threshold</span>
                <Badge variant="outline">80%</Badge>
              </div>
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <span className="font-medium">Scan Interval</span>
                <Badge variant="outline">30 seconds</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

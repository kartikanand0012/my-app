"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Clock, Phone, Activity, AlertTriangle, CheckCircle, Eye } from "lucide-react"

interface AgentStatus {
  id: string
  name: string
  employeeId: string
  avatar: string
  currentStatus: "active" | "break" | "offline" | "in_call"
  shift: "morning" | "afternoon" | "night"
  loginTime: string
  totalBreakTime: number
  currentBreakStart?: string
  callsToday: number
  callsInProgress: number
  avgCallDuration: number
  approvalRate: number
  rejectionRate: number
  lastActivity: string
  flagCount: number
  engagementScore: number
  location: string
  workstation: string
}

export function AgentStatusTracker() {
  const [agents, setAgents] = useState<AgentStatus[]>([])
  const [filterShift, setFilterShift] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [lastUpdate, setLastUpdate] = useState(new Date())

  useEffect(() => {
    const generateAgentData = (): AgentStatus[] => [
      {
        id: "AGT_001",
        name: "Rajesh Kumar",
        employeeId: "EMP001",
        avatar: "/placeholder.svg?height=32&width=32",
        currentStatus: "break",
        shift: "morning",
        loginTime: "09:00:00",
        totalBreakTime: 45,
        currentBreakStart: "15:30:00",
        callsToday: 12,
        callsInProgress: 0,
        avgCallDuration: 8.5,
        approvalRate: 89,
        rejectionRate: 11,
        lastActivity: "15:29:45",
        flagCount: 2,
        engagementScore: 72,
        location: "Mumbai",
        workstation: "WS-001",
      },
      {
        id: "AGT_002",
        name: "Priya Sharma",
        employeeId: "EMP002",
        avatar: "/placeholder.svg?height=32&width=32",
        currentStatus: "active",
        shift: "morning",
        loginTime: "09:00:00",
        totalBreakTime: 15,
        callsToday: 0,
        callsInProgress: 0,
        avgCallDuration: 0,
        approvalRate: 0,
        rejectionRate: 0,
        lastActivity: "14:30:00",
        flagCount: 1,
        engagementScore: 25,
        location: "Delhi",
        workstation: "WS-002",
      },
      {
        id: "AGT_003",
        name: "Amit Patel",
        employeeId: "EMP003",
        avatar: "/placeholder.svg?height=32&width=32",
        currentStatus: "in_call",
        shift: "morning",
        loginTime: "09:00:00",
        totalBreakTime: 25,
        callsToday: 18,
        callsInProgress: 1,
        avgCallDuration: 7.2,
        approvalRate: 92,
        rejectionRate: 8,
        lastActivity: "15:50:00",
        flagCount: 0,
        engagementScore: 88,
        location: "Bangalore",
        workstation: "WS-003",
      },
      {
        id: "AGT_004",
        name: "Sneha Reddy",
        employeeId: "EMP004",
        avatar: "/placeholder.svg?height=32&width=32",
        currentStatus: "active",
        shift: "morning",
        loginTime: "09:00:00",
        totalBreakTime: 20,
        callsToday: 15,
        callsInProgress: 0,
        avgCallDuration: 9.1,
        approvalRate: 78,
        rejectionRate: 22,
        lastActivity: "15:48:00",
        flagCount: 1,
        engagementScore: 65,
        location: "Hyderabad",
        workstation: "WS-004",
      },
      {
        id: "AGT_005",
        name: "Vikram Singh",
        employeeId: "EMP005",
        avatar: "/placeholder.svg?height=32&width=32",
        currentStatus: "active",
        shift: "afternoon",
        loginTime: "13:00:00",
        totalBreakTime: 10,
        callsToday: 22,
        callsInProgress: 0,
        avgCallDuration: 6.8,
        approvalRate: 94,
        rejectionRate: 6,
        lastActivity: "15:52:00",
        flagCount: 0,
        engagementScore: 95,
        location: "Chennai",
        workstation: "WS-005",
      },
    ]

    setAgents(generateAgentData())

    // Simulate real-time updates
    const interval = setInterval(() => {
      setLastUpdate(new Date())
      setAgents((prev) =>
        prev.map((agent) => ({
          ...agent,
          lastActivity: new Date().toLocaleTimeString(),
          // Simulate some random updates
          callsToday: agent.callsToday + (Math.random() > 0.8 ? 1 : 0),
          totalBreakTime: agent.totalBreakTime + (Math.random() > 0.9 ? 1 : 0),
        })),
      )
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-700 border-green-200 bg-green-50"
      case "in_call":
        return "text-blue-700 border-blue-200 bg-blue-50"
      case "break":
        return "text-yellow-700 border-yellow-200 bg-yellow-50"
      case "offline":
        return "text-gray-700 border-gray-200 bg-gray-50"
      default:
        return "text-gray-700 border-gray-200 bg-gray-50"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-3 h-3" />
      case "in_call":
        return <Phone className="w-3 h-3" />
      case "break":
        return <Clock className="w-3 h-3" />
      case "offline":
        return <Activity className="w-3 h-3" />
      default:
        return <Activity className="w-3 h-3" />
    }
  }

  const filteredAgents = agents.filter((agent) => {
    const shiftMatch = filterShift === "all" || agent.shift === filterShift
    const statusMatch = filterStatus === "all" || agent.currentStatus === filterStatus
    return shiftMatch && statusMatch
  })

  const statusCounts = {
    active: agents.filter((a) => a.currentStatus === "active").length,
    in_call: agents.filter((a) => a.currentStatus === "in_call").length,
    break: agents.filter((a) => a.currentStatus === "break").length,
    offline: agents.filter((a) => a.currentStatus === "offline").length,
  }

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">{statusCounts.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Phone className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">In Call</p>
                <p className="text-2xl font-bold text-gray-900">{statusCounts.in_call}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">On Break</p>
                <p className="text-2xl font-bold text-gray-900">{statusCounts.break}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Activity className="w-8 h-8 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Offline</p>
                <p className="text-2xl font-bold text-gray-900">{statusCounts.offline}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Agent Status Tracker</span>
            </span>
            <div className="text-sm text-gray-600">Last updated: {lastUpdate.toLocaleTimeString()}</div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4 mb-6">
            <Select value={filterShift} onValueChange={setFilterShift}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by Shift" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Shifts</SelectItem>
                <SelectItem value="morning">Morning</SelectItem>
                <SelectItem value="afternoon">Afternoon</SelectItem>
                <SelectItem value="night">Night</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="in_call">In Call</SelectItem>
                <SelectItem value="break">On Break</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Agent Status Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Shift</TableHead>
                <TableHead>Break Time</TableHead>
                <TableHead>Calls Today</TableHead>
                <TableHead>Approval Rate</TableHead>
                <TableHead>Engagement</TableHead>
                <TableHead>Flags</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAgents.map((agent) => (
                <TableRow key={agent.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={agent.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {agent.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{agent.name}</p>
                        <p className="text-sm text-gray-500">{agent.employeeId}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(agent.currentStatus)}>
                      {getStatusIcon(agent.currentStatus)}
                      <span className="ml-1 capitalize">{agent.currentStatus.replace("_", " ")}</span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {agent.shift}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span className={agent.totalBreakTime > 30 ? "text-red-600 font-medium" : "text-gray-900"}>
                        {agent.totalBreakTime}m
                      </span>
                      {agent.totalBreakTime > 30 && <AlertTriangle className="w-4 h-4 text-red-500" />}
                    </div>
                    {agent.currentBreakStart && (
                      <p className="text-xs text-gray-500">Since {agent.currentBreakStart}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span>{agent.callsToday}</span>
                      {agent.callsInProgress > 0 && (
                        <Badge variant="outline" className="text-blue-600 border-blue-200">
                          <Phone className="w-3 h-3 mr-1" />
                          In Progress
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span className={agent.approvalRate < 85 ? "text-red-600" : "text-green-600"}>
                        {agent.approvalRate}%
                      </span>
                      <Progress value={agent.approvalRate} className="w-16 h-2" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Progress value={agent.engagementScore} className="w-16 h-2" />
                      <span className="text-sm">{agent.engagementScore}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {agent.flagCount > 0 ? (
                      <Badge variant="outline" className="text-red-600 border-red-200">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        {agent.flagCount}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-green-600 border-green-200">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Clean
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detailed Agent Cards for Flagged Agents */}
      {filteredAgents.filter((agent) => agent.flagCount > 0).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span>Agents Requiring Attention</span>
            </CardTitle>
            <CardDescription>Agents with active flags or performance issues</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAgents
                .filter((agent) => agent.flagCount > 0)
                .map((agent) => (
                  <div key={agent.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={agent.avatar || "/placeholder.svg"} />
                          <AvatarFallback>
                            {agent.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{agent.name}</p>
                          <p className="text-sm text-gray-500">
                            {agent.location} • {agent.workstation}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-red-600 border-red-200">
                        {agent.flagCount} Flags
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Break Time</p>
                        <p className={agent.totalBreakTime > 30 ? "text-red-600 font-medium" : "text-gray-900"}>
                          {agent.totalBreakTime} minutes
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Calls Today</p>
                        <p className="text-gray-900">{agent.callsToday}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Approval Rate</p>
                        <p className={agent.approvalRate < 85 ? "text-red-600" : "text-green-600"}>
                          {agent.approvalRate}%
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Engagement</p>
                        <p className="text-gray-900">{agent.engagementScore}%</p>
                      </div>
                    </div>

                    <div className="mt-4 flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                        View Details
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                        Send Message
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

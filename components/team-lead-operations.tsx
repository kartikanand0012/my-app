"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Users,
  Download,
  Clock,
  AlertTriangle,
  CheckCircle,
  CalendarIcon,
  MessageSquare,
  Video,
  Eye,
  Settings,
  Phone,
  Search,
} from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { format } from "date-fns"
import { useMockApi } from "../lib/hooks/useMockApi";
import { fetchTeamMembers } from "../lib/services/teamLeadOperationsApi";

interface TeamLeadOperationsProps {
  userRole: "admin" | "team-lead"
  onAgentSelect: (agentId: string) => void
}

interface TeamMember {
  id: string
  uuid: string
  name: string
  avatar: string
  status: "active" | "break" | "offline"
  todayErrors: number
  errorTypes: string[]
  callsToday: number
  successRate: number
  lastError: string
  videoRecordingId?: string
  shift: string
  team: string
}

export function TeamLeadOperations({ userRole, onAgentSelect }: TeamLeadOperationsProps) {
  const { data: teamMembers, loading, error } = useMockApi(fetchTeamMembers);
  const [selectedTeam, setSelectedTeam] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [errorTypeFilter, setErrorTypeFilter] = useState("all")
  const [dateFrom, setDateFrom] = useState<Date>()
  const [dateTo, setDateTo] = useState<Date>()

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading team members.</div>;

  const handleVideoAccess = (videoId: string, agentName: string) => {
    console.log(`Accessing video recording: ${videoId} for ${agentName}`)
    alert(`Opening video recording: ${videoId}\nAgent: ${agentName}\n\nThis would redirect to your video system.`)
  }

  // Filter team members based on search and filters
  const filteredMembers = teamMembers.filter((member) => {
    const matchesTeam = selectedTeam === "all" || member.team === selectedTeam
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.uuid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.lastError.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesErrorType = errorTypeFilter === "all" || member.errorTypes.some((type) => type === errorTypeFilter)

    return matchesTeam && matchesSearch && matchesErrorType
  })

  const teamPerformanceData = [
    { hour: "09:00", errors: 2, calls: 45 },
    { hour: "10:00", errors: 4, calls: 52 },
    { hour: "11:00", errors: 3, calls: 48 },
    { hour: "12:00", errors: 1, calls: 38 },
    { hour: "13:00", errors: 5, calls: 44 },
    { hour: "14:00", errors: 3, calls: 49 },
    { hour: "15:00", errors: 6, calls: 51 },
    { hour: "16:00", errors: 2, calls: 46 },
  ]

  const totalErrors = teamMembers.reduce((sum, member) => sum + member.todayErrors, 0)
  const totalCalls = teamMembers.reduce((sum, member) => sum + member.callsToday, 0)
  const avgSuccessRate = teamMembers.reduce((sum, member) => sum + member.successRate, 0) / teamMembers.length
  const activeMembers = teamMembers.filter((member) => member.status === "active").length
  const totalMembers = teamMembers.length

  return (
    <div className="space-y-6">
      {/* Team Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Team Members</p>
                <p className="text-2xl font-bold text-gray-900">
                  {activeMembers}/{totalMembers}
                </p>
                <p className="text-xs text-green-600">Active/Total</p>
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
                <p className="text-2xl font-bold text-gray-900">{totalErrors}</p>
                <p className="text-xs text-red-600">Today</p>
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
                <p className="text-2xl font-bold text-gray-900">{avgSuccessRate.toFixed(1)}%</p>
                <p className="text-xs text-green-600">Team Average</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Calls</p>
                <p className="text-2xl font-bold text-gray-900">{totalCalls}</p>
                <p className="text-xs text-purple-600">Today</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Phone className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Calls Drop</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
                <p className="text-xs text-red-600">Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Hourly Team Performance</CardTitle>
          <CardDescription>Error rates and call volumes throughout the day</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={teamPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="calls" fill="#3b82f6" name="Total Calls" />
              <Bar dataKey="errors" fill="#ef4444" name="Errors" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Team Members Overview with Enhanced Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Team Members Overview</span>
            <div className="flex space-x-2">
              <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by Team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teams</SelectItem>
                  <SelectItem value="Team A">Team A</SelectItem>
                  <SelectItem value="Team B">Team B</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardTitle>
          <CardDescription>Current team member status and basic performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Enhanced Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by name, UUID, or error..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={errorTypeFilter} onValueChange={setErrorTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Error Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Error Types</SelectItem>
                <SelectItem value="Document Quality">Document Quality</SelectItem>
                <SelectItem value="Network Issue">Network Issue</SelectItem>
                <SelectItem value="Identity Verification">Identity Verification</SelectItem>
                <SelectItem value="System Timeout">System Timeout</SelectItem>
                <SelectItem value="Audio Issue">Audio Issue</SelectItem>
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

            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead>UUID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Today's Calls</TableHead>
                <TableHead>Success Rate</TableHead>
                <TableHead>Errors</TableHead>
                <TableHead>Last Error</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.map((member) => (
                <TableRow key={member.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={member.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-gray-500">
                          {member.team} • {member.shift}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-xs text-gray-600">{member.uuid}</span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        member.status === "active"
                          ? "text-green-700 border-green-200"
                          : member.status === "break"
                            ? "text-yellow-700 border-yellow-200"
                            : "text-gray-700 border-gray-200"
                      }
                    >
                      {member.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{member.callsToday}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Progress value={member.successRate} className="w-16 h-2" />
                      <span className="text-sm">{member.successRate}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant="outline"
                        className={
                          member.todayErrors === 0
                            ? "text-green-700 border-green-200"
                            : member.todayErrors <= 2
                              ? "text-yellow-700 border-yellow-200"
                              : "text-red-700 border-red-200"
                        }
                      >
                        {member.todayErrors} errors
                      </Badge>
                      {member.todayErrors > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            member.videoRecordingId && handleVideoAccess(member.videoRecordingId, member.name)
                          }
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Video className="w-4 h-4 mr-1" />
                          View Video
                        </Button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-gray-600 max-w-xs truncate">{member.lastError}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => onAgentSelect(member.id)}>
                        <Eye className="w-3 h-3 mr-1" />
                        View Profile
                      </Button>
                      <Button variant="outline" size="sm">
                        <MessageSquare className="w-3 h-3 mr-1" />
                        Message
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-600">
              Showing 1-{filteredMembers.length} of {teamMembers.length} team members
            </p>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common team lead operations and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2 bg-transparent"
            >
              <Download className="w-6 h-6" />
              <span>Export Excel Report</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2 bg-transparent"
            >
              <CalendarIcon className="w-6 h-6" />
              <span>Schedule Team Meeting</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2 bg-transparent"
            >
              <Settings className="w-6 h-6" />
              <span>Configure Alerts</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

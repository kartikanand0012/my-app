"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Users, Trophy, TrendingUp, TrendingDown, Star, Phone, Target } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"

interface TeamPerformanceProps {
  userRole: "admin" | "team-lead" | "employee"
}

const teamMembers = [
  {
    id: 1,
    name: "Sarah Wilson",
    avatar: "/placeholder.svg?height=32&width=32",
    role: "Senior KYC Specialist",
    callsToday: 52,
    successRate: 96.8,
    errorRate: 3.2,
    avgDuration: "7.8m",
    proficiencyScore: 94,
    trend: "up",
    trendValue: 2.1,
    status: "online",
    totalCalls: 1247,
    rank: 1,
  },
  {
    id: 2,
    name: "Mike Johnson",
    avatar: "/placeholder.svg?height=32&width=32",
    role: "KYC Specialist",
    callsToday: 48,
    successRate: 94.2,
    errorRate: 5.8,
    avgDuration: "8.2m",
    proficiencyScore: 91,
    trend: "up",
    trendValue: 1.5,
    status: "online",
    totalCalls: 1156,
    rank: 2,
  },
  {
    id: 3,
    name: "Emily Chen",
    avatar: "/placeholder.svg?height=32&width=32",
    role: "KYC Specialist",
    callsToday: 45,
    successRate: 92.1,
    errorRate: 7.9,
    avgDuration: "8.9m",
    proficiencyScore: 88,
    trend: "down",
    trendValue: -0.8,
    status: "online",
    totalCalls: 1089,
    rank: 3,
  },
  {
    id: 4,
    name: "David Brown",
    avatar: "/placeholder.svg?height=32&width=32",
    role: "Junior KYC Specialist",
    callsToday: 38,
    successRate: 89.5,
    errorRate: 10.5,
    avgDuration: "9.5m",
    proficiencyScore: 82,
    trend: "up",
    trendValue: 3.2,
    status: "away",
    totalCalls: 892,
    rank: 4,
  },
  {
    id: 5,
    name: "Lisa Anderson",
    avatar: "/placeholder.svg?height=32&width=32",
    role: "KYC Specialist",
    callsToday: 41,
    successRate: 91.8,
    errorRate: 8.2,
    avgDuration: "8.6m",
    proficiencyScore: 86,
    trend: "up",
    trendValue: 1.9,
    status: "online",
    totalCalls: 967,
    rank: 5,
  },
]

const teamPerformanceData = [
  { name: "Document Verification", teamAvg: 92, topPerformer: 98, benchmark: 90 },
  { name: "Identity Validation", teamAvg: 88, topPerformer: 95, benchmark: 85 },
  { name: "Biometric Matching", teamAvg: 95, topPerformer: 99, benchmark: 93 },
  { name: "Compliance Check", teamAvg: 85, topPerformer: 92, benchmark: 82 },
  { name: "Customer Service", teamAvg: 89, topPerformer: 96, benchmark: 87 },
  { name: "Process Efficiency", teamAvg: 91, topPerformer: 97, benchmark: 88 },
]

const monthlyTrends = [
  { month: "Jan", calls: 3240, successRate: 91.2 },
  { month: "Feb", calls: 3456, successRate: 92.1 },
  { month: "Mar", calls: 3789, successRate: 93.5 },
  { month: "Apr", calls: 3621, successRate: 94.2 },
  { month: "May", calls: 3892, successRate: 94.8 },
  { month: "Jun", calls: 4123, successRate: 95.1 },
]

export function TeamPerformance({ userRole }: TeamPerformanceProps) {
  return (
    <div className="space-y-6">
      {/* Overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Team Size</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
                <Badge variant="outline" className="mt-1 text-green-600 border-green-200">
                  All Active
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Trophy className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Top Performer</p>
                <p className="text-lg font-bold text-gray-900">Sarah Wilson</p>
                <Badge variant="outline" className="mt-1 text-yellow-600 border-yellow-200">
                  96.8% Success
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Target className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Team Average</p>
                <p className="text-2xl font-bold text-gray-900">92.9%</p>
                <Badge variant="outline" className="mt-1 text-green-600 border-green-200">
                  Above Target
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Phone className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Calls</p>
                <p className="text-2xl font-bold text-gray-900">4,123</p>
                <Badge variant="outline" className="mt-1 text-purple-600 border-purple-200">
                  This Month
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Team Performance Metrics</CardTitle>
            <CardDescription>Comparison of team average vs top performer and benchmarks</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={teamPerformanceData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="name" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar name="Team Average" dataKey="teamAvg" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                <Radar name="Top Performer" dataKey="topPerformer" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                <Radar name="Benchmark" dataKey="benchmark" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Trends</CardTitle>
            <CardDescription>Team performance trends over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="calls" fill="#3b82f6" name="Total Calls" />
                <Bar dataKey="successRate" fill="#10b981" name="Success Rate %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Members table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Individual Performance</span>
          </CardTitle>
          <CardDescription>Detailed performance metrics for each team member</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Calls Today</TableHead>
                <TableHead>Success Rate</TableHead>
                <TableHead>Avg Duration</TableHead>
                <TableHead>Proficiency</TableHead>
                <TableHead>Trend</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamMembers.map((member) => (
                <TableRow key={member.id}>
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
                        <p className="text-sm text-gray-500">{member.role}</p>
                      </div>
                      {member.rank <= 3 && (
                        <Badge variant="outline" className="text-yellow-600 border-yellow-200">
                          <Star className="w-3 h-3 mr-1" />#{member.rank}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{member.callsToday}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span>{member.successRate}%</span>
                      <Progress value={member.successRate} className="w-16 h-2" />
                    </div>
                  </TableCell>
                  <TableCell>{member.avgDuration}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        member.proficiencyScore >= 90
                          ? "text-green-700 border-green-200"
                          : member.proficiencyScore >= 80
                            ? "text-yellow-700 border-yellow-200"
                            : "text-red-700 border-red-200"
                      }
                    >
                      {member.proficiencyScore}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      {member.trend === "up" ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      )}
                      <span className={member.trend === "up" ? "text-green-500" : "text-red-500"}>
                        {member.trendValue}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        member.status === "online"
                          ? "text-green-700 border-green-200"
                          : member.status === "away"
                            ? "text-yellow-700 border-yellow-200"
                            : "text-gray-700 border-gray-200"
                      }
                    >
                      {member.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

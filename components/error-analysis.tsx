import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, TrendingDown, TrendingUp, FileText, Lightbulb, ExternalLink } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"

interface ErrorAnalysisProps {
  userRole: "admin" | "team-lead" | "employee"
}

const errorTypes = [
  {
    type: "Document Quality Issues",
    count: 28,
    percentage: 38.9,
    trend: "down",
    trendValue: -12,
    color: "#ef4444",
    severity: "high",
    avgResolutionTime: "3.2 min",
  },
  {
    type: "Network Connectivity",
    count: 18,
    percentage: 25.0,
    trend: "up",
    trendValue: 8,
    color: "#f59e0b",
    severity: "medium",
    avgResolutionTime: "1.8 min",
  },
  {
    type: "Identity Verification Failed",
    count: 15,
    percentage: 20.8,
    trend: "down",
    trendValue: -5,
    color: "#8b5cf6",
    severity: "high",
    avgResolutionTime: "4.1 min",
  },
  {
    type: "System Timeout",
    count: 8,
    percentage: 11.1,
    trend: "up",
    trendValue: 3,
    color: "#10b981",
    severity: "low",
    avgResolutionTime: "0.5 min",
  },
  {
    type: "Audio/Video Issues",
    count: 3,
    percentage: 4.2,
    trend: "down",
    trendValue: -2,
    color: "#3b82f6",
    severity: "medium",
    avgResolutionTime: "2.1 min",
  },
]

const errorSolutions = [
  {
    errorType: "Document Quality Issues",
    commonCauses: ["Poor lighting", "Blurry images", "Incomplete documents"],
    solutions: [
      "Guide customer to improve lighting conditions",
      "Request document re-capture with better focus",
      "Verify all required fields are visible",
    ],
    preventionTips: "Use document quality checklist before proceeding",
    successRate: 89,
  },
  {
    errorType: "Network Connectivity",
    commonCauses: ["Weak internet signal", "Server overload", "Client-side issues"],
    solutions: [
      "Switch to mobile data if WiFi is unstable",
      "Refresh the session and retry",
      "Use alternative verification method",
    ],
    preventionTips: "Check connection quality at session start",
    successRate: 95,
  },
  {
    errorType: "Identity Verification Failed",
    commonCauses: ["Facial recognition mismatch", "Document tampering", "Expired documents"],
    solutions: [
      "Request additional verification documents",
      "Perform manual verification process",
      "Escalate to senior verification team",
    ],
    preventionTips: "Verify document validity dates first",
    successRate: 76,
  },
]

const weeklyErrorTrend = [
  { week: "Week 1", errors: 89, resolved: 84, pending: 5 },
  { week: "Week 2", errors: 76, resolved: 72, pending: 4 },
  { week: "Week 3", errors: 82, resolved: 78, pending: 4 },
  { week: "Week 4", errors: 72, resolved: 69, pending: 3 },
]

export function ErrorAnalysis({ userRole }: ErrorAnalysisProps) {
  return (
    <div className="space-y-6">
      {/* Error Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Error Distribution</span>
            </CardTitle>
            <CardDescription>Breakdown of error types and their frequency</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={errorTypes}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ type, count }) => `${type}: ${count}`}
                  outerRadius={80}
                  innerRadius={40}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {errorTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Error Trend</CardTitle>
            <CardDescription>Error resolution progress over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyErrorTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="errors" fill="#ef4444" name="Total Errors" />
                <Bar dataKey="resolved" fill="#10b981" name="Resolved" />
                <Bar dataKey="pending" fill="#f59e0b" name="Pending" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Error Types Table */}
      <Card>
        <CardHeader>
          <CardTitle>Error Types Analysis</CardTitle>
          <CardDescription>Detailed breakdown of error types, trends, and resolution metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Error Type</TableHead>
                <TableHead>Count</TableHead>
                <TableHead>Percentage</TableHead>
                <TableHead>Trend</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Avg Resolution</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {errorTypes.map((error) => (
                <TableRow key={error.type}>
                  <TableCell className="font-medium">{error.type}</TableCell>
                  <TableCell>{error.count}</TableCell>
                  <TableCell>{error.percentage}%</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      {error.trend === "up" ? (
                        <TrendingUp className="w-4 h-4 text-red-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-green-500" />
                      )}
                      <span className={error.trend === "up" ? "text-red-500" : "text-green-500"}>
                        {Math.abs(error.trendValue)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        error.severity === "high"
                          ? "border-red-200 text-red-700"
                          : error.severity === "medium"
                            ? "border-yellow-200 text-yellow-700"
                            : "border-green-200 text-green-700"
                      }
                    >
                      {error.severity}
                    </Badge>
                  </TableCell>
                  <TableCell>{error.avgResolutionTime}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Error Solutions and Prevention */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lightbulb className="w-5 h-5" />
            <span>Error Solutions & Prevention</span>
          </CardTitle>
          <CardDescription>Common causes, solutions, and prevention strategies for each error type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {errorSolutions.map((solution, index) => (
              <div key={solution.errorType} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-lg">{solution.errorType}</h4>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Success Rate:</span>
                    <Badge variant="outline" className="text-green-700 border-green-200">
                      {solution.successRate}%
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h5 className="font-medium text-sm text-gray-700 mb-2">Common Causes</h5>
                    <ul className="text-sm space-y-1">
                      {solution.commonCauses.map((cause, i) => (
                        <li key={i} className="flex items-start space-x-2">
                          <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                          <span>{cause}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-medium text-sm text-gray-700 mb-2">Solutions</h5>
                    <ul className="text-sm space-y-1">
                      {solution.solutions.map((sol, i) => (
                        <li key={i} className="flex items-start space-x-2">
                          <span className="w-1 h-1 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                          <span>{sol}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-medium text-sm text-gray-700 mb-2">Prevention Tips</h5>
                    <p className="text-sm text-gray-600">{solution.preventionTips}</p>
                    <Progress value={solution.successRate} className="mt-2 h-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common actions for error management and resolution</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Generate Error Report
            </Button>
            <Button variant="outline">
              <ExternalLink className="w-4 h-4 mr-2" />
              View Training Materials
            </Button>
            <Button variant="outline">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Create Error Alert
            </Button>
            {(userRole === "admin" || userRole === "team-lead") && (
              <Button variant="outline">
                <Lightbulb className="w-4 h-4 mr-2" />
                Update Solutions Database
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

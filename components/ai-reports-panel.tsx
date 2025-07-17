"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Bot, Send, MessageSquare, TrendingUp, AlertCircle, CheckCircle, Clock } from "lucide-react"
import { useMockApi } from "../lib/hooks/useMockApi";
import { fetchRecentReports, fetchAIInsights } from "../lib/services/aiReportsPanelApi";

interface AIReportsPanelProps {
  userRole: "admin" | "team-lead" | "employee"
}

export function AIReportsPanel({ userRole }: AIReportsPanelProps) {
  const { data: recentReports, loading: loadingReports, error: errorReports } = useMockApi(fetchRecentReports);
  const { data: aiInsights, loading: loadingInsights, error: errorInsights } = useMockApi(fetchAIInsights);
  const [selectedEmployee, setSelectedEmployee] = useState("all");
  const [reportType, setReportType] = useState("daily");
  const [autoReports, setAutoReports] = useState(true);
  const [slackNotifications, setSlackNotifications] = useState(true);
  const [customMessage, setCustomMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  if (loadingReports || loadingInsights) return <div>Loading...</div>;
  if (errorReports || errorInsights) return <div>Error loading AI reports panel data.</div>;

  const handleGenerateReport = async () => {
    setIsGenerating(true)
    // Simulate AI report generation
    setTimeout(() => {
      setIsGenerating(false)
    }, 3000)
  }

  const handleSendSlackReport = async () => {
    // Simulate sending Slack report
    console.log("Sending Slack report...")
  }

  return (
    <div className="space-y-6">
      {/* AI Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bot className="w-5 h-5" />
            <span>AI Report Configuration</span>
          </CardTitle>
          <CardDescription>Configure automated AI-powered reports and Slack notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(userRole === "admin" || userRole === "team-lead") && (
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Employee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  <SelectItem value="sarah-wilson">Sarah Wilson</SelectItem>
                  <SelectItem value="mike-johnson">Mike Johnson</SelectItem>
                  <SelectItem value="emily-chen">Emily Chen</SelectItem>
                  <SelectItem value="david-brown">David Brown</SelectItem>
                </SelectContent>
              </Select>
            )}

            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder="Report Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily Summary</SelectItem>
                <SelectItem value="weekly">Weekly Report</SelectItem>
                <SelectItem value="monthly">Monthly Analysis</SelectItem>
                <SelectItem value="error-alert">Error Alerts</SelectItem>
                <SelectItem value="performance">Performance Review</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2">
              <Switch id="auto-reports" checked={autoReports} onCheckedChange={setAutoReports} />
              <Label htmlFor="auto-reports" className="text-sm">
                Auto Reports
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="slack-notifications" checked={slackNotifications} onCheckedChange={setSlackNotifications} />
              <Label htmlFor="slack-notifications" className="text-sm">
                Slack Notifications
              </Label>
            </div>
          </div>

          <div className="space-y-4">
            <Label htmlFor="custom-message">Custom Message (Optional)</Label>
            <Textarea
              id="custom-message"
              placeholder="Add a custom message to include in the AI report..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex space-x-3">
            <Button onClick={handleGenerateReport} disabled={isGenerating}>
              <Bot className="w-4 h-4 mr-2" />
              {isGenerating ? "Generating..." : "Generate AI Report"}
            </Button>
            <Button variant="outline" onClick={handleSendSlackReport}>
              <Send className="w-4 h-4 mr-2" />
              Send to Slack
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>AI-Powered Insights</span>
          </CardTitle>
          <CardDescription>Intelligent analysis and recommendations based on your performance data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {aiInsights?.map((insight, index) => (
              <div key={index} className="flex items-start space-x-3 p-4 border rounded-lg">
                <div className="flex-shrink-0">
                  {insight.priority === "positive" && <CheckCircle className="w-5 h-5 text-green-600" />}
                  {insight.priority === "warning" && <AlertCircle className="w-5 h-5 text-yellow-600" />}
                  {insight.priority === "info" && <TrendingUp className="w-5 h-5 text-blue-600" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{insight.type}</h4>
                    <Badge
                      variant="outline"
                      className={
                        insight.priority === "positive"
                          ? "text-green-700 border-green-200"
                          : insight.priority === "warning"
                            ? "text-yellow-700 border-yellow-200"
                            : "text-blue-700 border-blue-200"
                      }
                    >
                      {insight.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{insight.message}</p>
                  {insight.actionable && (
                    <Button variant="outline" size="sm">
                      Take Action
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5" />
            <span>Recent AI Reports</span>
          </CardTitle>
          <CardDescription>History of AI-generated reports and Slack notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentReports?.map((report) => (
              <div key={report.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline">{report.type}</Badge>
                    <span className="text-sm font-medium">{report.recipient}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant="outline"
                      className={
                        report.status === "sent"
                          ? "text-green-700 border-green-200"
                          : report.status === "scheduled"
                            ? "text-blue-700 border-blue-200"
                            : "text-gray-700 border-gray-200"
                      }
                    >
                      <Clock className="w-3 h-3 mr-1" />
                      {report.status}
                    </Badge>
                    <span className="text-xs text-gray-500">{report.timestamp}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-gray-700">{report.summary}</p>
                  {report.improvements.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-1">Improvement Suggestions:</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {report.improvements.map((improvement, i) => (
                          <li key={i} className="flex items-start space-x-2">
                            <span className="w-1 h-1 bg-blue-400 rounded-full mt-1.5 flex-shrink-0"></span>
                            <span>{improvement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Slack Integration Status */}
      <Card>
        <CardHeader>
          <CardTitle>Slack Integration</CardTitle>
          <CardDescription>Status and configuration of Slack notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-medium">Slack Workspace Connected</p>
                <p className="text-sm text-gray-600">kyc-team-workspace</p>
              </div>
            </div>
            <Badge variant="outline" className="text-green-700 border-green-200">
              <CheckCircle className="w-3 h-3 mr-1" />
              Active
            </Badge>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 border rounded-lg">
              <p className="text-2xl font-bold text-blue-600">247</p>
              <p className="text-sm text-gray-600">Reports Sent</p>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <p className="text-2xl font-bold text-green-600">98.2%</p>
              <p className="text-sm text-gray-600">Delivery Rate</p>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <p className="text-2xl font-bold text-purple-600">12</p>
              <p className="text-sm text-gray-600">Active Channels</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

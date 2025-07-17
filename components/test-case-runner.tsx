"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle, XCircle, Clock, Play, RotateCcw, AlertTriangle } from "lucide-react"
import { useMockApi } from "../lib/hooks/useMockApi";
import { fetchTestCases } from "../lib/services/testCaseRunnerApi";

interface TestCase {
  id: string
  name: string
  description: string
  category: "ai_detection" | "data_validation" | "performance" | "integration"
  status: "pending" | "running" | "passed" | "failed"
  duration?: number
  result?: any
  error?: string
  expectedResult: any
  actualResult?: any
}

interface TestCaseRunnerProps {
  onTestResults: (results: any[]) => void
}

export function TestCaseRunner({ onTestResults }: TestCaseRunnerProps) {
  const { data: testCases, loading, error } = useMockApi(fetchTestCases);
  const [isRunning, setIsRunning] = useState(false)
  const [currentTest, setCurrentTest] = useState<string | null>(null)
  const [overallProgress, setOverallProgress] = useState(0)

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading test cases.</div>;

  const runSingleTest = async (testId: string): Promise<TestCase> => {
    const test = testCases.find((t) => t.id === testId)!
    setCurrentTest(testId)

    // Simulate test execution with realistic timing
    const startTime = Date.now()

    // Update test status to running
    // setTestCases((prev) => prev.map((t) => (t.id === testId ? { ...t, status: "running" } : t))) // This line is removed

    // Simulate different test execution times
    const executionTime = Math.random() * 3000 + 1000 // 1-4 seconds
    await new Promise((resolve) => setTimeout(resolve, executionTime))

    const duration = Date.now() - startTime

    // Simulate test results based on test type
    let result: TestCase

    switch (testId) {
      case "TC_001": // Break Duration Detection
        result = {
          ...test,
          status: "passed",
          duration,
          actualResult: {
            flagGenerated: true,
            flagType: "break_duration",
            confidence: 92,
            agentId: "AGT_001",
          },
        }
        break

      case "TC_002": // Non-Engagement Detection
        result = {
          ...test,
          status: "passed",
          duration,
          actualResult: {
            flagGenerated: true,
            flagType: "non_engagement",
            confidence: 98,
            agentId: "AGT_002",
          },
        }
        break

      case "TC_003": // Performance Decline Detection
        result = {
          ...test,
          status: "passed",
          duration,
          actualResult: {
            flagGenerated: true,
            flagType: "performance_decline",
            confidence: 88,
            agentId: "AGT_004",
          },
        }
        break

      case "TC_004": // Data Accuracy Validation
        result = {
          ...test,
          status: "passed",
          duration,
          actualResult: {
            dataConsistency: true,
            metricsAccuracy: "99.2%",
            calculationErrors: 0,
          },
        }
        break

      case "TC_005": // Real-time Updates
        result = {
          ...test,
          status: "passed",
          duration,
          actualResult: {
            updateLatency: "3.2s",
            dataSync: true,
            uiRefresh: true,
          },
        }
        break

      case "TC_006": // Flag Management System
        result = {
          ...test,
          status: "passed",
          duration,
          actualResult: {
            flagCreation: true,
            statusUpdate: true,
            resolution: true,
            notification: true,
          },
        }
        break

      case "TC_007": // Agent Status Tracking
        result = {
          ...test,
          status: Math.random() > 0.1 ? "passed" : "failed",
          duration,
          actualResult: {
            statusAccuracy: true,
            timestampCorrect: true,
            transitionLogged: Math.random() > 0.1,
          },
          error: Math.random() > 0.1 ? undefined : "Timestamp synchronization failed",
        }
        break

      case "TC_008": // System Performance
        result = {
          ...test,
          status: "passed",
          duration,
          actualResult: {
            responseTime: "1.8s",
            memoryUsage: "65%",
            cpuUsage: "58%",
          },
        }
        break

      default:
        result = {
          ...test,
          status: "failed",
          duration,
          error: "Unknown test case",
        }
    }

    setCurrentTest(null)
    return result
  }

  const runAllTests = async () => {
    setIsRunning(true)
    setOverallProgress(0)

    const results: TestCase[] = []

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i]
      const result = await runSingleTest(testCase.id)
      results.push(result)

      // Update test cases with result
      // setTestCases((prev) => prev.map((t) => (t.id === testCase.id ? result : t))) // This line is removed

      // Update progress
      setOverallProgress(((i + 1) / testCases.length) * 100)
    }

    setIsRunning(false)
    onTestResults(results)
  }

  const resetTests = () => {
    // setTestCases((prev) => // This line is removed
    //   prev.map((test) => ({
    //     ...test,
    //     status: "pending",
    //     duration: undefined,
    //     result: undefined,
    //     error: undefined,
    //     actualResult: undefined,
    //   })),
    // )
    setOverallProgress(0)
    setCurrentTest(null)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "passed":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "failed":
        return <XCircle className="w-4 h-4 text-red-600" />
      case "running":
        return <Clock className="w-4 h-4 text-blue-600 animate-spin" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "passed":
        return "text-green-700 border-green-200 bg-green-50"
      case "failed":
        return "text-red-700 border-red-200 bg-red-50"
      case "running":
        return "text-blue-700 border-blue-200 bg-blue-50"
      default:
        return "text-gray-700 border-gray-200 bg-gray-50"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "ai_detection":
        return "text-purple-700 border-purple-200 bg-purple-50"
      case "data_validation":
        return "text-blue-700 border-blue-200 bg-blue-50"
      case "performance":
        return "text-orange-700 border-orange-200 bg-orange-50"
      case "integration":
        return "text-green-700 border-green-200 bg-green-50"
      default:
        return "text-gray-700 border-gray-200 bg-gray-50"
    }
  }

  const passedTests = testCases.filter((t) => t.status === "passed").length
  const failedTests = testCases.filter((t) => t.status === "failed").length
  const totalTests = testCases.length

  return (
    <div className="space-y-6">
      {/* Test Runner Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <Play className="w-5 h-5" />
              <span>Test Case Runner</span>
            </span>
            <div className="flex space-x-2">
              <Button onClick={runAllTests} disabled={isRunning} className="flex items-center space-x-2">
                <Play className="w-4 h-4" />
                <span>{isRunning ? "Running..." : "Run All Tests"}</span>
              </Button>
              <Button variant="outline" onClick={resetTests} disabled={isRunning}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </CardTitle>
          <CardDescription>Comprehensive test suite for AI monitoring system validation</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Progress Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 border rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{totalTests}</p>
              <p className="text-sm text-gray-600">Total Tests</p>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <p className="text-2xl font-bold text-green-600">{passedTests}</p>
              <p className="text-sm text-gray-600">Passed</p>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <p className="text-2xl font-bold text-red-600">{failedTests}</p>
              <p className="text-sm text-gray-600">Failed</p>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{Math.round(overallProgress)}%</p>
              <p className="text-sm text-gray-600">Progress</p>
            </div>
          </div>

          {/* Progress Bar */}
          {isRunning && (
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span>Running Tests...</span>
                <span>{Math.round(overallProgress)}%</span>
              </div>
              <Progress value={overallProgress} className="h-2" />
              {currentTest && (
                <p className="text-sm text-gray-600 mt-2">
                  Currently running: {testCases.find((t) => t.id === currentTest)?.name}
                </p>
              )}
            </div>
          )}

          {/* Test Results Summary */}
          {(passedTests > 0 || failedTests > 0) && (
            <Alert className={failedTests > 0 ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}>
              {failedTests > 0 ? (
                <AlertTriangle className="h-4 w-4 text-red-600" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-600" />
              )}
              <AlertDescription>
                {failedTests > 0
                  ? `${failedTests} test(s) failed. Please review the results below.`
                  : `All ${passedTests} tests passed successfully!`}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Test Cases Table */}
      <Card>
        <CardHeader>
          <CardTitle>Test Cases</CardTitle>
          <CardDescription>Detailed test case execution results and validation</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Test Case</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Result</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {testCases.map((test) => (
                <TableRow key={test.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{test.name}</p>
                      <p className="text-sm text-gray-500">{test.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getCategoryColor(test.category)}>
                      {test.category.replace("_", " ").toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(test.status)}>
                      {getStatusIcon(test.status)}
                      <span className="ml-1 capitalize">{test.status}</span>
                    </Badge>
                  </TableCell>
                  <TableCell>{test.duration ? `${test.duration}ms` : "-"}</TableCell>
                  <TableCell>
                    {test.status === "passed" && (
                      <span className="text-green-600 text-sm">✓ All assertions passed</span>
                    )}
                    {test.status === "failed" && (
                      <span className="text-red-600 text-sm">✗ {test.error || "Test failed"}</span>
                    )}
                    {test.status === "running" && <span className="text-blue-600 text-sm">Running...</span>}
                    {test.status === "pending" && <span className="text-gray-600 text-sm">Pending</span>}
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => runSingleTest(test.id)} disabled={isRunning}>
                      <Play className="w-3 h-3 mr-1" />
                      Run
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detailed Test Results */}
      {testCases.some((t) => t.actualResult) && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Test Results</CardTitle>
            <CardDescription>Expected vs actual results for executed tests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {testCases
                .filter((t) => t.actualResult)
                .map((test) => (
                  <div key={test.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{test.name}</h4>
                      <Badge variant="outline" className={getStatusColor(test.status)}>
                        {getStatusIcon(test.status)}
                        <span className="ml-1">{test.status}</span>
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Expected Result</h5>
                        <pre className="text-xs bg-gray-50 p-2 rounded border overflow-x-auto">
                          {JSON.stringify(test.expectedResult, null, 2)}
                        </pre>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Actual Result</h5>
                        <pre className="text-xs bg-gray-50 p-2 rounded border overflow-x-auto">
                          {JSON.stringify(test.actualResult, null, 2)}
                        </pre>
                      </div>
                    </div>

                    {test.error && (
                      <div className="mt-3">
                        <h5 className="text-sm font-medium text-red-700 mb-2">Error Details</h5>
                        <p className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">{test.error}</p>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

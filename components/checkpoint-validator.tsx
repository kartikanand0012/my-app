"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Database, Activity, Bot, Shield, Zap } from "lucide-react"

interface Checkpoint {
  id: string
  name: string
  description: string
  category: "system" | "data" | "ai" | "security" | "performance"
  status: "pending" | "checking" | "passed" | "failed" | "warning"
  priority: "low" | "medium" | "high" | "critical"
  validationRules: string[]
  result?: {
    passed: boolean
    message: string
    details?: any
    recommendations?: string[]
  }
  dependencies?: string[]
}

interface CheckpointValidatorProps {
  testResults: any[]
}

export function CheckpointValidator({ testResults }: CheckpointValidatorProps) {
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([
    {
      id: "CP_001",
      name: "Database Connectivity",
      description: "Verify connection to Apache Superset and data sources",
      category: "system",
      status: "pending",
      priority: "critical",
      validationRules: [
        "Database connection established",
        "Query execution successful",
        "Data retrieval within acceptable time",
        "Connection pool healthy",
      ],
    },
    {
      id: "CP_002",
      name: "AI Engine Initialization",
      description: "Validate AI monitoring algorithms are loaded and functional",
      category: "ai",
      status: "pending",
      priority: "critical",
      validationRules: [
        "All AI models loaded successfully",
        "Detection algorithms initialized",
        "Confidence thresholds configured",
        "Real-time processing enabled",
      ],
      dependencies: ["CP_001"],
    },
    {
      id: "CP_003",
      name: "Data Accuracy Validation",
      description: "Ensure all displayed metrics match source data",
      category: "data",
      status: "pending",
      priority: "high",
      validationRules: [
        "Metric calculations verified",
        "Data aggregation correct",
        "Real-time sync functional",
        "Historical data consistent",
      ],
      dependencies: ["CP_001", "CP_002"],
    },
    {
      id: "CP_004",
      name: "Flag Generation System",
      description: "Verify AI flag detection and management workflow",
      category: "ai",
      status: "pending",
      priority: "high",
      validationRules: [
        "Flag detection algorithms active",
        "Confidence scoring accurate",
        "Flag persistence working",
        "Status updates functional",
      ],
      dependencies: ["CP_002", "CP_003"],
    },
    {
      id: "CP_005",
      name: "Real-time Monitoring",
      description: "Validate real-time data updates and synchronization",
      category: "performance",
      status: "pending",
      priority: "medium",
      validationRules: [
        "Data refresh intervals correct",
        "WebSocket connections stable",
        "UI updates responsive",
        "Memory usage optimized",
      ],
      dependencies: ["CP_001", "CP_003"],
    },
    {
      id: "CP_006",
      name: "Security Validation",
      description: "Ensure proper access controls and data protection",
      category: "security",
      status: "pending",
      priority: "high",
      validationRules: [
        "Authentication mechanisms active",
        "Role-based access enforced",
        "Data encryption enabled",
        "Audit logging functional",
      ],
    },
    {
      id: "CP_007",
      name: "Performance Benchmarks",
      description: "Validate system performance meets requirements",
      category: "performance",
      status: "pending",
      priority: "medium",
      validationRules: [
        "Response time < 2 seconds",
        "Memory usage < 80%",
        "CPU utilization < 70%",
        "Concurrent user support adequate",
      ],
      dependencies: ["CP_001", "CP_002", "CP_005"],
    },
    {
      id: "CP_008",
      name: "Integration Testing",
      description: "Verify all system components work together correctly",
      category: "system",
      status: "pending",
      priority: "high",
      validationRules: [
        "Component communication functional",
        "Data flow between modules correct",
        "Error handling robust",
        "Fallback mechanisms active",
      ],
      dependencies: ["CP_001", "CP_002", "CP_003", "CP_004"],
    },
  ])

  const [isValidating, setIsValidating] = useState(false)
  const [validationProgress, setValidationProgress] = useState(0)
  const [currentCheckpoint, setCurrentCheckpoint] = useState<string | null>(null)

  useEffect(() => {
    // Update checkpoint status based on test results
    if (testResults.length > 0) {
      setCheckpoints((prev) =>
        prev.map((checkpoint) => {
          const relatedTests = testResults.filter(
            (test) =>
              (checkpoint.category === "ai" && test.category === "ai_detection") ||
              (checkpoint.category === "data" && test.category === "data_validation") ||
              (checkpoint.category === "performance" && test.category === "performance") ||
              (checkpoint.category === "system" && test.category === "integration"),
          )

          if (relatedTests.length > 0) {
            const allPassed = relatedTests.every((test) => test.status === "passed")
            const anyFailed = relatedTests.some((test) => test.status === "failed")

            return {
              ...checkpoint,
              status: anyFailed ? "failed" : allPassed ? "passed" : "warning",
              result: {
                passed: allPassed,
                message: anyFailed
                  ? "Some related tests failed"
                  : allPassed
                    ? "All related tests passed"
                    : "Tests partially completed",
                details: relatedTests,
              },
            }
          }
          return checkpoint
        }),
      )
    }
  }, [testResults])

  const validateCheckpoint = async (checkpointId: string): Promise<Checkpoint> => {
    const checkpoint = checkpoints.find((c) => c.id === checkpointId)!
    setCurrentCheckpoint(checkpointId)

    // Update status to checking
    setCheckpoints((prev) => prev.map((c) => (c.id === checkpointId ? { ...c, status: "checking" } : c)))

    // Simulate validation process
    await new Promise((resolve) => setTimeout(resolve, 2000 + Math.random() * 3000))

    // Simulate validation results
    const validationSuccess = Math.random() > 0.15 // 85% success rate
    const hasWarnings = Math.random() > 0.7 // 30% chance of warnings

    const result: Checkpoint = {
      ...checkpoint,
      status: !validationSuccess ? "failed" : hasWarnings ? "warning" : "passed",
      result: {
        passed: validationSuccess,
        message: !validationSuccess
          ? "Validation failed - critical issues detected"
          : hasWarnings
            ? "Validation passed with warnings"
            : "All validation rules passed successfully",
        details: {
          rulesChecked: checkpoint.validationRules.length,
          rulesPassed: validationSuccess
            ? checkpoint.validationRules.length - (hasWarnings ? 1 : 0)
            : Math.floor(checkpoint.validationRules.length * 0.6),
          executionTime: `${(2000 + Math.random() * 3000).toFixed(0)}ms`,
        },
        recommendations: !validationSuccess
          ? ["Review system configuration", "Check error logs for details", "Restart affected services"]
          : hasWarnings
            ? ["Monitor performance metrics", "Consider optimization"]
            : [],
      },
    }

    setCurrentCheckpoint(null)
    return result
  }

  const runAllValidations = async () => {
    setIsValidating(true)
    setValidationProgress(0)

    // Sort checkpoints by dependencies (topological sort)
    const sortedCheckpoints = [...checkpoints].sort((a, b) => {
      if (a.dependencies?.includes(b.id)) return 1
      if (b.dependencies?.includes(a.id)) return -1
      return 0
    })

    for (let i = 0; i < sortedCheckpoints.length; i++) {
      const checkpoint = sortedCheckpoints[i]

      // Check if dependencies are met
      const dependenciesMet =
        !checkpoint.dependencies ||
        checkpoint.dependencies.every((depId) => {
          const dep = checkpoints.find((c) => c.id === depId)
          return dep?.status === "passed" || dep?.status === "warning"
        })

      if (!dependenciesMet) {
        // Skip if dependencies not met
        setCheckpoints((prev) =>
          prev.map((c) =>
            c.id === checkpoint.id
              ? {
                  ...c,
                  status: "failed",
                  result: {
                    passed: false,
                    message: "Dependencies not met",
                    recommendations: ["Resolve dependency issues first"],
                  },
                }
              : c,
          ),
        )
      } else {
        const result = await validateCheckpoint(checkpoint.id)
        setCheckpoints((prev) => prev.map((c) => (c.id === checkpoint.id ? result : c)))
      }

      setValidationProgress(((i + 1) / sortedCheckpoints.length) * 100)
    }

    setIsValidating(false)
  }

  const resetValidations = () => {
    setCheckpoints((prev) =>
      prev.map((checkpoint) => ({
        ...checkpoint,
        status: "pending",
        result: undefined,
      })),
    )
    setValidationProgress(0)
    setCurrentCheckpoint(null)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "passed":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "failed":
        return <XCircle className="w-4 h-4 text-red-600" />
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      case "checking":
        return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
      default:
        return <RefreshCw className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "passed":
        return "text-green-700 border-green-200 bg-green-50"
      case "failed":
        return "text-red-700 border-red-200 bg-red-50"
      case "warning":
        return "text-yellow-700 border-yellow-200 bg-yellow-50"
      case "checking":
        return "text-blue-700 border-blue-200 bg-blue-50"
      default:
        return "text-gray-700 border-gray-200 bg-gray-50"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "system":
        return <Database className="w-4 h-4" />
      case "ai":
        return <Bot className="w-4 h-4" />
      case "data":
        return <Activity className="w-4 h-4" />
      case "security":
        return <Shield className="w-4 h-4" />
      case "performance":
        return <Zap className="w-4 h-4" />
      default:
        return <Database className="w-4 h-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "text-red-700 border-red-200 bg-red-50"
      case "high":
        return "text-orange-700 border-orange-200 bg-orange-50"
      case "medium":
        return "text-yellow-700 border-yellow-200 bg-yellow-50"
      case "low":
        return "text-blue-700 border-blue-200 bg-blue-50"
      default:
        return "text-gray-700 border-gray-200 bg-gray-50"
    }
  }

  const passedCheckpoints = checkpoints.filter((c) => c.status === "passed").length
  const failedCheckpoints = checkpoints.filter((c) => c.status === "failed").length
  const warningCheckpoints = checkpoints.filter((c) => c.status === "warning").length
  const totalCheckpoints = checkpoints.length

  const overallHealth = (passedCheckpoints / totalCheckpoints) * 100

  return (
    <div className="space-y-6">
      {/* Validation Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>System Checkpoint Validator</span>
            </span>
            <div className="flex space-x-2">
              <Button onClick={runAllValidations} disabled={isValidating} className="flex items-center space-x-2">
                <RefreshCw className={`w-4 h-4 ${isValidating ? "animate-spin" : ""}`} />
                <span>{isValidating ? "Validating..." : "Run All Validations"}</span>
              </Button>
              <Button variant="outline" onClick={resetValidations} disabled={isValidating}>
                Reset
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Comprehensive system validation to ensure all components are functioning correctly
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Overall Health Score */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="text-center p-3 border rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{Math.round(overallHealth)}%</p>
              <p className="text-sm text-gray-600">System Health</p>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <p className="text-2xl font-bold text-green-600">{passedCheckpoints}</p>
              <p className="text-sm text-gray-600">Passed</p>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">{warningCheckpoints}</p>
              <p className="text-sm text-gray-600">Warnings</p>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <p className="text-2xl font-bold text-red-600">{failedCheckpoints}</p>
              <p className="text-sm text-gray-600">Failed</p>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{totalCheckpoints}</p>
              <p className="text-sm text-gray-600">Total</p>
            </div>
          </div>

          {/* Progress Bar */}
          {isValidating && (
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span>Validation Progress</span>
                <span>{Math.round(validationProgress)}%</span>
              </div>
              <Progress value={validationProgress} className="h-2" />
              {currentCheckpoint && (
                <p className="text-sm text-gray-600 mt-2">
                  Currently validating: {checkpoints.find((c) => c.id === currentCheckpoint)?.name}
                </p>
              )}
            </div>
          )}

          {/* System Health Alert */}
          {overallHealth < 80 && (passedCheckpoints > 0 || failedCheckpoints > 0) && (
            <Alert className="border-red-200 bg-red-50 mb-6">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription>
                System health is below optimal levels ({Math.round(overallHealth)}%).
                {failedCheckpoints > 0 && ` ${failedCheckpoints} critical checkpoint(s) failed.`}
                Please address the issues before proceeding to production.
              </AlertDescription>
            </Alert>
          )}

          {overallHealth >= 95 && passedCheckpoints === totalCheckpoints && (
            <Alert className="border-green-200 bg-green-50 mb-6">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>
                Excellent! All system checkpoints passed successfully. The system is ready for production deployment.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Checkpoint Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {checkpoints.map((checkpoint) => (
          <Card
            key={checkpoint.id}
            className={
              checkpoint.status === "failed"
                ? "border-red-200"
                : checkpoint.status === "warning"
                  ? "border-yellow-200"
                  : checkpoint.status === "passed"
                    ? "border-green-200"
                    : ""
            }
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  {getCategoryIcon(checkpoint.category)}
                  <span>{checkpoint.name}</span>
                </span>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className={getPriorityColor(checkpoint.priority)}>
                    {checkpoint.priority.toUpperCase()}
                  </Badge>
                  <Badge variant="outline" className={getStatusColor(checkpoint.status)}>
                    {getStatusIcon(checkpoint.status)}
                    <span className="ml-1 capitalize">{checkpoint.status}</span>
                  </Badge>
                </div>
              </CardTitle>
              <CardDescription>{checkpoint.description}</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Validation Rules */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Validation Rules</h4>
                <ul className="text-sm space-y-1">
                  {checkpoint.validationRules.map((rule, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Dependencies */}
              {checkpoint.dependencies && checkpoint.dependencies.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Dependencies</h4>
                  <div className="flex flex-wrap gap-2">
                    {checkpoint.dependencies.map((depId) => {
                      const dep = checkpoints.find((c) => c.id === depId)
                      return (
                        <Badge key={depId} variant="outline" className="text-xs">
                          {dep?.name || depId}
                        </Badge>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Results */}
              {checkpoint.result && (
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded border">
                    <p className="text-sm font-medium text-gray-700">Result</p>
                    <p className="text-sm text-gray-600">{checkpoint.result.message}</p>
                  </div>

                  {checkpoint.result.details && (
                    <div className="p-3 bg-gray-50 rounded border">
                      <p className="text-sm font-medium text-gray-700 mb-2">Details</p>
                      <pre className="text-xs text-gray-600 overflow-x-auto">
                        {JSON.stringify(checkpoint.result.details, null, 2)}
                      </pre>
                    </div>
                  )}

                  {checkpoint.result.recommendations && checkpoint.result.recommendations.length > 0 && (
                    <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                      <p className="text-sm font-medium text-yellow-800 mb-2">Recommendations</p>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        {checkpoint.result.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="w-1 h-1 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Individual Validation Button */}
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => validateCheckpoint(checkpoint.id)}
                  disabled={isValidating || checkpoint.status === "checking"}
                  className="w-full"
                >
                  <RefreshCw className={`w-3 h-3 mr-2 ${checkpoint.status === "checking" ? "animate-spin" : ""}`} />
                  {checkpoint.status === "checking" ? "Validating..." : "Validate"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

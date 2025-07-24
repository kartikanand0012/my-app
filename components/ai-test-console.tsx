"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Bot,
  Play,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
  Activity,
  MessageSquare,
  Video,
  BarChart,
  Settings,
  Zap
} from "lucide-react"
import { apiClient } from "@/lib/api-client"

interface TestResult {
  success: boolean
  message: string
  data?: any
  test_status: 'PASSED' | 'FAILED' | 'SYSTEM_ERROR'
  agent_type?: string
  model?: string
  error?: string
}

interface TestConfig {
  query?: string
  uuid?: string
  error_type?: string
  agent_id?: string
  batch_id?: string
  total_items?: number
  report_type?: string
}

export function AITestConsole() {
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({})
  const [isRunningTest, setIsRunningTest] = useState<string | null>(null)
  const [isRunningAll, setIsRunningAll] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Test configurations
  const [testConfigs, setTestConfigs] = useState<TestConfig>({
    query: "Analyze the current QC performance metrics and provide insights",
    uuid: "test-uuid-123",
    error_type: "language",
    agent_id: "TEST_AG001",
    batch_id: "test-batch-123",
    total_items: 10,
    report_type: "daily"
  })

  const runTest = async (testName: string, endpoint: string, payload?: any) => {
    setIsRunningTest(testName)
    setError(null)
    
    try {
      const response = await apiClient.post(`/test-ai/${endpoint}`, payload)
      
      setTestResults(prev => ({
        ...prev,
        [testName]: response.data
      }))
    } catch (err: any) {
      const errorResult: TestResult = {
        success: false,
        message: `Test failed: ${err.message}`,
        test_status: 'SYSTEM_ERROR',
        error: err.response?.data?.error || err.message
      }
      
      setTestResults(prev => ({
        ...prev,
        [testName]: errorResult
      }))
    } finally {
      setIsRunningTest(null)
    }
  }

  const runAllTests = async () => {
    setIsRunningAll(true)
    setError(null)
    
    try {
      const response = await apiClient.post('/test-ai/test-all')
      
      // Parse comprehensive test results
      const allResults: Record<string, TestResult> = {}
      
      if (response.data.success && response.data.data.test_results) {
        response.data.data.test_results.forEach((result: any) => {
          allResults[result.agent] = {
            success: result.status === 'PASSED',
            message: result.status === 'PASSED' 
              ? `${result.agent} is working correctly` 
              : `${result.agent} test failed`,
            test_status: result.status,
            agent_type: result.agent,
            model: result.model,
            error: result.error,
            data: result
          }
        })
      }
      
      // Add overall system status
      allResults.system_overview = {
        success: response.data.success,
        message: response.data.message,
        test_status: response.data.data.overall_status === 'ALL_PASSED' ? 'PASSED' : 'FAILED',
        data: response.data.data
      }
      
      setTestResults(allResults)
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to run comprehensive test')
    } finally {
      setIsRunningAll(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PASSED':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'SYSTEM_ERROR':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PASSED': return 'default'
      case 'FAILED': return 'destructive' 
      case 'SYSTEM_ERROR': return 'secondary'
      default: return 'outline'
    }
  }

  const testDefinitions = [
    {
      id: 'main_agent',
      name: 'Main AI Agent',
      description: 'Tests Claude 3.5 Sonnet main agent functionality',
      icon: <Bot className="h-5 w-5" />,
      endpoint: 'test-main-agent',
      payload: () => ({ query: testConfigs.query })
    },
    {
      id: 'video_subagent',
      name: 'Video Analysis Sub-Agent',
      description: 'Tests video analysis capabilities with Claude Haiku',
      icon: <Video className="h-5 w-5" />,
      endpoint: 'test-video-subagent',
      payload: () => ({
        uuid: testConfigs.uuid,
        error_type: testConfigs.error_type,
        agent_id: testConfigs.agent_id
      })
    },
    {
      id: 'progress_subagent',
      name: 'Progress Tracking Sub-Agent',
      description: 'Tests batch progress tracking functionality',
      icon: <BarChart className="h-5 w-5" />,
      endpoint: 'test-progress-subagent',
      payload: () => ({
        batch_id: testConfigs.batch_id,
        total_items: testConfigs.total_items
      })
    },
    {
      id: 'report_subagent',
      name: 'Report Generation Sub-Agent',
      description: 'Tests automated report generation',
      icon: <MessageSquare className="h-5 w-5" />,
      endpoint: 'test-report-subagent',
      payload: () => ({
        report_type: testConfigs.report_type
      })
    },
    {
      id: 'teams_integration',
      name: 'Teams Integration',
      description: 'Tests Microsoft Teams webhook integration',
      icon: <MessageSquare className="h-5 w-5" />,
      endpoint: 'test-teams',
      payload: () => ({})
    }
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-600" />
            AI Agent Test Console
          </CardTitle>
          <CardDescription>
            Verify that all Claude AI agents are working correctly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <Button 
              onClick={runAllTests} 
              disabled={isRunningAll}
              className="flex items-center gap-2"
            >
              {isRunningAll ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {isRunningAll ? 'Testing All...' : 'Test All Agents'}
            </Button>
            
            {testResults.system_overview && (
              <Badge variant={getStatusColor(testResults.system_overview.test_status) as any} className="flex items-center gap-1">
                {getStatusIcon(testResults.system_overview.test_status)}
                System Status: {testResults.system_overview.test_status}
              </Badge>
            )}
          </div>

          {error && (
            <Alert className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="tests" className="space-y-4">
            <TabsList>
              <TabsTrigger value="tests">Individual Tests</TabsTrigger>
              <TabsTrigger value="config">Test Configuration</TabsTrigger>
              <TabsTrigger value="results">Results Overview</TabsTrigger>
            </TabsList>

            <TabsContent value="tests" className="space-y-4">
              <div className="grid gap-4">
                {testDefinitions.map((test) => {
                  const result = testResults[test.id]
                  const isRunning = isRunningTest === test.id
                  
                  return (
                    <Card key={test.id} className="border">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="text-blue-600">{test.icon}</div>
                            <div>
                              <h4 className="font-medium">{test.name}</h4>
                              <p className="text-sm text-gray-600">{test.description}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {result && (
                              <Badge variant={getStatusColor(result.test_status) as any} className="flex items-center gap-1">
                                {getStatusIcon(result.test_status)}
                                {result.test_status}
                              </Badge>
                            )}
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => runTest(test.id, test.endpoint, test.payload())}
                              disabled={isRunning || isRunningAll}
                            >
                              {isRunning ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                              {isRunning ? 'Testing...' : 'Test'}
                            </Button>
                          </div>
                        </div>
                        
                        {result && (
                          <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                            <p className="font-medium">{result.message}</p>
                            {result.data && result.data.model && (
                              <p className="text-gray-600 mt-1">Model: {result.data.model}</p>
                            )}
                            {result.error && (
                              <p className="text-red-600 mt-1">Error: {result.error}</p>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>

            <TabsContent value="config" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Test Parameters
                  </CardTitle>
                  <CardDescription>
                    Configure test parameters for each agent
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="test-query">Main Agent Query</Label>
                      <Textarea
                        id="test-query"
                        value={testConfigs.query}
                        onChange={(e) => setTestConfigs(prev => ({...prev, query: e.target.value}))}
                        rows={3}
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="agent-id">Agent ID</Label>
                        <Input
                          id="agent-id"
                          value={testConfigs.agent_id}
                          onChange={(e) => setTestConfigs(prev => ({...prev, agent_id: e.target.value}))}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="error-type">Error Type</Label>
                        <select
                          id="error-type"
                          value={testConfigs.error_type}
                          onChange={(e) => setTestConfigs(prev => ({...prev, error_type: e.target.value}))}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          <option value="language">Language</option>
                          <option value="body_language">Body Language</option>
                          <option value="sop">SOP Compliance</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="batch-id">Batch ID</Label>
                      <Input
                        id="batch-id"
                        value={testConfigs.batch_id}
                        onChange={(e) => setTestConfigs(prev => ({...prev, batch_id: e.target.value}))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="total-items">Total Items</Label>
                      <Input
                        id="total-items"
                        type="number"
                        value={testConfigs.total_items}
                        onChange={(e) => setTestConfigs(prev => ({...prev, total_items: parseInt(e.target.value)}))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="report-type">Report Type</Label>
                      <select
                        id="report-type"
                        value={testConfigs.report_type}
                        onChange={(e) => setTestConfigs(prev => ({...prev, report_type: e.target.value}))}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="results" className="space-y-4">
              {Object.keys(testResults).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(testResults).map(([testName, result]) => (
                    <Card key={testName}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={getStatusColor(result.test_status) as any} className="flex items-center gap-1">
                            {getStatusIcon(result.test_status)}
                            {result.test_status}
                          </Badge>
                          <h4 className="font-medium capitalize">{testName.replace('_', ' ')}</h4>
                        </div>
                        
                        <p className="text-sm mb-2">{result.message}</p>
                        
                        {result.data && (
                          <details className="text-sm">
                            <summary className="cursor-pointer text-blue-600 hover:underline">
                              View detailed results
                            </summary>
                            <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                              {JSON.stringify(result.data, null, 2)}
                            </pre>
                          </details>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Bot className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-600">No test results yet</p>
                    <p className="text-sm text-gray-500">Run individual tests or test all agents to see results</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
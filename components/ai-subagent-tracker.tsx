"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Bot,
  Play,
  Pause,
  RotateCcw,
  Activity,
  Eye,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Users,
  Zap
} from "lucide-react"
import { apiClient } from "@/lib/api-client"

interface SubAgent {
  id: string
  name: string
  type: 'video_analysis' | 'progress_tracking' | 'report_generation'
  status: 'idle' | 'active' | 'busy' | 'error'
  current_task?: string
  items_assigned: number
  items_completed: number
  success_rate: number
  avg_processing_time: number
  last_activity: string
  performance_score: number
}

interface BatchProgress {
  batch_id: string
  filename: string
  total_items: number
  completed_items: number
  flagged_items: number
  processing_rate: number
  estimated_completion: string
  subagents_assigned: SubAgent[]
}

export function AISubAgentTracker() {
  const [subAgents, setSubAgents] = useState<SubAgent[]>([])
  const [activeBatches, setActiveBatches] = useState<BatchProgress[]>([])
  const [systemStats, setSystemStats] = useState({
    total_agents: 0,
    active_agents: 0,
    items_processing: 0,
    avg_throughput: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadSubAgentData()
    const interval = setInterval(loadSubAgentData, 3000) // Update every 3 seconds
    return () => clearInterval(interval)
  }, [])

  const loadSubAgentData = async () => {
    try {
      const response = await apiClient.get('/quality-check/subagent-status')
      
      if (response.success) {
        setSubAgents(response.data.subagents)
        setActiveBatches(response.data.active_batches)
        setSystemStats(response.data.system_stats)
      }
    } catch (error) {
      console.error('Failed to load sub-agent data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const controlSubAgent = async (agentId: string, action: 'start' | 'pause' | 'restart') => {
    try {
      const response = await apiClient.post(`/quality-check/subagent/${agentId}/${action}`)
      
      if (response.success) {
        loadSubAgentData() // Refresh data
      }
    } catch (error) {
      console.error(`Failed to ${action} sub-agent:`, error)
    }
  }

  const getAgentTypeIcon = (type: string) => {
    switch (type) {
      case 'video_analysis':
        return <Eye className="h-4 w-4" />
      case 'progress_tracking':
        return <Activity className="h-4 w-4" />
      case 'report_generation':
        return <TrendingUp className="h-4 w-4" />
      default:
        return <Bot className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green'
      case 'busy': return 'blue'
      case 'idle': return 'gray'
      case 'error': return 'red'
      default: return 'gray'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'busy':
        return <Zap className="h-4 w-4 text-blue-500" />
      case 'idle':
        return <Clock className="h-4 w-4 text-gray-500" />
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Bot className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-6 h-6 text-blue-600 animate-pulse" />
              AI Sub-Agent Monitor
            </CardTitle>
            <CardDescription>Loading sub-agent status...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* System Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-6 h-6 text-blue-600" />
            AI Sub-Agent System Monitor
          </CardTitle>
          <CardDescription>
            Real-time monitoring of AI sub-agents processing QC tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{systemStats.total_agents}</p>
                <p className="text-sm text-gray-600">Total Agents</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Activity className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{systemStats.active_agents}</p>
                <p className="text-sm text-gray-600">Active Agents</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Zap className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{systemStats.items_processing}</p>
                <p className="text-sm text-gray-600">Items Processing</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <TrendingUp className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{systemStats.avg_throughput.toFixed(1)}</p>
                <p className="text-sm text-gray-600">Items/Min</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sub-Agent Status */}
      <Card>
        <CardHeader>
          <CardTitle>Sub-Agent Status</CardTitle>
          <CardDescription>Individual agent performance and current tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Current Task</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Controls</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subAgents.map((agent) => (
                <TableRow key={agent.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">{agent.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getAgentTypeIcon(agent.type)}
                      <span className="capitalize">{agent.type.replace('_', ' ')}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(agent.status) as any} className="flex items-center gap-1 w-fit">
                      {getStatusIcon(agent.status)}
                      <span className="capitalize">{agent.status}</span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">
                        {agent.current_task || 'Idle'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Last activity: {new Date(agent.last_activity).toLocaleTimeString()}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{agent.items_completed} / {agent.items_assigned}</span>
                        <span>{Math.round((agent.items_completed / Math.max(agent.items_assigned, 1)) * 100)}%</span>
                      </div>
                      <Progress 
                        value={(agent.items_completed / Math.max(agent.items_assigned, 1)) * 100} 
                        className="h-2"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {agent.success_rate.toFixed(1)}% success
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500">
                        {agent.avg_processing_time.toFixed(1)}s avg
                      </p>
                      <div className="flex items-center gap-1">
                        <div className="w-12 bg-gray-200 rounded-full h-1">
                          <div 
                            className="bg-blue-500 h-1 rounded-full" 
                            style={{ width: `${agent.performance_score}%` }}
                          />
                        </div>
                        <span className="text-xs">{agent.performance_score}%</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {agent.status === 'idle' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => controlSubAgent(agent.id, 'start')}
                        >
                          <Play className="h-3 w-3" />
                        </Button>
                      )}
                      {(agent.status === 'active' || agent.status === 'busy') && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => controlSubAgent(agent.id, 'pause')}
                        >
                          <Pause className="h-3 w-3" />
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => controlSubAgent(agent.id, 'restart')}
                      >
                        <RotateCcw className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {subAgents.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Bot className="mx-auto h-12 w-12 mb-4" />
              <p>No sub-agents currently active</p>
              <p className="text-sm">Upload a CSV batch to activate AI sub-agents</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Batch Processing */}
      <Card>
        <CardHeader>
          <CardTitle>Active Batch Processing</CardTitle>
          <CardDescription>Current CSV batches being processed by sub-agents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeBatches.map((batch) => (
              <div key={batch.batch_id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium">{batch.filename}</h4>
                    <p className="text-sm text-gray-500">
                      Batch ID: {batch.batch_id}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {batch.processing_rate.toFixed(1)} items/min
                    </p>
                    <p className="text-xs text-gray-500">
                      ETA: {batch.estimated_completion}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Progress</p>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{batch.completed_items} / {batch.total_items}</span>
                      <span>{Math.round((batch.completed_items / batch.total_items) * 100)}%</span>
                    </div>
                    <Progress value={(batch.completed_items / batch.total_items) * 100} className="h-2" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Flagged Items</p>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span className="text-lg font-bold">{batch.flagged_items}</span>
                      <span className="text-sm text-gray-500">
                        ({((batch.flagged_items / Math.max(batch.completed_items, 1)) * 100).toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Assigned Agents</p>
                    <div className="flex items-center gap-1">
                      {batch.subagents_assigned.map((agent, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          <Bot className="h-3 w-3 mr-1" />
                          {agent.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {activeBatches.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Activity className="mx-auto h-12 w-12 mb-4" />
                <p>No active batch processing</p>
                <p className="text-sm">Upload CSV files to see batch progress here</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
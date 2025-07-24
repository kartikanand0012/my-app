"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  Clock,
  Bot,
  Eye,
  Loader2,
  Download,
  RefreshCw
} from "lucide-react"
import { apiClient } from "@/lib/api-client"

interface CSVRow {
  uuid: string
  error_type: string
  agent_id: string
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'processing' | 'completed' | 'failed'
  ai_confidence?: number
  issues_found?: string[]
  video_url?: string
}

interface QCBatch {
  id: string
  filename: string
  total_rows: number
  processed: number
  status: 'uploading' | 'processing' | 'completed' | 'failed'
  created_at: string
  rows: CSVRow[]
}

export function QCCSVUpload() {
  const [batches, setBatches] = useState<QCBatch[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file')
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('csv', file)

      const response = await apiClient.uploadFile('/quality-check/upload-csv', file, {
        type: 'qc_batch'
      })

      if (response.success) {
        const newBatch: QCBatch = {
          id: response.data.batch_id,
          filename: file.name,
          total_rows: response.data.total_rows,
          processed: 0,
          status: 'processing',
          created_at: new Date().toISOString(),
          rows: response.data.rows
        }

        setBatches(prev => [newBatch, ...prev])
        
        // Start polling for batch status
        pollBatchStatus(newBatch.id)
      } else {
        setError(response.message || 'Upload failed')
      }
    } catch (err) {
      setError('Failed to upload CSV file')
    } finally {
      setIsUploading(false)
    }
  }

  const pollBatchStatus = async (batchId: string) => {
    try {
      const response = await apiClient.get(`/quality-check/batch-status/${batchId}`)
      
      if (response.success) {
        setBatches(prev => prev.map(batch => 
          batch.id === batchId 
            ? { ...batch, ...response.data.batch }
            : batch
        ))

        // Continue polling if still processing
        if (response.data.batch.status === 'processing') {
          setTimeout(() => pollBatchStatus(batchId), 2000)
        }
      }
    } catch (err) {
      console.error('Failed to poll batch status:', err)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }

  const downloadSampleCSV = () => {
    const sampleData = [
      ['uuid', 'error_type', 'agent_id', 'priority'],
      ['uuid-123-456-789', 'language', 'AG001', 'high'],
      ['uuid-987-654-321', 'body_language', 'AG002', 'medium'],
      ['uuid-555-666-777', 'sop', 'AG003', 'low']
    ]
    
    const csvContent = sampleData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'qc_sample.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const retryBatch = async (batchId: string) => {
    try {
      const response = await apiClient.post(`/quality-check/retry-batch/${batchId}`)
      
      if (response.success) {
        setBatches(prev => prev.map(batch => 
          batch.id === batchId 
            ? { ...batch, status: 'processing' }
            : batch
        ))
        pollBatchStatus(batchId)
      }
    } catch (err) {
      setError('Failed to retry batch')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'yellow'
      case 'processing': return 'blue'
      case 'completed': return 'green'
      case 'failed': return 'red'
      default: return 'gray'
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-6 h-6 text-blue-600" />
            AI Quality Check - CSV Upload
          </CardTitle>
          <CardDescription>
            Upload CSV files with UUIDs and error types for AI sub-agents to process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* File Drop Zone */}
            <div
              className={`border-2 border-dashed p-8 rounded-lg text-center transition-colors ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <Upload className={`mx-auto h-12 w-12 mb-4 ${dragActive ? 'text-blue-500' : 'text-gray-400'}`} />
              <p className="text-lg font-medium mb-2">
                Drop CSV file here or click to browse
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Supports CSV files with columns: uuid, error_type, agent_id, priority
              </p>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="mr-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Select CSV File
                  </>
                )}
              </Button>
              <Button variant="ghost" onClick={downloadSampleCSV}>
                <Download className="mr-2 h-4 w-4" />
                Download Sample
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              className="hidden"
            />

            {error && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Batch Processing Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Processing Batches ({batches.length})
          </CardTitle>
          <CardDescription>
            Monitor AI sub-agent progress on uploaded CSV batches
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {batches.map((batch) => (
              <div key={batch.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">{batch.filename}</p>
                      <p className="text-sm text-gray-500">
                        {batch.total_rows} rows • Created {new Date(batch.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusColor(batch.status) as any}>
                      {getStatusIcon(batch.status)}
                      <span className="ml-1 capitalize">{batch.status}</span>
                    </Badge>
                    {batch.status === 'failed' && (
                      <Button size="sm" variant="outline" onClick={() => retryBatch(batch.id)}>
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Retry
                      </Button>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress: {batch.processed} / {batch.total_rows}</span>
                    <span>{Math.round((batch.processed / batch.total_rows) * 100)}%</span>
                  </div>
                  <Progress 
                    value={(batch.processed / batch.total_rows) * 100} 
                    className="h-2"
                  />
                </div>

                {/* Batch Details Table */}
                {batch.rows.length > 0 && (
                  <div className="border rounded overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>UUID</TableHead>
                          <TableHead>Error Type</TableHead>
                          <TableHead>Agent</TableHead>
                          <TableHead>Priority</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>AI Confidence</TableHead>
                          <TableHead>Issues Found</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {batch.rows.slice(0, 5).map((row, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-mono text-xs">{row.uuid}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {row.error_type}
                              </Badge>
                            </TableCell>
                            <TableCell>{row.agent_id}</TableCell>
                            <TableCell>
                              <Badge 
                                variant={row.priority === 'high' ? 'destructive' : row.priority === 'medium' ? 'secondary' : 'outline'}
                                className="capitalize"
                              >
                                {row.priority}
                              </Badge>
                            </TableCell>
                            <TableCell>{getStatusIcon(row.status)}</TableCell>
                            <TableCell>
                              {row.ai_confidence && (
                                <span className="text-sm">
                                  {Math.round(row.ai_confidence * 100)}%
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              {row.issues_found && row.issues_found.length > 0 && (
                                <Badge variant="destructive" className="text-xs">
                                  {row.issues_found.length} issues
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                        {batch.rows.length > 5 && (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center text-gray-500">
                              ... and {batch.rows.length - 5} more rows
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            ))}

            {batches.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <FileSpreadsheet className="mx-auto h-12 w-12 mb-4" />
                <p>No CSV batches uploaded yet</p>
                <p className="text-sm">Upload a CSV file to get started with AI analysis</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Upload,
  Video,
  Bot,
  CheckCircle,
  AlertTriangle,
  Clock,
  Eye,
  Loader2,
  FileVideo,
  Play,
  UserX,
  MessageCircleWarning,
  BookOpenCheck,
} from "lucide-react"
import { apiClient } from "@/lib/api-client"

interface VideoAnalysisResult {
  uuid: string
  agent_id: string
  error_type: string
  confidence: number
  flag_status: 'approved' | 'flagged' | 'needs_review'
  issues: Array<{
    type: string
    description: string
    severity: 'low' | 'medium' | 'high'
    timestamp: string
  }>
  technical_scores: {
    language_score: number
    body_language_score: number
    sop_compliance_score: number
    technical_quality_score: number
  }
  recommendations: string[]
  analysis_timestamp: string
}

interface UploadedVideo {
  id: string
  filename: string
  agent_id: string
  error_type: string
  status: 'uploading' | 'analyzing' | 'completed' | 'failed'
  progress: number
  analysis_result?: VideoAnalysisResult
  video_url?: string
  created_at: string
}

export function VideoUploadAnalyzer() {
  const [uploadedVideos, setUploadedVideos] = useState<UploadedVideo[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<UploadedVideo | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [agentId, setAgentId] = useState("")
  const [errorType, setErrorType] = useState<string>("language")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('video/')) {
      setError('Please upload a video file (MP4, AVI, MOV, etc.)')
      return
    }

    if (!agentId.trim()) {
      setError('Please enter an Agent ID')
      return
    }

    if (file.size > 100 * 1024 * 1024) { // 100MB limit
      setError('File size must be less than 100MB')
      return
    }

    setIsUploading(true)
    setError(null)

    const videoId = `video-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newVideo: UploadedVideo = {
      id: videoId,
      filename: file.name,
      agent_id: agentId,
      error_type: errorType,
      status: 'uploading',
      progress: 0,
      created_at: new Date().toISOString()
    }

    setUploadedVideos(prev => [newVideo, ...prev])

    try {
      // Upload video file
      const response = await apiClient.uploadFile('/quality-check/upload-video', file, {
        agent_id: agentId,
        error_type: errorType,
        video_id: videoId
      })

      if (response.success) {
        // Update status to analyzing
        setUploadedVideos(prev => prev.map(video => 
          video.id === videoId 
            ? { ...video, status: 'analyzing', progress: 50, video_url: response.data.video_url }
            : video
        ))

        // Start AI analysis
        await analyzeVideo(videoId, response.data.video_id)
      } else {
        throw new Error(response.message || 'Upload failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      setUploadedVideos(prev => prev.map(video => 
        video.id === videoId 
          ? { ...video, status: 'failed', progress: 0 }
          : video
      ))
    } finally {
      setIsUploading(false)
    }
  }

  const analyzeVideo = async (videoId: string, uploadedVideoId: string) => {
    try {
      const response = await apiClient.post(`/quality-check/analyze-video/${uploadedVideoId}`)

      if (response.success) {
        setUploadedVideos(prev => prev.map(video => 
          video.id === videoId 
            ? { 
                ...video, 
                status: 'completed', 
                progress: 100,
                analysis_result: response.data.analysis
              }
            : video
        ))
      } else {
        throw new Error(response.message || 'Analysis failed')
      }
    } catch (err) {
      console.error('Analysis error:', err)
      setUploadedVideos(prev => prev.map(video => 
        video.id === videoId 
          ? { ...video, status: 'failed' }
          : video
      ))
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploading':
        return <Upload className="h-4 w-4 text-blue-500 animate-pulse" />
      case 'analyzing':
        return <Bot className="h-4 w-4 text-purple-500 animate-pulse" />
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
      case 'uploading': return 'blue'
      case 'analyzing': return 'purple'
      case 'completed': return 'green'
      case 'failed': return 'red'
      default: return 'gray'
    }
  }

  const getFlagIcon = (type: string) => {
    switch (type) {
      case 'body_language':
        return <UserX className="h-4 w-4 text-orange-500" />
      case 'language':
        return <MessageCircleWarning className="h-4 w-4 text-red-500" />
      case 'sop':
        return <BookOpenCheck className="h-4 w-4 text-blue-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive'
      case 'medium': return 'secondary' 
      case 'low': return 'outline'
      default: return 'outline'
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileVideo className="w-6 h-6 text-blue-600" />
            Video Quality Analysis
          </CardTitle>
          <CardDescription>
            Upload VKYC call videos for AI sub-agent analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="agent-id">Agent ID</Label>
                <Input
                  id="agent-id"
                  placeholder="e.g., AG001"
                  value={agentId}
                  onChange={(e) => setAgentId(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="error-type">Expected Error Type</Label>
                <select
                  id="error-type"
                  value={errorType}
                  onChange={(e) => setErrorType(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="language">Language Issues</option>
                  <option value="body_language">Body Language</option>
                  <option value="sop">SOP Compliance</option>
                  <option value="technical">Technical Quality</option>
                </select>
              </div>
            </div>
          </div>

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
              Drop video file here or click to browse
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Supports MP4, AVI, MOV, MKV, WebM (max 100MB)
            </p>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || !agentId.trim()}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <FileVideo className="mr-2 h-4 w-4" />
                  Select Video File
                </>
              )}
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            className="hidden"
          />

          {error && (
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Video Analysis Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            AI Analysis Results ({uploadedVideos.length})
          </CardTitle>
          <CardDescription>
            Real-time sub-agent analysis of uploaded videos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {uploadedVideos.map((video) => (
              <div key={video.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <FileVideo className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">{video.filename}</p>
                      <p className="text-sm text-gray-500">
                        Agent: {video.agent_id} • Type: {video.error_type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusColor(video.status) as any} className="flex items-center gap-1">
                      {getStatusIcon(video.status)}
                      <span className="capitalize">{video.status}</span>
                    </Badge>
                    {video.status === 'completed' && (
                      <Button size="sm" variant="outline" onClick={() => setSelectedVideo(video)}>
                        <Eye className="h-4 w-4 mr-1" />
                        View Results
                      </Button>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                {(video.status === 'uploading' || video.status === 'analyzing') && (
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>
                        {video.status === 'uploading' ? 'Uploading...' : 'AI Sub-agent Analyzing...'}
                      </span>
                      <span>{video.progress}%</span>
                    </div>
                    <Progress value={video.progress} className="h-2" />
                  </div>
                )}

                {/* Quick Results Summary */}
                {video.analysis_result && (
                  <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                      <p className="font-medium">AI Confidence</p>
                      <Badge variant="outline">
                        {Math.round(video.analysis_result.confidence * 100)}%
                      </Badge>
                    </div>
                    <div className="text-center">
                      <p className="font-medium">Flag Status</p>
                      <Badge variant={
                        video.analysis_result.flag_status === 'approved' ? 'default' : 
                        video.analysis_result.flag_status === 'flagged' ? 'destructive' : 'secondary'
                      }>
                        {video.analysis_result.flag_status}
                      </Badge>
                    </div>
                    <div className="text-center">
                      <p className="font-medium">Issues Found</p>
                      <Badge variant="outline">
                        {video.analysis_result.issues.length}
                      </Badge>
                    </div>
                    <div className="text-center">
                      <p className="font-medium">Overall Score</p>
                      <Badge variant="outline">
                        {Math.round(
                          (video.analysis_result.technical_scores.language_score + 
                           video.analysis_result.technical_scores.body_language_score + 
                           video.analysis_result.technical_scores.sop_compliance_score + 
                           video.analysis_result.technical_scores.technical_quality_score) / 4
                        )}%
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {uploadedVideos.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <FileVideo className="mx-auto h-12 w-12 mb-4" />
                <p>No videos uploaded yet</p>
                <p className="text-sm">Upload a VKYC call video to see AI analysis</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis Dialog */}
      {selectedVideo && selectedVideo.analysis_result && (
        <Dialog open onOpenChange={() => setSelectedVideo(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">
                AI Analysis Results: {selectedVideo.filename}
              </DialogTitle>
              <DialogDescription>
                Agent: {selectedVideo.analysis_result.agent_id} • 
                Analyzed: {new Date(selectedVideo.analysis_result.analysis_timestamp).toLocaleString()}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-6 py-4">
              {/* Overall Scores */}
              <div>
                <h4 className="font-semibold mb-3">Quality Scores</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 border rounded">
                    <p className="text-sm text-gray-600">Language</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {selectedVideo.analysis_result.technical_scores.language_score}%
                    </p>
                  </div>
                  <div className="text-center p-3 border rounded">
                    <p className="text-sm text-gray-600">Body Language</p>
                    <p className="text-2xl font-bold text-green-600">
                      {selectedVideo.analysis_result.technical_scores.body_language_score}%
                    </p>
                  </div>
                  <div className="text-center p-3 border rounded">
                    <p className="text-sm text-gray-600">SOP Compliance</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {selectedVideo.analysis_result.technical_scores.sop_compliance_score}%
                    </p>
                  </div>
                  <div className="text-center p-3 border rounded">
                    <p className="text-sm text-gray-600">Technical Quality</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {selectedVideo.analysis_result.technical_scores.technical_quality_score}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Issues Found */}
              {selectedVideo.analysis_result.issues.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Issues Detected</h4>
                  <div className="space-y-3">
                    {selectedVideo.analysis_result.issues.map((issue, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 border rounded-md">
                        <div className="mt-1">{getFlagIcon(issue.type)}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium capitalize">{issue.type.replace('_', ' ')}</p>
                            <Badge variant={getSeverityColor(issue.severity) as any} className="text-xs">
                              {issue.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{issue.description}</p>
                          <p className="text-xs text-blue-500 font-mono mt-1">
                            Timestamp: {issue.timestamp}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {selectedVideo.analysis_result.recommendations.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">AI Recommendations</h4>
                  <div className="space-y-2">
                    {selectedVideo.analysis_result.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                        <p className="text-sm">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Flag Status */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Final Decision</p>
                  <p className="text-sm text-gray-600">
                    AI Confidence: {Math.round(selectedVideo.analysis_result.confidence * 100)}%
                  </p>
                </div>
                <Badge 
                  variant={
                    selectedVideo.analysis_result.flag_status === 'approved' ? 'default' : 
                    selectedVideo.analysis_result.flag_status === 'flagged' ? 'destructive' : 'secondary'
                  }
                  className="text-lg px-4 py-2"
                >
                  {selectedVideo.analysis_result.flag_status.toUpperCase()}
                </Badge>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
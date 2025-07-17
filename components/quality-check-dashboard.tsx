"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ShieldCheck,
  Video,
  MessageCircleWarning,
  BookOpenCheck,
  UserX,
  AlertTriangle,
  Filter,
  CheckCircle,
  Clock,
  Users,
  Calculator,
} from "lucide-react"

interface FlaggedCall {
  callId: string
  agentId: string
  agentName: string
  callDate: string
  videoUrl: string
  flags: Array<{
    type: "body_language" | "language" | "sop"
    description: string
    timestamp: string
  }>
  status: "pending_review" | "reviewed_ok" | "action_required"
}

interface AgentCallData {
  agentId: string
  agentName: string
  totalCalls: number
}

const initialFlaggedCalls: FlaggedCall[] = [
  {
    callId: "VKYC_QC_001",
    agentId: "AGT_005",
    agentName: "Arjun Patel",
    callDate: "2023-10-25",
    videoUrl: "/placeholder.mp4",
    flags: [
      { type: "sop", description: "Did not state the full closing script.", timestamp: "04:15" },
      { type: "body_language", description: "Not wearing ID card.", timestamp: "00:10" },
    ],
    status: "pending_review",
  },
  {
    callId: "VKYC_QC_002",
    agentId: "AGT_012",
    agentName: "Diya Verma",
    callDate: "2023-10-25",
    videoUrl: "/placeholder.mp4",
    flags: [{ type: "language", description: "Used unprofessional term 'yaar'.", timestamp: "02:30" }],
    status: "pending_review",
  },
  {
    callId: "VKYC_QC_003",
    agentId: "AGT_008",
    agentName: "Krishna Iyer",
    callDate: "2023-10-24",
    videoUrl: "/placeholder.mp4",
    flags: [{ type: "body_language", description: "Agent was slouched during the call.", timestamp: "01:05" }],
    status: "action_required",
  },
  {
    callId: "VKYC_QC_004",
    agentId: "AGT_021",
    agentName: "Rohan Das",
    callDate: "2023-10-23",
    videoUrl: "/placeholder.mp4",
    flags: [{ type: "sop", description: "Incorrectly verified a document.", timestamp: "03:40" }],
    status: "reviewed_ok",
  },
  {
    callId: "VKYC_QC_005",
    agentId: "AGT_005",
    agentName: "Arjun Patel",
    callDate: "2023-10-22",
    videoUrl: "/placeholder.mp4",
    flags: [{ type: "language", description: "Interrupted the customer multiple times.", timestamp: "01:55" }],
    status: "reviewed_ok",
  },
]

const FLAG_TYPES = ["body_language", "language", "sop"] as const

const agentNames = [
  "Aarav Sharma",
  "Vivaan Singh",
  "Aditya Kumar",
  "Vihaan Gupta",
  "Arjun Patel",
  "Sai Reddy",
  "Reyansh Joshi",
  "Krishna Iyer",
  "Ishaan Nair",
  "Advik Menon",
  "Ananya Rao",
  "Diya Verma",
  "Saanvi Agarwal",
  "Aadhya Mishra",
  "Myra Shah",
  "Aarohi Desai",
  "Kiara Pillai",
  "Sitara Bhatt",
  "Navya Chauhan",
  "Pari Mehra",
  "Rohan Das",
  "Vikram Jain",
  "Kabir Mehta",
  "Zayn Ali",
  "Aryan Kumar",
  "Sanya Reddy",
  "Tara Singh",
  "Ira Gupta",
  "Riya Patel",
  "Aisha Sharma",
]

export function QualityCheckDashboard() {
  const [flaggedCalls, setFlaggedCalls] = useState<FlaggedCall[]>(initialFlaggedCalls)
  const [selectedCall, setSelectedCall] = useState<FlaggedCall | null>(null)
  const [samplingPercentage, setSamplingPercentage] = useState(5)
  const [activeQueueTab, setActiveQueueTab] = useState("pending")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFlags, setSelectedFlags] = useState<string[]>([])

  const agentCallData: AgentCallData[] = useMemo(() => {
    return agentNames.map((name, index) => ({
      agentId: `AGT_${String(index + 1).padStart(3, "0")}`,
      agentName: name,
      totalCalls: Math.floor(Math.random() * 51) + 200, // Random number between 200 and 250
    }))
  }, [])

  const totalCallsFromAgents = useMemo(
    () => agentCallData.reduce((sum, agent) => sum + agent.totalCalls, 0),
    [agentCallData],
  )

  const totalCallsToScan = useMemo(() => {
    return agentCallData.reduce((sum, agent) => {
      return sum + Math.round((agent.totalCalls * samplingPercentage) / 100)
    }, 0)
  }, [agentCallData, samplingPercentage])

  const stats = useMemo(() => {
    const totalFlagged = initialFlaggedCalls.length
    const pendingReview = initialFlaggedCalls.filter(
      (c) => c.status === "pending_review" || c.status === "action_required",
    ).length
    const reviewed = totalFlagged - pendingReview
    return { totalFlagged, pendingReview, reviewed }
  }, [])

  const filteredCalls = useMemo(() => {
    return flaggedCalls
      .filter((call) => {
        if (searchTerm === "") return true
        const searchLower = searchTerm.toLowerCase()
        return (
          call.callId.toLowerCase().includes(searchLower) ||
          call.agentId.toLowerCase().includes(searchLower) ||
          call.agentName.toLowerCase().includes(searchLower)
        )
      })
      .filter((call) => {
        if (selectedFlags.length === 0) return true
        return call.flags.some((flag) => selectedFlags.includes(flag.type))
      })
  }, [flaggedCalls, searchTerm, selectedFlags])

  const pendingCalls = filteredCalls.filter((c) => c.status === "pending_review" || c.status === "action_required")
  const reviewedCalls = filteredCalls.filter((c) => c.status === "reviewed_ok")

  const getFlagIcon = (type: "body_language" | "language" | "sop") => {
    if (type === "body_language") return <UserX className="w-4 h-4 text-orange-500" />
    if (type === "language") return <MessageCircleWarning className="w-4 h-4 text-red-500" />
    if (type === "sop") return <BookOpenCheck className="w-4 h-4 text-blue-500" />
    return null
  }

  const handleUpdateStatus = (callId: string, status: FlaggedCall["status"]) => {
    setFlaggedCalls((prev) => prev.map((call) => (call.callId === callId ? { ...call, status } : call)))
    setSelectedCall(null)
  }

  return (
    <>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-indigo-600" />
              AI Quality Check Dashboard
            </CardTitle>
            <CardDescription>
              AI-powered post-approval analysis of VKYC calls for quality assurance and compliance.
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Dialog>
            <DialogTrigger asChild>
              <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Available Calls</CardTitle>
                  <Video className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalCallsFromAgents.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Click to configure scan batch</p>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>AI Scan Batch Configuration</DialogTitle>
                <DialogDescription>
                  Adjust the percentage of calls to be randomly selected from each agent for the next quality check
                  batch.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Agents</p>
                    <p className="text-2xl font-bold flex items-center justify-center gap-2">
                      <Users className="w-6 h-6" /> {agentCallData.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Calls</p>
                    <p className="text-2xl font-bold flex items-center justify-center gap-2">
                      <Video className="w-6 h-6" /> {totalCallsFromAgents.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Calls to Scan</p>
                    <p className="text-2xl font-bold flex items-center justify-center gap-2">
                      <Calculator className="w-6 h-6" /> {totalCallsToScan.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="sampling" className="font-medium">
                    Sampling Percentage: {samplingPercentage}%
                  </label>
                  <Slider
                    id="sampling"
                    min={1}
                    max={100}
                    step={1}
                    value={[samplingPercentage]}
                    onValueChange={(value) => setSamplingPercentage(value[0])}
                  />
                </div>
                <div className="relative h-72 overflow-y-auto border rounded-md">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background">
                      <TableRow>
                        <TableHead>Agent Name</TableHead>
                        <TableHead>Total Calls</TableHead>
                        <TableHead>Calls to Scan</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {agentCallData.map((agent) => (
                        <TableRow key={agent.agentId}>
                          <TableCell>{agent.agentName}</TableCell>
                          <TableCell>{agent.totalCalls}</TableCell>
                          <TableCell className="font-bold">
                            {Math.round((agent.totalCalls * samplingPercentage) / 100)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Flagged Calls</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalFlagged}</div>
              <p className="text-xs text-muted-foreground">All-time flagged calls</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingReview}</div>
              <p className="text-xs text-muted-foreground">Awaiting manual verification</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reviewed Calls</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.reviewed}</div>
              <p className="text-xs text-muted-foreground">QC process completed</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Flagged Call Queue</CardTitle>
            <CardDescription>Calls identified by the AI that require or have undergone manual review.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <Input
                placeholder="Search by Call ID, Agent Name/ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="ml-auto bg-transparent">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter by Flag ({selectedFlags.length})
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Flag Type</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {FLAG_TYPES.map((flag) => (
                    <DropdownMenuCheckboxItem
                      key={flag}
                      checked={selectedFlags.includes(flag)}
                      onCheckedChange={(checked) => {
                        setSelectedFlags((prev) => (checked ? [...prev, flag] : prev.filter((f) => f !== flag)))
                      }}
                      className="capitalize"
                    >
                      {flag.replace("_", " ")}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <Tabs value={activeQueueTab} onValueChange={setActiveQueueTab}>
              <TabsList>
                <TabsTrigger value="pending">Pending ({pendingCalls.length})</TabsTrigger>
                <TabsTrigger value="reviewed">Reviewed ({reviewedCalls.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="pending">
                <CallQueueTable calls={pendingCalls} onReview={setSelectedCall} />
              </TabsContent>
              <TabsContent value="reviewed">
                <CallQueueTable calls={reviewedCalls} onReview={setSelectedCall} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {selectedCall && (
        <Dialog open onOpenChange={() => setSelectedCall(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl">Review Call: {selectedCall.callId}</DialogTitle>
              <DialogDescription>
                Agent: {selectedCall.agentName} | Date: {selectedCall.callDate}
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              <div className="bg-black rounded-lg aspect-video flex items-center justify-center">
                <p className="text-white">Video Player Placeholder</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">AI Detected Flags</h4>
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                  {selectedCall.flags.map((flag, index) => (
                    <div key={index} className="flex items-start gap-3 p-2 border rounded-md">
                      <div className="mt-1">{getFlagIcon(flag.type)}</div>
                      <div>
                        <p className="font-medium capitalize">{flag.type.replace("_", " ")}</p>
                        <p className="text-sm text-muted-foreground">{flag.description}</p>
                        <p className="text-xs text-blue-500 font-mono">Timestamp: {flag.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter className="sm:justify-between">
              <div className="text-sm text-muted-foreground">Review and update call status.</div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleUpdateStatus(selectedCall.callId, "reviewed_ok")}>
                  Mark as OK
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleUpdateStatus(selectedCall.callId, "action_required")}
                >
                  Escalate / Action Required
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

function CallQueueTable({
  calls,
  onReview,
}: {
  calls: FlaggedCall[]
  onReview: (call: FlaggedCall) => void
}) {
  const getFlagIcon = (type: "body_language" | "language" | "sop") => {
    if (type === "body_language") return <UserX className="w-4 h-4 text-orange-500" />
    if (type === "language") return <MessageCircleWarning className="w-4 h-4 text-red-500" />
    if (type === "sop") return <BookOpenCheck className="w-4 h-4 text-blue-500" />
    return null
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Call ID</TableHead>
          <TableHead>Agent</TableHead>
          <TableHead>Flags Detected</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {calls.length > 0 ? (
          calls.map((call) => (
            <TableRow key={call.callId}>
              <TableCell className="font-mono text-xs">{call.callId}</TableCell>
              <TableCell className="font-medium">{call.agentName}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-2">
                  {call.flags.map((flag, index) => (
                    <Badge key={index} variant="outline" className="capitalize">
                      {getFlagIcon(flag.type)}
                      <span className="ml-1">{flag.type.replace("_", " ")}</span>
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    call.status === "pending_review"
                      ? "warning"
                      : call.status === "action_required"
                        ? "destructive"
                        : "success"
                  }
                  className="capitalize"
                >
                  {call.status.replace("_", " ")}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="outline" size="sm" onClick={() => onReview(call)}>
                  <Video className="w-4 h-4 mr-2" />
                  Review Call
                </Button>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={5} className="text-center h-24">
              No calls match the current filters.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}

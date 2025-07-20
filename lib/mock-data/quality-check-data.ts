export interface WorkflowEntityData {
  entity: string
  totalCalls: number
  approved: number
  rejected: number
  callsToScan: number
}

export interface FlaggedCall {
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
  status: "pending_review" | "reviewed_ok" | "action_required" | "flag_approved" | "flag_rejected"
  aiConfidence?: number
  manualReviewer?: string
  reviewDate?: string
}

export const workflowEntityData: WorkflowEntityData[] = [
  {
    entity: "IA Approved",
    totalCalls: 300,
    approved: 300,
    rejected: 0,
    callsToScan: 15 // 5% of 300
  },
  {
    entity: "IA Rejected",
    totalCalls: 700,
    approved: 0,
    rejected: 700,
    callsToScan: 35 // 5% of 700
  },
  {
    entity: "QA Approved",
    totalCalls: 1000,
    approved: 1000,
    rejected: 0,
    callsToScan: 50 // 5% of 1000
  },
  {
    entity: "QA Rejected",
    totalCalls: 500,
    approved: 0,
    rejected: 500,
    callsToScan: 25 // 5% of 500
  }
]

export const flaggedCallsData: FlaggedCall[] = [
  // Today's calls
  {
    callId: "VKYC_QC_001",
    agentId: "AGT_005",
    agentName: "Arjun Patel",
    callDate: new Date().toISOString().split('T')[0], // Today
    videoUrl: "/placeholder.mp4",
    flags: [
      { type: "sop", description: "Did not state the full closing script.", timestamp: "04:15" },
      { type: "body_language", description: "Not wearing ID card.", timestamp: "00:10" },
    ],
    status: "pending_review",
    aiConfidence: 0.65
  },
  {
    callId: "VKYC_QC_002",
    agentId: "AGT_012",
    agentName: "Diya Verma",
    callDate: new Date().toISOString().split('T')[0], // Today
    videoUrl: "/placeholder.mp4",
    flags: [{ type: "language", description: "Used unprofessional term 'yaar'.", timestamp: "02:30" }],
    status: "flag_approved",
    aiConfidence: 0.85,
    manualReviewer: "John Smith",
    reviewDate: new Date().toLocaleString()
  },
  {
    callId: "VKYC_QC_003",
    agentId: "AGT_008",
    agentName: "Krishna Iyer",
    callDate: new Date().toISOString().split('T')[0], // Today
    videoUrl: "/placeholder.mp4",
    flags: [{ type: "body_language", description: "Agent was slouched during the call.", timestamp: "01:05" }],
    status: "flag_rejected",
    aiConfidence: 0.45,
    manualReviewer: "Sarah Johnson",
    reviewDate: new Date().toLocaleString()
  },
  
  // Yesterday's calls
  {
    callId: "VKYC_QC_004",
    agentId: "AGT_021",
    agentName: "Rohan Das",
    callDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Yesterday
    videoUrl: "/placeholder.mp4",
    flags: [{ type: "sop", description: "Incorrectly verified a document.", timestamp: "03:40" }],
    status: "flag_approved",
    aiConfidence: 0.92,
    manualReviewer: "Mike Wilson",
    reviewDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toLocaleString()
  },
  {
    callId: "VKYC_QC_005",
    agentId: "AGT_005",
    agentName: "Arjun Patel",
    callDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Yesterday
    videoUrl: "/placeholder.mp4",
    flags: [{ type: "language", description: "Interrupted the customer multiple times.", timestamp: "01:55" }],
    status: "flag_rejected",
    aiConfidence: 0.38,
    manualReviewer: "Lisa Brown",
    reviewDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toLocaleString()
  },
  {
    callId: "VKYC_QC_006",
    agentId: "AGT_015",
    agentName: "Saanvi Agarwal",
    callDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Yesterday
    videoUrl: "/placeholder.mp4",
    flags: [
      { type: "sop", description: "Failed to verify customer identity properly.", timestamp: "02:45" },
      { type: "language", description: "Used informal language with customer.", timestamp: "01:20" }
    ],
    status: "pending_review",
    aiConfidence: 0.72
  },
  
  // This month's calls (earlier in the month)
  {
    callId: "VKYC_QC_007",
    agentId: "AGT_003",
    agentName: "Aditya Kumar",
    callDate: new Date(new Date().getFullYear(), new Date().getMonth(), 15).toISOString().split('T')[0], // 15th of current month
    videoUrl: "/placeholder.mp4",
    flags: [{ type: "body_language", description: "Not maintaining proper eye contact.", timestamp: "03:10" }],
    status: "flag_approved",
    aiConfidence: 0.78,
    manualReviewer: "David Lee",
    reviewDate: new Date(new Date().getFullYear(), new Date().getMonth(), 15).toLocaleString()
  },
  {
    callId: "VKYC_QC_008",
    agentId: "AGT_018",
    agentName: "Kiara Pillai",
    callDate: new Date(new Date().getFullYear(), new Date().getMonth(), 10).toISOString().split('T')[0], // 10th of current month
    videoUrl: "/placeholder.mp4",
    flags: [{ type: "sop", description: "Did not follow proper document verification process.", timestamp: "04:30" }],
    status: "pending_review",
    aiConfidence: 0.55
  },
  
  // Last 3 months calls
  {
    callId: "VKYC_QC_009",
    agentId: "AGT_022",
    agentName: "Rahul Sharma",
    callDate: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 20).toISOString().split('T')[0], // Last month
    videoUrl: "/placeholder.mp4",
    flags: [{ type: "language", description: "Used inappropriate tone with customer.", timestamp: "02:15" }],
    status: "flag_approved",
    aiConfidence: 0.88,
    manualReviewer: "Emma Davis",
    reviewDate: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 20).toLocaleString()
  },
  {
    callId: "VKYC_QC_010",
    agentId: "AGT_007",
    agentName: "Priya Singh",
    callDate: new Date(new Date().getFullYear(), new Date().getMonth() - 2, 5).toISOString().split('T')[0], // 2 months ago
    videoUrl: "/placeholder.mp4",
    flags: [{ type: "sop", description: "Did not complete required verification steps.", timestamp: "05:20" }],
    status: "pending_review",
    aiConfidence: 0.62
  },
  
  // Older calls (more than 3 months ago)
  {
    callId: "VKYC_QC_011",
    agentId: "AGT_025",
    agentName: "Aisha Khan",
    callDate: new Date(new Date().getFullYear(), new Date().getMonth() - 4, 12).toISOString().split('T')[0], // 4 months ago
    videoUrl: "/placeholder.mp4",
    flags: [{ type: "body_language", description: "Poor posture during verification.", timestamp: "02:30" }],
    status: "flag_approved",
    aiConfidence: 0.82,
    manualReviewer: "Tom Wilson",
    reviewDate: new Date(new Date().getFullYear(), new Date().getMonth() - 4, 12).toLocaleString()
  },
  {
    callId: "VKYC_QC_012",
    agentId: "AGT_030",
    agentName: "Vikram Singh",
    callDate: new Date(new Date().getFullYear(), new Date().getMonth() - 5, 8).toISOString().split('T')[0], // 5 months ago
    videoUrl: "/placeholder.mp4",
    flags: [{ type: "language", description: "Used regional slang in conversation.", timestamp: "01:45" }],
    status: "flag_rejected",
    aiConfidence: 0.35,
    manualReviewer: "Lisa Chen",
    reviewDate: new Date(new Date().getFullYear(), new Date().getMonth() - 5, 8).toLocaleString()
  }
]

export const FLAG_TYPES = ["body_language", "language", "sop"] as const

// Summary statistics
export const callFlowSummary = {
  totalCallsToday: 5000,
  rejectedCalls: 2500, // Not shown in UI
  iaApprovedCalls: 300,
  iaRejectedCalls: 700,
  qaApprovedCalls: 1000,
  qaRejectedCalls: 500,
  samplingPercentage: 5,
  totalCallsExtracted: 125,
  aiFlaggedCalls: 10,
  pendingReviewCalls: 3,
  approvedFlags: 5,
  rejectedFlags: 2
} 
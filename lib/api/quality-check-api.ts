import { workflowEntityData, flaggedCallsData, WorkflowEntityData, FlaggedCall, callFlowSummary } from '../mock-data/quality-check-data'

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export interface QualityCheckAPIResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: string
}

export class QualityCheckAPI {
  // Get workflow entity call data
  static async getWorkflowEntityData(): Promise<QualityCheckAPIResponse<WorkflowEntityData[]>> {
    try {
      await delay(500) // Simulate network delay
      
      return {
        success: true,
        data: workflowEntityData,
        message: "Workflow entity call data retrieved successfully"
      }
    } catch (error) {
      return {
        success: false,
        data: [],
        error: "Failed to fetch workflow entity call data"
      }
    }
  }

  // Get flagged calls data
  static async getFlaggedCalls(): Promise<QualityCheckAPIResponse<FlaggedCall[]>> {
    try {
      await delay(300) // Simulate network delay
      
      return {
        success: true,
        data: flaggedCallsData,
        message: "Flagged calls data retrieved successfully"
      }
    } catch (error) {
      return {
        success: false,
        data: [],
        error: "Failed to fetch flagged calls data"
      }
    }
  }

  // Get flagged calls by status
  static async getFlaggedCallsByStatus(status: FlaggedCall['status']): Promise<QualityCheckAPIResponse<FlaggedCall[]>> {
    try {
      await delay(200) // Simulate network delay
      
      const filteredCalls = flaggedCallsData.filter(call => call.status === status)
      
      return {
        success: true,
        data: filteredCalls,
        message: `Flagged calls with status '${status}' retrieved successfully`
      }
    } catch (error) {
      return {
        success: false,
        data: [],
        error: `Failed to fetch flagged calls with status '${status}'`
      }
    }
  }

  // Update flagged call status
  static async updateFlaggedCallStatus(callId: string, status: FlaggedCall['status'], reviewer?: string): Promise<QualityCheckAPIResponse<FlaggedCall>> {
    try {
      await delay(400) // Simulate network delay
      
      const callIndex = flaggedCallsData.findIndex(call => call.callId === callId)
      
      if (callIndex === -1) {
        return {
          success: false,
          data: {} as FlaggedCall,
          error: "Call not found"
        }
      }

      // Update the call status and add review information
      flaggedCallsData[callIndex].status = status
      if (reviewer) {
        flaggedCallsData[callIndex].manualReviewer = reviewer
        flaggedCallsData[callIndex].reviewDate = new Date().toLocaleString()
      }
      
      return {
        success: true,
        data: flaggedCallsData[callIndex],
        message: `Call status updated to '${status}' successfully`
      }
    } catch (error) {
      return {
        success: false,
        data: {} as FlaggedCall,
        error: "Failed to update call status"
      }
    }
  }

  // Approve flag
  static async approveFlag(callId: string, reviewer: string): Promise<QualityCheckAPIResponse<FlaggedCall>> {
    return this.updateFlaggedCallStatus(callId, "flag_approved", reviewer)
  }

  // Reject flag
  static async rejectFlag(callId: string, reviewer: string): Promise<QualityCheckAPIResponse<FlaggedCall>> {
    return this.updateFlaggedCallStatus(callId, "flag_rejected", reviewer)
  }

  // Get flag statistics
  static async getFlagStatistics(): Promise<QualityCheckAPIResponse<{
    totalFlagged: number
    pendingReview: number
    approvedFlags: number
    rejectedFlags: number
    aiConfidence: number
  }>> {
    try {
      await delay(200) // Simulate network delay
      
      const stats = flaggedCallsData.reduce((acc, call) => {
        acc.totalFlagged++
        
        switch (call.status) {
          case "pending_review":
            acc.pendingReview++
            break
          case "flag_approved":
            acc.approvedFlags++
            break
          case "flag_rejected":
            acc.rejectedFlags++
            break
        }
        
        if (call.aiConfidence) {
          acc.aiConfidence += call.aiConfidence
        }
        
        return acc
      }, {
        totalFlagged: 0,
        pendingReview: 0,
        approvedFlags: 0,
        rejectedFlags: 0,
        aiConfidence: 0
      })
      
      // Calculate average AI confidence
      stats.aiConfidence = stats.totalFlagged > 0 ? stats.aiConfidence / stats.totalFlagged : 0
      
      return {
        success: true,
        data: stats,
        message: "Flag statistics retrieved successfully"
      }
    } catch (error) {
      return {
        success: false,
        data: {
          totalFlagged: 0,
          pendingReview: 0,
          approvedFlags: 0,
          rejectedFlags: 0,
          aiConfidence: 0
        },
        error: "Failed to fetch flag statistics"
      }
    }
  }

  // Get workflow entity statistics
  static async getWorkflowEntityStats(): Promise<QualityCheckAPIResponse<{
    totalEntities: number
    totalCalls: number
    totalApproved: number
    totalRejected: number
    totalCallsToScan: number
  }>> {
    try {
      await delay(200) // Simulate network delay
      
      const stats = workflowEntityData.reduce((acc, entity) => ({
        totalEntities: acc.totalEntities + 1,
        totalCalls: acc.totalCalls + entity.totalCalls,
        totalApproved: acc.totalApproved + entity.approved,
        totalRejected: acc.totalRejected + entity.rejected,
        totalCallsToScan: acc.totalCallsToScan + entity.callsToScan
      }), {
        totalEntities: 0,
        totalCalls: 0,
        totalApproved: 0,
        totalRejected: 0,
        totalCallsToScan: 0
      })
      
      return {
        success: true,
        data: stats,
        message: "Workflow entity statistics retrieved successfully"
      }
    } catch (error) {
      return {
        success: false,
        data: {
          totalEntities: 0,
          totalCalls: 0,
          totalApproved: 0,
          totalRejected: 0,
          totalCallsToScan: 0
        },
        error: "Failed to fetch workflow entity statistics"
      }
    }
  }

  // Search flagged calls
  static async searchFlaggedCalls(query: string): Promise<QualityCheckAPIResponse<FlaggedCall[]>> {
    try {
      await delay(300) // Simulate network delay
      
      const searchLower = query.toLowerCase()
      const filteredCalls = flaggedCallsData.filter(call => 
        call.callId.toLowerCase().includes(searchLower) ||
        call.agentId.toLowerCase().includes(searchLower) ||
        call.agentName.toLowerCase().includes(searchLower)
      )
      
      return {
        success: true,
        data: filteredCalls,
        message: `Found ${filteredCalls.length} calls matching '${query}'`
      }
    } catch (error) {
      return {
        success: false,
        data: [],
        error: "Failed to search flagged calls"
      }
    }
  }

  // Filter flagged calls by flag type
  static async filterFlaggedCallsByType(flagTypes: string[]): Promise<QualityCheckAPIResponse<FlaggedCall[]>> {
    try {
      await delay(250) // Simulate network delay
      
      const filteredCalls = flaggedCallsData.filter(call => 
        call.flags.some(flag => flagTypes.includes(flag.type))
      )
      
      return {
        success: true,
        data: filteredCalls,
        message: `Found ${filteredCalls.length} calls with specified flag types`
      }
    } catch (error) {
      return {
        success: false,
        data: [],
        error: "Failed to filter flagged calls by type"
      }
    }
  }
} 
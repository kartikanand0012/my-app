"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { apiClient } from '@/lib/api-client'
import { useAuth } from '@/lib/auth-context'

interface DashboardData {
  // Dashboard stats
  dashboardStats: any
  
  // Error analytics data
  errorStats: any
  errorTrendData: any[]
  errorTypesData: any[]
  errorDetails: any[]
  
  // Agent data
  agentProfile: any
  leaderboard: any[]
  allAgents: any[]
  
  // AI reporting data
  savedQueries: any[]
  scheduledReports: any[]
  
  // Loading and error states
  loading: boolean
  error: string | null
  
  // Refresh functions
  refreshErrorData: () => Promise<void>
  refreshAgentData: () => Promise<void>
  refreshDashboardStats: () => Promise<void>
  loadErrorDetails: () => Promise<void>  // NEW: On-demand error details loading
}

const DashboardContext = createContext<DashboardData | null>(null)

interface DashboardProviderProps {
  children: ReactNode
  userRole: 'admin' | 'team-lead' | 'agent'
}

export function DashboardProvider({ children, userRole }: DashboardProviderProps) {
  const { user } = useAuth()
  
  // Loading and error states
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Dashboard data states
  const [dashboardStats, setDashboardStats] = useState<any>(null)
  const [errorStats, setErrorStats] = useState<any>(null)
  const [errorTrendData, setErrorTrendData] = useState<any[]>([])
  const [errorTypesData, setErrorTypesData] = useState<any[]>([])
  const [errorDetails, setErrorDetails] = useState<any[]>([])
  
  // Agent data states
  const [agentProfile, setAgentProfile] = useState<any>(null)
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [allAgents, setAllAgents] = useState<any[]>([])
  
  // AI reporting data states
  const [savedQueries, setSavedQueries] = useState<any[]>([])
  const [scheduledReports, setScheduledReports] = useState<any[]>([])

  // Current agent ID for employee role
  const currentAgentId = user?.agent_id?.toString() || ''

  // Fetch dashboard statistics (for admin/team-lead only)
  const fetchDashboardStats = async () => {
    if (userRole === 'agent') return { success: true }
    
    try {
      console.log('🔄 Fetching dashboard stats...')
      const response = await apiClient.getDashboardStats()
      console.log('📊 Dashboard stats response:', response)
      
      if (response.success && response.data) {
        setDashboardStats(response.data)
        console.log('✅ Dashboard stats loaded successfully')
        return { success: true }
      } else {
        console.log('⚠️ Dashboard stats response not successful:', response)
        setDashboardStats({}) // Set empty object instead of null
        return { success: true } // Don't fail the whole load
      }
    } catch (err) {
      console.error('❌ Error fetching dashboard stats:', err)
      setDashboardStats({}) // Set empty object on error
      return { success: true } // Don't fail the whole load for this optional data
    }
  }

  // Fetch all error-related data using NEW APIs
  const fetchErrorData = async () => {
    try {
      console.log('🔄 Fetching error analytics data...')
      
      // Use NEW error analysis APIs
      const statsPromise = apiClient.getErrorStats().catch(err => {
        console.log('⚠️ Error stats failed:', err)
        return { success: false, data: null }
      })
      
      const trendPromise = apiClient.getErrorTrendsChart('30_days', 'daily').catch(err => {
        console.log('⚠️ Error trend failed:', err)
        return { success: false, data: null }
      })
      
      const agentRejectionPromise = apiClient.getAgentRejectionPieChart('this_month').catch(err => {
        console.log('⚠️ Agent rejection pie chart failed:', err)
        return { success: false, data: null }
      })

      const iaErrorTypesPromise = apiClient.getIAErrorTypesPieChart('this_month').catch(err => {
        console.log('⚠️ IA error types pie chart failed:', err)
        return { success: false, data: null }
      })

      const [statsResponse, trendResponse, agentRejectionResponse, iaErrorTypesResponse] = await Promise.all([
        statsPromise, trendPromise, agentRejectionPromise, iaErrorTypesPromise
      ])

      console.log('📊 Error stats response:', statsResponse)
      console.log('📈 Error trend response:', trendResponse)
      console.log('🥧 Agent rejection response:', agentRejectionResponse)
      console.log('🎯 IA error types response:', iaErrorTypesResponse)

      // Handle stats response
      if (statsResponse.success && statsResponse.data) {
        setErrorStats({
          total_errors: statsResponse.data.total_errors || 0,
          today_errors: statsResponse.data.today_errors || 0,
          agent_rejected: statsResponse.data.agent_rejected || 0,
          ia_flagged: statsResponse.data.ia_flagged || 0,
          acknowledged_errors: statsResponse.data.acknowledged_errors || 0,
          daily_average: statsResponse.data.daily_average || 0,
          error_rate: statsResponse.data.error_rate || 0,
          active_agents: statsResponse.data.active_agents || 0,
          // Legacy fields for backward compatibility
          total: statsResponse.data.total_errors || 0,
          today: statsResponse.data.today_errors || 0,
          pending: statsResponse.data.today_errors || 0,
          approved: 0,
          acknowledged: statsResponse.data.acknowledged_errors || 0,
          dailyAverage: statsResponse.data.daily_average || 0,
          successRate: Math.max(0, 100 - (statsResponse.data.error_rate || 0))
        })
        console.log('✅ Error stats loaded')
      } else {
        // Set default error stats structure
        setErrorStats({
          total_errors: 0,
          today_errors: 0,
          agent_rejected: 0,
          ia_flagged: 0,
          acknowledged_errors: 0,
          daily_average: 0,
          error_rate: 0,
          active_agents: 0,
          // Legacy fields
          total: 0,
          today: 0,
          pending: 0,
          approved: 0,
          acknowledged: 0,
          dailyAverage: 0,
          successRate: 0
        })
        console.log('📊 Using default error stats')
      }

      // Handle trend response
      if (trendResponse.success && trendResponse.data && trendResponse.data.chartData && Array.isArray(trendResponse.data.chartData)) {
        // Transform the new API data format to the expected format
        const transformedTrendData = trendResponse.data.chartData.map((item: any) => ({
          date: item.date,
          day: item.date,
          calls: item.totalErrors || 0,
          sessions: item.totalErrors || 0,
          errors: item.totalErrors || 0,
          errorCount: item.totalErrors || 0,
          successRate: 100 - ((item.totalErrors / Math.max(item.totalErrors, 1)) * 100)
        }))
        setErrorTrendData(transformedTrendData)
        console.log('✅ Error trend loaded:', transformedTrendData.length, 'items')
      } else {
        setErrorTrendData([])
        console.log('📈 Using empty error trend data')
      }

      // Combine agent rejection and IA error types for error distribution
      const combinedErrorTypes = []
      
      // Add agent rejection data
      if (agentRejectionResponse.success && agentRejectionResponse.data && agentRejectionResponse.data.chartData) {
        const agentData = agentRejectionResponse.data.chartData.map((item: any) => ({
          type: `Agent: ${item.category}`,
          errorType: item.category,
          count: item.count,
          value: item.count,
          percentage: item.percentage
        }))
        combinedErrorTypes.push(...agentData)
      }

      // Add IA error types data
      if (iaErrorTypesResponse.success && iaErrorTypesResponse.data && iaErrorTypesResponse.data.chartData) {
        const iaData = iaErrorTypesResponse.data.chartData.map((item: any) => ({
          type: `IA: ${item.category}`,
          errorType: item.category,
          count: item.count,
          value: item.count,
          percentage: item.percentage
        }))
        combinedErrorTypes.push(...iaData)
      }

      setErrorTypesData(combinedErrorTypes)
      console.log('✅ Error types loaded:', combinedErrorTypes.length, 'items')

      return { success: true }
    } catch (err) {
      console.error('❌ Error fetching error data:', err)
      // Set default values instead of throwing
      setErrorStats({
        total_errors: 0,
        today_errors: 0,
        agent_rejected: 0,
        ia_flagged: 0,
        acknowledged_errors: 0,
        daily_average: 0,
        error_rate: 0,
        active_agents: 0,
        // Legacy fields
        total: 0,
        today: 0,
        pending: 0,
        approved: 0,
        acknowledged: 0,
        dailyAverage: 0,
        successRate: 0
      })
      setErrorTrendData([])
      setErrorTypesData([])
      return { success: true } // Don't fail completely
    }
  }

  // Fetch error details using NEW detailed error list API
  const fetchErrorDetails = async () => {
    try {
      console.log('🔄 Fetching error details...')
      const response = await apiClient.getDetailedErrorList({
        date_filter: 'today',
        page: 1,
        limit: 20
      })
      
      console.log('📋 Error details response:', response)
      
      if (response.success && response.data && response.data.errors && Array.isArray(response.data.errors)) {
        setErrorDetails(response.data.errors)
        console.log('✅ Error details loaded:', response.data.errors.length, 'items')
      } else {
        setErrorDetails([])
        console.log('📋 Using empty error details')
      }
      return { success: true }
    } catch (err) {
      console.error('❌ Error fetching error details:', err)
      setErrorDetails([])
      return { success: true } // Don't fail completely
    }
  }

  // Fetch agent-related data
  const fetchAgentData = async () => {
    try {
      console.log('🔄 Fetching agent data...')
      
      // Always try to get leaderboard
      const leaderboardPromise = apiClient.getLeaderboard(10, 'today').catch(err => {
        console.log('⚠️ Leaderboard failed:', err)
        return { success: false, data: [] }
      })

      let agentPromise = Promise.resolve({ success: false, data: null })
      let allAgentsPromise = Promise.resolve({ success: false, data: [] })

      // Get agent profile for employees
      if (userRole === 'agent' && currentAgentId) {
        agentPromise = apiClient.getAgentProfile(currentAgentId, 'today').catch(err => {
          console.log('⚠️ Agent profile failed:', err)
          return { success: false, data: null }
        })
      }

      // Get all agents for admin/team-lead
      if (userRole !== 'agent') {
        allAgentsPromise = apiClient.getAllAgents('today').catch(err => {
          console.log('⚠️ All agents failed:', err)
          return { success: false, data: [] }
        })
      }

      const [leaderboardResponse, agentResponse, allAgentsResponse] = await Promise.all([
        leaderboardPromise, agentPromise, allAgentsPromise
      ])
      
      console.log('🏆 Leaderboard response:', leaderboardResponse)
      console.log('👤 Agent profile response:', agentResponse)
      console.log('👥 All agents response:', allAgentsResponse)

      // Handle leaderboard
      if (leaderboardResponse.success && leaderboardResponse.data && Array.isArray(leaderboardResponse.data)) {
        setLeaderboard(leaderboardResponse.data)
        console.log('✅ Leaderboard loaded:', leaderboardResponse.data.length, 'items')
      } else {
        setLeaderboard([])
        console.log('🏆 Using empty leaderboard')
      }

      // Handle agent profile
      if (userRole === 'agent') {
        if (agentResponse.success && agentResponse.data) {
          setAgentProfile(agentResponse.data)
          console.log('✅ Agent profile loaded')
        } else {
          // Set default agent profile structure
          setAgentProfile({
            id: currentAgentId,
            name: user?.agent_name || 'Agent',
            rank: 0,
            todayStats: {
              callsCompleted: 0,
              successRate: 0,
              errorCount: 0,
              avgCallDuration: 0,
              breakTime: 0,
              activeHours: 0
            }
          })
          console.log('👤 Using default agent profile')
        }
      }

      // Handle all agents
      if (userRole !== 'agent') {
        if (allAgentsResponse.success && allAgentsResponse.data && Array.isArray(allAgentsResponse.data)) {
          setAllAgents(allAgentsResponse.data)
          console.log('✅ All agents loaded:', allAgentsResponse.data.length, 'items')
        } else {
          setAllAgents([])
          console.log('👥 Using empty all agents')
        }
      }

      return { success: true }
    } catch (err) {
      console.error('❌ Error fetching agent data:', err)
      // Set defaults
      setLeaderboard([])
      if (userRole === 'agent') {
        setAgentProfile({
          id: currentAgentId,
          name: user?.agent_name || 'Agent',
          rank: 0,
          todayStats: {
            callsCompleted: 0,
            successRate: 0,
            errorCount: 0,
            avgCallDuration: 0,
            breakTime: 0,
            activeHours: 0
          }
        })
      } else {
        setAllAgents([])
      }
      return { success: true }
    }
  }

  // Fetch AI reporting data (for admin/team-lead only)
  const fetchAIReportingData = async () => {
    if (userRole === 'agent') return { success: true }
    
    try {
      console.log('🔄 Fetching AI reporting data...')
      
      const queriesPromise = apiClient.getSavedQueries().catch(err => {
        console.log('⚠️ Saved queries failed:', err)
        return { success: false, data: [] }
      })
      
      const reportsPromise = apiClient.getScheduledReports().catch(err => {
        console.log('⚠️ Scheduled reports failed:', err)
        return { success: false, data: [] }
      })

      const [queriesResponse, reportsResponse] = await Promise.all([
        queriesPromise, reportsPromise
      ])

      console.log('💾 Saved queries response:', queriesResponse)
      console.log('📅 Scheduled reports response:', reportsResponse)

      if (queriesResponse.success && queriesResponse.data && Array.isArray(queriesResponse.data)) {
        setSavedQueries(queriesResponse.data)
        console.log('✅ Saved queries loaded:', queriesResponse.data.length, 'items')
      } else {
        setSavedQueries([])
        console.log('💾 Using empty saved queries')
      }

      if (reportsResponse.success && reportsResponse.data && Array.isArray(reportsResponse.data)) {
        setScheduledReports(reportsResponse.data)
        console.log('✅ Scheduled reports loaded:', reportsResponse.data.length, 'items')
      } else {
        setScheduledReports([])
        console.log('📅 Using empty scheduled reports')
      }

      return { success: true }
    } catch (err) {
      console.error('❌ Error fetching AI reporting data:', err)
      setSavedQueries([])
      setScheduledReports([])
      return { success: true }
    }
  }

  // Main data loading function - OPTIMIZED to reduce unnecessary API calls
  const loadAllData = async () => {
    if (!user) {
      console.log('⏳ No user available, skipping data load')
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      console.log('🚀 Starting dashboard data load for user:', user.agent_name, 'role:', userRole)
      
      // OPTIMIZED: Only load data based on user role and current page needs
      const loadTasks = []
      
      // Always load error data - needed for all roles and components
      loadTasks.push(fetchErrorData())
      
      // Dashboard stats only for admin/team-lead
      if (userRole !== 'agent') {
        loadTasks.push(fetchDashboardStats())
      }
      
      // Agent data based on role
      loadTasks.push(fetchAgentData())
      
      // Error details only when needed (not on initial load)
      // This will be loaded on-demand when user navigates to error analysis
      // loadTasks.push(fetchErrorDetails())
      
      // AI reporting data only for admin/team-lead
      if (userRole !== 'agent') {
        loadTasks.push(fetchAIReportingData())
      }

      console.log(`🎯 Optimized loading: ${loadTasks.length} API calls for ${userRole} role`)
      const results = await Promise.allSettled(loadTasks)

      console.log('📊 Data loading results:', results)

      // Check if any critical failures occurred
      const failures = results.filter(result => result.status === 'rejected')
      
      if (failures.length > 0) {
        console.log('⚠️ Some data loading failed:', failures)
        // Only set error if ALL critical calls failed
        if (failures.length === results.length) {
          setError('Unable to load dashboard data. Please check your connection and try again.')
        }
      } else {
        console.log('✅ All data loaded successfully')
      }
    } catch (err) {
      console.error('❌ Critical error loading dashboard data:', err)
      setError('Failed to load dashboard data. Please refresh the page and try again.')
    } finally {
      setLoading(false)
      console.log('🏁 Dashboard data loading completed')
    }
  }

  // Refresh functions for specific data types
  const refreshErrorData = async () => {
    try {
      console.log('🔄 Refreshing error data...')
      await fetchErrorData()
      await fetchErrorDetails()
      console.log('✅ Error data refreshed')
    } catch (err) {
      console.error('❌ Error refreshing error data:', err)
    }
  }

  const refreshAgentData = async () => {
    try {
      console.log('🔄 Refreshing agent data...')
      await fetchAgentData()
      console.log('✅ Agent data refreshed')
    } catch (err) {
      console.error('❌ Error refreshing agent data:', err)
    }
  }

  const refreshDashboardStats = async () => {
    try {
      console.log('🔄 Refreshing dashboard stats...')
      await fetchDashboardStats()
      console.log('✅ Dashboard stats refreshed')
    } catch (err) {
      console.error('❌ Error refreshing dashboard stats:', err)
    }
  }

  // NEW: On-demand error details loading for error analysis page
  const loadErrorDetails = async () => {
    try {
      console.log('🔄 Loading error details on-demand...')
      await fetchErrorDetails()
      console.log('✅ Error details loaded')
    } catch (err) {
      console.error('❌ Error loading error details:', err)
    }
  }

  // Load data when component mounts or dependencies change
  useEffect(() => {
    loadAllData()
  }, [user, userRole, currentAgentId])

  const contextValue: DashboardData = {
    // Data
    dashboardStats,
    errorStats,
    errorTrendData,
    errorTypesData,
    errorDetails,
    agentProfile,
    leaderboard,
    allAgents,
    savedQueries,
    scheduledReports,
    
    // States
    loading,
    error,
    
    // Refresh functions
    refreshErrorData,
    refreshAgentData,
    refreshDashboardStats,
    loadErrorDetails  // NEW: On-demand error details loading
  }

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const context = useContext(DashboardContext)
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider')
  }
  return context
}
"use client"

import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react'
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
  agentErrorTypesData: any[] // new
  iaErrorTypesData: any[] // new
  
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

  // New error types data states
  const [agentErrorTypesData, setAgentErrorTypesData] = useState<any[]>([])
  const [iaErrorTypesData, setIAErrorTypesData] = useState<any[]>([])

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
      
      // Use dashboard stats for main statistics, fallback to error stats if needed
      const statsPromise = (userRole !== 'agent' ? 
        apiClient.getDashboardStats() : 
        apiClient.getErrorStats()
      ).catch(err => {
        console.log('⚠️ Dashboard/Error stats failed:', err)
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

      // Handle stats response - check if it's the new dashboard stats format
      if (statsResponse.success && statsResponse.data) {
        const data = statsResponse.data
        
        // Check if this is the new dashboard stats format with performance data
        if (data.performance && data.sessions) {
          setErrorStats({
            // New format from dashboard-stats
            total_errors: (data.performance.rejected_today || 0) + (data.performance.flagged_critical || 0),
            today_errors: (data.performance.rejected_today || 0) + (data.performance.flagged_critical || 0),
            sessions_today: data.sessions.sessions_today || 0, 
            agent_rejected: data.performance.rejected_today || 0,
            ia_flagged: data.performance.flagged_critical || 0,
            acknowledged_errors: data.performance.approved_today || 0,
            daily_average: 0, // Will be calculated if needed
            error_rate: 100 - (data.performance.approval_rate || 0),
            approval_rate: data.performance.approval_rate || 0,
            avg_duration_minutes: data.performance.avg_duration_minutes || 0,
            active_agents: data.agents?.active_agents || 0,
            // Legacy fields for backward compatibility
            total: (data.performance.rejected_today || 0) + (data.performance.flagged_critical || 0),
            today: data.sessions.sessions_today || 0,
            pending: data.performance.rejected_today || 0,
            approved: data.performance.approved_today || 0,
            acknowledged: data.performance.approved_today || 0,
            dailyAverage: 0,
            successRate: data.performance.approval_rate || 0
          })
        } else {
          // Original error-analytics format
          setErrorStats({
            total_errors: data.total_errors || 0,
            today_errors: data.today_errors || 0,
            agent_rejected: data.agent_rejected || 0,
            ia_flagged: data.ia_flagged || 0,
            acknowledged_errors: data.acknowledged_errors || 0,
            daily_average: data.daily_average || 0,
            error_rate: data.error_rate || 0,
            active_agents: data.active_agents || 0,
            // Legacy fields for backward compatibility
            total: data.total_errors || 0,
            today: data.today_errors || 0,
            pending: data.today_errors || 0,
            approved: 0,
            acknowledged: data.acknowledged_errors || 0,
            dailyAverage: data.daily_average || 0,
            successRate: Math.max(0, 100 - (data.error_rate || 0))
          })
        }
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

      // Handle trend response - keep original format from new API
      if (trendResponse.success && trendResponse.data && trendResponse.data.chartData && Array.isArray(trendResponse.data.chartData)) {
        // Use the new API data format directly for the error analysis charts
        setErrorTrendData(trendResponse.data.chartData)
        console.log('✅ Error trend loaded:', trendResponse.data.chartData.length, 'items')
      } else {
        setErrorTrendData([])
        console.log('📈 Using empty error trend data')
      }

      // Combine agent rejection and IA error types for error distribution
      // Agent rejection error types (separate)
      let agentErrorTypes: any[] = []
      if (agentRejectionResponse.success && agentRejectionResponse.data && agentRejectionResponse.data.chartData) {
        agentErrorTypes = agentRejectionResponse.data.chartData.map((item: any) => ({
          type: `Agent: ${item.category}`,
          errorType: item.category,
          count: item.count,
          value: item.count,
          percentage: item.percentage
        }))
      }
      setAgentErrorTypesData(agentErrorTypes)

      // IA error types (separate)
      let iaErrorTypes: any[] = []
      if (iaErrorTypesResponse.success && iaErrorTypesResponse.data && iaErrorTypesResponse.data.chartData) {
        iaErrorTypes = iaErrorTypesResponse.data.chartData.map((item: any) => ({
          type: `IA: ${item.category}`,
          errorType: item.category,
          count: item.count,
          value: item.count,
          percentage: item.percentage
        }))
      }
      setIAErrorTypesData(iaErrorTypes)

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
      setAgentErrorTypesData([])
      setIAErrorTypesData([])
      return { success: true } // Don't fail completely
    }
  }

  // Fetch error details using NEW detailed error list API - with caching
  const errorDetailsCache = useRef<{ data: any[], timestamp: number } | null>(null)
  const CACHE_DURATION = 60000 // 1 minute cache
  
  const fetchErrorDetails = async () => {
    try {
      // Check cache first
      const now = Date.now()
      if (errorDetailsCache.current && 
          (now - errorDetailsCache.current.timestamp) < CACHE_DURATION) {
        console.log('📋 Using cached error details')
        setErrorDetails(errorDetailsCache.current.data)
        return { success: true }
      }
      
      console.log('🔄 Fetching error details from API...')
      const response = await apiClient.getDetailedErrorList({
        date_filter: 'today',
        page: 1,
        limit: 20
      })
      
      console.log('📋 Error details response:', response)
      
      if (response.success && response.data && response.data.errors && Array.isArray(response.data.errors)) {
        // Cache the results
        errorDetailsCache.current = {
          data: response.data.errors,
          timestamp: now
        }
        setErrorDetails(response.data.errors)
        console.log('✅ Error details loaded and cached:', response.data.errors.length, 'items')
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

  const loadErrorDetails = async () => {
    try {
      console.log('🔄 Loading error details on demand...')
      await fetchErrorDetails()
      console.log('✅ Error details loaded on demand')
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
    errorTypesData, // (legacy, keep for backward compatibility if needed)
    agentErrorTypesData, // new
    iaErrorTypesData, // new
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
    loadErrorDetails,
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
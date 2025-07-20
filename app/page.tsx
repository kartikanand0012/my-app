"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { UserRoleSelector } from "@/components/user-role-selector"
import { DashboardOverview } from "@/components/dashboard-overview"
import { CallsAnalytics } from "@/components/calls-analytics"
import { ErrorAnalysisDashboard } from "@/components/error-analysis-dashboard"
import { LeadershipDashboard } from "@/components/leadership-dashboard"
import { AgentPerformanceDashboard } from "@/components/agent-performance-dashboard"
import { TeamLeadOperations } from "@/components/team-lead-operations"
import { AIMonitoringDashboard } from "@/components/ai-monitoring-dashboard"
import { QualityCheckDashboard } from "@/components/quality-check-dashboard"
import { AIQueryAutomationPanel } from "@/components/ai-query-automation-panel"
import { LoginForm } from "@/components/login-form"
import { useAuth } from "@/lib/auth-context"
import { LogOut, User } from "lucide-react"



export default function VideoKYCDashboard() {
  const { user, isLoading, isAuthenticated, logout } = useAuth()
  const [userRole, setUserRole] = useState<"admin" | "team-lead" | "agent">("admin")
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
  const [selectedTab, setSelectedTab] = useState("overview")

  const handleAgentSelect = (agentId: string) => {
    setSelectedAgent(agentId)
  }

  useEffect(() => {
    setSelectedTab("overview")
  }, [userRole])

  // Map backend roles to frontend roles
  useEffect(() => {
    if (user) {
      const roleMapping: { [key: string]: "admin" | "team-lead" | "agent" } = {
        'admin': 'admin',
        'team-lead': 'team-lead',
        'user': 'agent'
      }
      setUserRole(roleMapping[user.role] || 'agent')
    }
  }, [user])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginForm />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Video KYC Employee Performance Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="h-4 w-4" />
              <span>{user?.username}</span>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {userRole}
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            {(userRole === "admin" || userRole === "team-lead") && (
              <TabsTrigger value="ai-automation">AI & Automation</TabsTrigger>
            )}
            <TabsTrigger value="performance">
              {userRole === "agent" ? "My Performance" : "Agent Performance"}
            </TabsTrigger>
            <TabsTrigger value="errors">Error Analysis</TabsTrigger>
            {(userRole === "admin" || userRole === "team-lead") && (
              <TabsTrigger value="team-operations">Team Operations</TabsTrigger>
            )}
            {(userRole === "admin" || userRole === "team-lead") && (
              <TabsTrigger value="calls">Calls Analytics</TabsTrigger>
            )}
            {userRole === "admin" && <TabsTrigger value="leadership">Global Leadership</TabsTrigger>}
            {(userRole === "admin" || userRole === "team-lead") && (
              <TabsTrigger value="Ai-monitoring">Ai Monitoring</TabsTrigger>
            )}
            {userRole === "admin" && <TabsTrigger value="Quality-Check-Dashboard">Quality Check</TabsTrigger>}
          </TabsList>

          <TabsContent value="overview">
            <DashboardOverview userRole={userRole === "agent" ? "employee" : userRole} />
          </TabsContent>

          {(userRole === "admin" || userRole === "team-lead") && (
            <TabsContent value="ai-automation">
              <AIQueryAutomationPanel userRole={userRole} />
            </TabsContent>
          )}

          <TabsContent value="performance">
            <AgentPerformanceDashboard
              userRole={userRole}
              selectedAgent={selectedAgent}
              onAgentSelect={handleAgentSelect}
            />
          </TabsContent>

          <TabsContent value="errors">
            <ErrorAnalysisDashboard userRole={userRole} selectedAgent={selectedAgent} />
          </TabsContent>

          {(userRole === "admin" || userRole === "team-lead") && (
            <TabsContent value="team-operations">
              <TeamLeadOperations userRole={userRole} onAgentSelect={handleAgentSelect} />
            </TabsContent>
          )}

          <TabsContent value="calls">
            <CallsAnalytics userRole={userRole === "agent" ? "employee" : userRole} />
          </TabsContent>

          {userRole === "admin" && (
            <TabsContent value="leadership">
              <LeadershipDashboard onAgentSelect={handleAgentSelect} />
            </TabsContent>
          )}

          {(userRole === "admin" || userRole === "team-lead") && (
            <TabsContent value="Ai-monitoring">
              <AIMonitoringDashboard />
            </TabsContent>
          )}
          {userRole === "admin" && (
            <TabsContent value="Quality-Check-Dashboard">
              <QualityCheckDashboard />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  )
}


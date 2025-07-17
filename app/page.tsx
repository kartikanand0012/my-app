"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserRoleSelector } from "@/components/user-role-selector"
import { DashboardOverview } from "@/components/dashboard-overview"
import { CallsAnalytics } from "@/components/calls-analytics"
import { ErrorAnalysisDashboard } from "@/components/error-analysis-dashboard"
import { LeadershipDashboard } from "@/components/leadership-dashboard"
import { AgentPerformanceDashboard } from "@/components/agent-performance-dashboard"
import { TeamLeadOperations } from "@/components/team-lead-operations"
import { AIMonitoringDashboard } from "@/components/ai-monitoring-dashboard"
import { QualityCheckDashboard } from "@/components/quality-check-dashboard"



export default function VideoKYCDashboard() {
  const [userRole, setUserRole] = useState<"admin" | "team-lead" | "agent">("admin")

  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
  const [selectedTab, setSelectedTab] = useState("overview") // ✅ Step 1

  const handleAgentSelect = (agentId: string) => {
    setSelectedAgent(agentId)
  }

  useEffect(() => {
    setSelectedTab("overview") // ✅ Step 2
  }, [userRole])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Video KYC Employee Performance Dashboard</h1>
          <UserRoleSelector
            currentRole={userRole === "agent" ? "employee" : userRole}
            onRoleChange={(role) => setUserRole(role === "employee" ? "agent" : role)}
          />

        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6"> {/* ✅ Step 3 */}
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">
              {userRole === "agent" ? "My Performance" : "Agent Performance"}
            </TabsTrigger>
            <TabsTrigger value="errors">Error Analysis</TabsTrigger>
            {(userRole === "admin" || userRole === "team-lead") && (
              <TabsTrigger value="team-operations">Team Operations</TabsTrigger>
            )}
            <TabsTrigger value="calls">Calls Analytics</TabsTrigger>
            {userRole === "admin" && <TabsTrigger value="leadership">Global Leadership</TabsTrigger>}
            {userRole === "admin" && <TabsTrigger value="Ai-monitoring">Ai Monitoring</TabsTrigger>}
            {userRole === "admin" && <TabsTrigger value="Quality-Check-Dashboard">Quality Check</TabsTrigger>}
          </TabsList>

          <TabsContent value="overview">
            <DashboardOverview userRole={userRole === "agent" ? "employee" : userRole} />
          </TabsContent>


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

          {userRole === "admin" && (
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


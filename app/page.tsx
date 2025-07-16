"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserRoleSelector } from "@/components/user-role-selector"
import { DashboardOverview } from "@/components/dashboard-overview"
import { CallsAnalytics } from "@/components/calls-analytics"
import { ErrorAnalysisDashboard } from "@/components/error-analysis-dashboard"
import { LeadershipDashboard } from "@/components/leadership-dashboard"
import { AgentPerformanceDashboard } from "@/components/agent-performance-dashboard"
import { TeamLeadOperations } from "@/components/team-lead-operations"

export default function VideoKYCDashboard() {
  const [userRole, setUserRole] = useState<"admin" | "team-lead" | "employee">("admin")
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)

  const handleAgentSelect = (agentId: string) => {
    setSelectedAgent(agentId)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Video KYC Employee Performance Dashboard</h1>
          <UserRoleSelector currentRole={userRole} onRoleChange={setUserRole} />
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">
              {userRole === "employee" ? "My Performance" : "Agent Performance"}
            </TabsTrigger>
            <TabsTrigger value="errors">Error Analysis</TabsTrigger>
            {(userRole === "admin" || userRole === "team-lead") && (
              <TabsTrigger value="team-operations">Team Operations</TabsTrigger>
            )}
            <TabsTrigger value="calls">Calls Analytics</TabsTrigger>
            {userRole === "admin" && <TabsTrigger value="leadership">Global Leadership</TabsTrigger>}
          </TabsList>

          <TabsContent value="overview">
            <DashboardOverview userRole={userRole} />
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
            <CallsAnalytics userRole={userRole} />
          </TabsContent>

          {userRole === "admin" && (
            <TabsContent value="leadership">
              <LeadershipDashboard />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  )
}

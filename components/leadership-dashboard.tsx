"use client"

import type React from "react"
import { useState, useEffect, useMemo, type FC } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Crown, Shield, TrendingUp, Users, Search, CalendarIcon, Video, Users2, Sparkles } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useMockApi } from "../lib/hooks/useMockApi";
import { fetchLeadershipAgents } from "../lib/services/leadershipDashboardApi";

interface Agent {
  id: string
  uuid: string
  name: string
  email: string
  avatar: string
  rank: number
  score: number
  monthlyStats: {
    totalCalls: number
    successRate: number
    errorRate: number
    customerRating: number
    improvement: number
  }
  team: string
  location: string
}

interface Tier {
  name: string
  description: string
  range: string
  icon: React.ElementType
  color: string
  agents: Agent[]
}

interface LeadershipDashboardProps {
  onAgentSelect: (agentId: string) => void
}

const TIER_CONFIG = {
  elite: {
    name: "The Elite",
    description: "Top performers, setting the benchmark for excellence.",
    icon: Crown,
    color: "text-amber-500",
  },
  challengers: {
    name: "The Challengers",
    description: "High-potential agents, close to reaching the top.",
    icon: Shield,
    color: "text-sky-500",
  },
  growers: {
    name: "The Growers",
    description: "Consistent performers with significant potential for growth.",
    icon: TrendingUp,
    color: "text-emerald-500",
  },
  foundation: {
    name: "The Foundation",
    description: "The core of our team, building skills for future success.",
    icon: Users,
    color: "text-slate-500",
  },
}

export function LeadershipDashboard({ onAgentSelect }: LeadershipDashboardProps) {
  const { data: allAgents = [], loading, error } = useMockApi(fetchLeadershipAgents);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isMeetingModalOpen, setMeetingModalOpen] = useState(false);
  const [selectedTierForMeeting, setSelectedTierForMeeting] = useState<Tier | null>(null);
  const [dateRange, setDateRange] = useState("all_time");
  const [customDateFrom, setCustomDateFrom] = useState<Date>();
  const [customDateTo, setCustomDateTo] = useState<Date>();

  // All hooks must be called before any return!
  const filteredAgents = useMemo(() => {
    if (!searchQuery) return allAgents || [];
    return (allAgents || []).filter(
      (agent) =>
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.uuid.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [allAgents, searchQuery]);

  const agentTiers = useMemo((): Tier[] => {
    const elite = filteredAgents.filter((a) => a.rank >= 1 && a.rank <= 10);
    const challengers = filteredAgents.filter((a) => a.rank >= 11 && a.rank <= 30);
    const growers = filteredAgents.filter((a) => a.rank >= 31 && a.rank <= 60);
    const foundation = filteredAgents.filter((a) => a.rank > 60);

    return [
      { ...TIER_CONFIG.elite, range: "Top 1-10", agents: elite },
      { ...TIER_CONFIG.challengers, range: "Top 11-30", agents: challengers },
      { ...TIER_CONFIG.growers, range: "Top 31-60", agents: growers },
      { ...TIER_CONFIG.foundation, range: "61+", agents: foundation },
    ].filter((tier) => tier.agents.length > 0);
  }, [filteredAgents]);

  // Only now, after all hooks, do the early return:
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading leadership agents.</div>;

  const openMeetingScheduler = (tier: Tier) => {
    setSelectedTierForMeeting(tier)
    setMeetingModalOpen(true)
  }

  const AgentCard: FC<{ agent: Agent }> = ({ agent }) => {
    const getInitials = (name: string) => {
      const nameParts = name.trim().split(" ")
      if (nameParts.length >= 2) {
        return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
      }
      return nameParts[0][0].toUpperCase()
    }

    return (
      <div
        className="border rounded-lg p-3 hover:shadow-lg transition-all cursor-pointer bg-card"
        onClick={() => setSelectedAgent(agent)}
      >
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0 w-10 text-center">
            <p className="font-bold text-lg text-muted-foreground">{agent.rank}</p>
          </div>
          <Avatar className="w-12 h-12">
            <AvatarImage src={agent.avatar || "/placeholder.svg"} />
            <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
              {getInitials(agent.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{agent.name}</p>
            <p className="text-sm text-muted-foreground truncate">{agent.email}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-lg">{agent.monthlyStats.successRate.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">Success</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Users2 className="w-7 h-7" />
                Global Leadership Board
              </CardTitle>
              <CardDescription>
                Agent performance tiers and training scheduler with date range filtering.
              </CardDescription>
            </div>
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              {/* Date Range Filter */}
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_time">All Time</SelectItem>
                  <SelectItem value="last_week">Last Week</SelectItem>
                  <SelectItem value="last_month">Last Month</SelectItem>
                  <SelectItem value="last_3_months">Last 3 Months</SelectItem>
                  <SelectItem value="last_year">Last Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>

              {/* Custom Date Range Pickers */}
              {dateRange === "custom" && (
                <>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full md:w-40 justify-start text-left font-normal bg-transparent"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {customDateFrom ? format(customDateFrom, "PPP") : "From date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={customDateFrom} onSelect={setCustomDateFrom} initialFocus />
                    </PopoverContent>
                  </Popover>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full md:w-40 justify-start text-left font-normal bg-transparent"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {customDateTo ? format(customDateTo, "PPP") : "To date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={customDateTo} onSelect={setCustomDateTo} initialFocus />
                    </PopoverContent>
                  </Popover>
                </>
              )}

              {/* Search Input */}
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or UUID..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" defaultValue={["The Elite"]} className="w-full space-y-4">
            {agentTiers.map((tier) => (
              <AccordionItem value={tier.name} key={tier.name} className="border rounded-lg bg-background/50">
                <div className="flex items-center justify-between w-full">
                  <AccordionTrigger className="flex-1 p-4 hover:no-underline rounded-t-lg data-[state=open]:bg-muted/50">
                    <div className="flex items-center gap-4">
                      <tier.icon className={`w-8 h-8 ${tier.color}`} />
                      <div>
                        <h3 className="text-xl font-bold text-left">{tier.name}</h3>
                        <p className="text-sm text-muted-foreground text-left">{tier.description}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-lg px-4 py-2">
                      {tier.agents.length} Agents
                    </Badge>
                  </AccordionTrigger>
                  <Button
                    size="sm"
                    variant="outline"
                    className="m-4"
                    onClick={() => openMeetingScheduler(tier)}
                  >
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    Schedule Training
                  </Button>
                </div>
                <AccordionContent className="p-4 border-t">
                  {tier.agents.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                      {tier.agents.map((agent) => (
                        <AgentCard key={agent.id} agent={agent} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No agents in this tier match your search.</p>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Agent Details Dialog */}
      {selectedAgent && (
        <Dialog open onOpenChange={() => setSelectedAgent(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex items-center space-x-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={selectedAgent.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold text-xl">
                    {(() => {
                      const nameParts = selectedAgent.name.trim().split(" ")
                      if (nameParts.length >= 2) {
                        return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
                      }
                      return nameParts[0][0].toUpperCase()
                    })()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <DialogTitle className="text-2xl">{selectedAgent.name}</DialogTitle>
                  <DialogDescription>{selectedAgent.email}</DialogDescription>
                  <Badge variant="outline" className="mt-2">
                    Rank #{selectedAgent.rank}
                  </Badge>
                </div>
              </div>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="text-center p-2 rounded-lg bg-muted">
                <p className="text-2xl font-bold text-blue-600">{selectedAgent.monthlyStats.totalCalls}</p>
                <p className="text-xs text-muted-foreground">Total Calls</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-muted">
                <p className="text-2xl font-bold text-green-600">
                  {selectedAgent.monthlyStats.successRate.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">Success Rate</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-muted">
                <p className="text-2xl font-bold text-red-600">{selectedAgent.monthlyStats.errorRate.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Error Rate</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-muted">
                <p className="text-2xl font-bold text-purple-600">
                  {selectedAgent.monthlyStats.customerRating.toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">Avg. Rating</p>
              </div>
            </div>
            <DialogFooter>
              <Button
                className="w-full"
                onClick={() => {
                  onAgentSelect(selectedAgent.id)
                  setSelectedAgent(null)
                }}
              >
                <Video className="w-4 h-4 mr-2" />
                View Full Performance Profile
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Schedule Meeting Dialog */}
      {isMeetingModalOpen && selectedTierForMeeting && (
        <Dialog open onOpenChange={setMeetingModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-2xl">
                <Sparkles className="w-6 h-6 text-amber-500" />
                Schedule Training for "{selectedTierForMeeting.name}"
              </DialogTitle>
              <DialogDescription>
                Organize a targeted training session for the {selectedTierForMeeting.agents.length} agents in this tier.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-6 py-4">
              <div className="space-y-4">
                <h4 className="font-semibold">Session Details</h4>
                <Input placeholder="Meeting Title (e.g., Advanced VKYC Techniques)" />
                <Input type="datetime-local" />
                <Input placeholder="Meeting Link (e.g., Google Meet, Zoom)" />
                <textarea
                  className="w-full min-h-[100px] p-2 border rounded-md text-sm"
                  placeholder="Agenda or notes..."
                ></textarea>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold">Attendees ({selectedTierForMeeting.agents.length})</h4>
                <div className="max-h-[240px] overflow-y-auto space-y-2 pr-2 border rounded-md p-2">
                  {selectedTierForMeeting.agents.map((agent) => (
                    <div key={agent.id} className="flex items-center gap-2 text-sm">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={agent.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold text-xs">
                          {(() => {
                            const nameParts = agent.name.trim().split(" ")
                            if (nameParts.length >= 2) {
                              return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
                            }
                            return nameParts[0][0].toUpperCase()
                          })()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="flex-1 truncate">{agent.name}</span>
                      <span className="text-muted-foreground truncate">{agent.email}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setMeetingModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setMeetingModalOpen(false)}>
                <CalendarIcon className="w-4 h-4 mr-2" />
                Send Invites
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

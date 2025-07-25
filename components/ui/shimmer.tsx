import React from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

// Base shimmer animation
export const Shimmer = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
)

// Agent card shimmer
export const AgentCardShimmer = () => (
  <Card className="p-4 border rounded-lg">
    <div className="flex flex-col items-center space-y-3">
      <Shimmer className="w-16 h-16 rounded-full" />
      <div className="text-center space-y-2 w-full">
        <Shimmer className="h-4 w-24 mx-auto" />
        <Shimmer className="h-3 w-16 mx-auto" />
        <Shimmer className="h-3 w-20 mx-auto" />
      </div>
      <div className="flex flex-col space-y-1 w-full">
        <Shimmer className="h-6 w-full" />
        <Shimmer className="h-6 w-full" />
      </div>
    </div>
  </Card>
)

// Performance metrics shimmer
export const MetricsCardShimmer = () => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center space-x-2">
        <Shimmer className="w-8 h-8 rounded" />
        <div className="space-y-2 flex-1">
          <Shimmer className="h-4 w-24" />
          <Shimmer className="h-8 w-16" />
          <Shimmer className="h-3 w-20" />
        </div>
      </div>
    </CardContent>
  </Card>
)

// Profile header shimmer
export const ProfileHeaderShimmer = () => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center space-x-4">
        <Shimmer className="w-16 h-16 rounded-full" />
        <div className="space-y-2">
          <Shimmer className="h-8 w-48" />
          <Shimmer className="h-4 w-32" />
        </div>
      </div>
    </CardContent>
  </Card>
)

// Chart shimmer
export const ChartShimmer = ({ height = "300px" }: { height?: string }) => (
  <Card>
    <CardHeader>
      <div className="space-y-2">
        <Shimmer className="h-6 w-40" />
        <Shimmer className="h-4 w-60" />
      </div>
    </CardHeader>
    <CardContent>
      <Shimmer className="w-full rounded" style={{ height }} />
    </CardContent>
  </Card>
)

// Leaderboard shimmer
export const LeaderboardShimmer = () => (
  <Card>
    <CardHeader>
      <div className="space-y-2">
        <Shimmer className="h-6 w-40" />
        <Shimmer className="h-4 w-60" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex items-center space-x-3">
              <Shimmer className="w-8 h-8 rounded" />
              <Shimmer className="w-10 h-10 rounded-full" />
              <div className="space-y-2">
                <Shimmer className="h-4 w-24" />
                <Shimmer className="h-3 w-32" />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Shimmer className="h-6 w-16" />
              <Shimmer className="w-4 h-4" />
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
)

// Monthly summary shimmer
export const MonthlySummaryShimmer = () => (
  <Card>
    <CardHeader>
      <div className="space-y-2">
        <Shimmer className="h-6 w-48" />
        <Shimmer className="h-4 w-64" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="text-center p-4 border rounded-lg">
            <Shimmer className="h-8 w-16 mx-auto mb-2" />
            <Shimmer className="h-4 w-20 mx-auto mb-2" />
            <Shimmer className="h-2 w-full" />
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
)

// Search filters shimmer
export const SearchFiltersShimmer = () => (
  <Card>
    <CardHeader>
      <div className="space-y-2">
        <Shimmer className="h-6 w-32" />
        <Shimmer className="h-4 w-48" />
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Shimmer key={i} className="h-10 w-full" />
        ))}
      </div>
    </CardContent>
  </Card>
)
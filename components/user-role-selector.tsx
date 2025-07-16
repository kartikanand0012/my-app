"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { User, Users, Shield } from "lucide-react"

interface UserRoleSelectorProps {
  currentRole: "admin" | "team-lead" | "employee"
  onRoleChange: (role: "admin" | "team-lead" | "employee") => void
}

export function UserRoleSelector({ currentRole, onRoleChange }: UserRoleSelectorProps) {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="w-4 h-4" />
      case "team-lead":
        return <Users className="w-4 h-4" />
      case "employee":
        return <User className="w-4 h-4" />
      default:
        return <User className="w-4 h-4" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 border-red-200"
      case "team-lead":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "employee":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="flex items-center space-x-4">
      <Badge variant="outline" className={`${getRoleColor(currentRole)} flex items-center space-x-1`}>
        {getRoleIcon(currentRole)}
        <span className="capitalize">{currentRole === "employee" ? "Agent" : currentRole}</span>
      </Badge>

      <Select value={currentRole} onValueChange={onRoleChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Select role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="admin">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Admin</span>
            </div>
          </SelectItem>
          <SelectItem value="team-lead">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Team Lead</span>
            </div>
          </SelectItem>
          <SelectItem value="employee">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>Agent</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

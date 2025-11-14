"use client"

import { Badge } from "@/components/ui/badge"
import { Clock, Package, CheckCircle2, XCircle, Truck } from "lucide-react"

interface OrderStatusBadgeProps {
  status: string
  isRealtime?: boolean
}

export function OrderStatusBadge({ status, isRealtime }: OrderStatusBadgeProps) {
  const statusConfig = {
    pending: {
      label: "Pending",
      icon: Clock,
      className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    },
    processing: {
      label: "Processing",
      icon: Package,
      className: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    },
    ready: {
      label: "Ready",
      icon: Truck,
      className: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    },
    completed: {
      label: "Completed",
      icon: CheckCircle2,
      className: "bg-green-500/10 text-green-500 border-green-500/20",
    },
    cancelled: {
      label: "Cancelled",
      icon: XCircle,
      className: "bg-red-500/10 text-red-500 border-red-500/20",
    },
  }

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
  const Icon = config.icon

  return (
    <Badge variant="outline" className={`${config.className} relative`}>
      <Icon className="mr-1 h-3 w-3" />
      {config.label}
      {isRealtime && (
        <span className="ml-2 flex h-2 w-2">
          <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
        </span>
      )}
    </Badge>
  )
}

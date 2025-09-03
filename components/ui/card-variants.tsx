import * as React from "react"
import { cn } from "@/lib/utils"
import { Card } from "./card"

// Enhanced Product Card
export function ProductCard({ className, ...props }: React.ComponentProps<typeof Card>) {
  return (
    <Card
      className={cn(
        // Product-specific styling
        "group cursor-pointer",
        // Enhanced product card background
        "bg-gradient-to-br from-card via-card to-card/98",
        // Better product hover effects
        "hover:shadow-lg hover:shadow-saudi-green/15",
        "hover:-translate-y-1 hover:border-saudi-green/30",
        // Product card specific spacing
        "p-0 gap-0",
        className
      )}
      {...props}
    />
  )
}

// Premium Dashboard Card
export function DashboardCard({ className, ...props }: React.ComponentProps<typeof Card>) {
  return (
    <Card
      className={cn(
        // Dashboard-specific styling
        "relative",
        // Premium gradient background
        "bg-gradient-to-br from-card via-card to-saudi-green/2",
        // Enhanced dashboard shadows
        "shadow-md hover:shadow-xl",
        "shadow-saudi-green/8 hover:shadow-saudi-green/20",
        // Dashboard card hover effects
        "hover:border-saudi-green/25 hover:-translate-y-1",
        // Dashboard card accent
        "before:absolute before:top-0 before:left-0 before:w-full before:h-1",
        "before:bg-gradient-to-r before:from-saudi-green before:to-desert-gold",
        "before:rounded-t-xl before:opacity-60",
        className
      )}
      {...props}
    />
  )
}

// Statistics/Metric Card
export function MetricCard({ 
  className, 
  trend, 
  ...props 
}: React.ComponentProps<typeof Card> & {
  trend?: 'up' | 'down' | 'neutral'
}) {
  const getTrendStyles = () => {
    switch (trend) {
      case 'up':
        return "border-l-4 border-l-green-500 bg-gradient-to-br from-card to-green-50/30"
      case 'down':
        return "border-l-4 border-l-red-500 bg-gradient-to-br from-card to-red-50/30"
      default:
        return "border-l-4 border-l-saudi-green bg-gradient-to-br from-card to-saudi-green/5"
    }
  }

  return (
    <Card
      className={cn(
        // Metric card base styling
        "relative overflow-hidden",
        // Trend-based styling
        getTrendStyles(),
        // Enhanced metric shadows
        "shadow-sm hover:shadow-md",
        "transition-all duration-300",
        // Metric card hover
        "hover:-translate-y-0.5",
        className
      )}
      {...props}
    />
  )
}

// Feature/Value Proposition Card
export function FeatureCard({ className, ...props }: React.ComponentProps<typeof Card>) {
  return (
    <Card
      className={cn(
        // Feature card styling
        "text-center group",
        // Enhanced feature card background
        "bg-gradient-to-br from-card via-pearl-white/50 to-card",
        // Feature card shadows and borders
        "border-border/20 hover:border-saudi-green/20",
        "shadow-sm hover:shadow-lg hover:shadow-saudi-green/10",
        // Feature card hover effects
        "hover:-translate-y-2 hover:scale-[1.02]",
        "transition-all duration-300 ease-out",
        className
      )}
      {...props}
    />
  )
}

// Premium/VIP Card
export function PremiumCard({ className, ...props }: React.ComponentProps<typeof Card>) {
  return (
    <Card
      className={cn(
        // Premium card base
        "relative overflow-hidden",
        // Premium golden gradient
        "bg-gradient-to-br from-card via-desert-gold/5 to-card",
        // Premium borders
        "border-2 border-desert-gold/20 hover:border-desert-gold/40",
        // Premium shadows with gold tint
        "shadow-lg shadow-desert-gold/10 hover:shadow-xl hover:shadow-desert-gold/20",
        // Premium hover effects
        "hover:-translate-y-1 hover:scale-[1.01]",
        // Premium accent overlay
        "before:absolute before:inset-0",
        "before:bg-gradient-to-br before:from-desert-gold/5 before:via-transparent before:to-saudi-green/5",
        "before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300",
        className
      )}
      {...props}
    />
  )
}

// Order/Transaction Card
export function OrderCard({ className, status, ...props }: React.ComponentProps<typeof Card> & {
  status?: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
}) {
  const getStatusStyles = () => {
    switch (status) {
      case 'pending':
        return "border-l-4 border-l-yellow-500 bg-gradient-to-br from-card to-yellow-50/20"
      case 'confirmed':
        return "border-l-4 border-l-blue-500 bg-gradient-to-br from-card to-blue-50/20"
      case 'shipped':
        return "border-l-4 border-l-purple-500 bg-gradient-to-br from-card to-purple-50/20"
      case 'delivered':
        return "border-l-4 border-l-green-500 bg-gradient-to-br from-card to-green-50/20"
      case 'cancelled':
        return "border-l-4 border-l-red-500 bg-gradient-to-br from-card to-red-50/20"
      default:
        return "border-l-4 border-l-saudi-green bg-gradient-to-br from-card to-saudi-green/5"
    }
  }

  return (
    <Card
      className={cn(
        // Order card base
        "relative",
        // Status-based styling
        getStatusStyles(),
        // Order card interactions
        "hover:shadow-md hover:-translate-y-0.5",
        "transition-all duration-200",
        className
      )}
      {...props}
    />
  )
}

// Listing/Inventory Card
export function ListingCard({ className, ...props }: React.ComponentProps<typeof Card>) {
  return (
    <Card
      className={cn(
        // Listing card base
        "group hover:shadow-lg",
        // Listing card background
        "bg-gradient-to-br from-card via-card to-riyadh-sky/2",
        // Listing card borders and shadows
        "border-border/30 hover:border-riyadh-sky/25",
        "shadow-sm hover:shadow-riyadh-sky/10",
        // Listing card hover effects
        "hover:-translate-y-1",
        "transition-all duration-300",
        className
      )}
      {...props}
    />
  )
}

// Message/Communication Card
export function MessageCard({ 
  className, 
  priority,
  ...props 
}: React.ComponentProps<typeof Card> & {
  priority?: 'low' | 'medium' | 'high' | 'urgent'
}) {
  const getPriorityStyles = () => {
    switch (priority) {
      case 'urgent':
        return "border-l-4 border-l-red-500 bg-gradient-to-br from-card to-red-50/30 animate-pulse"
      case 'high':
        return "border-l-4 border-l-orange-500 bg-gradient-to-br from-card to-orange-50/20"
      case 'medium':
        return "border-l-4 border-l-yellow-500 bg-gradient-to-br from-card to-yellow-50/20"
      case 'low':
        return "border-l-4 border-l-gray-400 bg-gradient-to-br from-card to-gray-50/20"
      default:
        return "border-l-4 border-l-oasis-teal bg-gradient-to-br from-card to-oasis-teal/5"
    }
  }

  return (
    <Card
      className={cn(
        // Message card base
        "relative",
        // Priority-based styling
        getPriorityStyles(),
        // Message card interactions
        "hover:shadow-md hover:-translate-y-0.5",
        "transition-all duration-200",
        className
      )}
      {...props}
    />
  )
}

// Analytics/Chart Card
export function AnalyticsCard({ className, ...props }: React.ComponentProps<typeof Card>) {
  return (
    <Card
      className={cn(
        // Analytics card base
        "relative overflow-hidden",
        // Analytics card background with data visualization theme
        "bg-gradient-to-br from-card via-card to-riyadh-sky/3",
        // Analytics card borders and shadows
        "border-border/20 hover:border-riyadh-sky/30",
        "shadow-md hover:shadow-lg hover:shadow-riyadh-sky/15",
        // Analytics card hover effects
        "hover:-translate-y-1",
        // Data grid pattern overlay
        "before:absolute before:inset-0 before:opacity-[0.02]",
        "before:bg-[linear-gradient(rgba(22,93,49,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(22,93,49,0.1)_1px,transparent_1px)]",
        "before:bg-[size:20px_20px]",
        className
      )}
      {...props}
    />
  )
}
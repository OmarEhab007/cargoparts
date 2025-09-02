import * as React from "react"

import { cn } from "@/lib/utils"

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        // Enhanced background with subtle gradient
        "bg-gradient-to-br from-card via-card to-card/95",
        // Enhanced border with Saudi green accent
        "border border-border/40 hover:border-saudi-green/20",
        // Improved text styling
        "text-card-foreground",
        // Enhanced layout and spacing
        "flex flex-col gap-6 rounded-xl py-6",
        // Enhanced shadows with warm tones
        "shadow-sm hover:shadow-md",
        "shadow-saudi-green/5 hover:shadow-saudi-green/10",
        // Smooth transitions
        "transition-all duration-300 ease-out",
        // Enhanced backdrop
        "backdrop-blur-sm",
        // Subtle hover lift effect
        "hover:-translate-y-0.5",
        // Position for overlay effects
        "relative overflow-hidden",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        // Enhanced container layout
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5",
        // Enhanced spacing with better proportions
        "px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto]",
        // Enhanced border styling
        "[.border-b]:pb-6 [.border-b]:border-border/30",
        // Subtle background accent
        "relative",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        // Enhanced typography with better hierarchy
        "leading-tight font-semibold text-foreground",
        // Improved text size and spacing
        "text-lg tracking-tight",
        // Better color contrast
        "text-saudi-green/90 hover:text-saudi-green",
        "transition-colors duration-200",
        className
      )}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn(
        // Enhanced typography with better readability
        "text-muted-foreground text-sm leading-relaxed",
        // Improved spacing and layout
        "mt-1",
        // Better color balance
        "text-muted-foreground/80",
        className
      )}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn(
        // Enhanced spacing and layout
        "px-6",
        // Better content organization
        "space-y-3",
        // Improved text flow
        "text-foreground/90",
        className
      )}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        // Enhanced layout and alignment
        "flex items-center justify-between px-6",
        // Enhanced border styling
        "[.border-t]:pt-6 [.border-t]:border-border/30",
        // Better spacing and background
        "mt-auto",
        // Enhanced hover states for interactive elements
        "[&_button]:transition-all [&_button]:duration-200",
        className
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}

'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ProductCardSkeletonProps {
  viewMode?: 'grid' | 'list';
  className?: string;
}

export function ProductCardSkeleton({ viewMode = 'grid', className }: ProductCardSkeletonProps) {
  // List view skeleton
  if (viewMode === 'list') {
    return (
      <Card className={cn(
        "overflow-hidden bg-white dark:bg-card border-border/50",
        "flex flex-row gap-4 p-4",
        className
      )}>
        {/* List Image Skeleton */}
        <Skeleton className="w-32 h-32 rounded-lg flex-shrink-0" />
        
        {/* List Content Skeleton */}
        <div className="flex-1 space-y-3">
          {/* Title & Price Row */}
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-full max-w-[280px]" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="text-end space-y-1">
              <Skeleton className="h-8 w-24 ms-auto" />
              <Skeleton className="h-4 w-20 ms-auto" />
            </div>
          </div>

          {/* Details & Actions */}
          <div className="flex justify-between items-end">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Skeleton className="h-9 w-9" />
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-20" />
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Grid view skeleton (default)
  return (
    <Card className={cn(
      "overflow-hidden bg-white dark:bg-card border-border/50",
      className
    )}>
      {/* Image Header Skeleton */}
      <CardHeader className="p-0">
        <Skeleton className="aspect-square w-full" />
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        {/* Title & Part Number */}
        <div className="space-y-1">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-4 w-24" />
        </div>

        {/* Seller Info */}
        <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-md">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-1">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-3 rounded-full" />
            </div>
            <div className="flex items-center gap-1">
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-3 w-3" />
                ))}
              </div>
              <Skeleton className="h-3 w-8" />
            </div>
          </div>
          <Skeleton className="h-4 w-16" />
        </div>

        {/* Vehicle Compatibility */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>

        {/* Years & Location */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>

        {/* Delivery Info */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-12" />
        </div>

        {/* Price */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-4 w-12" />
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        <Skeleton className="flex-1 h-10" />
        <Skeleton className="h-10 w-16" />
      </CardFooter>
    </Card>
  );
}
import { Suspense } from 'react';
import { MarketingPromotions } from '@/components/features/marketing-promotions';
import { Skeleton } from '@/components/ui/skeleton';

export default function MarketingPage() {
  return (
    <div className="space-y-6 p-6">
      <Suspense
        fallback={
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-10 w-32" />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
            <div className="grid grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-64" />
              ))}
            </div>
          </div>
        }
      >
        <MarketingPromotions />
      </Suspense>
    </div>
  );
}
import { Suspense } from 'react';
import { StoreCustomization } from '@/components/features/store-customization';
import { Skeleton } from '@/components/ui/skeleton';

export default function SettingsPage() {
  return (
    <div className="space-y-6 p-6">
      <Suspense
        fallback={
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-8 w-64" />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
            <div className="space-y-6">
              <Skeleton className="h-[500px] w-full" />
            </div>
          </div>
        }
      >
        <StoreCustomization />
      </Suspense>
    </div>
  );
}
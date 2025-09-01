import { cn } from '@/lib/utils';
import { 
  Package, 
  Car, 
  Gauge, 
  Cog,
  Battery,
  Disc
} from 'lucide-react';

interface ImagePlaceholderProps {
  className?: string;
  type?: 'part' | 'engine' | 'brake' | 'transmission' | 'electrical' | 'general';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const iconMap = {
  part: Package,
  engine: Gauge,
  brake: Disc,
  transmission: Cog,
  electrical: Battery,
  general: Car,
};

const sizeMap = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
  xl: 'h-20 w-20',
};

export function ImagePlaceholder({ 
  className, 
  type = 'part',
  size = 'md' 
}: ImagePlaceholderProps) {
  const Icon = iconMap[type] || Package;
  
  return (
    <div 
      className={cn(
        "relative flex items-center justify-center overflow-hidden",
        "bg-gradient-to-br from-muted/80 to-muted/20",
        "border border-border/20",
        "rounded-lg",
        className
      )}
    >
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-primary/10 animate-pulse" />
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="placeholder-pattern"
              x="0"
              y="0"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="20" cy="20" r="1" fill="currentColor" className="text-muted-foreground/20" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#placeholder-pattern)" />
        </svg>
      </div>
      
      {/* Icon */}
      <div className="relative z-10 p-4">
        <Icon 
          className={cn(
            sizeMap[size],
            "text-muted-foreground/60"
          )} 
        />
      </div>
      
      {/* Shimmer effect */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite]">
        <div className="h-full w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>
    </div>
  );
}

// Animation keyframes for shimmer effect
export const shimmerKeyframes = `
  @keyframes shimmer {
    100% {
      transform: translateX(100%);
    }
  }
`;

// Alternative modern placeholder with car part silhouette
export function ModernImagePlaceholder({ 
  className,
  variant = 'default'
}: { 
  className?: string;
  variant?: 'default' | 'dark' | 'gradient';
}) {
  const variantStyles = {
    default: 'from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700',
    dark: 'from-slate-700 to-slate-800',
    gradient: 'from-blue-100 via-purple-100 to-pink-100 dark:from-blue-900 dark:via-purple-900 dark:to-pink-900',
  };
  
  return (
    <div 
      className={cn(
        "relative flex items-center justify-center overflow-hidden",
        "bg-gradient-to-br",
        variantStyles[variant],
        "rounded-xl",
        className
      )}
    >
      {/* SVG Car Part Pattern */}
      <svg 
        viewBox="0 0 200 200" 
        className="absolute inset-0 w-full h-full opacity-5"
        xmlns="http://www.w3.org/2000/svg"
      >
        <pattern id="parts-pattern" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
          <circle cx="25" cy="25" r="3" fill="currentColor" />
          <rect x="10" y="10" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="0.5" />
        </pattern>
        <rect width="200" height="200" fill="url(#parts-pattern)" />
      </svg>
      
      {/* Centered Icon with glow effect */}
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
        <Package className="relative h-12 w-12 text-muted-foreground/40" />
      </div>
    </div>
  );
}
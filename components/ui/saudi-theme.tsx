'use client';

import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Saudi National Colors and Cultural Design System
export const SAUDI_COLORS = {
  // Primary Saudi Green variations
  green: {
    50: '#f0f8f0',
    100: '#dcf0dc', 
    200: '#bce0bc',
    300: '#8cc98c',
    400: '#5ab05a',
    500: '#165d31', // Primary Saudi Green
    600: '#134d28',
    700: '#103d1f',
    800: '#0d2d17',
    900: '#0a1f10',
    950: '#041208',
  },
  // Desert Gold variations
  gold: {
    50: '#fefbf0',
    100: '#fdf6dc',
    200: '#fbeab8',
    300: '#f8d884',
    400: '#f4c24e',
    500: '#D4AF37', // Primary Desert Gold
    600: '#b8932b',
    700: '#9a7524',
    800: '#7f5f20',
    900: '#6b4f1d',
    950: '#3e2b0e',
  },
  // Riyadh Sky variations
  sky: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#87CEEB', // Primary Riyadh Sky
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
    950: '#082f49',
  },
  // Cultural accent colors
  cultural: {
    // Traditional Arabic calligraphy gold
    calligraphy: '#B8860B',
    // Desert sand warm tone
    sand: '#F5DEB3',
    // Traditional textile colors
    burgundy: '#800020',
    // Pearl white for contrast
    pearl: '#F8F8FF',
  }
} as const;

interface SaudiCardProps {
  children: React.ReactNode;
  variant?: 'green' | 'gold' | 'sky' | 'cultural';
  className?: string;
}

export function SaudiCard({ children, variant = 'green', className }: SaudiCardProps) {
  const variantStyles = {
    green: 'bg-gradient-to-br from-green-50 via-white to-green-50/30 dark:from-green-950/20 dark:via-background dark:to-green-950/10 border-green-200/50 dark:border-green-800/30',
    gold: 'bg-gradient-to-br from-yellow-50 via-white to-yellow-50/30 dark:from-yellow-950/20 dark:via-background dark:to-yellow-950/10 border-yellow-200/50 dark:border-yellow-800/30',
    sky: 'bg-gradient-to-br from-blue-50 via-white to-blue-50/30 dark:from-blue-950/20 dark:via-background dark:to-blue-950/10 border-blue-200/50 dark:border-blue-800/30',
    cultural: 'bg-gradient-to-br from-amber-50 via-white to-amber-50/30 dark:from-amber-950/20 dark:via-background dark:to-amber-950/10 border-amber-200/50 dark:border-amber-800/30',
  };

  return (
    <Card className={cn(variantStyles[variant], className)}>
      {children}
    </Card>
  );
}

interface SaudiHeaderProps {
  title: string;
  subtitle?: string;
  variant?: 'green' | 'gold' | 'sky';
  className?: string;
}

export function SaudiHeader({ title, subtitle, variant = 'green', className }: SaudiHeaderProps) {
  const variantStyles = {
    green: 'text-green-800 dark:text-green-200',
    gold: 'text-yellow-700 dark:text-yellow-300',
    sky: 'text-blue-800 dark:text-blue-200',
  };

  const subtitleStyles = {
    green: 'text-green-600/70 dark:text-green-400/70',
    gold: 'text-yellow-600/70 dark:text-yellow-400/70',  
    sky: 'text-blue-600/70 dark:text-blue-400/70',
  };

  return (
    <div className={cn('space-y-2', className)}>
      <h1 className={cn('text-2xl sm:text-3xl font-bold', variantStyles[variant])}>
        {title}
      </h1>
      {subtitle && (
        <p className={cn('text-sm sm:text-base', subtitleStyles[variant])}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

interface SaudiMetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ElementType;
  variant?: 'revenue' | 'orders' | 'customers' | 'performance';
  showProgress?: boolean;
  progressValue?: number;
  badge?: string | number;
  className?: string;
}

export function SaudiMetricCard({
  title,
  value,
  change,
  icon: Icon,
  variant = 'revenue',
  showProgress = false,
  progressValue,
  badge,
  className
}: SaudiMetricCardProps) {
  const variantConfig = {
    revenue: {
      // Enhanced Saudi green theme with depth
      cardBg: 'bg-gradient-to-br from-saudi-green/5 via-card to-saudi-green/8 dark:from-saudi-green/10 dark:via-card dark:to-saudi-green/5',
      border: 'border-2 border-saudi-green/20 hover:border-saudi-green/35 dark:border-saudi-green/25',
      titleColor: 'text-saudi-green dark:text-saudi-green-light',
      valueColor: 'text-saudi-green-dark dark:text-saudi-green',
      iconBg: 'bg-gradient-to-br from-saudi-green/15 to-saudi-green/25 shadow-lg',
      iconColor: 'text-saudi-green-dark dark:text-saudi-green-light',
      progressColor: 'bg-gradient-to-r from-saudi-green to-saudi-green-light',
      shadowColor: 'shadow-saudi-green/10 hover:shadow-saudi-green/20',
      accentGradient: 'from-saudi-green/10 to-transparent',
    },
    orders: {
      // Enhanced desert gold theme
      cardBg: 'bg-gradient-to-br from-desert-gold/8 via-card to-desert-gold/12 dark:from-desert-gold/10 dark:via-card dark:to-desert-gold/5',
      border: 'border-2 border-desert-gold/25 hover:border-desert-gold/40 dark:border-desert-gold/25',
      titleColor: 'text-desert-gold-dark dark:text-desert-gold-light',
      valueColor: 'text-desert-gold-dark dark:text-desert-gold',
      iconBg: 'bg-gradient-to-br from-desert-gold/20 to-desert-gold/30 shadow-lg',
      iconColor: 'text-desert-gold-dark dark:text-desert-gold-light',
      progressColor: 'bg-gradient-to-r from-desert-gold to-desert-gold-light',
      shadowColor: 'shadow-desert-gold/10 hover:shadow-desert-gold/20',
      accentGradient: 'from-desert-gold/10 to-transparent',
    },
    customers: {
      // Enhanced Riyadh sky theme
      cardBg: 'bg-gradient-to-br from-riyadh-sky/8 via-card to-riyadh-sky/12 dark:from-riyadh-sky/10 dark:via-card dark:to-riyadh-sky/5',
      border: 'border-2 border-riyadh-sky/25 hover:border-riyadh-sky/40 dark:border-riyadh-sky/25',
      titleColor: 'text-riyadh-sky-dark dark:text-riyadh-sky-light',
      valueColor: 'text-riyadh-sky-dark dark:text-riyadh-sky',
      iconBg: 'bg-gradient-to-br from-riyadh-sky/20 to-riyadh-sky/30 shadow-lg',
      iconColor: 'text-riyadh-sky-dark dark:text-riyadh-sky-light',
      progressColor: 'bg-gradient-to-r from-riyadh-sky to-riyadh-sky-light',
      shadowColor: 'shadow-riyadh-sky/10 hover:shadow-riyadh-sky/20',
      accentGradient: 'from-riyadh-sky/10 to-transparent',
    },
    performance: {
      // Enhanced oasis teal theme
      cardBg: 'bg-gradient-to-br from-oasis-teal/8 via-card to-oasis-teal/12 dark:from-oasis-teal/10 dark:via-card dark:to-oasis-teal/5',
      border: 'border-2 border-oasis-teal/25 hover:border-oasis-teal/40 dark:border-oasis-teal/25',
      titleColor: 'text-oasis-teal dark:text-oasis-teal/90',
      valueColor: 'text-oasis-teal dark:text-oasis-teal/80',
      iconBg: 'bg-gradient-to-br from-oasis-teal/20 to-oasis-teal/30 shadow-lg',
      iconColor: 'text-oasis-teal dark:text-oasis-teal/90',
      progressColor: 'bg-gradient-to-r from-oasis-teal to-oasis-teal/80',
      shadowColor: 'shadow-oasis-teal/10 hover:shadow-oasis-teal/20',
      accentGradient: 'from-oasis-teal/10 to-transparent',
    },
  };

  const config = variantConfig[variant];

  return (
    <Card className={cn(
      // Enhanced card base styling
      'group relative overflow-hidden cursor-default',
      // Enhanced background and borders
      config.cardBg, config.border,
      // Enhanced shadows and interactions
      'shadow-lg hover:shadow-xl', config.shadowColor,
      // Smooth hover effects
      'hover:-translate-y-1 hover:scale-[1.02]',
      'transition-all duration-300 ease-out',
      // Enhanced backdrop blur
      'backdrop-blur-sm',
      className
    )}>
      {/* Enhanced decorative accent */}
      <div className={cn(
        'absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500',
        'bg-gradient-to-bl', config.accentGradient
      )} />
      
      <CardHeader className="pb-3 relative z-10">
        <div className="flex items-center justify-between">
          <CardTitle className={cn(
            'text-sm font-semibold tracking-tight',
            'group-hover:scale-105 transition-transform duration-200',
            config.titleColor
          )}>
            {title}
          </CardTitle>
          <div className={cn(
            'p-3 rounded-xl relative overflow-hidden',
            'group-hover:scale-110 group-hover:rotate-3 transition-all duration-300',
            config.iconBg
          )}>
            {/* Icon background glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <Icon className={cn(
              'h-5 w-5 relative z-10',
              'group-hover:scale-110 transition-transform duration-200',
              config.iconColor
            )} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="space-y-4">
          {/* Enhanced value display */}
          <div className={cn(
            'text-2xl sm:text-3xl font-bold tracking-tight',
            'group-hover:scale-105 transition-transform duration-200',
            config.valueColor
          )}>
            {value}
          </div>
          
          {/* Enhanced change indicator */}
          {change !== undefined && (
            <div className="flex items-center gap-2">
              <div className={cn(
                'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold',
                change > 0 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              )}>
                {change > 0 ? (
                  <>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    +{change}%
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {change}%
                  </>
                )}
              </div>
              <span className="text-xs text-muted-foreground font-medium">
                vs last period
              </span>
            </div>
          )}
          
          {/* Enhanced progress bar */}
          {showProgress && progressValue !== undefined && (
            <div className="space-y-3">
              <div className="relative">
                <div className="w-full bg-muted/50 rounded-full h-3 overflow-hidden">
                  <div 
                    className={cn(
                      'h-3 rounded-full transition-all duration-700 ease-out relative overflow-hidden',
                      config.progressColor
                    )}
                    style={{ width: `${progressValue}%` }}
                  >
                    {/* Progress bar shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground font-medium">
                  Progress
                </p>
                <p className={cn(
                  'text-xs font-bold px-2 py-1 rounded-full',
                  'bg-muted/50', config.titleColor
                )}>
                  {progressValue}%
                </p>
              </div>
            </div>
          )}
          
          {/* Enhanced badge */}
          {badge && (
            <Badge className={cn(
              'text-xs font-semibold px-2 py-1 rounded-full border-2',
              config.titleColor, config.border
            )}>
              {badge}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Saudi Cultural Business Time Components
export function SaudiBusinessHours({ isArabic = false }: { isArabic?: boolean }) {
  const businessHours = [
    { day: isArabic ? 'الأحد' : 'Sunday', hours: '8:00 AM - 5:00 PM' },
    { day: isArabic ? 'الإثنين' : 'Monday', hours: '8:00 AM - 5:00 PM' },
    { day: isArabic ? 'الثلاثاء' : 'Tuesday', hours: '8:00 AM - 5:00 PM' },
    { day: isArabic ? 'الأربعاء' : 'Wednesday', hours: '8:00 AM - 5:00 PM' },
    { day: isArabic ? 'الخميس' : 'Thursday', hours: '8:00 AM - 5:00 PM' },
    { day: isArabic ? 'الجمعة' : 'Friday', hours: isArabic ? 'مغلق للصلاة' : 'Closed for Prayer' },
    { day: isArabic ? 'السبت' : 'Saturday', hours: '9:00 AM - 2:00 PM' },
  ];

  return (
    <div className="space-y-2">
      {businessHours.map((schedule, index) => (
        <div key={index} className="flex justify-between items-center p-2 rounded-lg bg-muted/30">
          <span className="text-sm font-medium">{schedule.day}</span>
          <span className={cn(
            'text-sm',
            schedule.hours.includes('مغلق') || schedule.hours.includes('Closed') 
              ? 'text-amber-600 dark:text-amber-400' 
              : 'text-muted-foreground'
          )}>
            {schedule.hours}
          </span>
        </div>
      ))}
    </div>
  );
}

// Export Saudi theme utilities
export const saudiTheme = {
  colors: SAUDI_COLORS,
  spacing: {
    cultural: '1.25rem', // 20px - Traditional Arabic spacing
    comfortable: '1.5rem', // 24px - Comfortable reading spacing
  },
  borderRadius: {
    cultural: '8px', // Moderate rounding respecting cultural preferences
  },
  shadows: {
    cultural: 'rgba(22, 93, 49, 0.1) 0px 4px 12px', // Saudi green shadow
    gold: 'rgba(212, 175, 55, 0.1) 0px 4px 12px', // Desert gold shadow
  }
};
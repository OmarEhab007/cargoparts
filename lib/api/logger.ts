import { NextRequest } from 'next/server';

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
}

export interface LogContext {
  requestId?: string;
  userId?: string;
  sellerId?: string;
  method?: string;
  path?: string;
  statusCode?: number;
  duration?: number;
  ip?: string;
  userAgent?: string;
  [key: string]: any;
}

export class Logger {
  private static instance: Logger;
  private isDevelopment = process.env.NODE_ENV === 'development';
  private logLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || LogLevel.INFO;

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR, LogLevel.FATAL];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  private formatLog(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...context,
      environment: process.env.NODE_ENV,
    };

    if (this.isDevelopment) {
      // Pretty print in development
      return JSON.stringify(logEntry, null, 2);
    }

    // Single line JSON in production
    return JSON.stringify(logEntry);
  }

  private log(level: LogLevel, message: string, context?: LogContext): void {
    if (!this.shouldLog(level)) return;

    const formattedLog = this.formatLog(level, message, context);

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formattedLog);
        break;
      case LogLevel.INFO:
        console.info(formattedLog);
        break;
      case LogLevel.WARN:
        console.warn(formattedLog);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(formattedLog);
        break;
    }

    // In production, you might want to send logs to an external service
    if (!this.isDevelopment && level === LogLevel.FATAL) {
      // Send to error tracking service (e.g., Sentry, LogRocket)
      this.sendToErrorTracking(message, context);
    }
  }

  private sendToErrorTracking(message: string, context?: LogContext): void {
    // Implement integration with error tracking service
    // Example: Sentry.captureMessage(message, 'fatal', { extra: context });
  }

  debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorContext: LogContext = {
      ...context,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: this.isDevelopment ? error.stack : undefined,
      } : error,
    };
    this.log(LogLevel.ERROR, message, errorContext);
  }

  fatal(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorContext: LogContext = {
      ...context,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : error,
    };
    this.log(LogLevel.FATAL, message, errorContext);
  }

  /**
   * Log API request
   */
  logRequest(request: NextRequest, requestId: string, userId?: string): void {
    const context: LogContext = {
      requestId,
      userId,
      method: request.method,
      path: request.nextUrl.pathname,
      query: Object.fromEntries(request.nextUrl.searchParams),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      userAgent: request.headers.get('user-agent'),
    };

    this.info(`API Request: ${request.method} ${request.nextUrl.pathname}`, context);
  }

  /**
   * Log API response
   */
  logResponse(
    request: NextRequest,
    statusCode: number,
    duration: number,
    requestId: string,
    userId?: string
  ): void {
    const context: LogContext = {
      requestId,
      userId,
      method: request.method,
      path: request.nextUrl.pathname,
      statusCode,
      duration,
    };

    const level = statusCode >= 500 ? LogLevel.ERROR : 
                  statusCode >= 400 ? LogLevel.WARN : 
                  LogLevel.INFO;

    this.log(
      level,
      `API Response: ${request.method} ${request.nextUrl.pathname} - ${statusCode} (${duration}ms)`,
      context
    );
  }

  /**
   * Log database query (development only by default)
   */
  logQuery(query: string, params?: any[], duration?: number): void {
    if (!this.isDevelopment) return;

    this.debug('Database Query', {
      query: query.substring(0, 500), // Truncate long queries
      params: params?.slice(0, 10), // Limit params logged
      duration,
    });
  }

  /**
   * Log cache operations
   */
  logCache(operation: 'hit' | 'miss' | 'set' | 'delete', key: string, context?: LogContext): void {
    this.debug(`Cache ${operation}: ${key}`, context);
  }

  /**
   * Log business events
   */
  logBusinessEvent(event: string, context?: LogContext): void {
    this.info(`Business Event: ${event}`, context);
  }

  /**
   * Log security events
   */
  logSecurityEvent(event: string, context?: LogContext): void {
    this.warn(`Security Event: ${event}`, context);
  }

  /**
   * Log performance metrics
   */
  logPerformance(metric: string, value: number, unit: string = 'ms', context?: LogContext): void {
    this.info(`Performance: ${metric} = ${value}${unit}`, context);
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

/**
 * Express-style request logging middleware
 */
export function requestLogger(request: NextRequest, requestId: string): {
  start: number;
  log: (statusCode: number, userId?: string) => void;
} {
  const start = Date.now();
  
  return {
    start,
    log: (statusCode: number, userId?: string) => {
      const duration = Date.now() - start;
      logger.logResponse(request, statusCode, duration, requestId, userId);
    },
  };
}

/**
 * Structured logging for specific domains
 */
export const domainLoggers = {
  auth: {
    login: (userId: string, success: boolean, context?: LogContext) => {
      logger.logBusinessEvent(`User ${success ? 'logged in' : 'login failed'}`, {
        ...context,
        userId,
        success,
      });
    },
    logout: (userId: string, context?: LogContext) => {
      logger.logBusinessEvent('User logged out', { ...context, userId });
    },
    register: (userId: string, role: string, context?: LogContext) => {
      logger.logBusinessEvent('User registered', { ...context, userId, role });
    },
  },
  
  seller: {
    created: (sellerId: string, userId: string, context?: LogContext) => {
      logger.logBusinessEvent('Seller profile created', {
        ...context,
        sellerId,
        userId,
      });
    },
    updated: (sellerId: string, fields: string[], context?: LogContext) => {
      logger.logBusinessEvent('Seller profile updated', {
        ...context,
        sellerId,
        updatedFields: fields,
      });
    },
    suspended: (sellerId: string, reason: string, context?: LogContext) => {
      logger.logSecurityEvent('Seller suspended', {
        ...context,
        sellerId,
        reason,
      });
    },
  },

  order: {
    created: (orderId: string, userId: string, total: number, context?: LogContext) => {
      logger.logBusinessEvent('Order created', {
        ...context,
        orderId,
        userId,
        total,
      });
    },
    statusChanged: (orderId: string, from: string, to: string, context?: LogContext) => {
      logger.logBusinessEvent('Order status changed', {
        ...context,
        orderId,
        statusFrom: from,
        statusTo: to,
      });
    },
    cancelled: (orderId: string, reason: string, context?: LogContext) => {
      logger.logBusinessEvent('Order cancelled', {
        ...context,
        orderId,
        reason,
      });
    },
  },

  payment: {
    initiated: (paymentId: string, amount: number, method: string, context?: LogContext) => {
      logger.logBusinessEvent('Payment initiated', {
        ...context,
        paymentId,
        amount,
        method,
      });
    },
    completed: (paymentId: string, context?: LogContext) => {
      logger.logBusinessEvent('Payment completed', { ...context, paymentId });
    },
    failed: (paymentId: string, reason: string, context?: LogContext) => {
      logger.logBusinessEvent('Payment failed', {
        ...context,
        paymentId,
        reason,
      });
    },
  },

  listing: {
    created: (listingId: string, sellerId: string, context?: LogContext) => {
      logger.logBusinessEvent('Listing created', {
        ...context,
        listingId,
        sellerId,
      });
    },
    updated: (listingId: string, fields: string[], context?: LogContext) => {
      logger.logBusinessEvent('Listing updated', {
        ...context,
        listingId,
        updatedFields: fields,
      });
    },
    outOfStock: (listingId: string, context?: LogContext) => {
      logger.logBusinessEvent('Listing out of stock', { ...context, listingId });
    },
  },
};

/**
 * Performance monitoring wrapper
 */
export function measurePerformance<T>(
  name: string,
  fn: () => T | Promise<T>,
  context?: LogContext
): T | Promise<T> {
  const start = Date.now();
  
  try {
    const result = fn();
    
    if (result instanceof Promise) {
      return result.finally(() => {
        const duration = Date.now() - start;
        logger.logPerformance(name, duration, 'ms', context);
      });
    }
    
    const duration = Date.now() - start;
    logger.logPerformance(name, duration, 'ms', context);
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    logger.logPerformance(`${name} (failed)`, duration, 'ms', context);
    throw error;
  }
}
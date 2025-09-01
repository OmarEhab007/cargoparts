import { Prisma } from '@prisma/client';

export const PRISMA_ERROR_CODES = {
  UniqueConstraintViolation: 'P2002',
  ForeignKeyConstraintViolation: 'P2003',
  RecordNotFound: 'P2025',
} as const;

export function isPrismaError(error: unknown): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError;
}

export function handlePrismaError(error: unknown): {
  message: string;
  code?: string;
} {
  if (isPrismaError(error)) {
    switch (error.code) {
      case PRISMA_ERROR_CODES.UniqueConstraintViolation:
        return {
          message: 'A record with this value already exists',
          code: 'DUPLICATE_ENTRY',
        };
      case PRISMA_ERROR_CODES.ForeignKeyConstraintViolation:
        return {
          message: 'Related record not found',
          code: 'INVALID_REFERENCE',
        };
      case PRISMA_ERROR_CODES.RecordNotFound:
        return {
          message: 'Record not found',
          code: 'NOT_FOUND',
        };
      default:
        return {
          message: 'Database operation failed',
          code: 'DATABASE_ERROR',
        };
    }
  }
  
  return {
    message: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
  };
}

export async function withTransaction<T>(
  fn: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> {
  const { prisma } = await import('./prisma');
  return prisma.$transaction(fn);
}

export async function isDatabaseConnected(): Promise<boolean> {
  try {
    const { prisma } = await import('./prisma');
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}
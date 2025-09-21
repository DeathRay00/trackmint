import { useState, useCallback } from 'react';
import { toast } from '../hooks/use-toast';

interface ErrorHandlerOptions {
  showToast?: boolean;
  logError?: boolean;
  fallbackMessage?: string;
}

export const useErrorHandler = (options: ErrorHandlerOptions = {}) => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    showToast = true,
    logError = true,
    fallbackMessage = 'An unexpected error occurred'
  } = options;

  const handleError = useCallback((error: unknown, customMessage?: string) => {
    let errorMessage = fallbackMessage;

    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = String(error.message);
    }

    setError(errorMessage);

    if (logError) {
      console.error('Error handled:', error);
    }

    if (showToast) {
      toast({
        title: 'Error',
        description: customMessage || errorMessage,
        variant: 'destructive',
      });
    }
  }, [showToast, logError, fallbackMessage]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const executeWithErrorHandling = useCallback(async <T>(
    asyncFunction: () => Promise<T>,
    customErrorMessage?: string
  ): Promise<T | null> => {
    try {
      setIsLoading(true);
      clearError();
      const result = await asyncFunction();
      return result;
    } catch (error) {
      handleError(error, customErrorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [handleError, clearError]);

  return {
    error,
    isLoading,
    handleError,
    clearError,
    executeWithErrorHandling,
  };
};

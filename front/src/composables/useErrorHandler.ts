import { ErrorService } from '@/services/ErrorService';
import type { ApiError } from '@/types';
import { ref } from 'vue';

export function useErrorHandler() {
  const loading = ref(false);

  const withErrorHandling = async <T>(
    operation: () => Promise<T>,
    context?: string,
  ): Promise<T | undefined> => {
    loading.value = true;
    try {
      const result = await operation();
      return result;
    } catch (error) {
      ErrorService.handleError(error as Error | ApiError, context);
      return undefined;
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    withErrorHandling,
  };
}

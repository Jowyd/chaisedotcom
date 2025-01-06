import type { ToastServiceMethods } from 'primevue/toastservice';
import type { ApiError } from '@/types';
import type { ValidationError } from '@/types/error';

export class ErrorService {
  private static toast: ToastServiceMethods | null = null;

  static init(toast: ToastServiceMethods) {
    this.toast = toast;
  }

  static handleError(error: Error | ApiError, context?: string): void {
    console.error(`Error in ${context || 'application'}:`, error);

    if (!this.toast) {
      console.warn('Toast service not initialized in ErrorService');
      return;
    }

    if ('code' in error) {
      this.handleApiError(error as ApiError);
      return;
    }

    this.toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'An unexpected error occurred',
      life: 5000,
    });
  }

  private static handleApiError(error: ApiError): void {
    if (!this.toast) return;

    const errorMessages: Record<string, string> = {
      PROFILE_NOT_FOUND: 'User profile could not be found',
      UNAUTHORIZED: 'You are not authorized to perform this action',
      INVALID_REQUEST: 'Invalid request parameters',
    };
    console.log(error);

    this.toast.add({
      severity: 'error',
      summary: 'Error',
      detail: errorMessages[error.code] || error.response.data.message || error.message,
      life: 5000,
    });
  }

  static handleSuccess(message: string): void {
    if (!this.toast) return;

    this.toast.add({
      severity: 'success',
      summary: 'Success',
      detail: message,
      life: 3000,
    });
  }

  static handleFormValidationErrors<T>(errors: ValidationError<T>[]): void {
    if (!this.toast || errors.length === 0) return;

    const firstError = errors[0];

    this.toast.add({
      severity: 'error',
      summary: 'Validation Error',
      detail: firstError.message,
      life: 5000,
    });
  }
}

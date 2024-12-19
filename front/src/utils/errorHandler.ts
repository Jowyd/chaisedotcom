import type { AxiosError } from 'axios';

interface ErrorResponse {
  message: string;
}

export function useErrorHandler() {

  const handleError = (error: AxiosError<ErrorResponse>) => {
    const message = error.response?.data?.message || error.message || 'Une erreur est survenue';
    console.error("Handler: ", message);    
    // toast.add({
    //   severity: 'error',
    //   summary: 'Erreur',
    //   detail: message,
    //   life: 5000
    // });
  };

  return {
    handleError
  };
}

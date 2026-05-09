/**
 * Network Resilience & Error Handling Service
 * Handles API calls with offline support, retry logic, timeouts, and error recovery
 */

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  retryable?: boolean;
}

export interface ApiError {
  message: string;
  code: string;
  retryable: boolean;
  originalError?: Error;
}

class NetworkResilienceService {
  private static readonly TIMEOUT = 15000; // 15 seconds
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAY = 1000; // 1 second
  private static isOnline = true;
  private static retryCallbacks: Array<() => void> = [];

  static {
    // Monitor online/offline status
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        NetworkResilienceService.isOnline = true;
        NetworkResilienceService.executeRetryCallbacks();
      });
      window.addEventListener('offline', () => {
        NetworkResilienceService.isOnline = false;
      });
    }
  }

  /**
   * Check if application is online
   */
  static isApplicationOnline(): boolean {
    if (typeof window === 'undefined') return true;
    return navigator.onLine && this.isOnline;
  }

  /**
   * Register a callback to execute when connection is restored
   */
  static onConnectionRestored(callback: () => void): void {
    this.retryCallbacks.push(callback);
  }

  /**
   * Execute all retry callbacks
   */
  private static executeRetryCallbacks(): void {
    const callbacks = [...this.retryCallbacks];
    this.retryCallbacks = [];
    callbacks.forEach(cb => {
      try {
        cb();
      } catch (error) {
        console.error('Error in retry callback:', error);
      }
    });
  }

  /**
   * Make an API call with network resilience
   */
  static async apiCall<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    // Check if offline
    if (!this.isApplicationOnline()) {
      return {
        success: false,
        error: 'You are offline. Please check your internet connection.',
        code: 'OFFLINE',
        retryable: true,
        data: undefined
      };
    }

    // Add timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT);

    let lastError: ApiError | null = null;
    let attempt = 0;

    while (attempt < this.MAX_RETRIES) {
      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return {
          success: true,
          data,
          error: undefined
        };

      } catch (error) {
        attempt++;
        const err = error as Error;

        // Determine if error is retryable
        const retryable = this.isRetryableError(err, attempt);

        lastError = {
          message: err.message,
          code: this.getErrorCode(err),
          retryable,
          originalError: err
        };

        // If not retryable or max retries reached, return error
        if (!retryable || attempt >= this.MAX_RETRIES) {
          clearTimeout(timeoutId);
          return {
            success: false,
            error: this.getUserFriendlyMessage(lastError.code),
            code: lastError.code,
            retryable: lastError.retryable,
            data: undefined
          };
        }

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY * attempt));
      }
    }

    clearTimeout(timeoutId);

    return {
      success: false,
      error: 'Request failed after multiple attempts',
      code: 'MAX_RETRIES',
      retryable: true,
      data: undefined
    };
  }

  /**
   * Determine if an error is retryable
   */
  private static isRetryableError(error: Error, attempt: number): boolean {
    const message = error.message.toLowerCase();

    // Network errors are retryable
    if (
      message.includes('failed to fetch') ||
      message.includes('network') ||
      message.includes('err_connection') ||
      message.includes('timeout') ||
      message.includes('aborted') ||
      message.includes('enotfound')
    ) {
      return attempt < this.MAX_RETRIES;
    }

    // CORS errors are generally not retryable
    if (message.includes('cors')) {
      return false;
    }

    // Other errors might be retryable
    return attempt < this.MAX_RETRIES - 1;
  }

  /**
   * Get error code from error message
   */
  private static getErrorCode(error: Error): string {
    const message = error.message.toLowerCase();

    if (message.includes('aborted') || message.includes('timeout')) {
      return 'TIMEOUT';
    }
    if (message.includes('network') || message.includes('failed to fetch')) {
      return 'NETWORK_ERROR';
    }
    if (message.includes('cors')) {
      return 'CORS_ERROR';
    }
    if (message.includes('err_connection')) {
      return 'CONNECTION_CLOSED';
    }

    return 'UNKNOWN_ERROR';
  }

  /**
   * Get user-friendly error message
   */
  private static getUserFriendlyMessage(code: string): string {
    const messages: Record<string, string> = {
      'OFFLINE': 'You are offline. Please check your internet connection.',
      'TIMEOUT': 'Request timed out. Please check your connection and try again.',
      'NETWORK_ERROR': 'Network error. Please check your connection.',
      'CONNECTION_CLOSED': 'Connection was closed. Please try again.',
      'CORS_ERROR': 'Access denied. There may be a server configuration issue.',
      'MAX_RETRIES': 'Request failed. Please try again later.',
      'UNKNOWN_ERROR': 'An error occurred. Please try again.'
    };

    return messages[code] || 'An unexpected error occurred';
  }

  /**
   * Simulate offline mode for testing
   */
  static setOfflineMode(offline: boolean): void {
    this.isOnline = !offline;
  }

  /**
   * Get connection status
   */
  static getConnectionStatus(): string {
    return this.isApplicationOnline() ? 'online' : 'offline';
  }
}

export default NetworkResilienceService;

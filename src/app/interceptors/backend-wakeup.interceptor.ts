import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { retry, throwError, timer } from 'rxjs';
import { environment } from '../../environments/environment';

const RETRYABLE_STATUSES = new Set([0, 408, 425, 429, 500, 502, 503, 504]);
const MAX_RETRIES = 4;
const BASE_RETRY_DELAY_MS = 1500;
const MAX_RETRY_DELAY_MS = 4000;

export const backendWakeupInterceptor: HttpInterceptorFn = (req, next) => {
  const isRetryableGetRequest = req.method === 'GET' && req.url.startsWith(environment.apiUrl);

  if (!isRetryableGetRequest) {
    return next(req);
  }

  return next(req).pipe(
    retry({
      count: MAX_RETRIES,
      delay: (error, retryCount) => {
        if (!shouldRetry(error)) {
          return throwError(() => error);
        }

        const delayMs = Math.min(BASE_RETRY_DELAY_MS * retryCount, MAX_RETRY_DELAY_MS);
        return timer(delayMs);
      },
    })
  );
};

function shouldRetry(error: unknown): boolean {
  if (error instanceof HttpErrorResponse) {
    return RETRYABLE_STATUSES.has(error.status);
  }

  const status = typeof error === 'object' && error !== null && 'status' in error
    ? Number((error as { status?: unknown }).status)
    : NaN;

  return RETRYABLE_STATUSES.has(status);
}

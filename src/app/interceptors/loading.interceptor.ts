import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoadingService } from '../services/loading.service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);
  const apiUrl = environment.apiUrl;
  const isTrackedRequest = req.method === 'GET' && req.url.startsWith(apiUrl);

  if (!isTrackedRequest) {
    return next(req);
  }

  loadingService.start();

  return next(req).pipe(finalize(() => loadingService.stop()));
};

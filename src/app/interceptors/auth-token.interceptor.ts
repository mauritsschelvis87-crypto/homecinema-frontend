import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';

const AUTH_EXCLUDED_PATHS = ['/auth/login', '/auth/register'];

export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token') ?? localStorage.getItem('jwt');
  const apiUrl = environment.apiUrl;
  const isApiRequest = req.url.startsWith(apiUrl);
  const isExcluded = AUTH_EXCLUDED_PATHS.some(path => req.url.startsWith(`${apiUrl}${path}`));

  if (!token || !isApiRequest || isExcluded || req.headers.has('Authorization')) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    })
  );
};

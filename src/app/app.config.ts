import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';

import { provideLottieOptions } from 'ngx-lottie';
import player from 'lottie-web';
import { routes } from './app.routes';
import { authTokenInterceptor } from './interceptors/auth-token.interceptor';
import { backendWakeupInterceptor } from './interceptors/backend-wakeup.interceptor';
import { loadingInterceptor } from './interceptors/loading.interceptor';

export function playerFactory() {
  return player;
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
        anchorScrolling: 'enabled',
      })
    ),
    provideTranslateService({ defaultLanguage: 'nl' }),
    provideHttpClient(withFetch(), withInterceptors([authTokenInterceptor, loadingInterceptor, backendWakeupInterceptor])),

    provideLottieOptions({
      player: playerFactory,
    }),
  ]
};

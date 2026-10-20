import { ApplicationConfig, importProvidersFrom, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { loadAppConfig } from './core/config/app-config';
import { NgxUiLoaderHttpModule, NgxUiLoaderModule, SPINNER, PB_DIRECTION } from 'ngx-ui-loader';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor]), withInterceptorsFromDi()),
    // Load public/api-config.json before the app renders so API URLs use the
    // deployed backend origin (falls back to environment defaults on failure).
    provideAppInitializer(() => loadAppConfig()),
    // Global HTTP loader — auto-shows spinner + progress bar on every HTTP request
    importProvidersFrom(
      NgxUiLoaderModule.forRoot({
        bgsColor: '#4f46e5',
        bgsOpacity: 0.15,
        bgsPosition: 'bottom-right',
        bgsSize: 40,
        bgsType: SPINNER.rectangleBounce,
        fgsColor: '#4f46e5',
        fgsPosition: 'center-center',
        fgsSize: 48,
        fgsType: SPINNER.threeStrings,
        overlayColor: 'rgba(248, 250, 252, 0.82)',
        pbColor: '#4f46e5',
        pbDirection: PB_DIRECTION.leftToRight,
        pbThickness: 3,
        blur: 2,
        gap: 24,
        logoPosition: 'center-center',
        logoSize: 120,
        logoUrl: '',
        masterLoaderId: 'master',
        overlayBorderRadius: '0',
        text: '',
        textColor: '#0f172a',
        textPosition: 'center-center',
      }),
      NgxUiLoaderHttpModule.forRoot({
        showForeground: true,
      })
    ),
  ],
};

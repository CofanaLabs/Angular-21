import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideSignalFormsConfig } from '@angular/forms/signals';
import { NG_STATUS_CLASSES } from '@angular/forms/signals/compat';
import { provideRouter, withViewTransitions } from '@angular/router';

import { labHttpInterceptor } from './http-lab-activity';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withFetch(), withInterceptors([labHttpInterceptor])),
    provideSignalFormsConfig({
      classes: NG_STATUS_CLASSES,
    }),
    provideRouter(routes, withViewTransitions()),
  ],
};

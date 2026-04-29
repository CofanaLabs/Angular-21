import { HttpInterceptorFn } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { tap } from 'rxjs';

export interface HttpActivityEntry {
  id: number;
  method: string;
  url: string;
  status: 'sent' | 'ok' | 'error';
  at: string;
}

@Injectable({ providedIn: 'root' })
export class HttpLabActivity {
  private nextId = 1;
  private readonly entriesState = signal<HttpActivityEntry[]>([]);

  readonly entries = this.entriesState.asReadonly();

  sent(method: string, url: string) {
    this.entriesState.update((entries) => {
      const entry: HttpActivityEntry = {
        id: this.nextId++,
        method,
        url,
        status: 'sent',
        at: new Date().toLocaleTimeString(),
      };

      return [entry, ...entries].slice(0, 8);
    });
  }

  finish(url: string, status: 'ok' | 'error') {
    this.entriesState.update((entries) => {
      const index = entries.findIndex((entry) => entry.url === url && entry.status === 'sent');

      if (index === -1) {
        return entries;
      }

      return entries.map((entry, currentIndex) =>
        currentIndex === index ? { ...entry, status } : entry,
      );
    });
  }

  clear() {
    this.entriesState.set([]);
  }
}

export const labHttpInterceptor: HttpInterceptorFn = (request, next) => {
  const activity = injectHttpActivity();
  const url = request.urlWithParams;
  const enhancedRequest = request.clone({
    setParams: {
      angularLab: 'interceptor',
    },
  });

  activity.sent(request.method, enhancedRequest.urlWithParams);

  return next(enhancedRequest).pipe(
    tap({
      next: () => activity.finish(enhancedRequest.urlWithParams, 'ok'),
      error: () => activity.finish(enhancedRequest.urlWithParams, 'error'),
    }),
  );
};

function injectHttpActivity() {
  return inject(HttpLabActivity);
}

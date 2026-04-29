import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'signal-forms',
    loadComponent: () =>
      import('./demos/signal-forms-demo').then((m) => m.SignalFormsDemo),
  },
  {
    path: 'compat-forms',
    loadComponent: () =>
      import('./demos/compat-forms-demo').then((m) => m.CompatFormsDemo),
  },
  {
    path: 'resources',
    loadComponent: () =>
      import('./demos/resources-demo').then((m) => m.ResourcesDemo),
  },
  {
    path: 'view-transitions',
    loadComponent: () =>
      import('./demos/view-transitions-demo').then((m) => m.ViewTransitionsDemo),
  },
  {
    path: 'async-validation',
    loadComponent: () =>
      import('./demos/async-validation-demo').then((m) => m.AsyncValidationDemo),
  },
  {
    path: 'rx-resource',
    loadComponent: () =>
      import('./demos/rx-resource-demo').then((m) => m.RxResourceDemo),
  },
  {
    path: 'signals',
    loadComponent: () =>
      import('./demos/linked-signal-demo').then((m) => m.SignalsDemo),
  },
  {
    path: 'linked-signal',
    redirectTo: 'signals',
  },
  {
    path: 'zoneless',
    loadComponent: () =>
      import('./demos/zoneless-demo').then((m) => m.ZonelessDemo),
  },
  {
    path: 'angular-aria',
    loadComponent: () =>
      import('./demos/angular-aria-demo').then((m) => m.AngularAriaDemo),
  },
  {
    path: 'defer',
    loadComponent: () => import('./demos/defer-demo').then((m) => m.DeferDemo),
  },
  {
    path: 'render-hooks',
    loadComponent: () =>
      import('./demos/render-hooks-demo').then((m) => m.RenderHooksDemo),
  },
  {
    path: 'interceptors',
    loadComponent: () =>
      import('./demos/interceptors-demo').then((m) => m.InterceptorsDemo),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'signal-forms',
  },
  {
    path: '**',
    redirectTo: 'signal-forms',
  },
];

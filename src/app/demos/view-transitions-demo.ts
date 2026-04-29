import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

type WorkspaceMode = 'overview' | 'details';

@Component({
  selector: 'app-view-transitions-demo',
  template: `
    <section class="demo-page">
      <header class="page-header">
        <p class="eyebrow">Router + Browser API</p>
        <h1>View Transitions</h1>
        <p>
          La app ya usa <code>withViewTransitions()</code> en el router. Esta pantalla
          tambien dispara <code>document.startViewTransition()</code> para cambios locales.
        </p>
      </header>

      <section class="transition-stage" [attr.data-mode]="mode()">
        <div class="toolbar">
          <div class="segmented" aria-label="Vista">
            <button
              type="button"
              [class.active]="mode() === 'overview'"
              (click)="setMode('overview')"
            >
              Resumen
            </button>
            <button
              type="button"
              [class.active]="mode() === 'details'"
              (click)="setMode('details')"
            >
              Detalle
            </button>
          </div>

          <span class="support-pill">{{ supportLabel() }}</span>
        </div>

        <div class="transition-surface">
          <img
            class="transition-image"
            src="/view-transition-card.svg"
            alt="Panel visual usado para demostrar el cambio de posicion con View Transitions"
          />

          <div class="transition-copy">
            @if (mode() === 'overview') {
              <span class="metric-label">Resumen</span>
              <h2>Imagen a la izquierda</h2>
              <p>
                Al cambiar de vista, el mismo elemento mantiene su nombre de transicion
                y el navegador interpola su posicion.
              </p>

              <div class="overview-stats" aria-label="Metricas de ejemplo">
                <article>
                  <span class="metric-label">Requests</span>
                  <strong>1,284</strong>
                </article>
                <article>
                  <span class="metric-label">Pending</span>
                  <strong>12</strong>
                </article>
                <article>
                  <span class="metric-label">Success</span>
                  <strong>98.7%</strong>
                </article>
              </div>
            } @else {
              <span class="metric-label">Detalle</span>
              <h2>Imagen a la derecha</h2>
              <ol>
                <li>El click llama a <code>document.startViewTransition()</code>.</li>
                <li>El signal <code>mode()</code> cambia el layout.</li>
                <li>La imagen conserva <code>view-transition-name: hero-card</code>.</li>
              </ol>
            }
          </div>
        </div>
      </section>
    </section>
  `,
  styleUrl: './demo.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewTransitionsDemo {
  private readonly document = inject(DOCUMENT);

  readonly mode = signal<WorkspaceMode>('overview');
  readonly supportsViewTransitions = signal(typeof this.document.startViewTransition === 'function');
  readonly supportLabel = computed(() =>
    this.supportsViewTransitions() ? 'Soportado por este navegador' : 'Fallback sin transicion',
  );

  setMode(mode: WorkspaceMode) {
    if (mode === this.mode()) {
      return;
    }

    if (typeof this.document.startViewTransition !== 'function') {
      this.mode.set(mode);
      return;
    }

    this.document.startViewTransition(() => {
      this.mode.set(mode);
    });
  }
}

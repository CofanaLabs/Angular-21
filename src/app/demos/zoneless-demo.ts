import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

@Component({
  selector: 'app-zoneless-demo',
  imports: [JsonPipe],
  template: `
    <section class="demo-page">
      <header class="page-header">
        <p class="eyebrow">Change detection</p>
        <h1>Zoneless por defecto</h1>
        <p>
          En Angular 21 los proyectos nuevos no cargan <code>zone.js</code>. Los signals
          notifican a Angular; una mutacion async normal no lo hace hasta que otra accion
          programe render.
        </p>
      </header>

      <div class="demo-grid">
        <section class="panel">
          <h2>Async con y sin signal</h2>
          <dl class="metrics">
            <div>
              <dt>Signal async</dt>
              <dd>{{ signalAsyncCount() }}</dd>
            </div>
            <div>
              <dt>Plain async</dt>
              <dd>{{ plainAsyncCount }}</dd>
            </div>
            <div>
              <dt>Zone.js</dt>
              <dd>{{ hasZoneJs ? 'si' : 'no' }}</dd>
            </div>
          </dl>

          <div class="actions">
            <button type="button" class="secondary" (click)="scheduleSignalUpdate()">
              setTimeout + signal.set()
            </button>
            <button type="button" class="secondary" (click)="schedulePlainMutation()">
              setTimeout + mutacion normal
            </button>
            <button type="button" class="secondary" (click)="forceRender()">
              Forzar render con signal
            </button>
          </div>
        </section>

        <aside class="panel state-panel" aria-label="Estado zoneless">
          <h2>Que observar</h2>
          <p>
            El contador signal se actualiza cuando termina el timer. El contador plain se
            muta, pero puede no verse hasta que pulses otro boton, porque el timer ya no
            esta parcheado por Zone.js.
          </p>
          <pre>{{ snapshot() | json }}</pre>
        </aside>
      </div>
    </section>
  `,
  styleUrl: './demo.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZonelessDemo {
  readonly signalAsyncCount = signal(0);
  readonly renderTick = signal(0);
  readonly hasZoneJs = typeof (globalThis as { Zone?: unknown }).Zone !== 'undefined';

  plainAsyncCount = 0;

  readonly snapshot = computed(() => ({
    signalAsyncCount: this.signalAsyncCount(),
    plainAsyncCount: this.plainAsyncCount,
    renderTick: this.renderTick(),
    hasZoneJs: this.hasZoneJs,
  }));

  scheduleSignalUpdate() {
    window.setTimeout(() => {
      this.signalAsyncCount.update((count) => count + 1);
    }, 600);
  }

  schedulePlainMutation() {
    window.setTimeout(() => {
      this.plainAsyncCount += 1;
    }, 600);
  }

  forceRender() {
    this.renderTick.update((tick) => tick + 1);
  }
}

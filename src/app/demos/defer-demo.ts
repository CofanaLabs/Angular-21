import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-heavy-panel',
  template: `
    <article class="heavy-panel">
      <span class="metric-label">{{ label() }}</span>
      <strong>{{ value() }}</strong>
      <p>{{ description() }}</p>
    </article>
  `,
  styleUrl: './demo.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeavyPanel {
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly description = input.required<string>();
}

@Component({
  selector: 'app-defer-demo',
  imports: [HeavyPanel, JsonPipe],
  template: `
    <section class="demo-page">
      <header class="page-header">
        <p class="eyebrow">Template control flow</p>
        <h1>&#64;defer y triggers</h1>
        <p>
          <code>&#64;defer</code> retrasa dependencias hasta que se cumple un trigger.
          Los triggers <code>hydrate on...</code> existen para SSR con incremental hydration.
        </p>
      </header>

      <div class="demo-grid">
        <section class="panel form-panel">
          <h2>Triggers en cliente</h2>

          <div class="defer-demo-row">
            @defer (on timer(1200ms)) {
              <app-heavy-panel
                label="Timer"
                value="1.2s"
                description="Se carga despues de un timer."
              />
            } @placeholder {
              <div class="placeholder-box">Esperando timer...</div>
            } @loading {
              <div class="placeholder-box">Cargando chunk...</div>
            }
          </div>

          <button #interactionTrigger type="button" class="secondary">
            Interactua aqui para cargar
          </button>
          @defer (on interaction(interactionTrigger); prefetch on hover(interactionTrigger)) {
            <app-heavy-panel
              label="Interaction"
              value="click"
              description="Se precarga al hover y se renderiza al interactuar."
            />
          } @placeholder {
            <div class="placeholder-box">Haz click o pulsa Enter en el boton.</div>
          }

          <div class="viewport-spacer" aria-hidden="true"></div>
          @defer (on viewport) {
            <app-heavy-panel
              label="Viewport"
              value="visible"
              description="Se carga cuando este bloque entra en el viewport."
            />
          } @placeholder {
            <div class="placeholder-box">Baja hasta aqui para activar viewport.</div>
          }
        </section>

        <aside class="panel state-panel" aria-label="Notas de hydration">
          <h2>Incremental hydration</h2>
          <p>
            En una app SSR se combina con <code>provideClientHydration(withIncrementalHydration())</code>
            y triggers como este:
          </p>
          <pre>{{ hydrationExample | json }}</pre>
        </aside>
      </div>
    </section>
  `,
  styleUrl: './demo.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeferDemo {
  readonly hydrationExample = {
    template: '@defer (on idle; hydrate on interaction) { <heavy-widget /> }',
    note: 'hydrate on... solo importa durante la primera carga SSR.',
  };
}

import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { Listbox, Option } from '@angular/aria/listbox';

@Component({
  selector: 'app-angular-aria-demo',
  imports: [JsonPipe, Listbox, Option],
  template: `
    <section class="demo-page">
      <header class="page-header">
        <p class="eyebrow">Developer preview</p>
        <h1>Angular Aria Listbox</h1>
        <p>
          Angular Aria trae directivas headless: accesibilidad y teclado sin estilos
          predefinidos. Aqui usamos <code>ngListbox</code> y <code>ngOption</code>.
        </p>
      </header>

      <div class="demo-grid">
        <section class="panel">
          <h2>Seleccion multiple accesible</h2>
          <p class="muted">Usa flechas para navegar y Space/Enter para seleccionar.</p>

          <div
            ngListbox
            class="aria-listbox"
            aria-label="Angular study topics"
            orientation="vertical"
            selectionMode="explicit"
            multi
            [values]="selectedTopics()"
            (valuesChange)="selectedTopics.set($event)"
          >
            @for (topic of topics; track topic) {
              <div ngOption [value]="topic" [label]="topic">
                <span>{{ topic }}</span>
                <span class="checkmark" aria-hidden="true">check</span>
              </div>
            }
          </div>
        </section>

        <aside class="panel state-panel" aria-label="Estado Angular Aria">
          <h2>Estado</h2>
          <p>
            La directiva gestiona <code>role="listbox"</code>, seleccion,
            foco activo y navegacion por teclado. El estado seleccionado queda
            sincronizado con un signal.
          </p>
          <pre>{{ snapshot() | json }}</pre>
        </aside>
      </div>
    </section>
  `,
  styleUrl: './demo.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AngularAriaDemo {
  readonly topics = [
    'Signal Forms',
    'Resources',
    'View Transitions',
    'Zoneless',
    'Render hooks',
    'Functional interceptors',
  ];

  readonly selectedTopics = signal(['Signal Forms', 'Resources']);

  readonly snapshot = computed(() => ({
    selectedTopics: this.selectedTopics(),
    count: this.selectedTopics().length,
  }));
}

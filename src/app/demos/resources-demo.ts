import { httpResource } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, resource, signal } from '@angular/core';

interface LabUser {
  id: number;
  name: string;
  role: string;
  focus: string;
}

interface RemoteTodo {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

const USERS: Record<number, LabUser> = {
  1: { id: 1, name: 'Marta', role: 'Frontend', focus: 'Signal Forms' },
  2: { id: 2, name: 'Diego', role: 'Platform', focus: 'Resources API' },
  3: { id: 3, name: 'Lucia', role: 'Product', focus: 'View Transitions' },
};

function wait(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

@Component({
  selector: 'app-resources-demo',
  template: `
    <section class="demo-page">
      <header class="page-header">
        <p class="eyebrow">Experimental HTTP API</p>
        <h1>Resources y llamadas reactivas</h1>
        <p>
          <code>resource()</code> modela async local con signals.
          <code>httpResource()</code> envuelve <code>HttpClient</code> y cancela la request anterior
          cuando cambian sus signals.
        </p>
      </header>

      <div class="demo-grid">
        <section class="panel">
          <h2>resource()</h2>
          <div class="segmented" aria-label="Usuarios locales">
            @for (id of userIds; track id) {
              <button
                type="button"
                [class.active]="selectedUserId() === id"
                (click)="selectUser(id)"
              >
                {{ id }}
              </button>
            }
            <button
              type="button"
              [class.active]="selectedUserId() === 999"
              (click)="selectUser(999)"
            >
              Error
            </button>
          </div>

          <div class="resource-box">
            @if (localUser.isLoading()) {
              <p class="muted">Cargando usuario...</p>
            } @else if (localUser.error()) {
              <p class="error">No se pudo cargar: {{ localErrorMessage() }}</p>
            } @else if (localUser.hasValue()) {
              <h3>{{ localUser.value().name }}</h3>
              <p>{{ localUser.value().role }} · {{ localUser.value().focus }}</p>
            }
          </div>

          <div class="actions">
            <button type="button" class="secondary" (click)="localUser.reload()">Reload</button>
          </div>
        </section>

        <section class="panel">
          <h2>httpResource()</h2>
          <label>
            Todo remoto
            <input type="number" min="1" max="10" [value]="todoId()" (input)="setTodoId($event)" />
          </label>

          <div class="resource-box">
            @if (todoResource.isLoading()) {
              <p class="muted">Cargando desde JSONPlaceholder...</p>
            } @else if (todoResource.error()) {
              <p class="error">Request fallida. Revisa conexion o CORS.</p>
            } @else if (todoResource.hasValue()) {
              <h3>{{ todoResource.value().title }}</h3>
              <p>Usuario {{ todoResource.value().userId }}</p>
              <p>Completado: {{ todoResource.value().completed ? 'si' : 'no' }}</p>
            }
          </div>

          <div class="actions">
            <button type="button" class="secondary" (click)="previousTodo()">Anterior</button>
            <button type="button" class="secondary" (click)="nextTodo()">Siguiente</button>
            <button type="button" class="secondary" (click)="todoResource.reload()">Reload</button>
          </div>
        </section>
      </div>
    </section>
  `,
  styleUrl: './demo.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResourcesDemo {
  readonly userIds = [1, 2, 3];
  readonly selectedUserId = signal(1);
  readonly todoId = signal(1);

  readonly localUser = resource({
    params: () => ({ id: this.selectedUserId() }),
    loader: async ({ params }) => {
      await wait(450);

      const user = USERS[params.id];
      if (!user) {
        throw new Error(`No existe el usuario ${params.id}.`);
      }

      return user;
    },
  });

  readonly todoResource = httpResource<RemoteTodo>(() => ({
    url: `https://jsonplaceholder.typicode.com/todos/${this.todoId()}`,
    method: 'GET',
  }));

  readonly localErrorMessage = computed(() => {
    const error = this.localUser.error();
    return error instanceof Error ? error.message : 'Error desconocido.';
  });

  selectUser(id: number) {
    this.selectedUserId.set(id);
  }

  previousTodo() {
    this.todoId.update((id) => Math.max(1, id - 1));
  }

  nextTodo() {
    this.todoId.update((id) => Math.min(10, id + 1));
  }

  setTodoId(event: Event) {
    const input = event.target as HTMLInputElement;
    const next = Number(input.value);

    if (Number.isFinite(next)) {
      this.todoId.set(Math.min(10, Math.max(1, next)));
    }
  }
}

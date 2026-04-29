import { HttpClient } from '@angular/common/http';
import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';

import { HttpLabActivity } from '../http-lab-activity';

interface TodoResponse {
  id: number;
  title: string;
  completed: boolean;
}

@Component({
  selector: 'app-interceptors-demo',
  imports: [JsonPipe],
  template: `
    <section class="demo-page">
      <header class="page-header">
        <p class="eyebrow">HttpClient</p>
        <h1>Functional interceptors</h1>
        <p>
          Los interceptores modernos son funciones. Se registran con
          <code>withInterceptors()</code> dentro de <code>provideHttpClient()</code>.
        </p>
      </header>

      <div class="demo-grid">
        <section class="panel">
          <h2>Request con HttpClient</h2>
          <p>
            El interceptor agrega el query param <code>angularLab=interceptor</code>
            y registra el estado de cada request.
          </p>

          <div class="actions">
            <button type="button" class="secondary" (click)="loadTodo()">Hacer request</button>
            <button type="button" class="secondary" (click)="activity.clear()">Limpiar log</button>
          </div>

          @if (todo(); as currentTodo) {
            <div class="resource-box">
              <h3>{{ currentTodo.title }}</h3>
              <p>Completado: {{ currentTodo.completed ? 'si' : 'no' }}</p>
            </div>
          }
        </section>

        <aside class="panel state-panel" aria-label="Log HTTP">
          <h2>Log del interceptor</h2>
          <pre>{{ activity.entries() | json }}</pre>
        </aside>
      </div>
    </section>
  `,
  styleUrl: './demo.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InterceptorsDemo {
  private readonly http = inject(HttpClient);
  readonly activity = inject(HttpLabActivity);
  readonly todo = signal<TodoResponse | null>(null);

  loadTodo() {
    const id = Math.floor(Math.random() * 10) + 1;
    this.http
      .get<TodoResponse>(`https://jsonplaceholder.typicode.com/todos/${id}`)
      .subscribe((todo) => this.todo.set(todo));
  }
}

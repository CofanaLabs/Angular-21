import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import {
  debounce,
  form,
  FormField,
  minLength,
  pattern,
  required,
  validateHttp,
} from '@angular/forms/signals';

interface RegistrationModel {
  username: string;
}

interface JsonPlaceholderUser {
  id: number;
  username: string;
}

@Component({
  selector: 'app-async-validation-demo',
  imports: [FormField, JsonPipe],
  template: `
    <section class="demo-page">
      <header class="page-header">
        <p class="eyebrow">Signal Forms</p>
        <h1>Validacion async con validateHttp()</h1>
        <p>
          La validacion remota solo corre cuando las reglas sincronas pasan. Si escribes
          rapido, Angular cancela la request anterior y mantiene el estado en
          <code>pending()</code>.
        </p>
      </header>

      <div class="demo-grid">
        <form class="panel form-panel">
          <label>
            Username
            <input
              type="text"
              autocomplete="off"
              [formField]="registrationForm.username"
              aria-describedby="username-help"
            />
          </label>

          <p id="username-help" class="muted">
            Prueba <code>Bret</code> o <code>Antonette</code> para ver un usuario ocupado.
          </p>

          @if (registrationForm.username().pending()) {
            <p class="status pending">Comprobando disponibilidad...</p>
          } @else if (registrationForm.username().valid() && registrationForm.username().dirty()) {
            <p class="status ok">Username disponible</p>
          }

          @if (registrationForm.username().touched() && registrationForm.username().invalid()) {
            <ul class="error-list">
              @for (error of registrationForm.username().errors(); track $index) {
                <li>{{ error.message ?? error.kind }}</li>
              }
            </ul>
          }

          <div class="actions">
            <button type="button" class="secondary" (click)="registrationForm.username().value.set('Bret')">
              Usar ocupado
            </button>
            <button type="button" class="secondary" (click)="registrationForm.username().value.set('angular21')">
              Usar libre
            </button>
          </div>
        </form>

        <aside class="panel state-panel" aria-label="Estado de validacion">
          <h2>Estado del campo</h2>
          <dl class="metrics">
            <div>
              <dt>Pending</dt>
              <dd>{{ registrationForm.username().pending() ? 'si' : 'no' }}</dd>
            </div>
            <div>
              <dt>Valido</dt>
              <dd>{{ registrationForm.username().valid() ? 'si' : 'no' }}</dd>
            </div>
            <div>
              <dt>Errores</dt>
              <dd>{{ registrationForm.username().errors().length }}</dd>
            </div>
          </dl>

          <h3>Modelo</h3>
          <pre>{{ snapshot() | json }}</pre>
        </aside>
      </div>
    </section>
  `,
  styleUrl: './demo.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AsyncValidationDemo {
  readonly registrationModel = signal<RegistrationModel>({
    username: '',
  });

  readonly registrationForm = form(this.registrationModel, (path) => {
    required(path.username, { message: 'El username es obligatorio.' });
    minLength(path.username, 3, { message: 'Usa al menos 3 caracteres.' });
    pattern(path.username, /^[a-zA-Z0-9_]+$/, {
      message: 'Solo letras, numeros y guion bajo.',
    });
    debounce(path.username, 350);

    validateHttp<string, JsonPlaceholderUser[]>(path.username, {
      request: ({ value }) => {
        const username = value();
        return username
          ? `https://jsonplaceholder.typicode.com/users?username=${encodeURIComponent(username)}`
          : undefined;
      },
      onSuccess: (users) =>
        users.length === 0
          ? null
          : {
              kind: 'usernameTaken',
              message: 'Ese username ya existe en el servidor.',
            },
      onError: () => ({
        kind: 'requestFailed',
        message: 'No se pudo validar contra el servidor.',
      }),
    });
  });

  readonly snapshot = computed(() => ({
    value: this.registrationModel(),
    pending: this.registrationForm.username().pending(),
    errors: this.registrationForm.username().errors(),
  }));
}

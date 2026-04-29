import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { AbstractControl, FormControl, ValidationErrors, Validators } from '@angular/forms';
import { FormField } from '@angular/forms/signals';
import { compatForm } from '@angular/forms/signals/compat';

function enterprisePasswordValidator(control: AbstractControl<string>): ValidationErrors | null {
  const value = control.value ?? '';

  if (!value) {
    return null;
  }

  return /[A-Z]/.test(value) && /\d/.test(value)
    ? null
    : {
        enterprisePassword: {
          message: 'Debe incluir una mayuscula y un numero.',
        },
      };
}

@Component({
  selector: 'app-compat-forms-demo',
  imports: [FormField, JsonPipe],
  template: `
    <section class="demo-page">
      <header class="page-header">
        <p class="eyebrow">Migration API</p>
        <h1>Compatibilidad con Reactive Forms</h1>
        <p>
          <code>compatForm()</code> permite meter un <code>FormControl</code> existente
          dentro de un Signal Form sin reescribir sus validadores.
        </p>
      </header>

      <div class="demo-grid">
        <form class="panel form-panel">
          <h2>FormControl legacy dentro de Signal Forms</h2>

          <label>
            Nombre nuevo
            <input type="text" [formField]="userForm.name" />
          </label>

          <label>
            Password legacy
            <input type="password" [formField]="userForm.password" />
          </label>

          @if (userForm.password().touched() && userForm.password().invalid()) {
            <ul class="error-list">
              @for (error of userForm.password().errors(); track $index) {
                <li>{{ error.message ?? error.kind }}</li>
              }
            </ul>
          }

          <div class="actions">
            <button type="button" class="secondary" (click)="fillFromSignalForm()">value.set()</button>
            <button type="button" class="secondary" (click)="fillFromLegacyControl()">
              FormControl.setValue()
            </button>
          </div>
        </form>

        <aside class="panel state-panel" aria-label="Estado de compatibilidad">
          <h2>Que se esta viendo</h2>
          <p>
            El campo <strong>Password legacy</strong> sigue siendo el mismo
            <code>FormControl</code>, pero en el template se usa con
            <code>[formField]</code> como cualquier campo de Signal Forms.
          </p>

          <h3>Valores sincronizados</h3>
          <pre>{{ compatSnapshot() | json }}</pre>
        </aside>
      </div>
    </section>
  `,
  styleUrl: './demo.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompatFormsDemo {
  readonly passwordControl = new FormControl('', {
    validators: [Validators.required, Validators.minLength(8), enterprisePasswordValidator],
    nonNullable: true,
  });

  readonly userModel = signal({
    name: '',
    password: this.passwordControl,
  });

  readonly userForm = compatForm(this.userModel);

  readonly compatSnapshot = computed(() => ({
    signalFormValue: {
      name: this.userForm.name().value(),
      password: this.userForm.password().value(),
      passwordValid: this.userForm.password().valid(),
    },
    legacyControlValue: this.passwordControl.value,
    legacyControlValid: this.passwordControl.valid,
  }));

  fillFromSignalForm() {
    this.userForm.name().value.set('Grace Hopper');
    this.userForm.password().value.set('Angular21');
  }

  fillFromLegacyControl() {
    this.userForm.name().value.set('Ada Lovelace');
    this.passwordControl.setValue('Angular21');
  }
}

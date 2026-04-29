import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import {
  applyWhen,
  email,
  form,
  FormField,
  maxLength,
  min,
  minLength,
  required,
} from '@angular/forms/signals';

type Plan = 'starter' | 'team' | 'enterprise';

interface SignupModel {
  profile: {
    name: string;
    email: string;
  };
  plan: Plan;
  seats: number;
  wantsInvoice: boolean;
  vatId: string;
  notes: string;
}

const initialSignupModel: SignupModel = {
  profile: {
    name: '',
    email: '',
  },
  plan: 'starter',
  seats: 1,
  wantsInvoice: false,
  vatId: '',
  notes: '',
};

@Component({
  selector: 'app-signal-forms-demo',
  imports: [FormField, JsonPipe],
  template: `
    <section class="demo-page">
      <header class="page-header">
        <p class="eyebrow">Experimental API</p>
        <h1>Signal Forms desde cero</h1>
        <p>
          El modelo vive en un signal, <code>form()</code> crea el arbol de campos y cada estado se
          lee como signal: <code>value()</code>, <code>valid()</code>, <code>dirty()</code>,
          <code>errors()</code>.
        </p>
      </header>

      <div class="demo-grid">
        <form class="panel form-panel" (submit)="save($event)">
          <div class="field-row two">
            <label>
              Nombre
              <input type="text" [formField]="signupForm.profile.name" autocomplete="name" />
            </label>

            <label>
              Email
              <input type="email" [formField]="signupForm.profile.email" autocomplete="email" />
            </label>
          </div>

          <div class="field-row two">
            <label>
              Plan
              <select [formField]="signupForm.plan">
                <option value="starter">Starter</option>
                <option value="team">Team</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </label>

            <label>
              Puestos
              <input type="number" [formField]="signupForm.seats" />
            </label>
          </div>

          <label class="check-row">
            <input type="checkbox" [formField]="signupForm.wantsInvoice" />
            Necesito factura
          </label>

          @if (signupForm.wantsInvoice().value()) {
            <label>
              VAT / Tax ID
              <input type="text" [formField]="signupForm.vatId" />
            </label>
          }

          <label>
            Notas
            <textarea rows="4" [formField]="signupForm.notes"></textarea>
          </label>

          <div class="actions">
            <button type="button" class="secondary" (click)="loadExample()">Cargar ejemplo</button>
            <button type="button" class="secondary" (click)="clearVat()">Quitar factura</button>
            <button type="button" class="secondary" (click)="resetStateOnly()">
              Reset estado
            </button>
            <button type="button" class="secondary" (click)="resetModelAndState()">
              Reset modelo
            </button>
            <button type="submit" [disabled]="signupForm().invalid()">Guardar</button>
          </div>
        </form>

        <aside class="panel state-panel" aria-label="Estado del formulario">
          <h2>Estado reactivo</h2>

          <dl class="metrics">
            <div>
              <dt>Valido</dt>
              <dd>{{ signupForm().valid() ? 'si' : 'no' }}</dd>
            </div>
            <div>
              <dt>Sucio</dt>
              <dd>{{ signupForm().dirty() ? 'si' : 'no' }}</dd>
            </div>
            <div>
              <dt>Tocado</dt>
              <dd>{{ signupForm().touched() ? 'si' : 'no' }}</dd>
            </div>
            <div>
              <dt>Total mensual</dt>
              <dd>{{ monthlyEstimate() }}</dd>
            </div>
          </dl>

          <h3>Errores activos</h3>
          <ul class="error-list">
            @for (message of errorMessages(); track message) {
              <li>{{ message }}</li>
            } @empty {
              <li class="muted">Sin errores</li>
            }
          </ul>

          <h3>Modelo fuente</h3>
          <pre>{{ signupModel() | json }}</pre>

          <h3>Reset en Signal Forms</h3>
          <pre>{{ resetExample }}</pre>
        </aside>
      </div>
    </section>
  `,
  styleUrl: './demo.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignalFormsDemo {
  readonly signupModel = signal<SignupModel>(structuredClone(initialSignupModel));

  readonly resetExample = `// Solo limpia dirty/touched; NO cambia valores
this.signupForm().reset();

// Cambia valores y limpia dirty/touched
this.signupForm().reset(initialSignupModel);

// Tambien puedes resetear el modelo fuente explicitamente
this.signupModel.set(structuredClone(initialSignupModel));
this.signupForm().reset();`;

  readonly signupForm = form(this.signupModel, (path) => {
    required(path.profile.name, { message: 'El nombre es obligatorio.' });
    minLength(path.profile.name, 2, { message: 'Usa al menos 2 caracteres.' });

    required(path.profile.email, { message: 'El email es obligatorio.' });
    email(path.profile.email, { message: 'Usa un email valido.' });

    min(path.seats, 1, { message: 'Debe haber al menos un puesto.' });
    maxLength(path.notes, 180, { message: 'Las notas no deben superar 180 caracteres.' });

    applyWhen(
      path,
      ({ valueOf }) => valueOf(path.wantsInvoice),
      (invoicePath) => {
        required(invoicePath.vatId, { message: 'El VAT es obligatorio si pides factura.' });
        minLength(invoicePath.vatId, 6, { message: 'El VAT debe tener al menos 6 caracteres.' });
      },
    );
  });

  readonly monthlyEstimate = computed(() => {
    const baseByPlan: Record<Plan, number> = {
      starter: 19,
      team: 49,
      enterprise: 129,
    };
    const plan = this.signupForm.plan().value();
    const seats = this.signupForm.seats().value();

    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(baseByPlan[plan] * seats);
  });

  readonly errorMessages = computed(() => [
    ...this.signupForm.profile
      .name()
      .errors()
      .map((error) => error.message ?? error.kind),
    ...this.signupForm.profile
      .email()
      .errors()
      .map((error) => error.message ?? error.kind),
    ...this.signupForm
      .seats()
      .errors()
      .map((error) => error.message ?? error.kind),
    ...this.signupForm
      .vatId()
      .errors()
      .map((error) => error.message ?? error.kind),
    ...this.signupForm
      .notes()
      .errors()
      .map((error) => error.message ?? error.kind),
  ]);

  loadExample() {
    this.signupForm.profile.name().value.set('Alex Guerrero');
    this.signupForm.profile.email().value.set('alex@angular.dev');
    this.signupForm.plan().value.set('team');
    this.signupForm.seats().value.set(4);
    this.signupForm.notes().value.set('Migrar un formulario progresivamente a Signal Forms.');
  }

  clearVat() {
    this.signupForm.wantsInvoice().value.set(false);
    this.signupForm.vatId().value.set('');
  }

  resetStateOnly() {
    this.signupForm().reset();
  }

  resetModelAndState() {
    this.signupForm().reset(structuredClone(initialSignupModel));
  }

  save(event: SubmitEvent) {
    event.preventDefault();
  }
}

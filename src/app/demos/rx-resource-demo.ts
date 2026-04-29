import { JsonPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  Injectable,
  inject,
  signal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { delay, map, of, throwError } from 'rxjs';

interface Invoice {
  id: number;
  customer: string;
  total: number;
  status: 'paid' | 'pending' | 'failed';
}

@Injectable({ providedIn: 'root' })
class InvoiceObservableService {
  private readonly invoices: Record<number, Invoice> = {
    1001: { id: 1001, customer: 'Cofana', total: 1280, status: 'paid' },
    1002: { id: 1002, customer: 'Angular Lab', total: 460, status: 'pending' },
    1003: { id: 1003, customer: 'Signals Corp', total: 2300, status: 'failed' },
  };

  loadInvoice(id: number) {
    const invoice = this.invoices[id];

    if (!invoice) {
      return throwError(() => new Error(`Factura ${id} no encontrada.`)).pipe(delay(350));
    }

    return of(invoice).pipe(
      delay(500),
      map((value) => ({ ...value })),
    );
  }
}

@Component({
  selector: 'app-rx-resource-demo',
  imports: [JsonPipe],
  template: `
    <section class="demo-page">
      <header class="page-header">
        <p class="eyebrow">RxJS interop</p>
        <h1>rxResource()</h1>
        <p>
          Usa <code>rxResource()</code> cuando tu capa de datos ya devuelve <code>Observable</code>.
          Mantienes el servicio RxJS, pero consumes estados como signals.
        </p>
      </header>

      <div class="demo-grid">
        <section class="panel">
          <h2>Servicio Observable existente</h2>
          <div class="segmented" aria-label="Facturas">
            @for (id of invoiceIds; track id) {
              <button type="button" [class.active]="invoiceId() === id" (click)="invoiceId.set(id)">
                {{ id }}
              </button>
            }
            <button
              type="button"
              [class.active]="invoiceId() === 9999"
              (click)="invoiceId.set(9999)"
            >
              Error
            </button>
          </div>

          <div class="resource-box">
            @if (invoiceResource.isLoading()) {
              <p class="muted">Cargando factura desde Observable...</p>
            } @else if (invoiceResource.error()) {
              <p class="error">{{ errorMessage() }}</p>
            } @else if (invoiceResource.hasValue()) {
              <h3>Factura {{ invoiceResource.value().id }}</h3>
              <p>{{ invoiceResource.value().customer }}</p>
              <p>Total: {{ invoiceResource.value().total }} EUR</p>
              <p>Estado: {{ invoiceResource.value().status }}</p>
            }
          </div>

          <div class="actions">
            <button type="button" class="secondary" (click)="invoiceResource.reload()">
              Reload
            </button>
          </div>
        </section>

        <aside class="panel state-panel" aria-label="Estado rxResource">
          <h2>ResourceRef</h2>
          <pre>{{ stateSnapshot() | json }}</pre>
        </aside>
      </div>
    </section>
  `,
  styleUrl: './demo.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RxResourceDemo {
  private readonly invoices = inject(InvoiceObservableService);

  readonly invoiceIds = [1001, 1002, 1003];
  readonly invoiceId = signal(1001);

  readonly invoiceResource = rxResource({
    params: () => ({ id: this.invoiceId() }),
    stream: ({ params }) => this.invoices.loadInvoice(params.id),
  });

  readonly errorMessage = computed(() => {
    const error = this.invoiceResource.error();
    return error instanceof Error ? error.message : 'Error desconocido.';
  });

  readonly stateSnapshot = computed(() => ({
    id: this.invoiceId(),
    loading: this.invoiceResource.isLoading(),
    hasValue: this.invoiceResource.hasValue(),
    error: this.errorMessage(),
    value: this.invoiceResource.hasValue() ? this.invoiceResource.value() : null,
  }));
}

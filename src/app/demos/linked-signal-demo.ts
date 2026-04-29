import { JsonPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  linkedSignal,
  signal,
  untracked,
} from '@angular/core';

interface Product {
  id: number;
  name: string;
  category: 'forms' | 'http' | 'router';
  score: number;
}

@Component({
  selector: 'app-signals-demo',
  imports: [JsonPipe],
  template: `
    <section class="demo-page">
      <header class="page-header">
        <p class="eyebrow">Signals</p>
        <h1>Signals</h1>
        <p>
          Un recorrido rapido por las piezas principales: <code>signal()</code>,
          <code>computed()</code>, <code>effect()</code>, <code>untracked()</code>,
          <code>asReadonly()</code>, <code>linkedSignal()</code> e igualdad personalizada.
        </p>
      </header>

      <div class="demo-grid">
        <section class="panel form-panel">
          <h2>signal() y computed()</h2>
          <p>
            <code>signal()</code> guarda estado mutable. <code>computed()</code>
            deriva valores y solo recalcula cuando cambian sus dependencias.
          </p>

          <dl class="metrics">
            <div>
              <dt>Cantidad</dt>
              <dd>{{ quantity() }}</dd>
            </div>
            <div>
              <dt>Precio</dt>
              <dd>{{ unitPrice() }}</dd>
            </div>
            <div>
              <dt>Subtotal</dt>
              <dd>{{ subtotal() }}</dd>
            </div>
            <div>
              <dt>Total</dt>
              <dd>{{ total() }}</dd>
            </div>
          </dl>

          <div class="actions">
            <button type="button" class="secondary" (click)="quantity.update(value => value + 1)">
              quantity.update()
            </button>
            <button type="button" class="secondary" (click)="quantity.set(1)">quantity.set()</button>
            <button type="button" class="secondary" (click)="toggleCurrency()">Cambiar moneda</button>
          </div>
        </section>

        <aside class="panel state-panel" aria-label="Estado base de signals">
          <h2>effect() y untracked()</h2>
          <p>
            El efecto escucha <code>quantity()</code>, pero lee la moneda con
            <code>untracked()</code>. Cambiar solo la moneda no dispara el efecto.
          </p>
          <pre>{{ signalLog() | json }}</pre>
        </aside>
      </div>

      <div class="demo-grid">
        <section class="panel form-panel">
          <h2>asReadonly()</h2>
          <p>
            Expone lectura publica sin permitir que otros llamen <code>set()</code> o
            <code>update()</code>. La escritura queda encapsulada.
          </p>

          <div class="resource-box">
            <h3>Panel privado</h3>
            <p>Estado publico readonly: {{ cartOpen() ? 'abierto' : 'cerrado' }}</p>
          </div>

          <div class="actions">
            <button type="button" class="secondary" (click)="toggleCart()">
              Cambiar desde metodo publico
            </button>
          </div>
        </section>

        <aside class="panel state-panel" aria-label="Igualdad personalizada">
          <h2>Igualdad personalizada</h2>
          <p>
            El signal de preferencias compara por valor. Si haces <code>set()</code> con
            otro objeto igual, no notifica cambios.
          </p>

          <div class="actions">
            <button type="button" class="secondary" (click)="setSamePreferences()">
              set() mismo valor
            </button>
            <button type="button" class="secondary" (click)="toggleDensity()">
              Cambiar density
            </button>
          </div>

          <pre>{{ preferencesSnapshot() | json }}</pre>
        </aside>
      </div>

      <div class="demo-grid">
        <section class="panel">
          <h2>linkedSignal()</h2>
          <p>
            Crea estado writable que se reinicia cuando cambia su fuente. Es ideal para
            una seleccion actual dependiente de una lista filtrada.
          </p>

          <div class="segmented" aria-label="Categorias">
            @for (category of categories; track category) {
              <button
                type="button"
                [class.active]="selectedCategory() === category"
                (click)="selectedCategory.set(category)"
              >
                {{ category }}
              </button>
            }
          </div>

          <div class="option-grid">
            @for (product of visibleProducts(); track product.id) {
              <button
                type="button"
                class="option-card"
                [class.active]="selectedProduct()?.id === product.id"
                (click)="selectedProduct.set(product)"
              >
                <strong>{{ product.name }}</strong>
                <span>{{ product.score }} puntos</span>
              </button>
            }
          </div>

          <div class="actions">
            <button type="button" class="secondary" (click)="removeSelected()">Quitar seleccionado</button>
            <button type="button" class="secondary" (click)="resetProducts()">Reset</button>
          </div>
        </section>

        <aside class="panel state-panel" aria-label="Estado linkedSignal">
          <h2>Seleccion dependiente</h2>
          <p>
            Si la seleccion sigue existiendo tras cambiar el filtro, se conserva. Si ya no
            existe, <code>linkedSignal</code> elige el primer resultado disponible.
          </p>
          <pre>{{ linkedSignalSnapshot() | json }}</pre>
        </aside>
      </div>

      <section class="panel study-panel">
        <h2>Cuando usar cada pieza</h2>
        <div class="study-grid">
          @for (note of signalNotes; track note.api) {
            <article class="study-card">
              <h3>{{ note.api }}</h3>
              <p>{{ note.when }}</p>
              <pre>{{ note.example }}</pre>
            </article>
          }
        </div>
      </section>
    </section>
  `,
  styleUrl: './demo.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignalsDemo {
  readonly quantity = signal(1);
  readonly unitPrice = signal(29);
  readonly currency = signal<'EUR' | 'USD'>('EUR');
  readonly subtotal = computed(() => this.quantity() * this.unitPrice());
  readonly total = computed(() => Math.round(this.subtotal() * 1.21));
  readonly signalLog = signal<string[]>(['effect pendiente de quantity()']);

  private readonly cartOpenState = signal(false);
  readonly cartOpen = this.cartOpenState.asReadonly();

  readonly preferences = signal(
    {
      theme: 'light' as 'light' | 'dark',
      density: 'comfortable' as 'comfortable' | 'compact',
    },
    {
      equal: (a, b) => a.theme === b.theme && a.density === b.density,
    },
  );
  readonly preferenceEffectRuns = signal(0);

  readonly categories: Array<Product['category']> = ['forms', 'http', 'router'];

  readonly products = signal<Product[]>([
    { id: 1, name: 'Signal Forms', category: 'forms', score: 96 },
    { id: 2, name: 'compatForm', category: 'forms', score: 82 },
    { id: 3, name: 'httpResource', category: 'http', score: 91 },
    { id: 4, name: 'Functional interceptors', category: 'http', score: 88 },
    { id: 5, name: 'View Transitions', category: 'router', score: 89 },
    { id: 6, name: 'Lazy routes', category: 'router', score: 84 },
  ]);

  readonly selectedCategory = signal<Product['category']>('forms');

  readonly visibleProducts = computed(() =>
    this.products().filter((product) => product.category === this.selectedCategory()),
  );

  readonly selectedProduct = linkedSignal<Product[], Product | null>({
    source: () => this.visibleProducts(),
    computation: (products, previous?: { value: Product | null }) => {
      const previousProduct = previous?.value;

      if (previousProduct && products.some((product) => product.id === previousProduct.id)) {
        return previousProduct;
      }

      return products[0] ?? null;
    },
  });

  readonly linkedSignalSnapshot = computed(() => ({
    category: this.selectedCategory(),
    visibleIds: this.visibleProducts().map((product) => product.id),
    selected: this.selectedProduct(),
  }));

  readonly preferencesSnapshot = computed(() => ({
    preferences: this.preferences(),
    effectRuns: this.preferenceEffectRuns(),
  }));

  readonly signalNotes = [
    {
      api: 'signal()',
      when: 'Estado local mutable que el template debe observar.',
      example: `readonly quantity = signal(1);
quantity.set(3);
quantity.update(q => q + 1);`,
    },
    {
      api: 'computed()',
      when: 'Valores derivados. No uses otro signal writable para guardar algo calculable.',
      example: `readonly total = computed(() =>
  this.quantity() * this.unitPrice()
);`,
    },
    {
      api: 'effect()',
      when: 'Side effects: logs, localStorage, sincronizar APIs no reactivas. No para calcular estado derivado.',
      example: `effect(() => {
  localStorage.setItem('qty', String(this.quantity()));
});`,
    },
    {
      api: 'untracked()',
      when: 'Leer un signal dentro de un effect/computed sin convertirlo en dependencia.',
      example: `effect(() => {
  const qty = this.quantity();
  const currency = untracked(this.currency);
});`,
    },
    {
      api: 'asReadonly()',
      when: 'Exponer estado desde un servicio/componente sin permitir escrituras externas.',
      example: `private state = signal(false);
readonly open = this.state.asReadonly();`,
    },
    {
      api: 'linkedSignal()',
      when: 'Estado writable cuyo valor por defecto depende de otra fuente reactiva.',
      example: `selected = linkedSignal({
  source: () => this.visibleProducts(),
  computation: products => products[0] ?? null,
});`,
    },
    {
      api: 'input()',
      when: 'Inputs de componente expuestos como signals. Reemplaza muchos @Input() clasicos.',
      example: `readonly userId = input.required<string>();

readonly userUrl = computed(() =>
  '/api/users/' + this.userId()
);`,
    },
    {
      api: 'model()',
      when: 'Input writable con two-way binding. Util para componentes de formulario o controles propios.',
      example: `readonly value = model('');

// Padre:
<app-search [(value)]="query" />`,
    },
    {
      api: 'viewChild()',
      when: 'Queries como signals. Muy util junto a afterNextRender() para DOM real.',
      example: `readonly input =
  viewChild.required<ElementRef<HTMLInputElement>>('input');

afterNextRender({
  write: () => this.input().nativeElement.focus(),
});`,
    },
  ];

  constructor() {
    effect(() => {
      const quantity = this.quantity();
      const currency = untracked(this.currency);

      untracked(() => {
        this.signalLog.update((log) => [
          `effect: quantity=${quantity}, currency leida sin tracking=${currency}`,
          ...log,
        ].slice(0, 6));
      });
    });

    effect(() => {
      this.preferences();

      untracked(() => {
        this.preferenceEffectRuns.update((runs) => runs + 1);
      });
    });
  }

  toggleCurrency() {
    this.currency.update((currency) => (currency === 'EUR' ? 'USD' : 'EUR'));
  }

  toggleCart() {
    this.cartOpenState.update((open) => !open);
  }

  setSamePreferences() {
    this.preferences.set({ ...this.preferences() });
  }

  toggleDensity() {
    this.preferences.update((preferences) => ({
      ...preferences,
      density: preferences.density === 'comfortable' ? 'compact' : 'comfortable',
    }));
  }

  removeSelected() {
    const selected = this.selectedProduct();

    if (!selected) {
      return;
    }

    this.products.update((products) => products.filter((product) => product.id !== selected.id));
  }

  resetProducts() {
    this.products.set([
      { id: 1, name: 'Signal Forms', category: 'forms', score: 96 },
      { id: 2, name: 'compatForm', category: 'forms', score: 82 },
      { id: 3, name: 'httpResource', category: 'http', score: 91 },
      { id: 4, name: 'Functional interceptors', category: 'http', score: 88 },
      { id: 5, name: 'View Transitions', category: 'router', score: 89 },
      { id: 6, name: 'Lazy routes', category: 'router', score: 84 },
    ]);
  }
}

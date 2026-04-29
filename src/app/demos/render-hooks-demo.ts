import { JsonPipe } from '@angular/common';
import {
  afterNextRender,
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  signal,
  viewChild,
} from '@angular/core';

@Component({
  selector: 'app-render-hooks-demo',
  imports: [JsonPipe],
  template: `
    <section class="demo-page">
      <header class="page-header">
        <p class="eyebrow">Lifecycle</p>
        <h1>Render hooks</h1>
        <p>
          Son callbacks del ciclo de renderizado. No reemplazan todos los lifecycle
          hooks clasicos; reemplazan sobre todo hacks para esperar a que el DOM ya
          este pintado.
        </p>
      </header>

      <div class="demo-grid">
        <section class="panel form-panel">
          <h2>Ejemplo 1: focus despues de render</h2>
          <p>
            <code>afterNextRender()</code> espera a que el input exista en el DOM y
            entonces aplica focus una sola vez.
          </p>

          <label>
            Buscar
            <input #searchInput type="search" placeholder="Este input recibe focus al entrar" />
          </label>

          <h2>Ejemplo 2: slider + medicion DOM</h2>
          <p>
            El slider cambia un signal. Angular renderiza el ancho, y
            <code>afterRenderEffect()</code> lee el tamaño real despues del render.
          </p>

          <label>
            Ancho del div
            <input
              type="range"
              min="220"
              max="620"
              [value]="panelWidth()"
              (input)="setPanelWidth($event)"
            />
          </label>

          <div #measureBox class="measured-box" [style.width.px]="panelWidth()">
            Div medido despues del render
          </div>
        </section>

        <aside class="panel state-panel" aria-label="Mediciones render hooks">
          <h2>Eventos del hook</h2>
          <pre>{{ hookLog() | json }}</pre>
        </aside>
      </div>

      <section class="panel study-panel">
        <h2>Render hooks vs lifecycle clasico</h2>
        <div class="study-grid">
          @for (item of lifecycleNotes; track item.title) {
            <article class="study-card">
              <h3>{{ item.title }}</h3>
              <p>{{ item.description }}</p>
              <pre>{{ item.example }}</pre>
            </article>
          }
        </div>
      </section>

      <section class="panel study-panel">
        <h2>Fases y orden</h2>
        <p>
          Si separas fases, Angular ejecuta todos los hooks en este orden. La idea es
          evitar mezclar escrituras y lecturas del DOM de forma costosa.
        </p>

        <ol class="phase-list">
          @for (phase of renderPhases; track phase.name) {
            <li>
              <strong>{{ phase.name }}</strong>
              <span>{{ phase.description }}</span>
            </li>
          }
        </ol>

        <pre>{{ phaseExample }}</pre>
      </section>

      <section class="panel study-panel">
        <h2>Que reemplazan</h2>
        <div class="study-grid">
          @for (replacement of replacementNotes; track replacement.old) {
            <article class="study-card">
              <h3>{{ replacement.old }}</h3>
              <p>{{ replacement.problem }}</p>
              <p><strong>Usa:</strong> {{ replacement.use }}</p>
            </article>
          }
        </div>
      </section>

      <section class="panel study-panel">
        <h2>Cuando no usarlos</h2>
        <div class="study-grid">
          @for (rule of avoidRules; track rule.title) {
            <article class="study-card">
              <h3>{{ rule.title }}</h3>
              <p>{{ rule.description }}</p>
            </article>
          }
        </div>
      </section>
    </section>
  `,
  styleUrl: './demo.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RenderHooksDemo {
  private readonly searchInput = viewChild.required<ElementRef<HTMLInputElement>>('searchInput');
  private readonly measureBox = viewChild.required<ElementRef<HTMLElement>>('measureBox');

  readonly panelWidth = signal(360);
  readonly hookLog = signal<string[]>(['Esperando primer render...']);

  readonly lifecycleNotes = [
    {
      title: 'ngOnInit()',
      description: 'Prepara estado o configura datos que no dependen del DOM real.',
      example: `ngOnInit() {
  this.chartData.set(defaultData);
}`,
    },
    {
      title: 'ngAfterViewInit()',
      description: 'El ViewChild ya existe, pero no expresa "despues del render" ni fases read/write.',
      example: `ngAfterViewInit() {
  // input existe, pero focus aqui puede competir
  // con hydration, animaciones o renders siguientes.
}`,
    },
    {
      title: 'afterNextRender(): focus + chart',
      description: 'Corre una vez despues del proximo render. Ideal para focus inicial o crear una libreria externa.',
      example: `<input #searchInput />
<canvas #chartCanvas></canvas>

private searchInput =
  viewChild.required<ElementRef<HTMLInputElement>>('searchInput');
private chartCanvas =
  viewChild.required<ElementRef<HTMLCanvasElement>>('chartCanvas');

private chart?: Chart;

constructor() {
  afterNextRender({
    write: () => {
      this.searchInput().nativeElement.focus();

      this.chart = new Chart(
        this.chartCanvas().nativeElement,
        chartConfig,
      );
    },
  });
}`,
    },
    {
      title: 'afterRenderEffect()',
      description: 'Efecto reactivo posterior al render. Ideal para actualizar un chart externo cuando cambian signals.',
      example: `readonly chartData = signal([10, 20, 30]);

constructor() {
  afterRenderEffect({
    write: () => this.chart?.update(this.chartData()),
    read: () => this.chartHost().nativeElement.getBoundingClientRect(),
  });
}`,
    },
    {
      title: 'write/read',
      description: 'Escribe primero y lee despues para evitar mezclar cambios de DOM con mediciones.',
      example: `afterRenderEffect({
  write: () => {
    host.style.width = this.width() + 'px';
  },
  read: () => {
    return host.getBoundingClientRect().width;
  },
});`,
    },
  ];

  readonly renderPhases = [
    {
      name: '1. earlyRead',
      description: 'Lee layout antes de escribir. Usalo poco; puede ser necesario para calculos previos.',
    },
    {
      name: '2. write',
      description: 'Escribe en el DOM: style, scroll, focus, actualizar una libreria visual.',
    },
    {
      name: '3. mixedReadWrite',
      description: 'Lee y escribe mezclado. Es comodo, pero menos recomendable para rendimiento.',
    },
    {
      name: '4. read',
      description: 'Lee el resultado final: getBoundingClientRect, offsetHeight, scrollHeight.',
    },
  ];

  readonly phaseExample = `afterRenderEffect({
  write: () => {
    chart.update(this.chartData(), this.chartMode());
    return this.chartData().length;
  },
  read: (count) => {
    console.log('barras renderizadas', count());
  },
});`;

  readonly replacementNotes = [
    {
      old: 'setTimeout(...)',
      problem: 'Ejemplo viejo: setTimeout(() => input.focus()). Espera por tiempo, no por render real.',
      use: 'afterNextRender({ write: () => input.focus() })',
    },
    {
      old: 'NgZone.onStable',
      problem: 'Ejemplo viejo: zone.onStable.pipe(take(1)).subscribe(() => initChart()). En zoneless pierde sentido.',
      use: 'afterNextRender({ write: () => chart = new Chart(...) })',
    },
    {
      old: 'ngAfterViewChecked',
      problem: 'Ejemplo viejo: revisar en cada check si cambio chartData para actualizar el chart.',
      use: 'afterRenderEffect({ write: () => chart.update(chartData()) })',
    },
    {
      old: 'MutationObserver innecesario',
      problem: 'Ejemplo viejo: observar barras del chart para medir altura. Angular ya sabe cuando cambian los datos.',
      use: 'afterRenderEffect({ read: () => chartHost.getBoundingClientRect() })',
    },
  ];

  readonly avoidRules = [
    {
      title: 'No para estado derivado',
      description: 'Si puedes calcular un valor con computed(), usa computed().',
    },
    {
      title: 'No para HTTP',
      description: 'Para datos async usa resource(), httpResource(), rxResource() o servicios.',
    },
    {
      title: 'No para validar formularios',
      description: 'Las validaciones pertenecen al schema de Signal Forms o a Reactive Forms.',
    },
    {
      title: 'No como parche general',
      description: 'Si no necesitas DOM real ya renderizado, probablemente no necesitas render hooks.',
    },
  ];

  constructor() {
    afterNextRender({
      write: () => {
        this.searchInput().nativeElement.focus();
        this.addLog('afterNextRender: focus aplicado al input');
      },
    });

    afterRenderEffect({
      write: () => {
        const width = this.panelWidth();
        const element = this.measureBox().nativeElement;

        element.style.borderWidth = width > 480 ? '5px' : '2px';

        this.addLog(`write: borde ajustado para ${width}px`);
        return width;
      },
      read: (width) => {
        const rect = this.measureBox().nativeElement.getBoundingClientRect();
        this.addLog(`read: signal ${width()}px -> DOM ${Math.round(rect.width)}px`);
      },
    });
  }

  setPanelWidth(event: Event) {
    const input = event.target as HTMLInputElement;
    this.panelWidth.set(Number(input.value));
  }

  private addLog(message: string) {
    this.hookLog.update((log) => [message, ...log].slice(0, 8));
  }
}

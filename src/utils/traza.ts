import { ElementoPresupuestario, GrupoPresupuestario, PartidaPresupuestaria, moneda } from '../domain';
import type { NombreClase } from './arbol';

interface EventoBase {
  prof: number;
  clase: NombreClase;
  el: ElementoPresupuestario;
  codigo: string;
  descripcion: string;
  hijos: number;
}

export type EventoTraza =
  | (EventoBase & { tipo: 'entra' })
  | (EventoBase & { tipo: 'sale'; valor: number });

/*
 * Registra las llamadas reales a calcularValorTotal() envolviendo
 * temporalmente el método en cada clase. Al terminar restaura los originales.
 * Devuelve una lista de eventos 'entra' / 'sale' con su profundidad.
 */
export function trazar(elemento: ElementoPresupuestario): EventoTraza[] {
  const eventos: EventoTraza[] = [];
  let prof = 0;

  const objetivos: Array<[NombreClase, { prototype: ElementoPresupuestario }]> = [
    ['PartidaPresupuestaria', PartidaPresupuestaria],
    ['GrupoPresupuestario', GrupoPresupuestario]
  ];
  const originales = objetivos.map(([, c]) => c.prototype.calcularValorTotal);

  objetivos.forEach(([nombre, c], i) => {
    c.prototype.calcularValorTotal = function (this: ElementoPresupuestario): number {
      const base: EventoBase = {
        prof,
        clase: nombre,
        el: this,
        codigo: this.getCodigo(),
        descripcion: this.getDescripcion(),
        hijos: this instanceof GrupoPresupuestario ? this.getElementos().length : 0
      };
      eventos.push({ ...base, tipo: 'entra' });
      prof++;
      const valor = originales[i].call(this);
      prof--;
      eventos.push({ ...base, tipo: 'sale', valor });
      return valor;
    };
  });

  try {
    elemento.calcularValorTotal();
  } finally {
    objetivos.forEach(([, c], i) => {
      c.prototype.calcularValorTotal = originales[i];
    });
  }
  return eventos;
}

export function narrar(ev: EventoTraza | undefined): string {
  if (!ev) return '';
  const grupo = ev.clase === 'GrupoPresupuestario';

  if (ev.tipo === 'entra') {
    if (grupo && ev.hijos === 0) {
      return `Se llama a calcularValorTotal() del grupo "${ev.descripcion}". Está vacío, así que no hay a quién delegar.`;
    }
    return grupo
      ? `Se llama a calcularValorTotal() del grupo "${ev.descripcion}". Delega en sus ${ev.hijos} elementos, sean partidas u otros grupos, sin preguntar de qué tipo son.`
      : `Se llama a calcularValorTotal() de la partida "${ev.descripcion}". No tiene hijos: responde con su propio valor asignado.`;
  }

  if (grupo) {
    return ev.hijos === 0
      ? `El grupo vacío devuelve ${moneda(ev.valor)}.`
      : `El grupo recibió ${ev.hijos} respuestas y devuelve su suma: ${moneda(ev.valor)}. Quien lo llamó recibe un número y no sabe cómo se calculó.`;
  }
  return `La partida devuelve ${moneda(ev.valor)} y la ejecución vuelve a quien la llamó.`;
}

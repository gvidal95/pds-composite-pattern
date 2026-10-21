import { ElementoPresupuestario } from './ElementoPresupuestario';
import { moneda, redondear } from './formato';

// Composite: contiene partidas u otros grupos y reenvía las operaciones a cada uno.
export class GrupoPresupuestario extends ElementoPresupuestario {
  private elementos: ElementoPresupuestario[] = [];

  constructor(codigo: string, descripcion: string) {
    super(codigo, descripcion);
  }

  agregar(elemento: ElementoPresupuestario): void {
    if (elemento === this) throw new Error('Un grupo no puede contenerse a sí mismo');
    this.elementos.push(elemento);
  }

  eliminar(elemento: ElementoPresupuestario): void {
    this.elementos = this.elementos.filter((e) => e !== elemento);
  }

  getElementos(): ElementoPresupuestario[] {
    return [...this.elementos];
  }

  // Delega en cada hijo sin saber si es partida o grupo.
  calcularValorTotal(): number {
    const suma = this.elementos.reduce((acc, e) => acc + e.calcularValorTotal(), 0);
    return redondear(suma);
  }

  mostrarEstructura(nivel: number = 0): string {
    const sangria = '    '.repeat(nivel);
    const cabecera = `${sangria}+ [${this.codigo}] ${this.descripcion}  ${moneda(this.calcularValorTotal())}`;
    const hijos = this.elementos.map((e) => e.mostrarEstructura(nivel + 1));
    return [cabecera, ...hijos].join('\n');
  }
}

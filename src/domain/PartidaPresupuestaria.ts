import { ElementoPresupuestario } from './ElementoPresupuestario';
import { moneda } from './formato';

// Leaf: elemento sin hijos.
export class PartidaPresupuestaria extends ElementoPresupuestario {
  private valorAsignado: number;

  constructor(codigo: string, descripcion: string, valorAsignado: number) {
    super(codigo, descripcion);
    this.valorAsignado = valorAsignado;
  }

  getValorAsignado(): number {
    return this.valorAsignado;
  }

  // No delega en nadie: el total es su valor asignado.
  calcularValorTotal(): number {
    return this.valorAsignado;
  }

  mostrarEstructura(nivel: number = 0): string {
    const sangria = '    '.repeat(nivel);
    return `${sangria}- [${this.codigo}] ${this.descripcion}  ${moneda(this.valorAsignado)}`;
  }
}

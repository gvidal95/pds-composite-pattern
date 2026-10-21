import type { ElementoPresupuestario } from './ElementoPresupuestario';

// Client: solo conoce ElementoPresupuestario.
// No hay instanceof ni if por tipo en ninguno de sus métodos.
export class ServicioPresupuesto {
  consultarValorTotal(elemento: ElementoPresupuestario): number {
    return elemento.calcularValorTotal();
  }

  generarReporte(elemento: ElementoPresupuestario): string {
    return elemento.mostrarEstructura(0);
  }
}

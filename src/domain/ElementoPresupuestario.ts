// Component: la abstracción común que ve el cliente.
export abstract class ElementoPresupuestario {
  protected codigo: string;
  protected descripcion: string;

  // Constructor protegido, como en el diagrama (#ElementoPresupuestario).
  protected constructor(codigo: string, descripcion: string) {
    this.codigo = codigo;
    this.descripcion = descripcion;
  }

  getCodigo(): string {
    return this.codigo;
  }

  getDescripcion(): string {
    return this.descripcion;
  }

  // Operaciones abstractas: cada subclase decide cómo responder.
  abstract calcularValorTotal(): number;

  abstract mostrarEstructura(nivel: number): string;
}

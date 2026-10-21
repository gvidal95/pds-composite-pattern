import { ElementoPresupuestario, GrupoPresupuestario, PartidaPresupuestaria } from '../domain';

/*
 * Utilidades del EDITOR de la aplicación, no del cliente del patrón.
 * Recorren el árbol para armarlo y modificarlo; ServicioPresupuesto no las usa.
 */

export type NombreClase = 'ElementoPresupuestario' | 'PartidaPresupuestaria' | 'GrupoPresupuestario';

export type Visitante = (el: ElementoPresupuestario, padre: GrupoPresupuestario | null) => void;

export function recorrer(
  el: ElementoPresupuestario,
  fn: Visitante,
  padre: GrupoPresupuestario | null = null
): void {
  fn(el, padre);
  if (el instanceof GrupoPresupuestario) {
    el.getElementos().forEach((h) => recorrer(h, fn, el));
  }
}

export function buscarPadre(
  raiz: ElementoPresupuestario,
  objetivo: ElementoPresupuestario
): GrupoPresupuestario | null {
  let encontrado: GrupoPresupuestario | null = null;
  recorrer(raiz, (e, pa) => {
    if (e === objetivo) encontrado = pa;
  });
  return encontrado;
}

export function buscarPorCodigo(
  raiz: ElementoPresupuestario,
  codigo: string
): ElementoPresupuestario | null {
  let encontrado: ElementoPresupuestario | null = null;
  recorrer(raiz, (e) => {
    if (e.getCodigo().toLowerCase() === codigo.toLowerCase()) encontrado = e;
  });
  return encontrado;
}

// Solo usa la API pública del diagrama (getElementos, eliminar, agregar) y conserva el orden.
export function reemplazar(
  padre: GrupoPresupuestario,
  viejo: ElementoPresupuestario,
  nuevo: ElementoPresupuestario
): void {
  const lista = padre.getElementos();
  lista.forEach((e) => padre.eliminar(e));
  lista.map((e) => (e === viejo ? nuevo : e)).forEach((e) => padre.agregar(e));
}

// Nombre legible de la clase real. No usa constructor.name para sobrevivir a la minificación.
export function nombreClase(el: ElementoPresupuestario): NombreClase {
  if (el instanceof GrupoPresupuestario) return 'GrupoPresupuestario';
  if (el instanceof PartidaPresupuestaria) return 'PartidaPresupuestaria';
  return 'ElementoPresupuestario';
}

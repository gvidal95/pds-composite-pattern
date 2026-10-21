import { describe, expect, it } from 'vitest';
import {
  ElementoPresupuestario,
  GrupoPresupuestario,
  PartidaPresupuestaria,
  ServicioPresupuesto
} from '../src/domain';
import { crearPresupuesto } from '../src/domain/ejemplo';
import { buscarPadre, buscarPorCodigo } from '../src/utils/arbol';
import { trazar } from '../src/utils/traza';

const servicio = new ServicioPresupuesto();

describe('PartidaPresupuestaria (Leaf)', () => {
  it('devuelve su valor asignado como total', () => {
    const p = new PartidaPresupuestaria('P1', 'Servidores', 54000);
    expect(p.getCodigo()).toBe('P1');
    expect(p.getDescripcion()).toBe('Servidores');
    expect(servicio.consultarValorTotal(p)).toBe(54000);
  });

  it('es un ElementoPresupuestario', () => {
    expect(new PartidaPresupuestaria('P', 'p', 1)).toBeInstanceOf(ElementoPresupuestario);
    expect(new GrupoPresupuestario('G', 'g')).toBeInstanceOf(ElementoPresupuestario);
  });
});

describe('GrupoPresupuestario (Composite)', () => {
  it('un grupo vacío vale cero', () => {
    expect(new GrupoPresupuestario('G', 'vacío').calcularValorTotal()).toBe(0);
  });

  it('suma partidas y grupos anidados de varios niveles', () => {
    const raiz = crearPresupuesto();
    // TI = 38500 + (54000 + 27500 + (12400 + 8600)) + 22000 = 163000 ; TH = 129000
    expect(servicio.consultarValorTotal(raiz)).toBe(292000);
    const ti = buscarPorCodigo(raiz, 'TI');
    expect(ti).not.toBeNull();
    expect(servicio.consultarValorTotal(ti as ElementoPresupuestario)).toBe(163000);
  });

  it('redondea a centavos para evitar errores de coma flotante', () => {
    const g = new GrupoPresupuestario('G', 'g');
    g.agregar(new PartidaPresupuestaria('A', 'a', 0.1));
    g.agregar(new PartidaPresupuestaria('B', 'b', 0.2));
    expect(g.calcularValorTotal()).toBe(0.3);
  });

  it('agregar y eliminar modifican el total', () => {
    const g = new GrupoPresupuestario('G', 'g');
    const p = new PartidaPresupuestaria('A', 'a', 100);
    g.agregar(p);
    expect(g.calcularValorTotal()).toBe(100);
    g.eliminar(p);
    expect(g.calcularValorTotal()).toBe(0);
  });

  it('no puede contenerse a sí mismo', () => {
    const g = new GrupoPresupuestario('G', 'g');
    expect(() => g.agregar(g)).toThrow();
  });

  it('getElementos devuelve una copia que no altera el grupo', () => {
    const g = new GrupoPresupuestario('G', 'g');
    g.agregar(new PartidaPresupuestaria('A', 'a', 1));
    g.getElementos().pop();
    expect(g.getElementos()).toHaveLength(1);
  });

  it('mostrarEstructura indenta por nivel', () => {
    const g = new GrupoPresupuestario('G', 'Raíz');
    const h = new GrupoPresupuestario('H', 'Hijo');
    h.agregar(new PartidaPresupuestaria('P', 'Hoja', 10));
    g.agregar(h);
    const lineas = servicio.generarReporte(g).split('\n');
    expect(lineas).toHaveLength(3);
    expect(lineas[0]).toMatch(/^\+ \[G\]/);
    expect(lineas[1]).toMatch(/^ {4}\+ \[H\]/);
    expect(lineas[2]).toMatch(/^ {8}- \[P\]/);
  });
});

describe('Extensibilidad', () => {
  it('una subclase nueva funciona sin tocar el grupo ni el cliente', () => {
    class PartidaConIva extends ElementoPresupuestario {
      private base: number;
      constructor(codigo: string, descripcion: string, base: number) {
        super(codigo, descripcion);
        this.base = base;
      }
      calcularValorTotal(): number {
        return this.base * 1.15;
      }
      mostrarEstructura(nivel: number = 0): string {
        return '    '.repeat(nivel) + `~ [${this.codigo}] con IVA`;
      }
    }
    const g = new GrupoPresupuestario('G', 'g');
    g.agregar(new PartidaConIva('X', 'x', 100));
    g.agregar(new PartidaPresupuestaria('Y', 'y', 50));
    expect(servicio.consultarValorTotal(g)).toBe(165);
  });
});

describe('Utilidades del editor', () => {
  it('buscarPadre encuentra el grupo contenedor', () => {
    const raiz = crearPresupuesto();
    const infra = buscarPorCodigo(raiz, 'TI-INF') as ElementoPresupuestario;
    const padre = buscarPadre(raiz, infra);
    expect(padre?.getCodigo()).toBe('TI');
    expect(buscarPadre(raiz, raiz)).toBeNull();
  });

  it('trazar registra las llamadas reales y restaura los métodos', () => {
    const raiz = crearPresupuesto();
    const infra = buscarPorCodigo(raiz, 'TI-INF') as ElementoPresupuestario;
    const antes = GrupoPresupuestario.prototype.calcularValorTotal;
    const eventos = trazar(infra);
    // 3 grupos... INF + COM = 2 grupos y 4 partidas = 6 llamadas, 12 eventos
    expect(eventos).toHaveLength(12);
    expect(eventos[0]).toMatchObject({ tipo: 'entra', clase: 'GrupoPresupuestario', codigo: 'TI-INF', prof: 0 });
    const ultimo = eventos[eventos.length - 1];
    expect(ultimo.tipo).toBe('sale');
    if (ultimo.tipo === 'sale') expect(ultimo.valor).toBe(infra.calcularValorTotal());
    expect(GrupoPresupuestario.prototype.calcularValorTotal).toBe(antes);
  });
});

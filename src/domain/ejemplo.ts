import { GrupoPresupuestario } from './GrupoPresupuestario';
import { PartidaPresupuestaria } from './PartidaPresupuestaria';

// Datos de ejemplo basados en el Escenario 01.
export function crearPresupuesto(): GrupoPresupuestario {
  const raiz = new GrupoPresupuestario('PRES', 'Presupuesto institucional 2026');

  const ti = new GrupoPresupuestario('TI', 'Tecnologías de la Información');
  const infra = new GrupoPresupuestario('TI-INF', 'Infraestructura');
  const com = new GrupoPresupuestario('INF-COM', 'Comunicaciones');

  com.agregar(new PartidaPresupuestaria('COM-RED', 'Equipos de red', 12400));
  com.agregar(new PartidaPresupuestaria('COM-ENL', 'Enlaces de datos', 8600));

  infra.agregar(new PartidaPresupuestaria('INF-SRV', 'Servidores', 54000));
  infra.agregar(new PartidaPresupuestaria('INF-ALM', 'Almacenamiento', 27500));
  infra.agregar(com);

  ti.agregar(new PartidaPresupuestaria('TI-LIC', 'Licenciamiento', 38500));
  ti.agregar(infra);
  ti.agregar(new PartidaPresupuestaria('TI-SER', 'Servicios', 22000));

  const th = new GrupoPresupuestario('TH', 'Talento Humano');
  th.agregar(new PartidaPresupuestaria('TH-REM', 'Remuneraciones', 120000));
  th.agregar(new PartidaPresupuestaria('TH-CAP', 'Capacitación', 9000));

  raiz.agregar(ti);
  raiz.agregar(th);
  return raiz;
}

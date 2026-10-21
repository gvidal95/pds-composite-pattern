// Los archivos reales del dominio, importados como texto (?raw) para mostrarlos tal cual.
import srcElemento from '../domain/ElementoPresupuestario.ts?raw';
import srcPartida from '../domain/PartidaPresupuestaria.ts?raw';
import srcGrupo from '../domain/GrupoPresupuestario.ts?raw';
import srcServicio from '../domain/ServicioPresupuesto.ts?raw';
import Codigo from './Codigo';
import Copiar from './Copiar';

const FUENTES: ReadonlyArray<readonly [string, string, string]> = [
  ['ElementoPresupuestario.ts', 'Component · clase abstracta', srcElemento],
  ['PartidaPresupuestaria.ts', 'Leaf', srcPartida],
  ['GrupoPresupuestario.ts', 'Composite', srcGrupo],
  ['ServicioPresupuesto.ts', 'Client', srcServicio]
];

const USO = `import {
  GrupoPresupuestario,
  PartidaPresupuestaria,
  ServicioPresupuesto
} from './src/domain';

const presupuesto = new GrupoPresupuestario('PRES', 'Presupuesto 2026');
const ti = new GrupoPresupuestario('TI', 'Tecnologías de la Información');
const infra = new GrupoPresupuestario('TI-INF', 'Infraestructura');

infra.agregar(new PartidaPresupuestaria('INF-SRV', 'Servidores', 54000));
infra.agregar(new PartidaPresupuestaria('INF-ALM', 'Almacenamiento', 27500));
ti.agregar(new PartidaPresupuestaria('TI-LIC', 'Licenciamiento', 38500));
ti.agregar(infra);            // un grupo dentro de un grupo
presupuesto.agregar(ti);

const servicio = new ServicioPresupuesto();
servicio.consultarValorTotal(presupuesto);  // 120000
console.log(servicio.generarReporte(infra));`;

export default function CodigoTab() {
  return (
    <div>
      <section className="sec">
        <h2>Las clases del diagrama en TypeScript</h2>
        <p>
          Estos son los archivos de <code>src/domain/</code>, tal como los ejecuta el simulador. Para formatear dinero
          usan <code>moneda()</code> y para redondear <code>redondear()</code>, definidas en <code>formato.ts</code>.
        </p>
      </section>

      {FUENTES.map(([nombre, rol, src]) => (
        <section className="sec" key={nombre}>
          <div className="bloque-cab">
            <span className="nombre">{nombre}</span>
            <span className="rol">{rol}</span>
            <Copiar texto={src} />
          </div>
          <Codigo src={src} />
        </section>
      ))}

      <section className="sec">
        <div className="bloque-cab">
          <span className="nombre">Ejemplo de uso</span>
          <span className="rol">Armar el árbol y consultarlo</span>
          <Copiar texto={USO} />
        </div>
        <Codigo src={USO} />
      </section>
    </div>
  );
}

import Codigo from './Codigo';
import Diagrama from './Diagrama';

const SIN_COMPOSITE = `function calcularTotal(nodo: Nodo): number {
  if (nodo.tipo === 'partida') {
    return nodo.valorAsignado;
  }
  if (nodo.tipo === 'grupo') {
    let suma = 0;
    for (const hijo of nodo.hijos) {
      suma += calcularTotal(hijo);
    }
    return suma;
  }
  // Un nuevo tipo de nodo obliga a volver
  // a editar esta función y todas sus gemelas
  // (mostrar, buscar, exportar...).
}`;

const CON_COMPOSITE = `function calcularTotal(elemento: ElementoPresupuestario): number {
  return elemento.calcularValorTotal();
}

// Funciona igual con una partida, un grupo,
// un grupo dentro de un grupo, o una clase
// que todavía no existe y herede de
// ElementoPresupuestario.`;

const ROLES: ReadonlyArray<readonly [string, string, string]> = [
  ['Component', 'ElementoPresupuestario', 'Declara lo que se puede hacer con cualquier elemento: getCodigo(), getDescripcion(), calcularValorTotal() y mostrarEstructura(). Es el único tipo que conoce el cliente.'],
  ['Leaf', 'PartidaPresupuestaria', 'Elemento sin hijos. Su total es directamente su valorAsignado. Es donde termina la recursión.'],
  ['Composite', 'GrupoPresupuestario', 'Guarda una lista de ElementoPresupuestario y reenvía las operaciones a cada uno. Su total es la suma de los totales de sus hijos, que pueden ser partidas u otros grupos.'],
  ['Client', 'ServicioPresupuesto', 'Consulta totales y genera reportes usando solo ElementoPresupuestario. No contiene ningún if por tipo.']
];

interface PatronProps {
  ir: () => void;
}

export default function Patron({ ir }: PatronProps) {
  return (
    <div>
      <section className="sec">
        <h2>La idea en una frase</h2>
        <p>
          Composite permite tratar de la misma manera a un objeto individual y a un conjunto de objetos. Aquí, una partida
          y un grupo de partidas responden a las mismas preguntas: cuál es tu código, cuánto suman y cómo te muestras.
        </p>
      </section>

      <section className="sec">
        <h2>El problema que resuelve</h2>
        <p>
          Sin una abstracción común, cada función que recorre el presupuesto tiene que preguntar qué clase de elemento
          tiene delante. Con Composite, esa pregunta desaparece del cliente porque cada clase sabe responder por sí misma.
        </p>
        <div className="cmp">
          <div><span className="cap mal">Sin Composite</span><Codigo src={SIN_COMPOSITE} /></div>
          <div><span className="cap bien">Con Composite</span><Codigo src={CON_COMPOSITE} /></div>
        </div>
      </section>

      <section className="sec">
        <h2>Quién es quién</h2>
        <div className="card scroll-x" style={{ padding: 0 }}>
          <table className="tbl">
            <thead>
              <tr><th>Rol en el patrón</th><th>Clase del diagrama</th><th>Responsabilidad</th></tr>
            </thead>
            <tbody>
              {ROLES.map((r) => (
                <tr key={r[0]}>
                  <td><strong>{r[0]}</strong></td>
                  <td><code>{r[1]}</code></td>
                  <td>{r[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="sec">
        <h2>El diagrama de clases</h2>
        <p>
          Dos relaciones sostienen todo: la herencia, que hace que partidas y grupos sean intercambiables, y la
          composición, que permite que un grupo contenga elementos que a su vez pueden ser grupos.
        </p>
        <div className="card dg-wrap"><Diagrama /></div>
        <p className="nota">
          Versión simplificada del diagrama de la solución: se omiten los tipos de retorno de algunos métodos. Los
          nombres en cursiva son abstractos.
        </p>
      </section>

      <section className="sec">
        <h2>Pruébalo en el simulador</h2>
        <ol className="lista">
          <li>Selecciona una partida y reproduce la traza. Hay una sola llamada, porque la hoja responde directamente.</li>
          <li>Selecciona <code>TI-INF</code>. Verás la recursión bajar por <code>INF-COM</code> y volver sumando.</li>
          <li>
            Agrega un grupo dentro de <code>INF-COM</code> y una partida dentro de ese grupo. Los totales de todos los
            ancestros cambian y <code>ServicioPresupuesto</code> sigue siendo el mismo código.
          </li>
          <li>Selecciona una partida y observa que no se puede agregar nada: <code>agregar()</code> solo existe en el grupo.</li>
        </ol>
        <div><button type="button" className="btn pri" onClick={ir}>Abrir el simulador</button></div>
      </section>

      <section className="sec">
        <h2>Decisiones y costos</h2>
        <ol className="lista">
          <li>
            <strong>Seguridad frente a transparencia.</strong> En el diagrama, agregar() y eliminar() están solo en
            GrupoPresupuestario. Así una partida nunca recibe un agregar() sin sentido, y en TypeScript el compilador lo
            impide, pero el código que arma el árbol debe saber que trabaja con un grupo. La variante transparente los
            declara en el componente y hace que la partida lance una excepción.
          </li>
          <li>
            <strong>Abierto a extensión.</strong> Un nuevo nivel de agrupación es una instancia más de
            GrupoPresupuestario. Un nuevo tipo de elemento es una nueva subclase. En ambos casos el cliente no se modifica.
          </li>
          <li>
            <strong>Demasiado general.</strong> Nada impide que un grupo contenga cualquier elemento. Si se necesitara una
            regla como "un grupo solo contiene partidas del mismo ejercicio", habría que comprobarla en agregar().
          </li>
          <li>
            <strong>Ciclos.</strong> Si un grupo llegara a contenerse a sí mismo, directa o indirectamente, la recursión no
            terminaría. La implementación bloquea el caso directo en agregar().
          </li>
          <li>
            <strong>Dinero.</strong> El diagrama usa BigDecimal. Aquí se redondea a centavos con el tipo number; para un
            sistema real conviene usar enteros en centavos o una librería decimal.
          </li>
        </ol>
      </section>
    </div>
  );
}

interface Metodo {
  t: string;
  i?: boolean;
}

interface CajaProps {
  x: number;
  y: number;
  w: number;
  cls: 'n' | 'p' | 'g';
  tag: string;
  estereo?: string;
  nombre: string;
  cursiva?: boolean;
  attrs: string[];
  metodos: Metodo[];
}

function Caja({ x, y, w, cls, tag, estereo, nombre, cursiva, attrs, metodos }: CajaProps) {
  const hh = estereo ? 48 : 30;
  const ah = attrs.length ? attrs.length * 18 + 12 : 0;
  const yNombre = estereo ? y + 38 : y + 20;
  const h = hh + ah + metodos.length * 18 + 12;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="6" className={'bx ' + cls} />
      {estereo && <text x={x + 12} y={y + 19} className="i">{estereo}</text>}
      <text x={x + 12} y={yNombre} className={'t' + (cursiva ? ' i' : '')}>{nombre}</text>
      <text x={x + w - 10} y={y + 19} textAnchor="end" className="tag">{tag}</text>
      <line x1={x} x2={x + w} y1={y + hh} y2={y + hh} className="dv" />
      {attrs.map((a, i) => (
        <text key={a} x={x + 12} y={y + hh + 6 + i * 18 + 13}>{a}</text>
      ))}
      {ah > 0 && <line x1={x} x2={x + w} y1={y + hh + ah} y2={y + hh + ah} className="dv" />}
      {metodos.map((m, i) => (
        <text key={m.t} x={x + 12} y={y + hh + ah + 6 + i * 18 + 13} className={m.i ? 'i' : ''}>{m.t}</text>
      ))}
    </g>
  );
}

export default function Diagrama() {
  return (
    <svg
      className="dg"
      viewBox="0 0 780 446"
      role="img"
      aria-label="Diagrama de clases del patrón Composite: ServicioPresupuesto usa ElementoPresupuestario; PartidaPresupuestaria y GrupoPresupuestario heredan de ella; GrupoPresupuestario contiene cero o más ElementoPresupuestario."
    >
      <defs>
        <marker id="tri" viewBox="0 0 14 14" refX="13" refY="7" markerWidth="14" markerHeight="14" markerUnits="userSpaceOnUse" orient="auto">
          <path d="M1,1 L13,7 L1,13 Z" className="m-hueco" />
        </marker>
        <marker id="dia" viewBox="0 0 14 14" refX="14" refY="7" markerWidth="14" markerHeight="14" markerUnits="userSpaceOnUse" orient="auto">
          <path d="M0,7 L7,1 L14,7 L7,13 Z" className="m-lleno" />
        </marker>
        <marker id="uso" viewBox="0 0 14 14" refX="12" refY="7" markerWidth="14" markerHeight="14" markerUnits="userSpaceOnUse" orient="auto">
          <path d="M1,2 L12,7 L1,12" className="m-abierto" />
        </marker>
      </defs>

      {/* dependencia: cliente usa al componente */}
      <line x1="266" y1="72" x2="330" y2="72" className="ln-d" markerEnd="url(#uso)" />
      <text x="278" y="64" className="lbl">«use»</text>

      {/* herencia: hoja y compuesto extienden al componente */}
      <path d="M166,268 L166,236 L470,236" className="ln-s" />
      <line x1="470" y1="268" x2="470" y2="204" className="ln-s" markerEnd="url(#tri)" />

      {/* composición: un grupo contiene 0..* elementos */}
      <line x1="690" y1="204" x2="690" y2="268" className="ln-s" markerEnd="url(#dia)" />
      <text x="698" y="224" className="lbl">0..*</text>
      <text x="698" y="244" className="lbl">elementos</text>
      <text x="698" y="256" className="lbl">1</text>

      <Caja
        x={16} y={24} w={250} cls="n" tag="CLIENT" estereo="«cliente»" nombre="ServicioPresupuesto" attrs={[]}
        metodos={[{ t: '+consultarValorTotal(elemento)' }, { t: '+generarReporte(elemento)' }]}
      />
      <Caja
        x={330} y={24} w={434} cls="n" tag="COMPONENT" estereo="«abstract»" nombre="ElementoPresupuestario" cursiva
        attrs={['#codigo: String', '#descripcion: String']}
        metodos={[
          { t: '+getCodigo(): String' },
          { t: '+getDescripcion(): String' },
          { t: '+calcularValorTotal(): BigDecimal', i: true },
          { t: '+mostrarEstructura(nivel): String', i: true }
        ]}
      />
      <Caja
        x={16} y={268} w={300} cls="p" tag="LEAF" nombre="PartidaPresupuestaria"
        attrs={['-valorAsignado: BigDecimal']}
        metodos={[{ t: '+getValorAsignado()' }, { t: '+calcularValorTotal()' }, { t: '+mostrarEstructura(nivel)' }]}
      />
      <Caja
        x={400} y={268} w={364} cls="g" tag="COMPOSITE" nombre="GrupoPresupuestario"
        attrs={['-elementos: List<ElementoPresupuestario>']}
        metodos={[
          { t: '+agregar(elemento)' },
          { t: '+eliminar(elemento)' },
          { t: '+getElementos()' },
          { t: '+calcularValorTotal()' },
          { t: '+mostrarEstructura(nivel)' }
        ]}
      />
    </svg>
  );
}

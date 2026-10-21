import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ElementoPresupuestario,
  GrupoPresupuestario,
  PartidaPresupuestaria,
  ServicioPresupuesto,
  moneda,
  redondear
} from '../domain';
import { crearPresupuesto } from '../domain/ejemplo';
import { buscarPadre, buscarPorCodigo, nombreClase, reemplazar } from '../utils/arbol';
import { narrar, trazar } from '../utils/traza';
import Nodo from './Nodo';
import ValorEditor from './ValorEditor';
import Codigo from './Codigo';

type TipoNuevo = 'partida' | 'grupo';

interface SimuladorProps {
  onReset: () => void;
}

export default function Simulador({ onReset }: SimuladorProps) {
  const [raiz] = useState<GrupoPresupuestario>(crearPresupuesto);
  const servicio = useMemo(() => new ServicioPresupuesto(), []);
  const [version, setVersion] = useState(0);
  const bump = () => setVersion((v) => v + 1);

  const [sel, setSel] = useState<ElementoPresupuestario>(() => buscarPorCodigo(raiz, 'TI-INF') ?? raiz);
  const [cerrados, setCerrados] = useState<Set<ElementoPresupuestario>>(() => new Set());
  const toggle = (el: ElementoPresupuestario) =>
    setCerrados((prev) => {
      const s = new Set(prev);
      if (s.has(el)) s.delete(el); else s.add(el);
      return s;
    });

  /* ---- traza paso a paso ---- */
  // `version` fuerza a recalcular la traza cuando el árbol cambia por mutación.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const trace = useMemo(() => trazar(sel), [sel, version]);
  const [paso, setPaso] = useState(9999);
  const [play, setPlay] = useState(false);
  useEffect(() => { setPaso(9999); setPlay(false); }, [trace]);

  const n = trace.length;
  const p = Math.min(paso, n - 1);

  useEffect(() => {
    if (!play) return undefined;
    if (p >= n - 1) { setPlay(false); return undefined; }
    const t = setTimeout(() => setPaso(p + 1), 700);
    return () => clearTimeout(t);
  }, [play, p, n]);

  const { actual, pila } = useMemo(() => {
    const st: ElementoPresupuestario[] = [];
    let act: ElementoPresupuestario | null = null;
    for (let i = 0; i <= p; i++) {
      const ev = trace[i];
      if (ev.tipo === 'entra') st.push(ev.el); else st.pop();
      act = ev.el;
    }
    return { actual: act, pila: new Set(st) };
  }, [trace, p]);

  const listaRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (listaRef.current) listaRef.current.scrollTop = listaRef.current.scrollHeight;
  }, [p, trace]);

  const llamadasG = trace.filter((e) => e.tipo === 'entra' && e.clase === 'GrupoPresupuestario').length;
  const llamadasP = trace.filter((e) => e.tipo === 'entra' && e.clase === 'PartidaPresupuestaria').length;

  /* ---- edición de la estructura ---- */
  const [tipo, setTipo] = useState<TipoNuevo>('partida');
  const [cod, setCod] = useState('');
  const [desc, setDesc] = useState('');
  const [valor, setValor] = useState('');
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const esGrupoSel = sel instanceof GrupoPresupuestario;
  const esRaiz = sel === raiz;

  const agregar = () => {
    setAviso('');
    if (!(sel instanceof GrupoPresupuestario)) return;
    const grupo = sel;
    const c = cod.trim();
    const d = desc.trim();
    if (!c || !d) { setError('Escribe un código y una descripción.'); return; }
    if (buscarPorCodigo(raiz, c)) { setError('Ya existe un elemento con ese código.'); return; }

    let nuevo: ElementoPresupuestario;
    if (tipo === 'partida') {
      const v = parseFloat(valor);
      if (!(v >= 0)) { setError('El valor debe ser un número mayor o igual a 0.'); return; }
      nuevo = new PartidaPresupuestaria(c, d, redondear(v));
    } else {
      nuevo = new GrupoPresupuestario(c, d);
    }

    const antes = grupo.calcularValorTotal();
    grupo.agregar(nuevo);
    setCerrados((prev) => { const s = new Set(prev); s.delete(grupo); return s; });
    setError('');
    setAviso(
      `Se agregó "${d}" dentro de "${grupo.getDescripcion()}". Total de "${grupo.getDescripcion()}": ${moneda(antes)} → ${moneda(grupo.calcularValorTotal())}. ServicioPresupuesto no cambió.`
    );
    setCod(''); setDesc(''); setValor('');
    bump();
  };

  const eliminar = () => {
    if (esRaiz) return;
    const padre = buscarPadre(raiz, sel);
    if (!padre) return;
    const nombre = sel.getDescripcion();
    padre.eliminar(sel);
    setError('');
    setAviso(`Se eliminó "${nombre}". Total de "${padre.getDescripcion()}": ${moneda(padre.calcularValorTotal())}.`);
    setSel(padre);
    bump();
  };

  const cambiarValor = (txt: string) => {
    if (!(sel instanceof PartidaPresupuestaria)) return;
    const v = parseFloat(txt);
    if (!(v >= 0)) { setError('El valor debe ser un número mayor o igual a 0.'); return; }
    const padre = buscarPadre(raiz, sel);
    if (!padre) return;
    const nueva = new PartidaPresupuestaria(sel.getCodigo(), sel.getDescripcion(), redondear(v));
    reemplazar(padre, sel, nueva);
    setError('');
    setAviso(`Se actualizó "${nueva.getDescripcion()}". Total de "${padre.getDescripcion()}": ${moneda(padre.calcularValorTotal())}.`);
    setSel(nueva);
    bump();
  };

  /* ---- lo que hace el cliente: solo habla con la abstracción ---- */
  const total = servicio.consultarValorTotal(sel);
  const reporte = servicio.generarReporte(sel);
  const evActual = trace[p];
  const clase = nombreClase(sel);

  return (
    <div className="sim">
      <div className="col">
        <section className="card" aria-labelledby="h-arbol">
          <h2 id="h-arbol" className="h3">Estructura del presupuesto</h2>
          <p className="hint">
            Elige un elemento. Cada total de la derecha sale de llamar a <code>calcularValorTotal()</code> sobre ese elemento.
          </p>
          <div className="thead"><span>Elemento</span><span>calcularValorTotal()</span></div>
          <ul className="tree" role="tree" aria-label="Árbol presupuestario">
            <Nodo el={raiz} sel={sel} onSel={setSel} cerrados={cerrados} toggle={toggle} actual={actual} pila={pila} />
          </ul>
        </section>

        <section className="card" aria-labelledby="h-edit">
          <h2 id="h-edit" className="h3">Hacer crecer la estructura</h2>
          <div className="form">
            <label>
              <span>Tipo</span>
              <select id="f-tipo" className="in" value={tipo} onChange={(e) => setTipo(e.target.value as TipoNuevo)}>
                <option value="partida">Partida</option>
                <option value="grupo">Grupo</option>
              </select>
            </label>
            <label>
              <span>Código</span>
              <input id="f-cod" className="in" value={cod} placeholder="TI-NUB" onChange={(e) => setCod(e.target.value)} />
            </label>
            <label className="wide">
              <span>Descripción</span>
              <input id="f-desc" className="in" value={desc} placeholder="Servicios en la nube" onChange={(e) => setDesc(e.target.value)} />
            </label>
            {tipo === 'partida' && (
              <label>
                <span>Valor asignado (USD)</span>
                <input id="f-valor" className="in" type="number" min="0" step="0.01" value={valor} placeholder="15000" onChange={(e) => setValor(e.target.value)} />
              </label>
            )}
          </div>
          <div className="acciones">
            <button type="button" className="btn pri" disabled={!esGrupoSel} onClick={agregar}>
              Agregar a {sel.getCodigo()}
            </button>
            <button type="button" className="btn peligro" disabled={esRaiz} onClick={eliminar}>
              Eliminar {sel.getCodigo()}
            </button>
            <button type="button" className="btn" onClick={onReset}>Restablecer ejemplo</button>
          </div>
          <div className={'estado ' + (error ? 'err' : 'ok')} role="status">
            {error ||
              aviso ||
              (esGrupoSel
                ? 'Agrega un grupo dentro de otro grupo y mira cómo cambian los totales de todos sus ancestros.'
                : 'Solo un grupo acepta nuevos elementos: agregar() existe únicamente en GrupoPresupuestario.')}
          </div>
        </section>
      </div>

      <div className="col">
        <section className="card" aria-labelledby="h-det">
          <h2 id="h-det" className="h3">Elemento seleccionado</h2>
          <dl className="kv">
            <dt>Tipo declarado</dt>
            <dd><span className="pill">ElementoPresupuestario</span></dd>
            <dt>Clase real</dt>
            <dd><span className={'pill ' + (esGrupoSel ? 'g' : 'p')}>{clase}</span></dd>
            <dt>getCodigo()</dt>
            <dd>{sel.getCodigo()}</dd>
            <dt>getDescripcion()</dt>
            <dd>{sel.getDescripcion()}</dd>
            <dt>calcularValorTotal()</dt>
            <dd><strong>{moneda(total)}</strong></dd>
            {sel instanceof PartidaPresupuestaria && (
              <>
                <dt>getValorAsignado()</dt>
                <dd>
                  <ValorEditor
                    key={sel.getCodigo() + ':' + sel.getValorAsignado()}
                    el={sel}
                    onAplicar={cambiarValor}
                  />
                </dd>
              </>
            )}
          </dl>
          <div style={{ height: 12 }}></div>
          <Codigo
            small
            src={`// El cliente solo ve la abstracción:\nconst total = servicio.consultarValorTotal(elemento);\n// → ${moneda(total)}   (respondió ${clase})`}
          />
        </section>

        <section className="card" aria-labelledby="h-traza">
          <h2 id="h-traza" className="h3">Recursión paso a paso</h2>
          <div className="ctrl">
            <button type="button" className="btn pri" onClick={() => { setPaso(0); setPlay(true); }}>Reproducir</button>
            <button type="button" className="btn" disabled={p <= 0} onClick={() => { setPlay(false); setPaso(p - 1); }}>Anterior</button>
            <button type="button" className="btn" disabled={p >= n - 1} onClick={() => { setPlay(false); setPaso(p + 1); }}>Siguiente</button>
            <span className="cuenta">paso {p + 1} / {n}</span>
          </div>
          <div className="traza" ref={listaRef} role="log" aria-label="Llamadas a calcularValorTotal">
            {trace.slice(0, p + 1).map((ev, i) => (
              <div key={i} className={'ln' + (i === p ? ' ult' : '')} style={{ paddingLeft: 6 + ev.prof * 16 }}>
                {ev.tipo === 'entra' ? (
                  <span>
                    → <span className={ev.clase === 'GrupoPresupuestario' ? 'cg' : 'cp'}>{ev.clase}</span>.calcularValorTotal() <span className="sal">[{ev.codigo}]</span>
                  </span>
                ) : (
                  <span className="sal">← devuelve {moneda(ev.valor)}</span>
                )}
              </div>
            ))}
          </div>
          <div className="narra" aria-live="polite">{narrar(evActual)}</div>
          <p className="resumen">
            {n / 2} llamadas en total: {llamadasP} a <span className="cp">PartidaPresupuestaria</span> y {llamadasG} a{' '}
            <span className="cg">GrupoPresupuestario</span>. El cliente hizo una sola.
          </p>
        </section>

        <section className="card" aria-labelledby="h-rep">
          <h2 id="h-rep" className="h3">generarReporte(elemento)</h2>
          <pre className="code" aria-label="Reporte de estructura">{reporte}</pre>
        </section>
      </div>
    </div>
  );
}

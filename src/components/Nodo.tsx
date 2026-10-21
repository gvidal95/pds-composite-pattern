import type { KeyboardEvent } from 'react';
import { ElementoPresupuestario, GrupoPresupuestario, moneda } from '../domain';

function Marca({ el }: { el: ElementoPresupuestario }) {
  // Solo decoración: ninguna regla de negocio depende de este instanceof.
  return el instanceof GrupoPresupuestario
    ? <span className="mk mk-g" aria-hidden="true"></span>
    : <span className="mk mk-p" aria-hidden="true"></span>;
}

interface NodoProps {
  el: ElementoPresupuestario;
  sel: ElementoPresupuestario;
  onSel: (el: ElementoPresupuestario) => void;
  cerrados: Set<ElementoPresupuestario>;
  toggle: (el: ElementoPresupuestario) => void;
  actual: ElementoPresupuestario | null;
  pila: Set<ElementoPresupuestario>;
}

export default function Nodo({ el, sel, onSel, cerrados, toggle, actual, pila }: NodoProps) {
  const esGrupo = el instanceof GrupoPresupuestario;
  const abierto = !cerrados.has(el);
  const hijos = el instanceof GrupoPresupuestario ? el.getElementos() : [];
  const cls =
    'row' +
    (esGrupo ? ' g' : '') +
    (sel === el ? ' sel' : '') +
    (actual === el ? ' actual' : pila.has(el) ? ' pila' : '');

  const teclas = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSel(el);
    }
  };

  return (
    <li role="none">
      <div
        className={cls}
        role="treeitem"
        aria-selected={sel === el}
        aria-expanded={esGrupo ? abierto : undefined}
        tabIndex={0}
        onClick={() => onSel(el)}
        onKeyDown={teclas}
      >
        {esGrupo ? (
          <button
            type="button"
            className="chev"
            aria-label={(abierto ? 'Contraer ' : 'Expandir ') + el.getDescripcion()}
            onClick={(e) => { e.stopPropagation(); toggle(el); }}
          >
            {abierto ? '▾' : '▸'}
          </button>
        ) : (
          <span></span>
        )}
        <Marca el={el} />
        <span className="txt">
          <span className="cod">{el.getCodigo()}</span>
          <span className="desc">{el.getDescripcion()}</span>
        </span>
        {/* Misma llamada para partidas y grupos: esto es el patrón en acción. */}
        <span className="tot">{moneda(el.calcularValorTotal())}</span>
      </div>
      {esGrupo && abierto && hijos.length > 0 && (
        <ul className="hijos" role="group">
          {hijos.map((h) => (
            <Nodo
              key={h.getCodigo()}
              el={h}
              sel={sel}
              onSel={onSel}
              cerrados={cerrados}
              toggle={toggle}
              actual={actual}
              pila={pila}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

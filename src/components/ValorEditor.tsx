import { useState } from 'react';
import type { PartidaPresupuestaria } from '../domain';

interface ValorEditorProps {
  el: PartidaPresupuestaria;
  onAplicar: (texto: string) => void;
}

export default function ValorEditor({ el, onAplicar }: ValorEditorProps) {
  const [draft, setDraft] = useState(String(el.getValorAsignado()));
  return (
    <div className="inline-edit">
      <input
        id="f-valor-edit"
        className="in"
        type="number"
        min="0"
        step="0.01"
        aria-label="Nuevo valor asignado"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
      />
      <button type="button" className="btn" onClick={() => onAplicar(draft)}>Cambiar</button>
    </div>
  );
}

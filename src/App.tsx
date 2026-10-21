import { useState } from 'react';
import Simulador from './components/Simulador';
import Patron from './components/Patron';
import CodigoTab from './components/CodigoTab';

type TabId = 'sim' | 'patron' | 'codigo';

const TABS: ReadonlyArray<readonly [TabId, string]> = [
  ['sim', 'Simulador'],
  ['patron', 'El patrón'],
  ['codigo', 'Código']
];

export default function App() {
  const [tab, setTab] = useState<TabId>('sim');
  const [reinicio, setReinicio] = useState(0);

  return (
    <div className="wrap">
      <header>
        <p className="eyebrow">Patrones de Diseño de Software · Actividad 02: Patrones Estructurales</p>
        <h1>Patrón Composite aplicado a un presupuesto</h1>
        <p className="lead">
          Partidas y grupos presupuestarios comparten una misma interfaz. El cliente calcula totales y muestra la
          estructura sin preguntar qué es cada elemento.
        </p>
        <div className="legend" aria-label="Leyenda">
          <span><span className="mk mk-g" aria-hidden="true"></span> Grupo presupuestario (Composite)</span>
          <span><span className="mk mk-p" aria-hidden="true"></span> Partida presupuestaria (Leaf)</span>
        </div>
      </header>

      <div className="tabs" role="tablist" aria-label="Secciones">
        {TABS.map(([id, nombre]) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`tab-${id}`}
            aria-selected={tab === id}
            aria-controls={`panel-${id}`}
            className="tab"
            onClick={() => setTab(id)}
          >
            {nombre}
          </button>
        ))}
      </div>

      <main role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
        {tab === 'sim' && <Simulador key={reinicio} onReset={() => setReinicio((r) => r + 1)} />}
        {tab === 'patron' && <Patron ir={() => setTab('sim')} />}
        {tab === 'codigo' && <CodigoTab />}
      </main>
    </div>
  );
}

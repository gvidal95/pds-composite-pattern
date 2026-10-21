import { useState } from 'react';

interface CopiarProps {
  texto: string;
}

export default function Copiar({ texto }: CopiarProps) {
  const [ok, setOk] = useState(false);

  const copiar = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(texto);
    } catch {
      try {
        const ta = document.createElement('textarea');
        ta.value = texto;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
      } catch {
        /* sin portapapeles disponible */
      }
    }
    setOk(true);
    setTimeout(() => setOk(false), 1500);
  };

  return (
    <button type="button" className="btn" onClick={copiar}>
      {ok ? 'Copiado' : 'Copiar'}
    </button>
  );
}

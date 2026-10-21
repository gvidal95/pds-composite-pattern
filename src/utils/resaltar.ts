// Resaltado de sintaxis mínimo para mostrar código sin dependencias externas.
const PATRON =
  /(\/\/[^\n]*)|(`[^`]*`|'[^'\n]*'|"[^"\n]*")|\b(class|extends|constructor|return|new|if|throw|const|let|function|this|super|instanceof|for|of|true|false|null|undefined|import|export|from|default|abstract|protected|private|public|readonly|void|number|string|type|interface)\b|\b(\d+(?:\.\d+)?)\b/g;

export function resaltar(src: string): string {
  const esc = src.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return esc.replace(PATRON, (_m, c?: string, s?: string, k?: string, n?: string) =>
    c ? `<span class="tc">${c}</span>`
      : s ? `<span class="ts">${s}</span>`
      : k ? `<span class="tk">${k}</span>`
      : `<span class="tn">${n}</span>`
  );
}

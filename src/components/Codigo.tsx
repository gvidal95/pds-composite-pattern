import { resaltar } from '../utils/resaltar';

interface CodigoProps {
  src: string;
  small?: boolean;
}

export default function Codigo({ src, small = false }: CodigoProps) {
  return (
    <pre
      className={'code' + (small ? ' sm' : '')}
      dangerouslySetInnerHTML={{ __html: resaltar(src) }}
    />
  );
}

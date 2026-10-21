const formato = new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' });

export const moneda = (n: number): string => formato.format(n);

// El diagrama usa BigDecimal. En TypeScript se redondea siempre a centavos.
export const redondear = (n: number): number => Math.round((n + Number.EPSILON) * 100) / 100;

export const currency = (n: number | null | undefined) =>
  (n ?? 0).toLocaleString('fr-FR', { style: 'currency', currency: 'MAD', maximumFractionDigits: 2 });

export const profit = (purchase: number, selling: number) => selling - purchase;

export const marginRate = (purchase: number, selling: number) =>
  selling ? Math.round(((selling - purchase) / selling) * 100) : 0;

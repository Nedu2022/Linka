export function formatNaira(amount: number) {
  return `₦${Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

export function formatNairaCompact(amount: number) {
  if (amount < 1000) return formatNaira(amount);
  if (amount < 1_000_000) return `₦${trimDecimal(amount / 1000)}k`;
  return `₦${trimDecimal(amount / 1_000_000)}m`;
}

function trimDecimal(value: number) {
  return value >= 100 ? Math.round(value).toString() : value.toFixed(1).replace(/\.0$/, '');
}

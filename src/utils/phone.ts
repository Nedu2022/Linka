export function formatNigerianNumber(digits: string) {
  return [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 10)].filter(Boolean).join(' ');
}

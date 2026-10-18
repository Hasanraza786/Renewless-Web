export function formatMoney(amount: number | string, currency?: string) {
  const value = Number(amount) || 0
  const code = currency && /^[A-Za-z]{3}$/.test(currency) ? currency.toUpperCase() : 'USD'
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: code,
    }).format(value)
  } catch {
    return `${code} ${value.toFixed(2)}`
  }
}

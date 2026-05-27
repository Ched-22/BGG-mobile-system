export function formatPlate(v) {
  const s = (v || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7)
  if (s.length <= 3) return s
  return s.slice(0, 3) + (s.length > 3 ? '-' + s.slice(3) : '')
}

export function formatPhoneBR(v) {
  const d = (v || '').replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return '(' + d
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

export function formatBRL(n) {
  if (n == null || isNaN(n)) return 'R$ 0,00'
  return (
    'R$ ' +
    Number(n).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  )
}

export function isValidEmail(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s || '')
}

export function isValidPlate(s) {
  const x = (s || '').replace(/[^A-Z0-9]/gi, '').toUpperCase()
  return /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(x)
}

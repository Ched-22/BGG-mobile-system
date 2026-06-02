export const VEHICLE_SIZE_OPTIONS = [
  { id: 'pequeno', label: 'Pequeno', hint: 'Hatch, compacto' },
  { id: 'medio', label: 'Médio', hint: 'Sedã, SUV médio' },
  { id: 'grande', label: 'Grande', hint: 'SUV grande, picape' },
]

export const SERVICES_CATALOG = [
  { id: 'polim', name: 'Polimento técnico', desc: 'Correção de pintura em 1 etapa', prices: { pequeno: 380, medio: 480, grande: 600 } },
  { id: 'vitri', name: 'Vitrificação cerâmica', desc: 'Proteção cerâmica de alto padrão', prices: { pequeno: 1480, medio: 1850, grande: 2320 } },
  { id: 'ppf', name: 'PPF — película de proteção', desc: 'Frontal completo, capô + para-choque', prices: { pequeno: 3360, medio: 4200, grande: 5250 } },
  { id: 'couro', name: 'Higienização de couro', desc: 'Bancos + painel + acabamentos', prices: { pequeno: 300, medio: 380, grande: 480 } },
  { id: 'motor', name: 'Detalhamento de motor', desc: 'Limpeza e finalização', prices: { pequeno: 220, medio: 280, grande: 350 } },
  { id: 'ozonio', name: 'Tratamento de ozônio', desc: 'Sanitização completa do habitáculo', prices: { pequeno: 180, medio: 220, grande: 280 } },
  { id: 'rodas', name: 'Restauração de rodas', desc: 'Polimento + selante por roda', prices: { pequeno: 510, medio: 640, grande: 800 } },
  { id: 'farol', name: 'Polimento de faróis', desc: 'Restauração ótica', prices: { pequeno: 150, medio: 180, grande: 220 } },
]

export const CAR_BRANDS = [
  'Porsche', 'Mercedes-Benz', 'BMW', 'Audi', 'Lamborghini',
  'Range Rover', 'Ferrari', 'Maserati', 'Volvo', 'Outra',
]

export function servicePrice(service, size) {
  return service.prices[size] ?? service.prices.medio
}

export function computeBudgetTotal({ selected, vehicleSize, discount, override }) {
  const subtotal = Object.entries(selected || {}).reduce((sum, [id, on]) => {
    if (!on) return sum
    const s = SERVICES_CATALOG.find((x) => x.id === id)
    return sum + (s ? servicePrice(s, vehicleSize) : 0)
  }, 0)
  const computed = subtotal - Number(discount || 0)
  return override !== '' && override != null ? Number(override) : computed
}

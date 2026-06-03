import { computeBudgetTotal } from '../data/orcamentoCatalog.js'

/** ID gerado só no cliente — ainda não existe na API. */
export function isLocalQuoteId(id) {
  if (!id) return true
  return id.startsWith('orc-local-') || id.startsWith('orc-')
}

/** Formato do formulário mobile → corpo da API (bgggarage-api). */
export function mapQuoteToApi(payload) {
  const selected = payload.selected || {}
  const serviceIds = Object.entries(selected)
    .filter(([, on]) => on)
    .map(([id]) => id)

  const total =
    payload.total ??
    computeBudgetTotal({
      selected,
      vehicleSize: payload.vehicleSize || 'medio',
      discount: payload.discount,
      override: payload.override ?? '',
    })

  return {
    clientName: payload.client?.name?.trim() || '',
    clientPhone: payload.client?.phone?.trim() || '',
    clientEmail: payload.client?.email?.trim() || undefined,
    plate: payload.vehicle?.plate?.trim() || '',
    brand: payload.vehicle?.brand?.trim() || '',
    model: payload.vehicle?.model?.trim() || '',
    year: Number(payload.vehicle?.year) || new Date().getFullYear(),
    color: payload.vehicle?.color?.trim() || undefined,
    km: payload.vehicle?.km ? Number(String(payload.vehicle.km).replace(/\D/g, '')) : undefined,
    vehicleSize: payload.vehicleSize || 'medio',
    services: serviceIds,
    discount: Number(payload.discount || 0),
    total: Number(total) || 0,
    notes: payload.desc?.trim() || undefined,
    internalNote: payload.internal?.trim() || undefined,
    status: payload.status,
  }
}

/** Resposta da API → formato usado nas telas mobile. */
export function mapQuoteFromApi(row) {
  if (!row) return null

  const services = row.services
  let selected = {}
  if (Array.isArray(services)) {
    selected = services.reduce((acc, item) => {
      const id = typeof item === 'string' ? item : item?.id
      if (id) acc[id] = true
      return acc
    }, {})
  } else if (services && typeof services === 'object') {
    selected = services
  }

  return {
    id: row.id,
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    submittedAt: row.submittedAt,
    approvedAt: row.approvedAt,
    client: {
      name: row.clientName || '',
      phone: row.clientPhone || '',
      email: row.clientEmail || '',
    },
    vehicle: {
      plate: row.plate || '',
      brand: row.brand || '',
      model: row.model || '',
      year: row.year != null ? String(row.year) : '',
      color: row.color || '',
      km: row.km != null ? String(row.km) : '',
    },
    vehicleSize: row.vehicleSize || 'medio',
    selected,
    discount: String(row.discount ?? 0),
    override: '',
    desc: row.notes || '',
    internal: row.internalNote || '',
    total: row.total ?? 0,
  }
}

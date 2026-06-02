import { useCallback, useEffect, useState } from 'react'
import { computeBudgetTotal } from '../data/orcamentoCatalog.js'

const STORAGE_KEY = 'bgg-orcamentos-v1'

export const ORCAMENTO_STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending_approval',
  APPROVED: 'approved',
}

function seedOrcamentos() {
  const now = Date.now()
  return [
    {
      id: 'orc-demo-1',
      status: ORCAMENTO_STATUS.APPROVED,
      createdAt: new Date(now - 86400000 * 3).toISOString(),
      updatedAt: new Date(now - 86400000 * 2).toISOString(),
      approvedAt: new Date(now - 86400000 * 2).toISOString(),
      client: { name: 'Marina Costa', phone: '(11) 99876-5432', email: 'marina@email.com' },
      vehicle: { plate: 'RGM-2H47', brand: 'Porsche', model: '911 Carrera S', year: '2022', color: 'Preto', km: '18400' },
      vehicleSize: 'medio',
      selected: { polim: true, vitri: true },
      discount: '0',
      override: '',
      desc: '',
      internal: '',
      total: 2330,
    },
    {
      id: 'orc-demo-2',
      status: ORCAMENTO_STATUS.PENDING,
      createdAt: new Date(now - 86400000).toISOString(),
      updatedAt: new Date(now - 3600000).toISOString(),
      submittedAt: new Date(now - 3600000).toISOString(),
      client: { name: 'Eduardo Almeida', phone: '(11) 98765-1234', email: '' },
      vehicle: { plate: 'HBL-9C12', brand: 'Mercedes-Benz', model: 'AMG GT', year: '2021', color: 'Cinza', km: '22000' },
      vehicleSize: 'medio',
      selected: { ppf: true, couro: true },
      discount: '200',
      override: '',
      desc: 'Cliente aguarda retorno até sexta.',
      internal: '',
      total: 4380,
    },
    {
      id: 'orc-demo-3',
      status: ORCAMENTO_STATUS.DRAFT,
      createdAt: new Date(now - 7200000).toISOString(),
      updatedAt: new Date(now - 1800000).toISOString(),
      client: { name: 'Beatriz Lima', phone: '(11) 97654-3210', email: 'beatriz@email.com' },
      vehicle: { plate: 'ABC-1D23', brand: 'Range Rover', model: 'Velar', year: '2023', color: 'Branco', km: '9500' },
      vehicleSize: 'grande',
      selected: { motor: true, ozonio: true },
      discount: '0',
      override: '',
      desc: '',
      internal: 'Preferência por horário da manhã.',
      total: 630,
    },
  ]
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {
    /* ignore */
  }
  const seed = seedOrcamentos()
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
  return seed
}

function persist(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export function isOrcamentoEditable(status) {
  return status === ORCAMENTO_STATUS.DRAFT || status === ORCAMENTO_STATUS.PENDING
}

export function orcamentoStatusLabel(status) {
  if (status === ORCAMENTO_STATUS.APPROVED) return 'Aprovado'
  if (status === ORCAMENTO_STATUS.PENDING) return 'Aguardando aprovação'
  return 'Rascunho'
}

export function orcamentoStatusChip(status) {
  if (status === ORCAMENTO_STATUS.APPROVED) return 'ok'
  if (status === ORCAMENTO_STATUS.PENDING) return 'warn'
  return 'gold'
}

export function useOrcamentos() {
  const [orcamentos, setOrcamentos] = useState(loadFromStorage)

  useEffect(() => {
    persist(orcamentos)
  }, [orcamentos])

  const upsert = useCallback((payload) => {
    const now = new Date().toISOString()
    const total = computeBudgetTotal(payload)
    const record = { ...payload, total, updatedAt: now }

    setOrcamentos((prev) => {
      const idx = prev.findIndex((o) => o.id === record.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = { ...prev[idx], ...record }
        return next
      }
      return [{ ...record, createdAt: now }, ...prev]
    })
    return record
  }, [])

  const createDraft = useCallback((payload) => {
    const id = payload.id || `orc-${Date.now()}`
    return upsert({
      ...payload,
      id,
      status: ORCAMENTO_STATUS.DRAFT,
    })
  }, [upsert])

  const saveDraft = useCallback((payload) => {
    return upsert({
      ...payload,
      status: ORCAMENTO_STATUS.DRAFT,
    })
  }, [upsert])

  const submitForApproval = useCallback((payload) => {
    const now = new Date().toISOString()
    return upsert({
      ...payload,
      status: ORCAMENTO_STATUS.PENDING,
      submittedAt: now,
    })
  }, [upsert])

  const getById = useCallback(
    (id) => orcamentos.find((o) => o.id === id),
    [orcamentos],
  )

  const byUpdated = (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)

  const pendingList = orcamentos
    .filter((o) => o.status === ORCAMENTO_STATUS.DRAFT || o.status === ORCAMENTO_STATUS.PENDING)
    .sort(byUpdated)
  const approvedList = orcamentos
    .filter((o) => o.status === ORCAMENTO_STATUS.APPROVED)
    .sort(byUpdated)

  return {
    orcamentos,
    pendingList,
    approvedList,
    getById,
    createDraft,
    saveDraft,
    submitForApproval,
  }
}

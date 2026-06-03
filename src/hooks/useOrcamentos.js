import { useCallback, useEffect, useState } from 'react'
import api from '../lib/api'
import { isLocalQuoteId, mapQuoteFromApi, mapQuoteToApi } from '../lib/quoteApi.js'

export const ORCAMENTO_STATUS = {
  DRAFT: 'DRAFT',
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
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
  const [orcamentos, setOrcamentos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchOrcamentos = useCallback(async () => {
    setError(null)
    try {
      const { data } = await api.get('/quotes')
      const list = Array.isArray(data) ? data.map(mapQuoteFromApi).filter(Boolean) : []
      setOrcamentos(list)
    } catch (err) {
      setError(err.response?.status === 404
        ? 'Rota /quotes não encontrada. Reinicie a API (bgggarage-api) com npm run start:dev.'
        : 'Não foi possível carregar os orçamentos.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('bgg-mobile-token')
    if (!token) {
      setLoading(false)
      return
    }
    fetchOrcamentos()
  }, [fetchOrcamentos])

  const upsert = useCallback(async (payload) => {
    const body = mapQuoteToApi({ ...payload, status: ORCAMENTO_STATUS.DRAFT })
    try {
      if (payload.id && !isLocalQuoteId(payload.id)) {
        const { data } = await api.patch(`/quotes/${payload.id}`, body)
        const mapped = mapQuoteFromApi(data)
        setOrcamentos((prev) => prev.map((o) => (o.id === mapped.id ? mapped : o)))
        return mapped
      }
      const { data } = await api.post('/quotes', body)
      const mapped = mapQuoteFromApi(data)
      setOrcamentos((prev) => [mapped, ...prev])
      return mapped
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao guardar orçamento')
      throw err
    }
  }, [])

  const saveDraft = useCallback((payload) => upsert(payload), [upsert])

  const submitForApproval = useCallback(async (payload) => {
    try {
      let id = payload.id
      if (!id || isLocalQuoteId(id)) {
        const created = await upsert(payload)
        id = created.id
      } else {
        await api.patch(`/quotes/${id}`, mapQuoteToApi(payload))
      }
      const { data } = await api.patch(`/quotes/${id}/submit`)
      const mapped = mapQuoteFromApi(data)
      setOrcamentos((prev) => prev.map((o) => (o.id === mapped.id ? mapped : o)))
      return mapped
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao enviar para aprovação')
      throw err
    }
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
    loading,
    error,
    getById,
    saveDraft,
    submitForApproval,
    refresh: fetchOrcamentos,
  }
}

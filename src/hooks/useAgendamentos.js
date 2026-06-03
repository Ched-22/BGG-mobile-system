import { useCallback, useEffect, useState } from 'react'
import api from '../lib/api'

export const AGENDAMENTO_KIND = {
  TAREFA: 'tarefa',
  AGENDAMENTO: 'agendamento',
}

export const CHECKLIST_PROGRESS = {
  NONE: 'none',
  ENTRADA: 'entrada_em_andamento',
  ENTRADA_DONE: 'entrada_finalizada',
  SAIDA: 'saida_em_andamento',
  DONE: 'concluido',
}

// Mapeia status da API para o formato do mobile
function mapAppointmentToAgendamento(a) {
  return {
    id: a.id,
    kind: AGENDAMENTO_KIND.AGENDAMENTO,
    title: a.notes || 'Agendamento',
    services: [],
    scheduledAt: a.scheduledAt,
    client: a.vehicle?.client?.name || '',
    plate: a.vehicle?.plate || '',
    car: `${a.vehicle?.brand} ${a.vehicle?.model}` || '',
    year: String(a.vehicle?.year || ''),
    color: a.vehicle?.color || '',
    adminNote: a.notes || '',
    checklistProgress: mapStatus(a.status),
  }
}

function mapStatus(status) {
  if (status === 'COMPLETED') return CHECKLIST_PROGRESS.DONE
  if (status === 'IN_PROGRESS') return CHECKLIST_PROGRESS.ENTRADA
  return CHECKLIST_PROGRESS.NONE
}

export function agendamentoKindLabel(kind) {
  return kind === AGENDAMENTO_KIND.TAREFA ? 'Tarefa' : 'Agendamento'
}

export function agendamentoKindChip(kind) {
  return kind === AGENDAMENTO_KIND.TAREFA ? 'gold' : 'ok'
}

export function checklistProgressLabel(progress) {
  if (progress === CHECKLIST_PROGRESS.DONE) return 'Checklist concluído'
  if (progress === CHECKLIST_PROGRESS.SAIDA) return 'Saída em andamento'
  if (progress === CHECKLIST_PROGRESS.ENTRADA_DONE) return 'Entrada finalizada'
  if (progress === CHECKLIST_PROGRESS.ENTRADA) return 'Entrada em andamento'
  return 'Checklist pendente'
}

export function checklistProgressChip(progress) {
  if (progress === CHECKLIST_PROGRESS.DONE) return 'ok'
  if (progress === CHECKLIST_PROGRESS.NONE) return 'warn'
  return 'gold'
}

export function formatAgendamentoWhen(iso) {
  const d = new Date(iso)
  const now = new Date()
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const isTomorrow =
    d.getDate() === tomorrow.getDate() &&
    d.getMonth() === tomorrow.getMonth() &&
    d.getFullYear() === tomorrow.getFullYear()

  const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  if (isToday) return `Hoje · ${time}`
  if (isTomorrow) return `Amanhã · ${time}`
  return d.toLocaleDateString('pt-BR', {
    weekday: 'short', day: '2-digit', month: 'short',
    hour: '2-digit', minute: '2-digit',
  })
}

export function agendamentoToVehicleContext(ag) {
  if (!ag) return null
  return {
    assignmentId: ag.id,
    assignmentTitle: ag.title,
    assignmentKind: ag.kind,
    plate: ag.plate,
    car: ag.car,
    client: ag.client,
    year: ag.year,
    color: ag.color,
  }
}

export function useAgendamentos() {
  const [agendamentos, setAgendamentos] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAgendamentos = useCallback(async () => {
    try {
      const { data } = await api.get('/appointments')
      const list = Array.isArray(data) ? data : []
      setAgendamentos(list.map(mapAppointmentToAgendamento))
    } catch {
      // fallback offline mantém estado actual
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
    fetchAgendamentos()
  }, [fetchAgendamentos])

  const getById = useCallback((id) => agendamentos.find((a) => a.id === id), [agendamentos])

  const findByPlate = useCallback(
    (plate) => {
      const norm = (plate || '').replace(/\W/g, '').toUpperCase()
      return agendamentos.find((a) => a.plate.replace(/\W/g, '').toUpperCase() === norm)
    },
    [agendamentos],
  )

  const updateChecklistProgress = useCallback(async (id, progress) => {
    const statusMap = {
      [CHECKLIST_PROGRESS.DONE]: 'COMPLETED',
      [CHECKLIST_PROGRESS.ENTRADA]: 'IN_PROGRESS',
      [CHECKLIST_PROGRESS.NONE]: 'PENDING',
    }
    try {
      await api.patch(`/appointments/${id}`, { status: statusMap[progress] || 'IN_PROGRESS' })
    } catch { /* offline */ }
    setAgendamentos((prev) =>
      prev.map((a) => (a.id === id ? { ...a, checklistProgress: progress } : a)),
    )
  }, [])

  const now = new Date()
  const todayList = agendamentos
    .filter((a) => {
      const d = new Date(a.scheduledAt)
      return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
    .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))

  const upcomingList = agendamentos
    .filter((a) => !todayList.some((t) => t.id === a.id))
    .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))

  return {
    agendamentos,
    todayList,
    upcomingList,
    loading,
    getById,
    findByPlate,
    updateChecklistProgress,
    refresh: fetchAgendamentos,
  }
}
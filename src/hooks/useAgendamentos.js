import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'bgg-agendamentos-v1'

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

function seedAgendamentos() {
  const now = new Date()
  const today9 = new Date(now)
  today9.setHours(9, 0, 0, 0)
  const today14 = new Date(now)
  today14.setHours(14, 30, 0, 0)
  const tomorrow10 = new Date(now)
  tomorrow10.setDate(tomorrow10.getDate() + 1)
  tomorrow10.setHours(10, 0, 0, 0)

  return [
    {
      id: 'ag-1',
      kind: AGENDAMENTO_KIND.AGENDAMENTO,
      title: 'Vitrificação cerâmica completa',
      services: ['Vitrificação cerâmica', 'Polimento técnico'],
      scheduledAt: today9.toISOString(),
      client: 'Marina Costa',
      plate: 'RGM-2H47',
      car: 'Porsche 911 Carrera S',
      year: '2022',
      color: 'Preto Jet',
      adminNote: 'Prioridade — cliente VIP. Confirmar horário na chegada.',
      checklistProgress: CHECKLIST_PROGRESS.ENTRADA_DONE,
    },
    {
      id: 'ag-2',
      kind: AGENDAMENTO_KIND.AGENDAMENTO,
      title: 'PPF frontal + higienização',
      services: ['PPF — película de proteção', 'Higienização de couro'],
      scheduledAt: today14.toISOString(),
      client: 'Eduardo Almeida',
      plate: 'HBL-9C12',
      car: 'Mercedes-AMG GT',
      year: '2021',
      color: 'Cinza selenite',
      adminNote: 'Veículo chega com acompanhante. Aguardar checklist de entrada.',
      checklistProgress: CHECKLIST_PROGRESS.NONE,
    },
    {
      id: 'ag-3',
      kind: AGENDAMENTO_KIND.TAREFA,
      title: 'Checklist de saída pendente',
      services: ['Entrega pós-serviço'],
      scheduledAt: today14.toISOString(),
      client: 'Beatriz Lima',
      plate: 'ABC-1D23',
      car: 'Range Rover Velar',
      year: '2023',
      color: 'Branco Fuji',
      adminNote: 'Tarefa criada pelo admin — finalizar inspeção de saída hoje.',
      checklistProgress: CHECKLIST_PROGRESS.SAIDA,
    },
    {
      id: 'ag-4',
      kind: AGENDAMENTO_KIND.AGENDAMENTO,
      title: 'Detalhamento completo',
      services: ['Detalhamento de motor', 'Tratamento de ozônio'],
      scheduledAt: tomorrow10.toISOString(),
      client: 'Carlos Mendes',
      plate: 'FGH-4K88',
      car: 'Audi RS6 Avant',
      year: '2020',
      color: 'Azul Navarra',
      adminNote: '',
      checklistProgress: CHECKLIST_PROGRESS.NONE,
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
  const seed = seedAgendamentos()
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
  return seed
}

function persist(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
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
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
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
  const [agendamentos, setAgendamentos] = useState(loadFromStorage)

  useEffect(() => {
    persist(agendamentos)
  }, [agendamentos])

  const getById = useCallback((id) => agendamentos.find((a) => a.id === id), [agendamentos])

  const findByPlate = useCallback(
    (plate) => {
      const norm = (plate || '').replace(/\W/g, '').toUpperCase()
      return agendamentos.find((a) => a.plate.replace(/\W/g, '').toUpperCase() === norm)
    },
    [agendamentos],
  )

  const updateChecklistProgress = useCallback((id, progress) => {
    setAgendamentos((prev) =>
      prev.map((a) => (a.id === id ? { ...a, checklistProgress: progress } : a)),
    )
  }, [])

  const todayList = agendamentos
    .filter((a) => {
      const d = new Date(a.scheduledAt)
      const now = new Date()
      return (
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      )
    })
    .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))

  const upcomingList = agendamentos
    .filter((a) => !todayList.some((t) => t.id === a.id))
    .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))

  return {
    agendamentos,
    todayList,
    upcomingList,
    getById,
    findByPlate,
    updateChecklistProgress,
  }
}

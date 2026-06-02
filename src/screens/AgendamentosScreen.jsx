import { Icon } from '../components/Icon.jsx'
import { TopBar, Button, SectionHeader } from '../components/ui/index.jsx'
import {
  agendamentoKindLabel,
  agendamentoKindChip,
  checklistProgressLabel,
  checklistProgressChip,
  formatAgendamentoWhen,
  CHECKLIST_PROGRESS,
} from '../hooks/useAgendamentos.js'

function EmptyBlock({ children }) {
  return (
    <div className="card-hairline" style={{ padding: 16, textAlign: 'center' }}>
      <p className="body-text" style={{ fontSize: 13, color: 'var(--t-fg-3)', margin: 0 }}>
        {children}
      </p>
    </div>
  )
}

function AgendamentoCard({ item, onSelect }) {
  return (
    <button
      type="button"
      className="card"
      style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}
      onClick={() => onSelect(item.id)}
    >
      <div className="row-between" style={{ alignItems: 'flex-start', gap: 8 }}>
        <div className="stack-tight" style={{ flex: 1, minWidth: 0 }}>
          <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
            <span className={`status-chip chip-${agendamentoKindChip(item.kind)}`} style={{ fontSize: 9 }}>
              {agendamentoKindLabel(item.kind)}
            </span>
            <span className="dim" style={{ fontSize: 11, letterSpacing: '0.04em' }}>
              {formatAgendamentoWhen(item.scheduledAt)}
            </span>
          </div>
          <div style={{ fontSize: 14, color: 'var(--t-fg)', fontWeight: 500, marginTop: 4 }}>{item.title}</div>
          <div
            style={{
              fontFamily: 'var(--e-mid)',
              color: 'var(--gold)',
              fontSize: 14,
              fontWeight: 500,
              letterSpacing: '0.06em',
            }}
          >
            {item.plate}
          </div>
          <div style={{ fontSize: 12, color: 'var(--t-fg-3)' }}>
            {item.car} · {item.client}
          </div>
        </div>
        <Icon name="ChevronRight" size={18} style={{ color: 'var(--t-fg-4)', flexShrink: 0, marginTop: 4 }} />
      </div>
      <div className="row-between" style={{ alignItems: 'center' }}>
        <span className={`status-chip chip-${checklistProgressChip(item.checklistProgress)}`} style={{ fontSize: 9 }}>
          {checklistProgressLabel(item.checklistProgress)}
        </span>
        <span className="dim" style={{ fontSize: 10, letterSpacing: '0.06em' }}>
          Ver detalhes
        </span>
      </div>
    </button>
  )
}

export function AgendamentosListScreen({ todayList, upcomingList, onMenu, onSelect }) {
  return (
    <>
      <TopBar title="Tarefas e agendamentos" onMenu={onMenu} />
      <div className="screen">
        <div className="screen-section">
          <p className="body-text" style={{ fontSize: 13, color: 'var(--t-fg-3)', margin: 0 }}>
            Selecione uma tarefa ou agendamento enviado pelo administrador para abrir o checklist do veículo.
          </p>
        </div>

        <div className="screen-section">
          <SectionHeader
            eyebrow="Admin"
            title="Hoje"
            action={
              todayList.length > 0 ? (
                <span style={{ fontSize: 11, color: 'var(--gold)', letterSpacing: '0.05em' }}>
                  {todayList.length}
                </span>
              ) : null
            }
          />
          <div className="col" style={{ gap: 10 }}>
            {todayList.length === 0 ? (
              <EmptyBlock>Nenhuma tarefa ou agendamento para hoje.</EmptyBlock>
            ) : (
              todayList.map((item) => <AgendamentoCard key={item.id} item={item} onSelect={onSelect} />)
            )}
          </div>
        </div>

        <div className="screen-section">
          <SectionHeader eyebrow="Planejados" title="Próximos" />
          <div className="col" style={{ gap: 10 }}>
            {upcomingList.length === 0 ? (
              <EmptyBlock>Nenhum agendamento futuro no momento.</EmptyBlock>
            ) : (
              upcomingList.map((item) => <AgendamentoCard key={item.id} item={item} onSelect={onSelect} />)
            )}
          </div>
        </div>

        <div
          className="row"
          style={{ gap: 8, padding: '0 var(--d-pad-screen) 24px', color: 'var(--t-fg-4)', fontSize: 11 }}
        >
          <Icon name="Calendar" size={14} style={{ color: 'var(--gold)', flexShrink: 0 }} />
          <span>Itens definidos pelo administrador na agenda da oficina.</span>
        </div>
        <div className="spacer" />
      </div>
    </>
  )
}

export function AgendamentoDetailScreen({ agendamento, onBack, onOpenChecklist }) {
  if (!agendamento) {
    return (
      <>
        <TopBar title="Atendimento" onBack={onBack} />
        <div className="screen">
          <div className="screen-section">
            <EmptyBlock>Atendimento não encontrado.</EmptyBlock>
            <Button block variant="ghost" onClick={onBack} style={{ marginTop: 16 }}>
              Voltar à lista
            </Button>
          </div>
        </div>
      </>
    )
  }

  const canChecklist = agendamento.checklistProgress !== CHECKLIST_PROGRESS.DONE
  const checklistLabel =
    agendamento.checklistProgress === CHECKLIST_PROGRESS.NONE
      ? 'Iniciar checklist do veículo'
      : 'Continuar checklist do veículo'

  return (
    <>
      <TopBar title="Detalhe do atendimento" onBack={onBack} />
      <div className="screen">
        <div className="screen-section">
          <div className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
              <span className={`status-chip chip-${agendamentoKindChip(agendamento.kind)}`}>
                {agendamentoKindLabel(agendamento.kind)}
              </span>
              <span className={`status-chip chip-${checklistProgressChip(agendamento.checklistProgress)}`}>
                {checklistProgressLabel(agendamento.checklistProgress)}
              </span>
            </div>
            <div>
              <div className="eyebrow">{formatAgendamentoWhen(agendamento.scheduledAt)}</div>
              <h1 className="h-display md" style={{ marginTop: 6 }}>
                {agendamento.title}
              </h1>
            </div>
            <div className="rule" />
            <div className="stack-tight">
              <div className="eyebrow">Veículo</div>
              <div
                style={{
                  fontFamily: 'var(--e-mid)',
                  color: 'var(--gold)',
                  fontSize: 20,
                  fontWeight: 500,
                  letterSpacing: '0.06em',
                }}
              >
                {agendamento.plate}
              </div>
              <div style={{ fontSize: 14, color: 'var(--t-fg)' }}>{agendamento.car}</div>
              <div className="dim" style={{ fontSize: 12 }}>
                {agendamento.year} · {agendamento.color}
              </div>
              <div className="dim" style={{ fontSize: 12 }}>
                Cliente: {agendamento.client}
              </div>
            </div>
          </div>
        </div>

        <div className="screen-section">
          <SectionHeader eyebrow="Serviços" title="Previstos" />
          <div className="col" style={{ gap: 6 }}>
            {agendamento.services.map((s, i) => (
              <div
                key={i}
                className="card-hairline"
                style={{ padding: '10px 12px', fontSize: 13, color: 'var(--t-fg-2)' }}
              >
                {s}
              </div>
            ))}
          </div>
        </div>

        {agendamento.adminNote && (
          <div className="screen-section">
            <SectionHeader eyebrow="Admin" title="Observações" />
            <p className="body-text" style={{ fontSize: 13, color: 'var(--t-fg-3)' }}>
              {agendamento.adminNote}
            </p>
          </div>
        )}

        <div className="screen-section">
          {canChecklist ? (
            <Button block onClick={() => onOpenChecklist(agendamento.id)} icon="ClipboardList">
              {checklistLabel}
            </Button>
          ) : (
            <div className="banner" style={{ marginBottom: 12 }}>
              <Icon name="CheckCircle" size={16} style={{ color: 'var(--t-status-ok-fg)' }} />
              <span>Checklist deste atendimento já foi concluído.</span>
            </div>
          )}
          <Button block variant="ghost" onClick={onBack}>
            Voltar à lista
          </Button>
        </div>
        <div className="spacer" />
      </div>
    </>
  )
}

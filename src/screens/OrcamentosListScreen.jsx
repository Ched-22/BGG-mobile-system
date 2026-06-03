import { Icon } from '../components/Icon.jsx'
import { TopBar, Button, SectionHeader, formatBRL } from '../components/ui/index.jsx'
import {
  orcamentoStatusChip,
  orcamentoStatusLabel,
  isOrcamentoEditable,
} from '../hooks/useOrcamentos.js'

function OrcamentoCard({ item, onOpen }) {
  const editable = isOrcamentoEditable(item.status)
  const vehicleLabel = [item.vehicle.brand, item.vehicle.model].filter(Boolean).join(' ') || 'Veículo'

  return (
    <button
      type="button"
      className="card"
      style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}
      onClick={() => onOpen(item.id)}
    >
      <div className="row-between" style={{ alignItems: 'flex-start', gap: 8 }}>
        <div className="stack-tight" style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, color: 'var(--t-fg)', fontWeight: 500 }}>{item.client.name}</div>
          <div
            style={{
              fontFamily: 'var(--e-mid)',
              color: 'var(--gold)',
              fontSize: 14,
              fontWeight: 500,
              letterSpacing: '0.06em',
            }}
          >
            {item.vehicle.plate}
          </div>
          <div style={{ fontSize: 12, color: 'var(--t-fg-3)' }}>{vehicleLabel}</div>
        </div>
        <div className="stack-tight" style={{ alignItems: 'flex-end', flexShrink: 0 }}>
          <span className={`status-chip chip-${orcamentoStatusChip(item.status)}`}>
            {orcamentoStatusLabel(item.status)}
          </span>
          <span
            style={{
              fontFamily: 'var(--e-display)',
              color: 'var(--gold)',
              fontSize: 18,
              fontWeight: 500,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {formatBRL(item.total)}
          </span>
        </div>
      </div>
      {editable && (
        <div className="dim" style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Toque para editar
        </div>
      )}
    </button>
  )
}

function EmptyBlock({ children }) {
  return (
    <div className="card-hairline" style={{ padding: 16, textAlign: 'center' }}>
      <p className="body-text" style={{ fontSize: 13, color: 'var(--t-fg-3)', margin: 0 }}>
        {children}
      </p>
    </div>
  )
}

export function OrcamentosListScreen({ pendingList, approvedList, apiError, onMenu, onNew, onOpen }) {
  return (
    <>
      <TopBar title="Orçamentos" onMenu={onMenu} />
      <div className="screen">
        {apiError && (
          <div className="banner" style={{ marginBottom: 12 }}>
            <Icon name="AlertTriangle" size={14} style={{ color: 'var(--t-status-warn-fg)' }} />
            <span>{typeof apiError === 'string' ? apiError : 'Erro ao ligar à API.'}</span>
          </div>
        )}
        <div className="screen-section">
          <Button block onClick={onNew} icon="Plus">
            Novo orçamento
          </Button>
        </div>

        <div className="screen-section">
          <SectionHeader
            eyebrow="Aguardando admin"
            title="Pendentes de aprovação"
            action={
              pendingList.length > 0 ? (
                <span style={{ fontSize: 11, color: 'var(--gold)', letterSpacing: '0.05em' }}>
                  {pendingList.length}
                </span>
              ) : null
            }
          />
          <div className="col" style={{ gap: 10 }}>
            {pendingList.length === 0 ? (
              <EmptyBlock>Nenhum orçamento pendente. Crie um novo e envie para aprovação.</EmptyBlock>
            ) : (
              pendingList.map((item) => (
                <OrcamentoCard key={item.id} item={item} onOpen={onOpen} />
              ))
            )}
          </div>
        </div>

        <div className="screen-section">
          <SectionHeader
            eyebrow="Liberados"
            title="Aprovados"
            action={
              approvedList.length > 0 ? (
                <span style={{ fontSize: 11, color: 'var(--t-fg-4)', letterSpacing: '0.05em' }}>
                  {approvedList.length}
                </span>
              ) : null
            }
          />
          <div className="col" style={{ gap: 10 }}>
            {approvedList.length === 0 ? (
              <EmptyBlock>Nenhum orçamento aprovado ainda.</EmptyBlock>
            ) : (
              approvedList.map((item) => (
                <OrcamentoCard key={item.id} item={item} onOpen={onOpen} />
              ))
            )}
          </div>
        </div>

        <div
          className="row"
          style={{ gap: 8, padding: '0 var(--d-pad-screen) 24px', color: 'var(--t-fg-4)', fontSize: 11 }}
        >
          <Icon name="Shield" size={14} style={{ color: 'var(--gold)', flexShrink: 0 }} />
          <span>Orçamentos enviados ficam com o administrador até aprovação.</span>
        </div>
        <div className="spacer" />
      </div>
    </>
  )
}

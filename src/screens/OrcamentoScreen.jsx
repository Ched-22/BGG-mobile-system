// ============================================================
// BGG Mobile — Orçamento (criação / edição)
// ============================================================
import { useState, useMemo } from 'react'
import { Icon } from '../components/Icon.jsx'
import {
  VEHICLE_SIZE_OPTIONS,
  SERVICES_CATALOG,
  CAR_BRANDS,
  servicePrice,
  computeBudgetTotal,
} from '../data/orcamentoCatalog.js'
import { isOrcamentoEditable } from '../hooks/useOrcamentos.js'
import {
  TopBar,
  TopBarActions,
  Field,
  TextInput,
  TextArea,
  Button,
  Sheet,
  SectionHeader,
  formatPlate,
  formatPhoneBR,
  formatBRL,
  isValidEmail,
  isValidPlate,
} from '../components/ui/index.jsx'

function emptyClient(preset) {
  return {
    name: preset?.name || '',
    phone: preset?.phone || '',
    email: preset?.email || '',
  }
}

function emptyVehicle(preset) {
  return {
    plate: preset?.plate || '',
    brand: preset?.brand || '',
    model: preset?.model || '',
    year: preset?.year || '',
    color: preset?.color || '',
    km: preset?.km || '',
  }
}

export function OrcamentoScreen({
  budget,
  presetClient,
  presetVehicle,
  onBack,
  onSaveDraft,
  onSubmitForApproval,
  addToast,
  online,
  onBudgetPersisted,
}) {
  const readOnly = budget ? !isOrcamentoEditable(budget.status) : false
  const isEdit = !!budget?.id

  const [budgetId, setBudgetId] = useState(() => budget?.id || `orc-local-${Date.now()}`)
  const [client, setClient] = useState(() => emptyClient(budget?.client || presetClient))
  const [vehicle, setVehicle] = useState(() => emptyVehicle(budget?.vehicle || presetVehicle))
  const [vehicleSize, setVehicleSize] = useState(budget?.vehicleSize || presetVehicle?.size || 'medio')
  const [selected, setSelected] = useState(() => budget?.selected || {})
  const [override, setOverride] = useState(() =>
    budget?.override != null && budget.override !== '' ? String(budget.override) : '',
  )
  const [discount, setDiscount] = useState(() =>
    budget?.discount != null ? String(budget.discount) : '0',
  )
  const [desc, setDesc] = useState(budget?.desc || '')
  const [internal, setInternal] = useState(budget?.internal || '')
  const [touched, setTouched] = useState({})
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [confirmApproval, setConfirmApproval] = useState(false)

  const formPayload = useMemo(
    () => ({
      id: budgetId,
      client,
      vehicle,
      vehicleSize,
      selected,
      discount,
      override,
      desc,
      internal,
      status: budget?.status,
      createdAt: budget?.createdAt,
      submittedAt: budget?.submittedAt,
      approvedAt: budget?.approvedAt,
    }),
    [budgetId, client, vehicle, vehicleSize, selected, discount, override, desc, internal, budget],
  )

  const computedTotal = useMemo(
    () => computeBudgetTotal({ selected, vehicleSize, discount, override }),
    [selected, vehicleSize, discount, override],
  )

  const servicesSubtotal = useMemo(() => {
    return Object.entries(selected).reduce((sum, [id, on]) => {
      if (!on) return sum
      const s = SERVICES_CATALOG.find((x) => x.id === id)
      return sum + (s ? servicePrice(s, vehicleSize) : 0)
    }, 0)
  }, [selected, vehicleSize])

  const total = override !== '' ? Number(override) : computedTotal
  const selectedCount = Object.values(selected).filter(Boolean).length

  const onVehicleSizeChange = (size) => {
    if (readOnly) return
    setVehicleSize(size)
    setOverride('')
  }

  const validate = () => {
    const e = {}
    if (!client.name.trim()) e.name = 'Nome do cliente é obrigatório'
    if (!client.phone.trim()) e.phone = 'Telefone do cliente é obrigatório'
    else if (client.phone.replace(/\D/g, '').length < 10) e.phone = 'Digite pelo menos 10 dígitos'
    if (client.email && !isValidEmail(client.email)) e.email = 'Formato de e-mail inválido'
    if (!vehicle.plate.trim()) e.plate = 'Placa do veículo é obrigatória'
    else if (!isValidPlate(vehicle.plate)) e.plate = 'Digite uma placa no formato ABC1D23'
    if (selectedCount === 0) e.services = 'Selecione pelo menos um serviço'
    if (total <= 0) e.total = 'Valor total deve ser maior que zero'
    return e
  }
  const errors = validate()

  const screenTitle = readOnly
    ? 'Orçamento aprovado'
    : isEdit
      ? 'Editar orçamento'
      : 'Novo orçamento'

  const buildRecord = () => ({
    ...formPayload,
    total: computeBudgetTotal(formPayload),
  })

  const save = async () => {
    if (readOnly) return
    setTouched({ name: true, phone: true, email: true, plate: true, services: true, total: true })
    if (Object.keys(errors).length > 0) {
      addToast({ kind: 'error', msg: 'Verifique os campos destacados' })
      return
    }
    try {
      const saved = await onSaveDraft?.(buildRecord())
      if (saved?.id) {
        setBudgetId(saved.id)
        onBudgetPersisted?.(saved)
      }
      addToast({
        kind: 'ok',
        msg: online ? 'Orçamento salvo' : 'Salvo offline — sincronizará ao reconectar',
      })
    } catch {
      addToast({ kind: 'error', msg: 'Não foi possível salvar na API. Verifique a ligação.' })
    }
  }

  const requestApproval = () => {
    if (readOnly) return
    setTouched({ name: true, phone: true, email: true, plate: true, services: true, total: true })
    if (Object.keys(errors).length > 0) {
      addToast({ kind: 'error', msg: 'Verifique os campos antes de enviar' })
      return
    }
    setConfirmApproval(true)
  }

  const confirmSubmitApproval = async () => {
    setConfirmApproval(false)
    try {
      const saved = await onSubmitForApproval?.(buildRecord())
      if (saved?.id) {
        setBudgetId(saved.id)
        onBudgetPersisted?.(saved)
      }
      addToast({ kind: 'ok', msg: 'Orçamento enviado ao administrador para aprovação' })
    } catch {
      addToast({ kind: 'error', msg: 'Não foi possível enviar para aprovação.' })
    }
  }

  const inputDisabled = readOnly

  return (
    <>
      <TopBar
        title={screenTitle}
        onBack={() => (readOnly ? onBack?.() : setConfirmCancel(true))}
        right={
          !readOnly ? (
            <TopBarActions>
              <button className="topbar-action" onClick={save} aria-label="Salvar">
                <Icon name="Save" size={20} />
              </button>
            </TopBarActions>
          ) : undefined
        }
      />
      <div className="screen">
        {readOnly && (
          <div className="banner" style={{ marginBottom: 0 }}>
            <Icon name="Shield" size={14} style={{ color: 'var(--gold)' }} />
            <span>Este orçamento foi aprovado pelo administrador e não pode ser alterado.</span>
          </div>
        )}

        <div className="screen-section">
          <SectionHeader eyebrow="Etapa 01" title="Cliente" />
          <Field label="Nome completo" required error={touched.name && errors.name}>
            <TextInput
              value={client.name}
              onChange={(v) => setClient({ ...client, name: v })}
              onBlur={() => setTouched((t) => ({ ...t, name: true }))}
              placeholder="ex. Marina Costa"
              disabled={inputDisabled}
            />
          </Field>
          <div className="grid-2">
            <Field label="Telefone" required error={touched.phone && errors.phone}>
              <TextInput
                value={client.phone}
                onChange={(v) => setClient({ ...client, phone: formatPhoneBR(v) })}
                onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
                type="tel"
                placeholder="(11) 99999-0000"
                disabled={inputDisabled}
              />
            </Field>
            <Field label="E-mail (opcional)" error={touched.email && errors.email}>
              <TextInput
                value={client.email}
                onChange={(v) => setClient({ ...client, email: v })}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                type="email"
                placeholder="cliente@email.com"
                disabled={inputDisabled}
              />
            </Field>
          </div>
        </div>

        <div className="rule" />

        <div className="screen-section">
          <SectionHeader eyebrow="Etapa 02" title="Veículo" />
          <div className="grid-2">
            <Field label="Placa" required error={touched.plate && errors.plate}>
              <TextInput
                value={vehicle.plate}
                onChange={(v) => setVehicle({ ...vehicle, plate: formatPlate(v) })}
                onBlur={() => setTouched((t) => ({ ...t, plate: true }))}
                placeholder="ABC-1D23"
                style={{ letterSpacing: '0.08em', fontFamily: 'var(--e-mid)', fontSize: 16 }}
                disabled={inputDisabled}
              />
            </Field>
            <Field label="Ano">
              <TextInput
                value={vehicle.year}
                onChange={(v) => setVehicle({ ...vehicle, year: v.replace(/\D/g, '').slice(0, 4) })}
                type="text"
                inputMode="numeric"
                placeholder="2024"
                disabled={inputDisabled}
              />
            </Field>
          </div>
          <Field label="Marca">
            <select
              className="field-input"
              value={vehicle.brand}
              onChange={(e) => setVehicle({ ...vehicle, brand: e.target.value })}
              disabled={inputDisabled}
            >
              <option value="">Selecione a marca</option>
              {CAR_BRANDS.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </Field>
          <div className="grid-2">
            <Field label="Modelo">
              <TextInput
                value={vehicle.model}
                onChange={(v) => setVehicle({ ...vehicle, model: v })}
                placeholder="911 Carrera S"
                disabled={inputDisabled}
              />
            </Field>
            <Field label="Cor">
              <TextInput
                value={vehicle.color}
                onChange={(v) => setVehicle({ ...vehicle, color: v })}
                placeholder="Preto Jet"
                disabled={inputDisabled}
              />
            </Field>
          </div>
          <Field label="Quilometragem" hint="Apenas números, sem ponto">
            <TextInput
              value={vehicle.km}
              onChange={(v) => setVehicle({ ...vehicle, km: v.replace(/\D/g, '') })}
              type="text"
              inputMode="numeric"
              placeholder="42500"
              suffix="km"
              disabled={inputDisabled}
            />
          </Field>
          <Field
            label="Tamanho do veículo"
            required
            hint="Os valores dos serviços são ajustados conforme o porte"
          >
            <div className="status-row" role="radiogroup" aria-label="Tamanho do veículo">
              {VEHICLE_SIZE_OPTIONS.map((opt) => {
                const active = vehicleSize === opt.id
                return (
                  <button
                    key={opt.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    className={`status-btn ${active ? 'active' : ''}`}
                    onClick={() => onVehicleSizeChange(opt.id)}
                    title={opt.hint}
                    disabled={inputDisabled}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
            <div className="dim" style={{ fontSize: 11, marginTop: 8, letterSpacing: '0.03em' }}>
              {VEHICLE_SIZE_OPTIONS.find((o) => o.id === vehicleSize)?.hint}
            </div>
          </Field>
        </div>

        <div className="rule" />

        <div className="screen-section">
          <SectionHeader
            eyebrow="Etapa 03"
            title="Serviços"
            action={
              <span
                style={{
                  fontSize: 11,
                  color: selectedCount > 0 ? 'var(--gold)' : 'var(--t-fg-4)',
                  letterSpacing: '0.05em',
                }}
              >
                {selectedCount} selecionado{selectedCount !== 1 ? 's' : ''}
              </span>
            }
          />
          {touched.services && errors.services && (
            <div className="field-msg err" style={{ marginBottom: -6 }}>
              {errors.services}
            </div>
          )}
          <div className="col" style={{ gap: 8 }}>
            {SERVICES_CATALOG.map((s) => {
              const on = !!selected[s.id]
              return (
                <button
                  key={s.id}
                  type="button"
                  className={`svc-item ${on ? 'selected' : ''}`}
                  onClick={() => {
                    if (readOnly) return
                    setSelected({ ...selected, [s.id]: !on })
                    setOverride('')
                  }}
                  style={{ textAlign: 'left', cursor: readOnly ? 'default' : 'pointer', opacity: readOnly ? 0.85 : 1 }}
                  disabled={readOnly}
                >
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      border: `1px solid ${on ? 'var(--gold)' : 'var(--t-line-strong)'}`,
                      background: on ? 'var(--gold)' : 'transparent',
                      borderRadius: 2,
                      flexShrink: 0,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {on && <Icon name="Check" size={13} stroke={3} style={{ color: '#0B0B0B' }} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="svc-name">{s.name}</div>
                    <div className="svc-desc">{s.desc}</div>
                  </div>
                  <div className="svc-price">{formatBRL(servicePrice(s, vehicleSize))}</div>
                </button>
              )
            })}
          </div>

          <Field label="Descrição adicional (opcional)">
            <TextArea
              value={desc}
              onChange={setDesc}
              placeholder="Detalhes específicos do serviço..."
              maxLength={500}
              rows={3}
              disabled={inputDisabled}
            />
          </Field>
        </div>

        <div className="rule" />

        <div className="screen-section">
          <SectionHeader eyebrow="Etapa 04" title="Valor total" />
          <div className="card-hairline" style={{ padding: 16 }}>
            <div className="row-between" style={{ marginBottom: 10 }}>
              <span className="dim" style={{ fontSize: 13 }}>
                Subtotal de serviços
              </span>
              <span style={{ color: 'var(--t-fg)', fontSize: 14, fontVariantNumeric: 'tabular-nums' }}>
                {formatBRL(servicesSubtotal)}
              </span>
            </div>
            <div className="row-between" style={{ marginBottom: 14 }}>
              <span className="dim" style={{ fontSize: 13 }}>
                Desconto
              </span>
              <div className="row" style={{ gap: 6 }}>
                <span className="dim" style={{ fontSize: 13 }}>
                  R$
                </span>
                <input
                  className="field-input"
                  style={{ height: 32, width: 90, textAlign: 'right', padding: '0 8px', fontSize: 13 }}
                  type="text"
                  inputMode="numeric"
                  value={discount}
                  onChange={(e) => {
                    setDiscount(e.target.value.replace(/\D/g, ''))
                    setOverride('')
                  }}
                  disabled={inputDisabled}
                />
              </div>
            </div>
            <div className="total-line" style={{ paddingBottom: 0, paddingTop: 12 }}>
              <div>
                <div className="lbl">Total</div>
                <div className="dim" style={{ fontSize: 10, letterSpacing: '0.05em', marginTop: 2 }}>
                  {override !== '' ? 'Editado manualmente' : 'Calculado automaticamente'}
                </div>
              </div>
              {readOnly ? (
                <div
                  style={{
                    fontFamily: 'var(--e-display)',
                    color: 'var(--gold)',
                    fontSize: 28,
                    fontWeight: 500,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {formatBRL(total)}
                </div>
              ) : (
                <input
                  className="field-input"
                  value={override !== '' ? override : computedTotal}
                  onChange={(e) => setOverride(e.target.value.replace(/[^\d]/g, ''))}
                  type="text"
                  inputMode="numeric"
                  style={{
                    width: 160,
                    height: 50,
                    padding: 0,
                    textAlign: 'right',
                    background: 'transparent',
                    border: 'none',
                    fontFamily: 'var(--e-display)',
                    color: 'var(--gold)',
                    fontSize: 28,
                    fontWeight: 500,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                />
              )}
            </div>
            {touched.total && errors.total && (
              <div className="field-msg err" style={{ marginTop: 6 }}>
                {errors.total}
              </div>
            )}
            {!readOnly && override !== '' && (
              <button
                type="button"
                className="link-cta"
                style={{ fontSize: 10, marginTop: 8 }}
                onClick={() => setOverride('')}
              >
                Recalcular automaticamente
              </button>
            )}
          </div>
        </div>

        <div className="screen-section">
          <Field
            label="Observações internas (opcional)"
            hint="Visível apenas ao técnico — máx. 500 caracteres"
          >
            <TextArea
              value={internal}
              onChange={setInternal}
              placeholder="ex. Cliente prefere atendimento aos sábados..."
              maxLength={500}
              rows={2}
              disabled={inputDisabled}
            />
          </Field>
        </div>

        <div className="screen-section">
          {readOnly ? (
            <Button block variant="secondary" onClick={onBack}>
              Voltar à lista
            </Button>
          ) : (
            <>
              <Button block onClick={save} icon="Save">
                Salvar orçamento
              </Button>
              <Button block variant="secondary" onClick={requestApproval} icon="Send">
                Enviar para aprovação
              </Button>
              <Button block variant="ghost" onClick={() => setConfirmCancel(true)}>
                Cancelar
              </Button>
            </>
          )}
        </div>
        <div className="spacer-lg" />
      </div>

      <Sheet
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        title="Descartar orçamento?"
        actions={
          <>
            <Button variant="ghost" onClick={() => setConfirmCancel(false)}>
              Continuar editando
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setConfirmCancel(false)
                onBack?.()
              }}
            >
              Descartar
            </Button>
          </>
        }
      >
        <p>Tem certeza que deseja cancelar? Os dados não salvos serão perdidos.</p>
      </Sheet>

      <Sheet
        open={confirmApproval}
        onClose={() => setConfirmApproval(false)}
        title="Enviar para aprovação"
        actions={
          <>
            <Button variant="ghost" onClick={() => setConfirmApproval(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={confirmSubmitApproval} icon="Send">
              Confirmar envio
            </Button>
          </>
        }
      >
        <p>
          O orçamento de <span className="gold-text">{formatBRL(total)}</span> será enviado ao
          administrador para análise e aprovação. Você poderá editá-lo enquanto estiver pendente.
        </p>
      </Sheet>
    </>
  )
}

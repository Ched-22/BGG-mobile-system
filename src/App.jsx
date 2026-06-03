import { useState, useEffect, useCallback } from 'react'
import { Icon } from './components/Icon.jsx'
import { BottomNav, Sheet, Toast, TopBar } from './components/ui/index.jsx'
import {
  useTweaks,
  TweaksPanel,
  TweakSection,
  TweakRadio,
  TweakToggle,
  TweakButton,
} from './components/tweaks/TweaksPanel.jsx'
import { LoginScreen, Dashboard } from './screens/auth.jsx'
import { OrcamentoScreen } from './screens/OrcamentoScreen.jsx'
import { OrcamentosListScreen } from './screens/OrcamentosListScreen.jsx'
import { ChecklistScreen } from './screens/ChecklistScreen.jsx'
import { AgendamentosListScreen, AgendamentoDetailScreen } from './screens/AgendamentosScreen.jsx'
import { useOrcamentos } from './hooks/useOrcamentos.js'
import { useAgendamentos, agendamentoToVehicleContext } from './hooks/useAgendamentos.js'

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  density: 'comfortable',
  editorial: 'medium',
}/*EDITMODE-END*/

function restoreUser() {
  try {
    const token = localStorage.getItem('bgg-mobile-token')
    const raw = localStorage.getItem('bgg-mobile-user')
    if (token && raw) return JSON.parse(raw)
  } catch {
    /* ignore */
  }
  return null
}

/** Raiz: hooks estáveis (sem dados da API). Evita violação de ordem no HMR/login. */
export default function App() {
  const [user, setUser] = useState(restoreUser)
  const [toasts, setToasts] = useState([])
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS)

  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-density', tweaks.density)
    root.setAttribute('data-editorial', tweaks.editorial)
  }, [tweaks])

  const addToast = useCallback((t) => {
    const item = { ...t, id: Date.now() + Math.random() }
    setToasts((prev) => [...prev, item])
    setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== item.id))
    }, 3000)
  }, [])

  const onLogin = (u) => {
    setUser(u)
    addToast({ kind: 'ok', msg: `Bem-vindo, ${u.name.split(' ')[0]}` })
  }

  const onLogout = () => {
    localStorage.removeItem('bgg-mobile-token')
    localStorage.removeItem('bgg-mobile-user')
    setUser(null)
  }

  if (!user) {
    return (
      <>
        <LoginScreen onLogin={onLogin} />
        <Toast toasts={toasts} />
        <TweaksPanel title="Tweaks">
          <TweakSection label="Densidade">
            <TweakRadio
              label="Espaço"
              value={tweaks.density}
              onChange={(v) => setTweak('density', v)}
              options={[
                { label: 'Compacto', value: 'compact' },
                { label: 'Normal', value: 'comfortable' },
                { label: 'Amplo', value: 'spacious' },
              ]}
            />
          </TweakSection>
          <TweakSection label="Tipografia">
            <TweakRadio
              label="Estilo"
              value={tweaks.editorial}
              onChange={(v) => setTweak('editorial', v)}
              options={[
                { label: 'Utilitária', value: 'low' },
                { label: 'Híbrida', value: 'medium' },
                { label: 'Editorial', value: 'high' },
              ]}
            />
          </TweakSection>
        </TweaksPanel>
      </>
    )
  }

  return (
    <AuthenticatedApp
      user={user}
      onLogout={onLogout}
      tweaks={tweaks}
      setTweak={setTweak}
      toasts={toasts}
      addToast={addToast}
    />
  )
}

/** Área logada: hooks de orçamentos/agendamentos ficam só aqui. */
function AuthenticatedApp({ user, onLogout, tweaks, setTweak, toasts, addToast }) {
  const [screen, setScreen] = useState('dashboard')
  const [vehicleContext, setVehicleContext] = useState(null)
  const [selectedAgendamentoId, setSelectedAgendamentoId] = useState(null)
  const [editingOrcamentoId, setEditingOrcamentoId] = useState(null)
  const [navActive, setNavActive] = useState('dashboard')
  const [menuOpen, setMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [online, setOnline] = useState(true)

  const {
    pendingList,
    approvedList,
    getById,
    saveDraft,
    submitForApproval,
    orcamentosError,
  } = useOrcamentos()

  const {
    todayList,
    upcomingList,
    getById: getAgendamentoById,
    findByPlate,
  } = useAgendamentos()

  const goOrcamentosList = () => {
    setEditingOrcamentoId(null)
    setScreen('orcamentos')
    setNavActive('orcamento')
  }

  const openOrcamentoNew = () => {
    setEditingOrcamentoId(null)
    setScreen('orcamento-form')
    setNavActive('orcamento')
  }

  const openOrcamentoById = (id) => {
    setEditingOrcamentoId(id)
    setScreen('orcamento-form')
    setNavActive('orcamento')
  }

  const goAgendamentosList = () => {
    setSelectedAgendamentoId(null)
    setVehicleContext(null)
    setScreen('agendamentos')
    setNavActive('checklist')
  }

  const openAgendamentoDetail = (id) => {
    setSelectedAgendamentoId(id)
    setScreen('agendamento-detail')
    setNavActive('checklist')
  }

  const openChecklistForAgendamento = (id) => {
    const ag = getAgendamentoById(id)
    if (!ag) {
      addToast({ kind: 'error', msg: 'Atendimento não encontrado' })
      goAgendamentosList()
      return
    }
    setSelectedAgendamentoId(id)
    setVehicleContext(agendamentoToVehicleContext(ag))
    setScreen('checklist')
    setNavActive('checklist')
  }

  const onOpen = (target, ctx) => {
    if (target === 'orcamento-new') {
      openOrcamentoNew()
    } else if (target === 'orcamentos') {
      goOrcamentosList()
    } else if (target === 'agendamentos' || target === 'checklist') {
      if (ctx?.assignmentId) {
        openAgendamentoDetail(ctx.assignmentId)
      } else if (ctx?.plate) {
        const found = findByPlate(ctx.plate)
        if (found) openAgendamentoDetail(found.id)
        else goAgendamentosList()
      } else {
        goAgendamentosList()
      }
    } else if (target === 'menu') setMenuOpen(true)
    else if (target === 'notifications') setNotifOpen(true)
  }

  const onNav = (id) => {
    setNavActive(id)
    if (id === 'dashboard') setScreen('dashboard')
    if (id === 'orcamento') goOrcamentosList()
    if (id === 'checklist') goAgendamentosList()
    if (id === 'clientes') setScreen('clientes')
  }

  const goDashboard = () => {
    setScreen('dashboard')
    setNavActive('dashboard')
    setEditingOrcamentoId(null)
    setSelectedAgendamentoId(null)
    setVehicleContext(null)
  }

  const handleSaveDraft = async (record) => {
    const saved = await saveDraft(record)
    if (saved?.id) setEditingOrcamentoId(saved.id)
    goOrcamentosList()
    return saved
  }

  const handleSubmitForApproval = async (record) => {
    const saved = await submitForApproval(record)
    goOrcamentosList()
    return saved
  }

  const handleLogout = () => {
    onLogout()
  }

  const editingBudget = editingOrcamentoId ? getById(editingOrcamentoId) : null
  const selectedAgendamento = selectedAgendamentoId ? getAgendamentoById(selectedAgendamentoId) : null

  const renderScreen = () => {
    switch (screen) {
      case 'dashboard':
        return (
          <Dashboard
            user={user}
            onOpen={onOpen}
            onLogout={handleLogout}
          />
        )
      case 'orcamentos':
        return (
          <OrcamentosListScreen
            pendingList={pendingList}
            approvedList={approvedList}
            apiError={orcamentosError}
            onMenu={() => setMenuOpen(true)}
            onNew={openOrcamentoNew}
            onOpen={openOrcamentoById}
          />
        )
      case 'orcamento-form':
        return (
          <OrcamentoScreen
            budget={editingBudget}
            onBack={goOrcamentosList}
            onSaveDraft={handleSaveDraft}
            onSubmitForApproval={handleSubmitForApproval}
            onBudgetPersisted={(saved) => setEditingOrcamentoId(saved.id)}
            addToast={addToast}
            online={online}
          />
        )
      case 'agendamentos':
        return (
          <AgendamentosListScreen
            todayList={todayList}
            upcomingList={upcomingList}
            onMenu={() => setMenuOpen(true)}
            onSelect={openAgendamentoDetail}
          />
        )
      case 'agendamento-detail':
        return (
          <AgendamentoDetailScreen
            agendamento={selectedAgendamento}
            onBack={goAgendamentosList}
            onOpenChecklist={openChecklistForAgendamento}
          />
        )
      case 'checklist':
        return (
          <ChecklistScreen
            onBack={() => {
              if (selectedAgendamentoId) {
                setScreen('agendamento-detail')
              } else {
                goAgendamentosList()
              }
            }}
            addToast={addToast}
            online={online}
            vehicleContext={vehicleContext}
          />
        )
      case 'clientes':
        return <ClientesPlaceholder onBack={goDashboard} />
      default:
        return (
          <Dashboard
            user={user}
            onOpen={onOpen}
            onLogout={handleLogout}
          />
        )
    }
  }

  return (
    <>
      <div className="phone-shell">
        {!online && (
          <div className="banner" style={{ position: 'sticky', top: 0, zIndex: 40 }}>
            <span className="dot" />
            <span>Você está offline. Os dados serão salvos no dispositivo.</span>
          </div>
        )}
        {renderScreen()}
        <BottomNav active={navActive} onNav={onNav} />
      </div>

      <Toast toasts={toasts} />

      <Sheet open={menuOpen} onClose={() => setMenuOpen(false)} title="Menu">
        <div className="col" style={{ gap: 0 }}>
          {[
            {
              icon: 'Sparkles',
              label: 'Início',
              action: () => {
                setMenuOpen(false)
                goDashboard()
              },
            },
            {
              icon: 'Wallet',
              label: 'Orçamentos',
              action: () => {
                setMenuOpen(false)
                goOrcamentosList()
              },
            },
            {
              icon: 'Plus',
              label: 'Novo orçamento',
              action: () => {
                setMenuOpen(false)
                openOrcamentoNew()
              },
            },
            {
              icon: 'ClipboardList',
              label: 'Tarefas e agendamentos',
              action: () => {
                setMenuOpen(false)
                goAgendamentosList()
              },
            },
            {
              icon: 'User',
              label: 'Meus clientes',
              action: () => {
                setMenuOpen(false)
                setScreen('clientes')
                setNavActive('clientes')
              },
            },
            { icon: 'HelpCircle', label: 'Ajuda' },
            { icon: 'Settings', label: 'Configurações' },
          ].map((m, i) => (
            <button
              key={i}
              onClick={m.action}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '14px 4px',
                borderBottom: '1px solid var(--t-line-hairline)',
                textAlign: 'left',
                color: 'var(--t-fg-2)',
                fontSize: 14,
              }}
            >
              <Icon name={m.icon} size={18} style={{ color: 'var(--gold)' }} />
              <span>{m.label}</span>
              <Icon
                name="ChevronRight"
                size={14}
                style={{ marginLeft: 'auto', color: 'var(--t-fg-4)' }}
              />
            </button>
          ))}
          <button
            onClick={() => {
              setMenuOpen(false)
              handleLogout()
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '14px 4px',
              textAlign: 'left',
              color: 'var(--t-danger)',
              fontSize: 14,
              marginTop: 8,
            }}
          >
            <Icon name="LogOut" size={18} />
            <span>Sair</span>
          </button>
          <div
            className="dim"
            style={{
              fontSize: 10,
              letterSpacing: '0.1em',
              textAlign: 'center',
              marginTop: 16,
            }}
          >
            BGG · Técnico v 2.4.1
          </div>
        </div>
      </Sheet>

      <Sheet open={notifOpen} onClose={() => setNotifOpen(false)} title="Notificações">
        <div className="col" style={{ gap: 10 }}>
          {[
            {
              t: 'Saída pendente · RGM-2H47',
              b: 'Porsche 911 aguarda checklist de saída há 1h',
              chip: 'warn',
            },
            {
              t: 'Orçamento aguardando aprovação',
              b: 'Mercedes-AMG GT · Eduardo Almeida — enviado ao admin',
              chip: 'gold',
            },
            {
              t: 'Sincronização concluída',
              b: '3 checklists sincronizados com o servidor',
              chip: 'ok',
            },
          ].map((n, i) => (
            <div
              className="card-hairline"
              key={i}
              style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 4 }}
            >
              <div className="row-between">
                <div className="eyebrow" style={{ fontSize: 9 }}>
                  {n.t}
                </div>
                <span
                  className={`status-chip chip-${n.chip}`}
                  style={{ fontSize: 9, padding: '2px 6px' }}
                >
                  Novo
                </span>
              </div>
              <div className="body-text" style={{ fontSize: 12 }}>
                {n.b}
              </div>
            </div>
          ))}
        </div>
      </Sheet>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Densidade">
          <TweakRadio
            label="Espaço"
            value={tweaks.density}
            onChange={(v) => setTweak('density', v)}
            options={[
              { label: 'Compacto', value: 'compact' },
              { label: 'Normal', value: 'comfortable' },
              { label: 'Amplo', value: 'spacious' },
            ]}
          />
        </TweakSection>
        <TweakSection label="Tipografia">
          <TweakRadio
            label="Estilo"
            value={tweaks.editorial}
            onChange={(v) => setTweak('editorial', v)}
            options={[
              { label: 'Utilitária', value: 'low' },
              { label: 'Híbrida', value: 'medium' },
              { label: 'Editorial', value: 'high' },
            ]}
          />
        </TweakSection>
        <TweakSection label="Conectividade">
          <TweakToggle label="Online (demo)" value={online} onChange={setOnline} />
        </TweakSection>
        <TweakSection label="Atalhos de navegação">
          <TweakButton label="Dashboard" onClick={goDashboard} />
          <TweakButton label="Lista de orçamentos" onClick={goOrcamentosList} />
          <TweakButton label="Novo orçamento" onClick={openOrcamentoNew} />
          <TweakButton label="Tarefas e agendamentos" onClick={goAgendamentosList} />
          <TweakButton label="Checklist" onClick={() => { setScreen('checklist'); setNavActive('checklist') }} />
        </TweakSection>
      </TweaksPanel>
    </>
  )
}

function ClientesPlaceholder({ onBack }) {
  return (
    <>
      <TopBar title="Meus clientes" onBack={onBack} />
      <div className="screen">
        <div className="screen-section">
          <div className="eyebrow">Em breve</div>
          <h1 className="h-display md">Lista de clientes</h1>
          <p className="body-text">
            Esta tela é placeholder no protótipo atual. Foque nas telas de Orçamento e
            Checklist (entrada/saída).
          </p>
        </div>
      </div>
    </>
  )
}

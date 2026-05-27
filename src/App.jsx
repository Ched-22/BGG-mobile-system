import { useState, useEffect, useCallback } from 'react'
import { Icon } from './components/Icon.jsx'
import { ThemeToggle } from './components/ThemeToggle.jsx'
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
import { ChecklistScreen } from './screens/ChecklistScreen.jsx'

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  density: 'comfortable',
  editorial: 'medium',
  theme: 'dark',
}/*EDITMODE-END*/

export default function App() {
  const [screen, setScreen] = useState('login')
  const [user, setUser] = useState(null)
  const [vehicleContext, setVehicleContext] = useState(null)
  const [toasts, setToasts] = useState([])
  const [navActive, setNavActive] = useState('dashboard')
  const [menuOpen, setMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [online, setOnline] = useState(true)
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS)

  const toggleTheme = useCallback(() => {
    setTweak('theme', tweaks.theme === 'dark' ? 'light' : 'dark')
  }, [tweaks.theme, setTweak])

  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-density', tweaks.density)
    root.setAttribute('data-editorial', tweaks.editorial)
    root.setAttribute('data-theme', tweaks.theme)
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
    setScreen('dashboard')
    setNavActive('dashboard')
    addToast({ kind: 'ok', msg: `Bem-vindo, ${u.name.split(' ')[0]}` })
  }

  const onOpen = (target, ctx) => {
    if (target === 'orcamento-new') {
      setScreen('orcamento')
      setNavActive('orcamento')
    } else if (target === 'checklist') {
      if (ctx) setVehicleContext(ctx)
      setScreen('checklist')
      setNavActive('checklist')
    } else if (target === 'menu') setMenuOpen(true)
    else if (target === 'notifications') setNotifOpen(true)
  }

  const onNav = (id) => {
    setNavActive(id)
    if (id === 'dashboard') setScreen('dashboard')
    if (id === 'orcamento') setScreen('orcamento')
    if (id === 'checklist') setScreen('checklist')
    if (id === 'clientes') setScreen('clientes')
  }

  const goDashboard = () => {
    setScreen('dashboard')
    setNavActive('dashboard')
  }

  const renderScreen = () => {
    switch (screen) {
      case 'login':
        return (
          <LoginScreen
            onLogin={onLogin}
            theme={tweaks.theme}
            onToggleTheme={toggleTheme}
          />
        )
      case 'dashboard':
        return (
          <Dashboard
            user={user}
            onOpen={onOpen}
            theme={tweaks.theme}
            onToggleTheme={toggleTheme}
            onLogout={() => {
              setUser(null)
              setScreen('login')
            }}
          />
        )
      case 'orcamento':
        return (
          <OrcamentoScreen
            onBack={goDashboard}
            onSaved={goDashboard}
            addToast={addToast}
            online={online}
            theme={tweaks.theme}
            onToggleTheme={toggleTheme}
          />
        )
      case 'checklist':
        return (
          <ChecklistScreen
            onBack={goDashboard}
            addToast={addToast}
            online={online}
            vehicleContext={vehicleContext}
            theme={tweaks.theme}
            onToggleTheme={toggleTheme}
          />
        )
      case 'clientes':
        return (
          <ClientesPlaceholder
            onBack={goDashboard}
            theme={tweaks.theme}
            onToggleTheme={toggleTheme}
          />
        )
      default:
        return null
    }
  }

  const isLogin = screen === 'login'

  return (
    <>
      <div className="phone-shell">
        {!online && !isLogin && (
          <div className="banner" style={{ position: 'sticky', top: 0, zIndex: 40 }}>
            <span className="dot" />
            <span>Você está offline. Os dados serão salvos no dispositivo.</span>
          </div>
        )}
        {renderScreen()}
        {!isLogin && <BottomNav active={navActive} onNav={onNav} />}
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
              label: 'Novo orçamento',
              action: () => {
                setMenuOpen(false)
                onOpen('orcamento-new')
              },
            },
            {
              icon: 'ClipboardList',
              label: 'Checklist do veículo',
              action: () => {
                setMenuOpen(false)
                onOpen('checklist')
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
            {
              icon: tweaks.theme === 'dark' ? 'Sun' : 'Moon',
              label: tweaks.theme === 'dark' ? 'Modo claro' : 'Modo escuro',
              action: () => {
                setMenuOpen(false)
                toggleTheme()
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
              setUser(null)
              setScreen('login')
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
              t: 'Orçamento enviado',
              b: 'Marina Costa visualizou seu orçamento de R$ 2.330',
              chip: 'ok',
            },
            {
              t: 'Sincronização concluída',
              b: '3 checklists sincronizados com o servidor',
              chip: 'gold',
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
        <TweakSection label="Modo de cor">
          <TweakRadio
            label="Tema"
            value={tweaks.theme}
            onChange={(v) => setTweak('theme', v)}
            options={[
              { label: 'Escuro', value: 'dark' },
              { label: 'Claro', value: 'light' },
            ]}
          />
        </TweakSection>
        <TweakSection label="Conectividade">
          <TweakToggle label="Online (demo)" value={online} onChange={setOnline} />
        </TweakSection>
        <TweakSection label="Atalhos de navegação">
          <TweakButton
            label="Tela de login"
            onClick={() => {
              setUser(null)
              setScreen('login')
            }}
          />
          <TweakButton
            label="Dashboard"
            onClick={() => {
              if (!user) setUser({ name: 'Rafael Marques', role: 'Técnico Sênior' })
              goDashboard()
            }}
          />
          <TweakButton
            label="Orçamento"
            onClick={() => {
              if (!user) setUser({ name: 'Rafael Marques', role: 'Técnico Sênior' })
              setScreen('orcamento')
              setNavActive('orcamento')
            }}
          />
          <TweakButton
            label="Checklist"
            onClick={() => {
              if (!user) setUser({ name: 'Rafael Marques', role: 'Técnico Sênior' })
              setScreen('checklist')
              setNavActive('checklist')
            }}
          />
        </TweakSection>
      </TweaksPanel>
    </>
  )
}

function ClientesPlaceholder({ onBack, theme, onToggleTheme }) {
  return (
    <>
      <TopBar
        title="Meus clientes"
        onBack={onBack}
        right={<ThemeToggle theme={theme} onToggle={onToggleTheme} />}
      />
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

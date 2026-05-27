// ============================================================
// BGG Mobile — Login & Dashboard screens
// ============================================================
import { useState } from 'react'
import { Icon } from '../components/Icon.jsx'
import { ThemeToggle, TopBarActions } from '../components/ThemeToggle.jsx'
import {
  TopBar,
  Field,
  TextInput,
  Checkbox,
  Button,
  SectionHeader,
} from '../components/ui/index.jsx'
import { isValidEmail } from '../utils/format.js'

export function LoginScreen({ onLogin, theme, onToggleTheme }) {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [remember, setRemember] = useState(true);
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});

  const validate = (extra = {}) => {
    const e = {};
    const eml = extra.email !== undefined ? extra.email : email;
    const pwd = extra.pass !== undefined ? extra.pass : pass;
    if (!eml) e.email = "Endereço de e-mail é obrigatório";
    else if (!isValidEmail(eml)) e.email = "Digite um endereço de e-mail válido";
    if (!pwd) e.pass = "Senha é obrigatória";
    return e;
  };

  const submit = (preset) => {
    const e = validate();
    setErrors(e);
    setTouched({ email: true, pass: true });
    if (Object.keys(e).length > 0) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin({ name: "Rafael Marques", role: "Técnico Sênior" });
    }, 700);
  };

  const quickFill = () => {
    setEmail("rafael@blackgoldgarage.com.br");
    setPass("••••••••");
    setErrors({});
  };

  return (
    <div className="phone-shell fade-in">
      <div className="login-bg">
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8 }}>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          <div className="banner" style={{ background: "transparent", border: "1px solid var(--t-line)", padding: "4px 10px" }}>
            <Icon name="Wifi" size={11}/>
            <span>Online</span>
          </div>
        </div>

        <div className="login-mark" style={{ marginTop: 36 }}>
          <div className="wordmark">BGG</div>
          <div className="rule-gold" />
          <div className="submark">Black Gold Garage · Técnicos</div>
        </div>

        <div className="col" style={{ gap: 20, position: "relative", zIndex: 1 }}>
          <div className="stack-tight" style={{ alignItems: "center", textAlign: "center" }}>
            <div className="eyebrow">Acesso restrito</div>
            <h1 className="h-display lg" style={{ textAlign: "center" }}>Entrar no Sistema</h1>
          </div>

          <Field
            label="E-mail"
            required
            error={touched.email && errors.email}
          >
            <TextInput
              value={email}
              onChange={(v) => { setEmail(v); if (touched.email) setErrors(validate({ email: v })); }}
              type="email"
              placeholder="seu@blackgoldgarage.com.br"
            />
          </Field>

          <Field
            label="Senha"
            required
            error={touched.pass && errors.pass}
          >
            <div style={{ position: "relative" }}>
              <TextInput
                value={pass}
                onChange={(v) => { setPass(v); if (touched.pass) setErrors(validate({ pass: v })); }}
                type={show ? "text" : "password"}
                placeholder="••••••••"
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShow(s => !s)}
                aria-label="Mostrar senha"
                style={{
                  position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                  color: "var(--t-fg-3)", padding: 6,
                }}
              >
                <Icon name={show ? "EyeOff" : "Eye"} size={18}/>
              </button>
            </div>
          </Field>

          <div className="row-between" style={{ paddingTop: 4 }}>
            <Checkbox checked={remember} onChange={setRemember}>Lembrar-me</Checkbox>
            <a className="link-cta" onClick={quickFill}>Esqueci a senha</a>
          </div>

          <Button block onClick={submit} disabled={loading} icon={loading ? null : "ArrowRight"}>
            {loading ? "Entrando…" : "Entrar"}
          </Button>

          <div className="row" style={{ justifyContent: "center", gap: 8 }}>
            <div className="rule-gold" style={{ width: 14 }} />
            <span style={{ fontSize: 10, letterSpacing: "0.18em", color: "var(--t-fg-4)", textTransform: "uppercase" }}>
              ou preencher demo
            </span>
            <div className="rule-gold" style={{ width: 14 }} />
          </div>
          <Button block variant="ghost" onClick={quickFill} size="sm">Usar credenciais de demonstração</Button>
        </div>

        <div style={{ textAlign: "center", color: "var(--t-fg-4)", fontSize: 10, letterSpacing: "0.1em" }}>
          v 2.4.1 · © BLACK GOLD GARAGE
        </div>
      </div>
    </div>
  );
}

// ---------- Dashboard ----------
export function Dashboard({ user, onOpen, theme, onToggleTheme }) {
  return (
    <>
      <TopBar
        title="BGG · Técnico"
        onMenu={() => onOpen("menu")}
        right={(
          <TopBarActions theme={theme} onToggleTheme={onToggleTheme}>
            <button className="topbar-action" onClick={() => onOpen("notifications")} aria-label="Notificações">
              <Icon name="Bell" size={20}/>
            </button>
          </TopBarActions>
        )}
      />
      <div className="screen">
        <div className="screen-section">
          <div className="eyebrow">Bem-vindo de volta</div>
          <h1 className="h-display lg">{user.name}</h1>
          <div className="muted" style={{ fontSize: 12, letterSpacing: "0.05em" }}>{user.role} · OS de hoje: <span className="gold-text">3 ativas</span></div>
        </div>

        <div className="screen-section">
          <div className="grid-2" style={{ gap: 12 }}>
            <button className="action-tile" onClick={() => onOpen("orcamento-new")}>
              <div className="tile-glyph"><Icon name="Wallet" size={22} /></div>
              <div className="stack-tight">
                <div className="eyebrow">Novo</div>
                <div className="tile-title">Orçamento</div>
                <div className="tile-sub">Criar orçamento para um serviço automotivo</div>
              </div>
              <div className="tile-arrow"><Icon name="ArrowRight" size={18}/></div>
            </button>

            <button className="action-tile" onClick={() => onOpen("checklist")}>
              <div className="tile-glyph"><Icon name="ClipboardList" size={22} /></div>
              <div className="stack-tight">
                <div className="eyebrow">Veículo</div>
                <div className="tile-title">Checklist</div>
                <div className="tile-sub">Registrar entrada ou saída do veículo</div>
              </div>
              <div className="tile-arrow"><Icon name="ArrowRight" size={18}/></div>
            </button>
          </div>
        </div>

        <div className="screen-section">
          <SectionHeader
            eyebrow="Em andamento"
            title="Atendimentos abertos"
            action={<a className="link-cta">Ver todos</a>}
          />
          <div className="col" style={{ gap: 10 }}>
            {[
              { plate: "RGM-2H47", car: "Porsche 911 Carrera S", client: "Marina Costa", status: "Aguardando saída", chip: "warn" },
              { plate: "HBL-9C12", car: "Mercedes-AMG GT", client: "Eduardo Almeida", status: "Em serviço", chip: "gold" },
              { plate: "ABC-1D23", car: "Range Rover Velar", client: "Beatriz Lima", status: "Entrada concluída", chip: "ok" },
            ].map((o, i) => (
              <button
                key={i}
                className="card"
                style={{ textAlign: "left", display: "flex", flexDirection: "column", gap: 8 }}
                onClick={() => onOpen("checklist", { plate: o.plate, car: o.car, client: o.client })}
              >
                <div className="row-between">
                  <div className="stack-tight">
                    <div style={{ fontFamily: "var(--e-mid)", color: "var(--gold)", fontSize: 16, fontWeight: 500, letterSpacing: "0.06em" }}>{o.plate}</div>
                    <div style={{ fontSize: 13, color: "var(--t-fg)" }}>{o.car}</div>
                    <div style={{ fontSize: 11, color: "var(--t-fg-4)", letterSpacing: "0.04em" }}>Cliente: {o.client}</div>
                  </div>
                  <span className={`status-chip chip-${o.chip}`}>{o.status}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="screen-section">
          <SectionHeader eyebrow="Resumo do dia" title="Métricas" />
          <div className="grid-3">
            {[
              { v: "07", l: "Orçamentos" },
              { v: "04", l: "Entradas" },
              { v: "02", l: "Saídas" },
            ].map((m, i) => (
              <div key={i} className="card-hairline" style={{ textAlign: "center", padding: 12 }}>
                <div style={{ fontFamily: "var(--e-display)", color: "var(--gold)", fontSize: 26, fontWeight: 500, letterSpacing: "0.04em" }}>{m.v}</div>
                <div style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--t-fg-4)", fontWeight: 600, marginTop: 4 }}>{m.l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="spacer" />
      </div>
    </>
  );
}


// ============================================================
// BGG Mobile — Orçamento (criação)
// ============================================================
import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { Icon } from '../components/Icon.jsx'
import { TopBarActions } from '../components/ThemeToggle.jsx'
import {
  TopBar,
  Field,
  TextInput,
  TextArea,
  Button,
  Sheet,
  SectionHeader,
  formatPlate,
  formatPhoneBR,
  formatBRL,
  isValidPlate,
} from '../components/ui/index.jsx'

const SERVICES_CATALOG = [
  { id: "polim", name: "Polimento técnico", price: 480, desc: "Correção de pintura em 1 etapa" },
  { id: "vitri", name: "Vitrificação cerâmica", price: 1850, desc: "Proteção cerâmica de alto padrão" },
  { id: "ppf",   name: "PPF — película de proteção", price: 4200, desc: "Frontal completo, capô + para-choque" },
  { id: "couro", name: "Higienização de couro", price: 380, desc: "Bancos + painel + acabamentos" },
  { id: "motor", name: "Detalhamento de motor", price: 280, desc: "Limpeza e finalização" },
  { id: "ozonio", name: "Tratamento de ozônio", price: 220, desc: "Sanitização completa do habitáculo" },
  { id: "rodas", name: "Restauração de rodas", price: 640, desc: "Polimento + selante por roda" },
  { id: "farol", name: "Polimento de faróis", price: 180, desc: "Restauração ótica" },
];

const CAR_BRANDS = ["Porsche", "Mercedes-Benz", "BMW", "Audi", "Lamborghini", "Range Rover", "Ferrari", "Maserati", "Volvo", "Outra"];

export function OrcamentoScreen({ onBack, onSaved, presetClient, presetVehicle, addToast, online, theme, onToggleTheme }) {
  const [client, setClient] = useState({
    name: presetClient?.name || "",
    phone: presetClient?.phone || "",
    email: presetClient?.email || "",
  });
  const [vehicle, setVehicle] = useState({
    plate: presetVehicle?.plate || "",
    brand: presetVehicle?.brand || "",
    model: presetVehicle?.model || "",
    year: presetVehicle?.year || "",
    color: presetVehicle?.color || "",
    km: presetVehicle?.km || "",
  });
  const [selected, setSelected] = useState({});
  const [override, setOverride] = useState(""); // user-edited total
  const [discount, setDiscount] = useState(0);
  const [desc, setDesc] = useState("");
  const [internal, setInternal] = useState("");
  const [touched, setTouched] = useState({});
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [confirmSend, setConfirmSend] = useState(false);

  const computedTotal = useMemo(() => {
    return Object.entries(selected).reduce((sum, [id, on]) => {
      if (!on) return sum;
      const s = SERVICES_CATALOG.find(x => x.id === id);
      return sum + (s ? s.price : 0);
    }, 0) - Number(discount || 0);
  }, [selected, discount]);
  const total = override !== "" ? Number(override) : computedTotal;

  const selectedCount = Object.values(selected).filter(Boolean).length;

  const validate = () => {
    const e = {};
    if (!client.name.trim()) e.name = "Nome do cliente é obrigatório";
    if (!client.phone.trim()) e.phone = "Telefone do cliente é obrigatório";
    else if (client.phone.replace(/\D/g, "").length < 10) e.phone = "Digite pelo menos 10 dígitos";
    if (client.email && !isValidEmail(client.email)) e.email = "Formato de e-mail inválido";
    if (!vehicle.plate.trim()) e.plate = "Placa do veículo é obrigatória";
    else if (!isValidPlate(vehicle.plate)) e.plate = "Digite uma placa no formato ABC1D23";
    if (selectedCount === 0) e.services = "Selecione pelo menos um serviço";
    if (total <= 0) e.total = "Valor total deve ser maior que zero";
    return e;
  };
  const errors = validate();

  const save = () => {
    setTouched({ name: true, phone: true, email: true, plate: true, services: true, total: true });
    if (Object.keys(errors).length > 0) {
      addToast({ kind: "error", msg: "Verifique os campos destacados" });
      return;
    }
    addToast({ kind: "ok", msg: online ? "Orçamento salvo com sucesso" : "Salvo offline — sincronizará ao reconectar" });
    onSaved?.();
  };

  const sendToCustomer = () => {
    setTouched({ name: true, phone: true, email: true, plate: true, services: true, total: true });
    if (Object.keys(errors).length > 0) {
      addToast({ kind: "error", msg: "Verifique os campos antes de enviar" });
      return;
    }
    if (!client.phone && !client.email) {
      addToast({ kind: "error", msg: "Cliente não possui telefone ou e-mail válido" });
      return;
    }
    setConfirmSend(true);
  };

  return (
    <>
      <TopBar title="Novo orçamento" onBack={() => setConfirmCancel(true)}
        right={(
          <TopBarActions theme={theme} onToggleTheme={onToggleTheme}>
            <button className="topbar-action" onClick={save} aria-label="Salvar">
              <Icon name="Save" size={20}/>
            </button>
          </TopBarActions>
        )}
      />
      <div className="screen">

        <div className="screen-section">
          <SectionHeader eyebrow="Etapa 01" title="Cliente" />
          <Field label="Nome completo" required error={touched.name && errors.name}>
            <TextInput value={client.name}
              onChange={(v) => { setClient({...client, name: v}); }}
              onBlur={() => setTouched(t => ({ ...t, name: true }))}
              placeholder="ex. Marina Costa" />
          </Field>
          <div className="grid-2">
            <Field label="Telefone" required error={touched.phone && errors.phone}>
              <TextInput value={client.phone}
                onChange={(v) => setClient({...client, phone: formatPhoneBR(v)})}
                onBlur={() => setTouched(t => ({ ...t, phone: true }))}
                type="tel" placeholder="(11) 99999-0000" />
            </Field>
            <Field label="E-mail (opcional)" error={touched.email && errors.email}>
              <TextInput value={client.email}
                onChange={(v) => setClient({...client, email: v})}
                onBlur={() => setTouched(t => ({ ...t, email: true }))}
                type="email" placeholder="cliente@email.com" />
            </Field>
          </div>
        </div>

        <div className="rule" />

        <div className="screen-section">
          <SectionHeader eyebrow="Etapa 02" title="Veículo" />
          <div className="grid-2">
            <Field label="Placa" required error={touched.plate && errors.plate}>
              <TextInput value={vehicle.plate}
                onChange={(v) => setVehicle({...vehicle, plate: formatPlate(v)})}
                onBlur={() => setTouched(t => ({ ...t, plate: true }))}
                placeholder="ABC-1D23"
                style={{ letterSpacing: "0.08em", fontFamily: "var(--e-mid)", fontSize: 16 }} />
            </Field>
            <Field label="Ano">
              <TextInput value={vehicle.year}
                onChange={(v) => setVehicle({...vehicle, year: v.replace(/\D/g,"").slice(0,4)})}
                type="text" inputMode="numeric" placeholder="2024" />
            </Field>
          </div>
          <Field label="Marca">
            <select className="field-input" value={vehicle.brand} onChange={(e) => setVehicle({...vehicle, brand: e.target.value})}>
              <option value="">Selecione a marca</option>
              {CAR_BRANDS.map(b => <option key={b}>{b}</option>)}
            </select>
          </Field>
          <div className="grid-2">
            <Field label="Modelo">
              <TextInput value={vehicle.model} onChange={(v) => setVehicle({...vehicle, model: v})} placeholder="911 Carrera S" />
            </Field>
            <Field label="Cor">
              <TextInput value={vehicle.color} onChange={(v) => setVehicle({...vehicle, color: v})} placeholder="Preto Jet" />
            </Field>
          </div>
          <Field label="Quilometragem" hint="Apenas números, sem ponto">
            <TextInput value={vehicle.km}
              onChange={(v) => setVehicle({...vehicle, km: v.replace(/\D/g, "")})}
              type="text" inputMode="numeric" placeholder="42500" suffix="km" />
          </Field>
        </div>

        <div className="rule" />

        <div className="screen-section">
          <SectionHeader
            eyebrow="Etapa 03"
            title="Serviços"
            action={<span style={{ fontSize: 11, color: selectedCount > 0 ? "var(--gold)" : "var(--t-fg-4)", letterSpacing: "0.05em" }}>{selectedCount} selecionado{selectedCount !== 1 ? "s" : ""}</span>}
          />
          {touched.services && errors.services && (
            <div className="field-msg err" style={{ marginBottom: -6 }}>{errors.services}</div>
          )}
          <div className="col" style={{ gap: 8 }}>
            {SERVICES_CATALOG.map(s => {
              const on = !!selected[s.id];
              return (
                <button
                  key={s.id}
                  type="button"
                  className={`svc-item ${on ? "selected" : ""}`}
                  onClick={() => { setSelected({...selected, [s.id]: !on}); setOverride(""); }}
                  style={{ textAlign: "left", cursor: "pointer" }}
                >
                  <div style={{
                    width: 22, height: 22, border: "1px solid " + (on ? "var(--gold)" : "var(--t-line-strong)"),
                    background: on ? "var(--gold)" : "transparent",
                    borderRadius: 2, flexShrink: 0,
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {on && <Icon name="Check" size={13} stroke={3} style={{ color: "#0B0B0B" }} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="svc-name">{s.name}</div>
                    <div className="svc-desc">{s.desc}</div>
                  </div>
                  <div className="svc-price">{formatBRL(s.price)}</div>
                </button>
              );
            })}
          </div>

          <Field label="Descrição adicional (opcional)">
            <TextArea value={desc} onChange={setDesc} placeholder="Detalhes específicos do serviço..." maxLength={500} rows={3}/>
          </Field>
        </div>

        <div className="rule" />

        <div className="screen-section">
          <SectionHeader eyebrow="Etapa 04" title="Valor total" />
          <div className="card-hairline" style={{ padding: 16 }}>
            <div className="row-between" style={{ marginBottom: 10 }}>
              <span className="dim" style={{ fontSize: 13 }}>Subtotal de serviços</span>
              <span style={{ color: "var(--t-fg)", fontSize: 14, fontVariantNumeric: "tabular-nums" }}>
                {formatBRL(Object.entries(selected).reduce((s, [id, on]) => s + (on ? (SERVICES_CATALOG.find(x => x.id === id)?.price || 0) : 0), 0))}
              </span>
            </div>
            <div className="row-between" style={{ marginBottom: 14 }}>
              <span className="dim" style={{ fontSize: 13 }}>Desconto</span>
              <div className="row" style={{ gap: 6 }}>
                <span className="dim" style={{ fontSize: 13 }}>R$</span>
                <input
                  className="field-input"
                  style={{ height: 32, width: 90, textAlign: "right", padding: "0 8px", fontSize: 13 }}
                  type="text" inputMode="numeric"
                  value={discount}
                  onChange={(e) => { setDiscount(e.target.value.replace(/\D/g,"")); setOverride(""); }}
                />
              </div>
            </div>
            <div className="total-line" style={{ paddingBottom: 0, paddingTop: 12 }}>
              <div>
                <div className="lbl">Total</div>
                <div className="dim" style={{ fontSize: 10, letterSpacing: "0.05em", marginTop: 2 }}>{override !== "" ? "Editado manualmente" : "Calculado automaticamente"}</div>
              </div>
              <input
                className="field-input"
                value={override !== "" ? override : computedTotal}
                onChange={(e) => setOverride(e.target.value.replace(/[^\d]/g,""))}
                type="text" inputMode="numeric"
                style={{
                  width: 160, height: 50, padding: 0,
                  textAlign: "right",
                  background: "transparent", border: "none",
                  fontFamily: "var(--e-display)", color: "var(--gold)", fontSize: 28, fontWeight: 500,
                  fontVariantNumeric: "tabular-nums"
                }}
              />
            </div>
            {touched.total && errors.total && <div className="field-msg err" style={{ marginTop: 6 }}>{errors.total}</div>}
            {override !== "" && (
              <button className="link-cta" style={{ fontSize: 10, marginTop: 8 }} onClick={() => setOverride("")}>
                Recalcular automaticamente
              </button>
            )}
          </div>
        </div>

        <div className="screen-section">
          <Field label="Observações internas (opcional)" hint="Visível apenas ao técnico — máx. 500 caracteres">
            <TextArea value={internal} onChange={setInternal} placeholder="ex. Cliente prefere atendimento aos sábados..." maxLength={500} rows={2}/>
          </Field>
        </div>

        <div className="screen-section">
          <Button block onClick={save} icon="Save">Salvar orçamento</Button>
          <Button block variant="secondary" onClick={sendToCustomer} icon="Whatsapp">Enviar ao cliente</Button>
          <Button block variant="ghost" onClick={() => setConfirmCancel(true)}>Cancelar</Button>
        </div>
        <div className="spacer-lg" />
      </div>

      <Sheet
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        title="Descartar orçamento?"
        actions={(
          <>
            <Button variant="ghost" onClick={() => setConfirmCancel(false)}>Continuar editando</Button>
            <Button variant="danger" onClick={() => { setConfirmCancel(false); onBack?.(); }}>Descartar</Button>
          </>
        )}
      >
        <p>Tem certeza que deseja cancelar? Os dados não salvos serão perdidos.</p>
      </Sheet>

      <Sheet
        open={confirmSend}
        onClose={() => setConfirmSend(false)}
        title="Enviar ao cliente"
        actions={(
          <>
            <Button variant="ghost" onClick={() => setConfirmSend(false)}>Cancelar</Button>
            <Button variant="primary" onClick={() => {
              setConfirmSend(false);
              addToast({ kind: "ok", msg: "Orçamento enviado ao cliente" });
              onSaved?.();
            }} icon="Send">Confirmar</Button>
          </>
        )}
      >
        <p>O orçamento de <span className="gold-text">{formatBRL(total)}</span> será enviado por WhatsApp para {client.phone || client.email}.</p>
      </Sheet>
    </>
  );
}


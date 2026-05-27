// ============================================================
// BGG Mobile — Checklist (Entrada + Saída)
// ============================================================
import { useState, useEffect, useMemo, useRef } from 'react'
import { Icon } from '../components/Icon.jsx'
import { TopBarActions } from '../components/ThemeToggle.jsx'
import {
  TopBar,
  Field,
  TextInput,
  TextArea,
  Button,
  Sheet,
  StatusButton,
  PhotoStrip,
  SectionHeader,
  Progress,
  SAMPLE_PHOTOS,
  formatPlate,
} from '../components/ui/index.jsx'

const CHECKLIST_ITEMS = [
  { id: "lataria", label: "Lataria (amassados, riscos)", icon: "Car" },
  { id: "vidros",  label: "Vidros (trincas, funcionamento)", icon: "GalleryHorizontal" },
  { id: "farois",  label: "Faróis e lanternas", icon: "Lightbulb" },
  { id: "pneus",   label: "Pneus (calibragem, banda)", icon: "Disc" },
  { id: "estepe",  label: "Estepe e ferramentas", icon: "Disc" },
  { id: "oleo",    label: "Nível do óleo", icon: "Droplet" },
  { id: "arref",   label: "Nível do líquido de arrefecimento", icon: "Droplet" },
  { id: "freio_fl", label: "Nível do fluido de freio", icon: "Droplet" },
  { id: "freios",  label: "Funcionamento dos freios", icon: "Gauge" },
  { id: "setas",   label: "Luzes de seta / pisca-alerta", icon: "AlertTriangle" },
  { id: "palhetas", label: "Palhetas do limpador", icon: "Wind" },
  { id: "cinto",   label: "Cinto de segurança", icon: "Shield" },
  { id: "bancos",  label: "Bancos (rasgos, sujeira)", icon: "User" },
  { id: "bateria", label: "Bateria (terminais, data)", icon: "Battery" },
  { id: "ac",      label: "Ar-condicionado", icon: "Snowflake" },
  { id: "doc",     label: "Documentação a bordo", icon: "FileText" },
];

// Helper: a sample "entry" state pre-filled, to demonstrate the Saída comparison
function buildSampleEntryState() {
  const state = {};
  // Pre-fill some items
  state["lataria"] = { status: "warn", note: "Risco leve na porta dianteira esquerda", photos: [SAMPLE_PHOTOS[0]] };
  state["vidros"] = { status: "ok", note: "", photos: [] };
  state["farois"] = { status: "ok", note: "", photos: [] };
  state["pneus"] = { status: "warn", note: "Banda dianteira gasta — recomenda troca", photos: [SAMPLE_PHOTOS[3]] };
  state["estepe"] = { status: "ok", note: "", photos: [] };
  state["oleo"] = { status: "ok", note: "", photos: [] };
  state["arref"] = { status: "ok", note: "", photos: [] };
  state["freio_fl"] = { status: "ok", note: "", photos: [] };
  state["freios"] = { status: "ok", note: "", photos: [] };
  state["setas"] = { status: "ok", note: "", photos: [] };
  state["palhetas"] = { status: "warn", note: "Sinais de ressecamento", photos: [] };
  state["cinto"] = { status: "ok", note: "", photos: [] };
  state["bancos"] = { status: "ok", note: "", photos: [] };
  state["bateria"] = { status: "ok", note: "", photos: [] };
  state["ac"] = { status: "ok", note: "", photos: [] };
  state["doc"] = { status: "na", note: "Documento digital", photos: [] };
  return state;
}

export function ChecklistScreen({ onBack, addToast, online, vehicleContext, theme, onToggleTheme }) {
  // Tab: "entrada" | "saida"
  const [tab, setTab] = useState("entrada");
  // Entry state (live)
  const [entry, setEntry] = useState(() => ({}));
  const [entryGeneralPhotos, setEntryGeneralPhotos] = useState([]);
  const [entryNotes, setEntryNotes] = useState("");
  const [entryFinalized, setEntryFinalized] = useState(false);

  // Exit state (initialized from entry on first switch / finalize)
  const [exitState, setExitState] = useState(() => ({}));
  const [exitGeneralPhotos, setExitGeneralPhotos] = useState([]);
  const [exitNotes, setExitNotes] = useState("");
  const [exitFinalized, setExitFinalized] = useState(false);
  const [showDiffs, setShowDiffs] = useState(false);

  const [confirmFinalEntry, setConfirmFinalEntry] = useState(false);
  const [confirmFinalExit, setConfirmFinalExit] = useState(false);
  const [confirmPerm, setConfirmPerm] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  // For initial demo, allow user to load sample entry data
  const loadSample = () => {
    setEntry(buildSampleEntryState());
    setEntryGeneralPhotos([SAMPLE_PHOTOS[1], SAMPLE_PHOTOS[2]]);
    setEntryNotes("Veículo recebido para vitrificação cerâmica completa.");
    setEntryFinalized(true);
    addToast({ kind: "ok", msg: "Entrada de exemplo carregada" });
  };

  const vehicle = vehicleContext || {
    plate: "RGM-2H47",
    car: "Porsche 911 Carrera S",
    client: "Marina Costa",
    year: "2024",
    color: "Preto Jet",
  };

  const onEntryStatus = (id, val) => {
    setEntry(prev => ({ ...prev, [id]: { ...(prev[id] || {}), status: val, photos: prev[id]?.photos || [], note: prev[id]?.note || "" } }));
  };
  const onEntryNote = (id, val) => {
    setEntry(prev => ({ ...prev, [id]: { ...(prev[id] || {}), note: val, photos: prev[id]?.photos || [], status: prev[id]?.status || null } }));
  };
  const onEntryAddPhoto = (id) => {
    setEntry(prev => {
      const cur = prev[id] || {};
      const photos = cur.photos || [];
      const next = SAMPLE_PHOTOS[(photos.length + (id.length % 4)) % SAMPLE_PHOTOS.length];
      return { ...prev, [id]: { ...cur, photos: [...photos, next] } };
    });
  };
  const onEntryRemovePhoto = (id, idx) => {
    setEntry(prev => {
      const cur = prev[id] || {};
      const photos = (cur.photos || []).filter((_, i) => i !== idx);
      return { ...prev, [id]: { ...cur, photos } };
    });
  };

  const onExitStatus = (id, val) => {
    setExitState(prev => ({ ...prev, [id]: { ...(prev[id] || {}), status: val, photos: prev[id]?.photos || [], note: prev[id]?.note || "" } }));
  };
  const onExitNote = (id, val) => {
    setExitState(prev => ({ ...prev, [id]: { ...(prev[id] || {}), note: val, photos: prev[id]?.photos || [], status: prev[id]?.status || null } }));
  };
  const onExitAddPhoto = (id) => {
    setExitState(prev => {
      const cur = prev[id] || {};
      const photos = cur.photos || [];
      const next = SAMPLE_PHOTOS[(photos.length + 2 + (id.length % 4)) % SAMPLE_PHOTOS.length];
      return { ...prev, [id]: { ...cur, photos: [...photos, next] } };
    });
  };
  const onExitRemovePhoto = (id, idx) => {
    setExitState(prev => {
      const cur = prev[id] || {};
      const photos = (cur.photos || []).filter((_, i) => i !== idx);
      return { ...prev, [id]: { ...cur, photos } };
    });
  };

  // When user switches to exit, copy entry as baseline
  useEffect(() => {
    if (tab === "saida" && Object.keys(exitState).length === 0 && Object.keys(entry).length > 0) {
      const seeded = {};
      Object.entries(entry).forEach(([id, v]) => {
        seeded[id] = { status: v.status, note: "", photos: [] };
      });
      setExitState(seeded);
    }
  }, [tab, entry, exitState]);

  const entryCount = Object.values(entry).filter(v => v.status === "ok" || v.status === "warn").length;
  const entryComplete = Object.values(entry).filter(v => v.status).length;
  const exitComplete = Object.values(exitState).filter(v => v.status).length;

  // Detect diffs (entry OK -> exit warn) = new damage
  const diffs = useMemo(() => {
    const out = [];
    Object.keys(entry).forEach(id => {
      const a = entry[id]?.status;
      const b = exitState[id]?.status;
      if (a === "ok" && b === "warn") out.push(id);
    });
    return out;
  }, [entry, exitState]);

  const totalEntryPhotos = useMemo(() => {
    return entryGeneralPhotos.length + Object.values(entry).reduce((s, v) => s + (v.photos?.length || 0), 0);
  }, [entry, entryGeneralPhotos]);

  // Save entry
  const saveEntry = () => {
    if (entryComplete === 0) {
      addToast({ kind: "error", msg: "Pelo menos um item deve ser verificado" });
      return;
    }
    addToast({ kind: "ok", msg: online ? "Checklist de entrada salvo" : "Salvo offline — sincronizará ao reconectar" });
  };
  const finalizeEntry = () => {
    if (entryComplete === 0) {
      addToast({ kind: "error", msg: "Pelo menos um item deve ser verificado (OK ou Atenção)" });
      return;
    }
    if (entryGeneralPhotos.length === 0) {
      addToast({ kind: "error", msg: "É obrigatório adicionar pelo menos uma foto geral do veículo" });
      return;
    }
    setConfirmFinalEntry(true);
  };
  const doFinalizeEntry = () => {
    setEntryFinalized(true);
    setConfirmFinalEntry(false);
    addToast({ kind: "ok", msg: "Entrada finalizada. Você pode registrar a saída" });
    setTab("saida");
  };

  const saveExit = () => {
    addToast({ kind: "ok", msg: "Checklist de saída salvo" });
  };
  const finalizeExit = () => {
    // All items need status
    const missing = Object.keys(entry).filter(id => !exitState[id]?.status);
    if (missing.length > 0) {
      addToast({ kind: "error", msg: "Todos os itens devem ter um status marcado" });
      return;
    }
    // New damages need photo + note
    const badDiffs = diffs.filter(id => {
      const ex = exitState[id];
      return !ex?.note || (ex?.photos?.length || 0) === 0;
    });
    if (badDiffs.length > 0) {
      addToast({ kind: "error", msg: "Novo dano requer foto e observação" });
      setShowDiffs(true);
      return;
    }
    setConfirmFinalExit(true);
  };
  const doFinalizeExit = () => {
    setExitFinalized(true);
    setConfirmFinalExit(false);
    setReportOpen(true);
  };

  return (
    <>
      <TopBar
        title="Checklist do veículo"
        onBack={onBack}
        right={(
          <TopBarActions theme={theme} onToggleTheme={onToggleTheme}>
            <button className="topbar-action" onClick={loadSample} aria-label="Demo">
              <Icon name="Sparkles" size={18}/>
            </button>
          </TopBarActions>
        )}
      />

      {!online && (
        <div className="banner">
          <span className="dot" />
          <span>Offline — alterações salvarão no dispositivo e sincronizarão depois</span>
        </div>
      )}

      {/* Vehicle context card */}
      <div style={{ padding: "12px var(--d-pad-screen) 0" }}>
        <div className="card" style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
          <div className="row-between">
            <div className="stack-tight">
              <div className="eyebrow">Veículo</div>
              <div style={{ fontFamily: "var(--e-mid)", color: "var(--gold)", fontSize: 18, fontWeight: 500, letterSpacing: "0.06em" }}>
                {vehicle.plate}
              </div>
              <div style={{ fontSize: 13, color: "var(--t-fg)" }}>{vehicle.car}</div>
              <div className="dim" style={{ fontSize: 11, letterSpacing: "0.04em" }}>
                {vehicle.year} · {vehicle.color} · {vehicle.client}
              </div>
            </div>
            <div className="stack-tight" style={{ alignItems: "flex-end" }}>
              {entryFinalized && <span className="status-chip chip-ok"><Icon name="Check" size={11} stroke={3}/>Entrada</span>}
              {exitFinalized && <span className="status-chip chip-gold"><Icon name="Check" size={11} stroke={3}/>Concluído</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ top: 0 }}>
        <button
          className={tab === "entrada" ? "active" : ""}
          onClick={() => setTab("entrada")}
        >
          <span>Entrada</span>
          <span className="tab-meta">{entryFinalized ? "Finalizada" : `${entryComplete}/${CHECKLIST_ITEMS.length}`}</span>
        </button>
        <button
          className={tab === "saida" ? "active" : ""}
          onClick={() => setTab("saida")}
          disabled={!entryFinalized}
          style={!entryFinalized ? { opacity: 0.4 } : null}
        >
          <span>Saída</span>
          <span className="tab-meta">{exitFinalized ? "Finalizada" : entryFinalized ? `${exitComplete}/${CHECKLIST_ITEMS.length}` : "Bloqueada"}</span>
        </button>
      </div>

      <div className="screen" style={{ paddingTop: 16, gap: 20 }}>

        {tab === "entrada" && (
          <>
            <div className="screen-section">
              <div className="row-between">
                <div className="stack-tight">
                  <div className="eyebrow">Etapa de entrada</div>
                  <h2 className="h-section">Inspeção inicial</h2>
                </div>
                <Progress value={entryComplete} total={CHECKLIST_ITEMS.length} />
              </div>
            </div>

            {/* General photos */}
            <div className="screen-section">
              <SectionHeader
                eyebrow="Documentação visual"
                title="Fotos gerais do veículo"
                action={<span style={{ fontSize: 10, color: "var(--t-fg-4)", letterSpacing: "0.05em" }}>{entryGeneralPhotos.length}/10</span>}
              />
              <PhotoStrip
                photos={entryGeneralPhotos}
                onAdd={() => {
                  if (entryGeneralPhotos.length === 0) { setConfirmPerm(true); return; }
                  setEntryGeneralPhotos([...entryGeneralPhotos, SAMPLE_PHOTOS[entryGeneralPhotos.length % SAMPLE_PHOTOS.length]]);
                }}
                onRemove={(i) => setEntryGeneralPhotos(entryGeneralPhotos.filter((_, ix) => ix !== i))}
                max={10}
                readOnly={entryFinalized}
              />
              <div className="field-hint">JPG, PNG ou HEIC · até 10 MB por foto</div>
            </div>

            {/* Items */}
            <div className="col" style={{ gap: 8 }}>
              {CHECKLIST_ITEMS.map((item, i) => {
                const cur = entry[item.id] || {};
                return (
                  <ChecklistItem
                    key={item.id}
                    index={i+1}
                    item={item}
                    state={cur}
                    onStatus={(v) => onEntryStatus(item.id, v)}
                    onNote={(v) => onEntryNote(item.id, v)}
                    onAddPhoto={() => onEntryAddPhoto(item.id)}
                    onRemovePhoto={(idx) => onEntryRemovePhoto(item.id, idx)}
                    readOnly={entryFinalized}
                  />
                );
              })}
            </div>

            <div className="screen-section">
              <Field label="Observações gerais (opcional)">
                <TextArea value={entryNotes} onChange={setEntryNotes} placeholder="Observações sobre o estado geral do veículo..." rows={3} maxLength={500}/>
              </Field>
            </div>

            {!entryFinalized ? (
              <div className="screen-section">
                <Button block onClick={saveEntry} icon="Save">Salvar checklist de entrada</Button>
                <Button block variant="secondary" onClick={finalizeEntry} icon="ClipboardCheck">Finalizar entrada</Button>
              </div>
            ) : (
              <div className="card" style={{ borderColor: "var(--t-status-ok-fg)", borderLeft: "2px solid var(--t-status-ok-fg)" }}>
                <div className="row" style={{ alignItems: "flex-start" }}>
                  <div style={{ color: "var(--t-status-ok-fg)", marginTop: 2 }}><Icon name="CheckCircle" size={20}/></div>
                  <div className="stack-tight" style={{ flex: 1 }}>
                    <div className="eyebrow" style={{ color: "var(--t-status-ok-fg)" }}>Entrada finalizada</div>
                    <div style={{ fontSize: 13, color: "var(--t-fg-2)" }}>
                      Os itens da entrada estão bloqueados para edição. Avance para a aba <strong className="gold-text">Saída</strong> ao concluir o serviço.
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="spacer-lg" />
          </>
        )}

        {tab === "saida" && (
          <>
            <div className="screen-section">
              <div className="row-between">
                <div className="stack-tight">
                  <div className="eyebrow">Etapa de saída</div>
                  <h2 className="h-section">Conferência final</h2>
                </div>
                <Progress value={exitComplete} total={CHECKLIST_ITEMS.length} />
              </div>
              <div className="body-text dim" style={{ fontSize: 12 }}>
                Status pré-preenchido com a inspeção de entrada. Altere apenas o que mudou após o serviço.
              </div>
            </div>

            <div className="row" style={{ gap: 8 }}>
              <Button size="sm" variant={showDiffs ? "primary" : "ghost"} icon="AlertTriangle" onClick={() => setShowDiffs(s => !s)}>
                {showDiffs ? `${diffs.length} diferença${diffs.length !== 1 ? "s" : ""}` : "Marcar diferenças"}
              </Button>
              {diffs.length > 0 && (
                <div className="compare-diff">
                  <Icon name="AlertTriangle" size={13}/>
                  <span>{diffs.length} novo{diffs.length > 1 ? "s" : ""} dano{diffs.length > 1 ? "s" : ""} detectado{diffs.length > 1 ? "s" : ""}</span>
                </div>
              )}
            </div>

            <div className="screen-section">
              <SectionHeader
                eyebrow="Documentação visual"
                title="Fotos de saída"
                action={<span style={{ fontSize: 10, color: "var(--t-fg-4)", letterSpacing: "0.05em" }}>{exitGeneralPhotos.length}/10</span>}
              />
              <PhotoStrip
                photos={exitGeneralPhotos}
                onAdd={() => setExitGeneralPhotos([...exitGeneralPhotos, SAMPLE_PHOTOS[(exitGeneralPhotos.length + 2) % SAMPLE_PHOTOS.length]])}
                onRemove={(i) => setExitGeneralPhotos(exitGeneralPhotos.filter((_, ix) => ix !== i))}
                max={10}
                readOnly={exitFinalized}
              />
            </div>

            <div className="col" style={{ gap: 8 }}>
              {CHECKLIST_ITEMS.map((item, i) => {
                const cur = exitState[item.id] || {};
                const prev = entry[item.id] || {};
                const isDiff = diffs.includes(item.id);
                return (
                  <ChecklistItem
                    key={item.id}
                    index={i+1}
                    item={item}
                    state={cur}
                    previous={prev}
                    onStatus={(v) => onExitStatus(item.id, v)}
                    onNote={(v) => onExitNote(item.id, v)}
                    onAddPhoto={() => onExitAddPhoto(item.id)}
                    onRemovePhoto={(idx) => onExitRemovePhoto(item.id, idx)}
                    isDifference={isDiff}
                    highlight={showDiffs && isDiff}
                    readOnly={exitFinalized}
                  />
                );
              })}
            </div>

            <div className="screen-section">
              <Field label="Observações gerais de saída (opcional)">
                <TextArea value={exitNotes} onChange={setExitNotes} placeholder="Observações finais do serviço..." rows={3} maxLength={500}/>
              </Field>
            </div>

            {!exitFinalized ? (
              <div className="screen-section">
                <Button block onClick={saveExit} icon="Save">Salvar checklist de saída</Button>
                <Button block variant="primary" onClick={finalizeExit} icon="ClipboardCheck">Finalizar saída</Button>
              </div>
            ) : (
              <div className="screen-section">
                <div className="card" style={{ borderColor: "var(--gold)", borderLeft: "2px solid var(--gold)" }}>
                  <div className="row" style={{ alignItems: "flex-start" }}>
                    <div style={{ color: "var(--gold)", marginTop: 2 }}><Icon name="Sparkles" size={20}/></div>
                    <div className="stack-tight" style={{ flex: 1 }}>
                      <div className="eyebrow">Veículo liberado</div>
                      <div style={{ fontSize: 13, color: "var(--t-fg-2)" }}>
                        Saída finalizada. Relatório gerado e disponível para envio ao cliente.
                      </div>
                    </div>
                  </div>
                </div>
                <Button block variant="primary" icon="Send" onClick={() => setReportOpen(true)}>Enviar relatório ao cliente</Button>
                <Button block variant="ghost" icon="FileText" onClick={() => setReportOpen(true)}>Ver relatório final</Button>
              </div>
            )}
            <div className="spacer-lg" />
          </>
        )}
      </div>

      {/* Camera permission */}
      <Sheet
        open={confirmPerm}
        onClose={() => setConfirmPerm(false)}
        title="Permissão da câmera"
        actions={(
          <>
            <Button variant="ghost" onClick={() => setConfirmPerm(false)}>Agora não</Button>
            <Button variant="primary" icon="Camera" onClick={() => {
              setConfirmPerm(false);
              setEntryGeneralPhotos([SAMPLE_PHOTOS[0]]);
              addToast({ kind: "ok", msg: "Foto adicionada" });
            }}>Permitir</Button>
          </>
        )}
      >
        <div className="perm-card" style={{ background: "transparent", border: "none", padding: 0 }}>
          <div className="icon" style={{ margin: "0" }}><Icon name="Camera" size={24}/></div>
          <p>O aplicativo precisa acessar sua câmera para tirar fotos do checklist do veículo.</p>
        </div>
      </Sheet>

      <Sheet
        open={confirmFinalEntry}
        onClose={() => setConfirmFinalEntry(false)}
        title="Finalizar entrada?"
        actions={(
          <>
            <Button variant="ghost" onClick={() => setConfirmFinalEntry(false)}>Voltar</Button>
            <Button variant="primary" icon="Check" onClick={doFinalizeEntry}>Finalizar entrada</Button>
          </>
        )}
      >
        <p>Tem certeza? Após finalizar, você não poderá mais editar os itens da entrada.</p>
        <div className="card-hairline" style={{ padding: 12, marginTop: 4 }}>
          <div className="row-between" style={{ fontSize: 12 }}>
            <span className="dim">Itens verificados</span>
            <span className="gold-text">{entryComplete} de {CHECKLIST_ITEMS.length}</span>
          </div>
          <div className="row-between" style={{ fontSize: 12, marginTop: 6 }}>
            <span className="dim">Fotos registradas</span>
            <span className="gold-text">{totalEntryPhotos}</span>
          </div>
        </div>
      </Sheet>

      <Sheet
        open={confirmFinalExit}
        onClose={() => setConfirmFinalExit(false)}
        title="Finalizar saída?"
        actions={(
          <>
            <Button variant="ghost" onClick={() => setConfirmFinalExit(false)}>Voltar</Button>
            <Button variant="primary" icon="Sparkles" onClick={doFinalizeExit}>Liberar veículo</Button>
          </>
        )}
      >
        <p>Isso encerrará o registro do veículo e gerará o relatório final para envio ao cliente.</p>
        {diffs.length > 0 && (
          <div className="compare-diff" style={{ fontSize: 12 }}>
            <Icon name="AlertTriangle" size={14}/>
            <span>{diffs.length} diferença{diffs.length > 1 ? "s" : ""} entre entrada e saída ficará registrada no relatório.</span>
          </div>
        )}
      </Sheet>

      <Sheet
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        title="Relatório final"
        actions={(
          <>
            <Button variant="ghost" onClick={() => setReportOpen(false)}>Fechar</Button>
            <Button variant="primary" icon="Whatsapp" onClick={() => { setReportOpen(false); addToast({ kind: "ok", msg: "Relatório enviado ao cliente" }); }}>Enviar por WhatsApp</Button>
          </>
        )}
      >
        <div className="col" style={{ gap: 10 }}>
          <div className="card-hairline" style={{ padding: 12 }}>
            <div className="eyebrow">Veículo</div>
            <div style={{ fontFamily: "var(--e-mid)", color: "var(--gold)", fontSize: 16, fontWeight: 500, letterSpacing: "0.06em", marginTop: 4 }}>{vehicle.plate} · {vehicle.car}</div>
            <div className="dim" style={{ fontSize: 11, marginTop: 4 }}>{vehicle.client}</div>
          </div>
          <div className="grid-3" style={{ gap: 6 }}>
            <div className="card-hairline" style={{ padding: 10, textAlign: "center" }}>
              <div style={{ fontFamily: "var(--e-display)", color: "var(--gold)", fontSize: 22, fontWeight: 500 }}>{entryCount}</div>
              <div style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--t-fg-4)", fontWeight: 600, marginTop: 2 }}>Itens entrada</div>
            </div>
            <div className="card-hairline" style={{ padding: 10, textAlign: "center" }}>
              <div style={{ fontFamily: "var(--e-display)", color: "var(--gold)", fontSize: 22, fontWeight: 500 }}>{totalEntryPhotos}</div>
              <div style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--t-fg-4)", fontWeight: 600, marginTop: 2 }}>Fotos</div>
            </div>
            <div className="card-hairline" style={{ padding: 10, textAlign: "center" }}>
              <div style={{ fontFamily: "var(--e-display)", color: diffs.length ? "var(--t-status-warn-fg)" : "var(--gold)", fontSize: 22, fontWeight: 500 }}>{diffs.length}</div>
              <div style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--t-fg-4)", fontWeight: 600, marginTop: 2 }}>Diferenças</div>
            </div>
          </div>
          <p style={{ fontSize: 12 }}>O relatório completo inclui todas as fotos de entrada e saída, status comparativo dos {CHECKLIST_ITEMS.length} itens e observações do técnico.</p>
        </div>
      </Sheet>
    </>
  );
}

// ---------- Single checklist item ----------
function ChecklistItem({ index, item, state, previous, onStatus, onNote, onAddPhoto, onRemovePhoto, readOnly, isDifference, highlight }) {
  const [open, setOpen] = useState(false);
  const status = state?.status;
  const photos = state?.photos || [];
  const note = state?.note || "";
  const expand = open || !!status || photos.length > 0 || note.length > 0;
  const cls = "cli" +
    (status === "ok" ? " has-status-ok" : "") +
    (status === "warn" ? " has-status-warn" : "") +
    (status === "na" ? " has-status-na" : "") +
    (highlight ? " changed" : "");
  const prevChip = previous && previous.status ? (
    <span className={`status-chip chip-${previous.status === "ok" ? "ok" : previous.status === "warn" ? "warn" : "na"}`}
      style={{ opacity: 0.6 }}>
      <Icon name={previous.status === "ok" ? "Check" : previous.status === "warn" ? "AlertTriangle" : "Minus"} size={10} stroke={2.5}/>
      Entrada
    </span>
  ) : null;
  return (
    <div className={cls}>
      <div className="cli-head" onClick={() => setOpen(o => !o)} style={{ cursor: "pointer" }}>
        <div className="cli-num">{String(index).padStart(2, "0")}</div>
        <div style={{ color: status ? "var(--gold)" : "var(--t-fg-4)" }}>
          <Icon name={item.icon} size={16} />
        </div>
        <div className="cli-title">{item.label}</div>
        {isDifference && <span className="status-chip chip-warn" style={{ fontSize: 9 }}><Icon name="AlertTriangle" size={10} stroke={2.5}/>Mudou</span>}
        {prevChip}
        <Icon name={expand ? "ChevronUp" : "ChevronDown"} size={14} className="dim"/>
      </div>

      {expand && (
        <>
          <StatusButton value={status} onChange={readOnly ? () => {} : onStatus} />
          {(status === "warn" || photos.length > 0 || open) && (
            <input
              className="cli-note-input"
              value={note}
              onChange={(e) => onNote(e.target.value)}
              placeholder={status === "warn" ? "Descreva a observação..." : "Observação (opcional)"}
              disabled={readOnly}
            />
          )}
          {(status === "warn" || photos.length > 0 || open) && (
            <PhotoStrip
              photos={photos}
              onAdd={onAddPhoto}
              onRemove={onRemovePhoto}
              max={5}
              readOnly={readOnly}
            />
          )}
        </>
      )}
    </div>
  );
}


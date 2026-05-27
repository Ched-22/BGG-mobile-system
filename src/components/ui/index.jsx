// ============================================================
// BGG Mobile — Shared UI Primitives
// ============================================================
import { useEffect } from 'react'
import { Icon } from '../Icon.jsx'

// ---------- TopBar ----------
export function TopBar({ title, onBack, onMenu, right }) {
  return (
    <header className="topbar">
      {onBack ? (
        <button className="topbar-action" onClick={onBack} aria-label="Voltar">
          <Icon name="ArrowLeft" size={22} />
        </button>
      ) : (
        <button className="topbar-action" onClick={onMenu} aria-label="Menu">
          <Icon name="Menu" size={22} />
        </button>
      )}
      <div className="title">{title}</div>
      {right ? right : <div style={{ width: 40 }} />}
    </header>
  );
}

// ---------- BottomNav ----------
export function BottomNav({ active, onNav }) {
  const items = [
    { id: "dashboard", label: "Início", icon: "Sparkles" },
    { id: "orcamento", label: "Orçamento", icon: "Wallet" },
    { id: "checklist", label: "Checklist", icon: "ClipboardList" },
    { id: "clientes", label: "Clientes", icon: "User" },
  ];
  return (
    <nav className="bottom-nav">
      {items.map(it => (
        <button
          key={it.id}
          className={active === it.id ? "active" : ""}
          onClick={() => onNav(it.id)}
        >
          <Icon name={it.icon} size={20} />
          <span>{it.label}</span>
        </button>
      ))}
    </nav>
  );
}

// ---------- Field ----------
export function Field({ label, required, error, hint, children, suffix }) {
  return (
    <div className={`field ${error ? "field-error" : ""}`}>
      {label && (
        <label className="field-label">
          {label}
          {required && <span className="req">*</span>}
        </label>
      )}
      <div style={{ position: "relative" }}>
        {children}
        {suffix && (
          <div style={{
            position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
            color: "var(--t-fg-3)", display: "flex", alignItems: "center"
          }}>{suffix}</div>
        )}
      </div>
      {error ? <div className="field-msg err">{error}</div>
        : hint ? <div className="field-msg">{hint}</div> : null}
    </div>
  );
}

export function TextInput({ value, onChange, type = "text", placeholder, maxLength, ...rest }) {
  return (
    <input
      className="field-input"
      type={type}
      value={value ?? ""}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      maxLength={maxLength}
      {...rest}
    />
  );
}

export function TextArea({ value, onChange, placeholder, maxLength, rows = 3 }) {
  const v = value ?? "";
  return (
    <div style={{ position: "relative" }}>
      <textarea
        className="field-input"
        value={v}
        rows={rows}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
      />
      {maxLength && (
        <div style={{
          position: "absolute", bottom: 6, right: 10,
          fontSize: 10, color: "var(--t-fg-4)", letterSpacing: "0.05em",
        }}>{v.length}/{maxLength}</div>
      )}
    </div>
  );
}

// ---------- Checkbox ----------
export function Checkbox({ checked, onChange, children }) {
  return (
    <label className="checkbox">
      <input type="checkbox" checked={!!checked} onChange={(e) => onChange?.(e.target.checked)} />
      <span className="box" />
      <span>{children}</span>
    </label>
  );
}

// ---------- Button ----------
export function Button({ children, onClick, variant = "primary", icon, block, size, type = "button", disabled }) {
  const v = `btn btn-${variant}` + (block ? " btn-block" : "") + (size === "sm" ? " btn-sm" : "");
  return (
    <button type={type} className={v} onClick={onClick} disabled={disabled} style={disabled ? { opacity: 0.4, pointerEvents: "none" } : null}>
      {icon && <Icon name={icon} size={size === "sm" ? 14 : 16} />}
      <span>{children}</span>
    </button>
  );
}

// ---------- Modal / Sheet ----------
export function Sheet({ open, onClose, title, children, actions }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}>
      <div className="modal">
        <div className="modal-grip" />
        {title && <h3>{title}</h3>}
        <div className="col" style={{ gap: 12 }}>{children}</div>
        {actions && <div className="modal-actions">{actions}</div>}
      </div>
    </div>
  );
}

// ---------- Toast manager ----------
export function Toast({ toasts }) {
  if (!toasts || toasts.length === 0) return null;
  const t = toasts[toasts.length - 1];
  return (
    <div className={`toast ${t.kind || ""}`}>
      <Icon name={t.kind === "error" ? "AlertCircle" : t.kind === "warn" ? "AlertTriangle" : "CheckCircle"} size={16} />
      <span>{t.msg}</span>
    </div>
  );
}

// ---------- StatusButton (checklist) ----------
export function StatusButton({ value, onChange }) {
  const options = [
    { v: "ok", label: "OK", cls: "ok", icon: "Check" },
    { v: "warn", label: "Atenção", cls: "warn", icon: "AlertTriangle" },
    { v: "na", label: "N/A", cls: "na", icon: "Minus" },
  ];
  return (
    <div className="status-row">
      {options.map(o => (
        <button
          key={o.v}
          className={`status-btn ${value === o.v ? `active ${o.cls}` : ""}`}
          onClick={() => onChange(value === o.v ? null : o.v)}
          type="button"
        >
          <Icon name={o.icon} size={13} stroke={2.4} />
          <span>{o.label}</span>
        </button>
      ))}
    </div>
  );
}

// ---------- Photo strip ----------
export const SAMPLE_PHOTOS = [
  "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&q=70",
  "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=400&q=70",
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&q=70",
  "https://images.unsplash.com/photo-1542362567-b07e54358753?w=400&q=70",
  "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=400&q=70",
  "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&q=70",
];
export function PhotoStrip({ photos = [], onAdd, onRemove, max = 10, readOnly }) {
  return (
    <div className="photo-strip">
      {photos.map((src, i) => (
        <div className="photo-thumb" key={i}>
          <img src={src} alt="" />
          {!readOnly && (
            <button className="rm" onClick={() => onRemove?.(i)} aria-label="Remover">
              <Icon name="X" size={10} stroke={2.6}/>
            </button>
          )}
        </div>
      ))}
      {!readOnly && photos.length < max && (
        <button className="photo-add" onClick={onAdd} type="button">
          <Icon name="Camera" size={16} />
          <span>Foto</span>
        </button>
      )}
    </div>
  );
}

// ---------- Section header ----------
export function SectionHeader({ eyebrow, title, action }) {
  return (
    <div className="row-between" style={{ alignItems: "baseline" }}>
      <div className="stack-tight">
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        {title && <h2 className="h-section">{title}</h2>}
      </div>
      {action}
    </div>
  );
}

// ---------- Progress ----------
export function Progress({ value, total }) {
  const pct = total ? Math.min(100, Math.round((value / total) * 100)) : 0;
  return (
    <div className="progress">
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="progress-val">{value}/{total}</div>
    </div>
  );
}

export {
  formatPlate,
  formatPhoneBR,
  formatBRL,
  isValidEmail,
  isValidPlate,
} from '../../utils/format.js'

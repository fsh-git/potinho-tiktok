import React, { useMemo } from "react";
import "./styles.css";

const THEMES = {
  lspd: { color: "#3b82f6", icon: "cuffs", location: "MISSION ROW, SA", code: "LSPD POLICE" },
  fib: { color: "#d8b34a", icon: "radio", location: "DOWNTOWN, LOS SANTOS", code: "FEDERAL INVESTIGATION BUREAU" },
  ems: { color: "#ef5350", icon: "siren", location: "PILLBOX HILL, SA", code: "LOS SANTOS EMS" },
  lsfd: { color: "#ff6b35", icon: "siren", location: "DAVIS, LOS SANTOS", code: "LOS SANTOS FIRE DEPT." },
  vinewood: { color: "#ec4899", icon: "diamond", location: "VINEWOOD HILLS, SA", code: "VINEWOOD VIP CLUB" },
  cash: { color: "#10b981", icon: "cash", location: "PACIFIC STANDARD", code: "PACIFIC STANDARD" },
  gold: { color: "#f59e0b", icon: "diamond", location: "DIAMOND CASINO", code: "DIAMOND CASINO" },
  ballas: { color: "#9b59d0", icon: "radio", location: "DAVIS, LOS SANTOS", code: "BALLAS TERRITORY" },
  grove: { color: "#55b948", icon: "radio", location: "GROVE STREET, DAVIS", code: "GROVE STREET FAMILIES" },
  biker: { color: "#c76b31", icon: "cuffs", location: "SANDY SHORES, BLAINE", code: "BLAINE COUNTY BIKER CLUB" },
  maze: { color: "#4c8cf5", icon: "cash", location: "PILLBOX HILL, SA", code: "MAZE BANK FINANCIAL" },
  lifeinvader: { color: "#40a6d9", icon: "radio", location: "ROCKFORD HILLS, SA", code: "LIFEINVADER NETWORK" },
};
const THEME_KEYS = Object.keys(THEMES);
const LOCATIONS = ["VINEWOOD", "STRAWBERRY", "VESPUCCI", "DOWNTOWN", "ROCKFORD HILLS", "MIRROR PARK", "DAVIS", "LA MESA", "DEL PERRO", "CHAMBERLAIN HILLS", "PILLBOX HILL"];

function Icon({ type }) {
  const common = { viewBox: "0 0 48 48", fill: "none", stroke: "currentColor", strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };
  if (type === "siren") return <svg {...common}><path d="M12 33h24M16 33v-8a8 8 0 0 1 16 0v8M10 39h28M24 8v5M8 16l4 3M40 16l-4 3" /></svg>;
  if (type === "cash") return <svg {...common}><rect x="7" y="13" width="34" height="23" rx="3"/><circle cx="24" cy="24.5" r="5"/><path d="M12 18h1M35 31h1" /></svg>;
  if (type === "diamond") return <svg {...common}><path d="m8 19 7-9h18l7 9-16 20L8 19Z"/><path d="m8 19h32M15 10l9 29 9-29" /></svg>;
  if (type === "radio") return <svg {...common}><rect x="11" y="16" width="26" height="25" rx="3"/><path d="m18 16 8-9M17 24h14M17 30h7M31 34h.01"/><circle cx="32" cy="34" r="2" /></svg>;
  return <svg {...common}><path d="M17 28a8 8 0 1 1 7-11M31 20a8 8 0 1 1-7 11"/><path d="m19 23 10 2M19 30l10-2"/><path d="M14 33 8 39M34 15l6-6" /></svg>;
}
function amountToNumber(amount) { if (typeof amount === "number") return amount; if (typeof amount?.value === "number") return amount.value; const raw = String(amount?.formatted || amount || "0").replace(/[^0-9,.-]/g, ""); return Number.parseFloat(raw.includes(",") ? raw.replace(/\./g, "").replace(",", ".") : raw) || 0; }
function seededIndex(seed, length) { let hash = 0; for (let i = 0; i < seed.length; i += 1) hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0; return Math.abs(hash) % length; }
function getAction(type) { return ({ follow: "iniciou patrulha no canal com", subscription: "assinou o canal com", subscriber: "assinou o canal com", message: "enviou reforços no valor de", donation: "enviou reforços no valor de" })[type] || "enviou reforços no valor de"; }

export default function Widget({ data = {}, parameters = {}, visible = true }) {
  const preview = parameters.preview_mode === true;
  const displayData = preview ? { author: parameters.test_author || "snull", amount: parameters.test_amount || "R$ 50,00", message: parameters.test_message || "Fiz o Pix para pagar a fiança na LSPD!", type: "donation" } : data;
  const author = displayData.author || displayData.username || displayData.user || "CIDADÃO ANÔNIMO";
  const amount = displayData.amount?.formatted || displayData.formattedAmount || displayData.amount || "R$ 0,00";
  const message = String(displayData.message || displayData.comment || "").slice(0, 700);
  const eventKey = preview ? "preview" : `${displayData.id || displayData.createdAt || ""}-${author}-${amount}`;
  const theme = THEMES[parameters.theme === "random" ? THEME_KEYS[seededIndex(eventKey, THEME_KEYS.length)] : parameters.theme] || THEMES.lspd;
  const value = amountToNumber(displayData.amount || amount);
  const maximumWanted = value >= Number(parameters.max_wanted_threshold ?? 100);
  const stars = maximumWanted ? 5 : value >= Number(parameters.star_threshold_5 ?? 100) ? 5 : value >= Number(parameters.star_threshold_4 ?? 50) ? 4 : value >= Number(parameters.star_threshold_3 ?? 20) ? 3 : value >= Number(parameters.star_threshold_2 ?? 10) ? 2 : 1;
  const title = parameters.dispatch_title?.trim() || theme.code;
  const location = parameters.random_location ? LOCATIONS[seededIndex(`${eventKey}-location`, LOCATIONS.length)] : (parameters.location_text?.trim() || theme.location);
  const accent = parameters.use_custom_color ? (parameters.accent_color || theme.color) : theme.color;
  const timestamp = useMemo(() => new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }), [eventKey]);

  return <div className={`dispatch-stage dispatch-stage--${parameters.card_alignment || "center"}`}>
    <div className={`dispatch ${!visible ? "dispatch--hidden" : ""} ${maximumWanted ? "dispatch--maximum" : ""}`} style={{ "--accent": accent, "--scale": `${Number(parameters.card_scale ?? 100) / 100}` }}>
      <div className="dispatch__scanlines" />
      {maximumWanted && <div className="dispatch__code99">CÓDIGO 10-99 <span>•</span> PROCURADO MÁXIMO <span>•</span> CÓDIGO 10-99</div>}
      <div className="dispatch__topline"><div className="dispatch__code"><span className="dispatch__warning">▲</span><span>{parameters.dispatch_prefix?.trim() ? `${parameters.dispatch_prefix.trim()} // ` : ""}{title}</span></div>
        {parameters.show_stars !== false && <div className="dispatch__stars">{[1, 2, 3, 4, 5].map(star => <span key={star} className={star <= stars ? "star star--on" : "star"}>★</span>)}</div>}
      </div>
      <div className="dispatch__body">{parameters.show_badge !== false && <div className="dispatch__badge"><Icon type={theme.icon} /></div>}<div className="dispatch__content"><div className="dispatch__headline"><span className="dispatch__author">{author}</span><span className="dispatch__action">{getAction(displayData.type)}</span><span className="dispatch__amount">{amount}</span></div>
        {parameters.show_message !== false && Boolean(message) && <div className="dispatch__message"><p>“{message}”</p></div>}</div></div>
      <div className="dispatch__footer"><span>LOC: {location}</span>{parameters.show_timestamp !== false && <span>STATUS: ATIVO [{timestamp}]</span>}</div>
    </div>
  </div>;
}

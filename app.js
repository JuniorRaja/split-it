/* Generated from app.jsx — do not edit. Run: node build.mjs */
const {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef
} = React;
const APP_CONFIG = (() => {
  const src = window.SPLITIT_CONFIG || {};
  const roster = Array.isArray(src.roster) ? src.roster : [];
  return {
    appName: String(src.appName || "split·it").trim() || "split·it",
    tagline: String(src.tagline || "Split trips, not friendships.").trim() || "Split trips, not friendships.",
    pocketbaseUrl: String(src.pocketbaseUrl || "https://db.prasannar.com").trim() || "https://db.prasannar.com",
    collectionPrefix: String(src.collectionPrefix || "splitit_").trim() || "splitit_",
    defaultCurrency: String(src.defaultCurrency || "INR").trim().toUpperCase() || "INR",
    allowEmailSignin: src.allowEmailSignin !== false,
    allowSelfSignup: src.allowSelfSignup === true,
    requireEmailVerification: src.requireEmailVerification !== false,
    roster
  };
})();
const APP_NAME = APP_CONFIG.appName;
const APP_TAGLINE = APP_CONFIG.tagline;
const PB_URL = APP_CONFIG.pocketbaseUrl;
const PREFIX = APP_CONFIG.collectionPrefix;
const pb = new PocketBase(PB_URL);
pb.autoCancellation(false);
const col = name => pb.collection(PREFIX + name);
const ROSTER = APP_CONFIG.roster.map(u => ({
  name: String(u?.name || "").trim(),
  email: String(u?.email || "").trim().toLowerCase()
})).filter(u => u.name && u.email);
const HAS_ROSTER = ROSTER.length > 0;
const EMAIL_SIGNIN_ENABLED = APP_CONFIG.allowEmailSignin || !HAS_ROSTER;
const SELF_SIGNUP_ENABLED = APP_CONFIG.allowSelfSignup;
const REQUIRE_EMAIL_VERIFICATION = APP_CONFIG.requireEmailVerification;
const CATEGORIES = [{
  key: "food",
  label: "Food",
  emoji: "🍕"
}, {
  key: "drinks",
  label: "Drinks",
  emoji: "🍻"
}, {
  key: "groceries",
  label: "Groceries",
  emoji: "🛒"
}, {
  key: "transport",
  label: "Transport",
  emoji: "🚕"
}, {
  key: "fuel",
  label: "Fuel",
  emoji: "⛽"
}, {
  key: "stay",
  label: "Stay",
  emoji: "🏨"
}, {
  key: "tickets",
  label: "Tickets",
  emoji: "🎟️"
}, {
  key: "shopping",
  label: "Shopping",
  emoji: "🛍️"
}, {
  key: "fun",
  label: "Fun",
  emoji: "🎬"
}, {
  key: "misc",
  label: "Other",
  emoji: "📦"
}];
const catOf = k => CATEGORIES.find(c => c.key === k) || CATEGORIES[CATEGORIES.length - 1];
const CURRENCIES = [{
  code: "INR",
  sym: "₹",
  dec: 2,
  name: "Indian Rupee"
}, {
  code: "MYR",
  sym: "RM ",
  dec: 2,
  name: "Malaysian Ringgit"
}, {
  code: "SGD",
  sym: "S$",
  dec: 2,
  name: "Singapore Dollar"
}, {
  code: "THB",
  sym: "฿",
  dec: 2,
  name: "Thai Baht"
}, {
  code: "USD",
  sym: "$",
  dec: 2,
  name: "US Dollar"
}, {
  code: "EUR",
  sym: "€",
  dec: 2,
  name: "Euro"
}, {
  code: "GBP",
  sym: "£",
  dec: 2,
  name: "British Pound"
}, {
  code: "AED",
  sym: "AED ",
  dec: 2,
  name: "UAE Dirham"
}, {
  code: "JPY",
  sym: "¥",
  dec: 0,
  name: "Japanese Yen"
}, {
  code: "IDR",
  sym: "Rp ",
  dec: 0,
  name: "Indonesian Rupiah"
}, {
  code: "VND",
  sym: "₫",
  dec: 0,
  name: "Vietnamese Dong"
}, {
  code: "LKR",
  sym: "Rs ",
  dec: 2,
  name: "Sri Lankan Rupee"
}];
const DEFAULT_CURRENCY = CURRENCIES.some(c => c.code === APP_CONFIG.defaultCurrency) ? APP_CONFIG.defaultCurrency : "INR";
const SYM2CODE = {
  "₹": "INR",
  "$": "USD",
  "€": "EUR",
  "£": "GBP",
  "¥": "JPY",
  "AED": "AED"
};
const normCur = c => SYM2CODE[c] || c || "INR";
const curOf = c => CURRENCIES.find(x => x.code === normCur(c)) || {
  code: normCur(c),
  sym: normCur(c) + " ",
  dec: 2
};
const fmt = (n, c = "INR") => {
  const cu = curOf(c);
  return cu.sym + Math.abs(n).toLocaleString("en-IN", {
    minimumFractionDigits: cu.dec,
    maximumFractionDigits: cu.dec
  });
};
async function fetchRate(from, to) {
  from = normCur(from);
  to = normCur(to);
  if (from === to) return 1;
  const key = `si_fx_${from}_${new Date().toISOString().slice(0, 10)}`;
  try {
    const c = JSON.parse(localStorage.getItem(key));
    if (c && c[to]) return c[to];
  } catch {}
  const res = await fetch(`https://open.er-api.com/v6/latest/${from}`);
  const j = await res.json();
  if (j?.result === "success" && j.rates?.[to]) {
    try {
      Object.keys(localStorage).filter(k => k.startsWith(`si_fx_${from}_`) && k !== key).forEach(k => localStorage.removeItem(k));
      localStorage.setItem(key, JSON.stringify(j.rates));
    } catch {}
    return j.rates[to];
  }
  throw new Error("Couldn't fetch the exchange rate — enter it manually.");
}
const baseAmt = e => e.base_amount || e.amount || 0;
const cache = {
  get(k) {
    try {
      return JSON.parse(localStorage.getItem("si_c_" + k));
    } catch {
      return null;
    }
  },
  set(k, v) {
    try {
      localStorage.setItem("si_c_" + k, JSON.stringify(v));
    } catch {}
  }
};
const AV_COLORS = ["#0E9F6E", "#B3492F", "#8C6D1F", "#3E5C76", "#6D4C7D", "#2F6D80", "#A85D9E"];
const initials = (n = "?") => n.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join("").toUpperCase();
const avColor = (id = "") => AV_COLORS[[...id].reduce((a, c) => a + c.charCodeAt(0), 0) % AV_COLORS.length];
const r2 = n => Math.round(n * 100) / 100;
const MAX_LEN = {
  tripName: 72,
  description: 120,
  notes: 280,
  comment: 300
};
const cleanText = (v, max) => String(v || "").replace(/\s+/g, " ").trim().slice(0, max);
const cleanEmail = v => String(v || "").trim().toLowerCase().slice(0, 200);
const randToken = () => Math.random().toString(36).slice(2) + Date.now().toString(36) + Math.random().toString(36).slice(2);
const shareUrl = (tripId, token) => `${location.origin}${location.pathname}#/shared/${tripId}/${token}`;
const AUTH_GUARD_KEY = "si_auth_guard";
const AUTH_PREFILL_EMAIL_KEY = "si_auth_prefill_email";
const AUTH_FAIL_LIMIT = 6;
const AUTH_WINDOW_MS = 10 * 60 * 1000;
const AUTH_LOCK_MS = 8 * 60 * 1000;
const today = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};
const niceDate = d => d ? new Date(d).toLocaleDateString(undefined, {
  day: "numeric",
  month: "short",
  year: "numeric"
}) : "";
const monthKey = d => new Date(d).toLocaleDateString(undefined, {
  month: "long",
  year: "numeric"
});
function timeAgo(d) {
  const s = (Date.now() - new Date(d).getTime()) / 1000;
  if (!isFinite(s)) return "";
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 7 * 86400) return `${Math.floor(s / 86400)}d ago`;
  return niceDate(d);
}
const first = n => (n || "?").split(" ")[0];
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return !!ok;
    } catch {
      return false;
    }
  }
}
function track(event, props = {}) {
  try {
    const detail = {
      event,
      props,
      at: new Date().toISOString()
    };
    window.dispatchEvent(new CustomEvent("splitit:event", {
      detail
    }));
    if (typeof window.plausible === "function") window.plausible(event, {
      props
    });
    if (typeof window.gtag === "function") window.gtag("event", event, props);
  } catch {}
}
function reportError(err, context = "runtime") {
  try {
    const error = err instanceof Error ? err : new Error(String(err || "Unknown error"));
    if (window.Sentry?.captureException) window.Sentry.captureException(error, {
      tags: {
        context
      }
    });
    track("client_error", {
      context,
      message: error.message.slice(0, 240)
    });
  } catch {}
}
function authGuardState() {
  try {
    const raw = JSON.parse(localStorage.getItem(AUTH_GUARD_KEY) || "{}");
    return {
      count: Number(raw.count) || 0,
      firstFailAt: Number(raw.firstFailAt) || 0,
      lockedUntil: Number(raw.lockedUntil) || 0
    };
  } catch {
    return {
      count: 0,
      firstFailAt: 0,
      lockedUntil: 0
    };
  }
}
function saveAuthGuard(next) {
  try {
    localStorage.setItem(AUTH_GUARD_KEY, JSON.stringify(next));
  } catch {}
}
function canAttemptAuth() {
  const s = authGuardState();
  const now = Date.now();
  if (s.lockedUntil > now) {
    return {
      ok: false,
      waitSec: Math.ceil((s.lockedUntil - now) / 1000)
    };
  }
  if (now - s.firstFailAt > AUTH_WINDOW_MS) {
    saveAuthGuard({
      count: 0,
      firstFailAt: 0,
      lockedUntil: 0
    });
    return {
      ok: true,
      waitSec: 0
    };
  }
  return {
    ok: true,
    waitSec: 0
  };
}
function markAuthFailure() {
  const now = Date.now();
  const s = authGuardState();
  const withinWindow = s.firstFailAt && now - s.firstFailAt <= AUTH_WINDOW_MS;
  const next = {
    count: withinWindow ? s.count + 1 : 1,
    firstFailAt: withinWindow ? s.firstFailAt : now,
    lockedUntil: 0
  };
  if (next.count >= AUTH_FAIL_LIMIT) next.lockedUntil = now + AUTH_LOCK_MS;
  saveAuthGuard(next);
}
function clearAuthGuard() {
  saveAuthGuard({
    count: 0,
    firstFailAt: 0,
    lockedUntil: 0
  });
}
function setAuthPrefillEmail(email) {
  const safe = cleanEmail(email);
  if (!safe) return;
  try {
    localStorage.setItem(AUTH_PREFILL_EMAIL_KEY, safe);
  } catch {}
}
function getAuthPrefillEmail() {
  try {
    return cleanEmail(localStorage.getItem(AUTH_PREFILL_EMAIL_KEY) || "");
  } catch {
    return "";
  }
}
function clearAuthPrefillEmail() {
  try {
    localStorage.removeItem(AUTH_PREFILL_EMAIL_KEY);
  } catch {}
}
function distribute(total, weights) {
  const cents = Math.round(total * 100);
  const tw = weights.reduce((a, b) => a + b, 0) || 1;
  const raw = weights.map(w => cents * w / tw);
  const base = raw.map(Math.floor);
  let rem = cents - base.reduce((a, b) => a + b, 0);
  const order = raw.map((v, i) => [v - base[i], i]).sort((a, b) => b[0] - a[0]);
  for (let k = 0; k < rem; k++) base[order[k % order.length][1]] += 1;
  return base.map(c => c / 100);
}
function computeNets(expenses, splits, settlements) {
  const net = {};
  const add = (id, v) => {
    if (id) net[id] = r2((net[id] || 0) + v);
  };
  expenses.forEach(e => add(e.paid_by, baseAmt(e)));
  splits.forEach(s => add(s.user, -s.amount));
  settlements.forEach(s => {
    add(s.from, s.amount);
    add(s.to, -s.amount);
  });
  return net;
}
function simplify(net) {
  const cred = [],
    deb = [];
  Object.entries(net).forEach(([id, v]) => {
    if (v > 0.009) cred.push({
      id,
      v
    });else if (v < -0.009) deb.push({
      id,
      v: -v
    });
  });
  cred.sort((a, b) => b.v - a.v);
  deb.sort((a, b) => b.v - a.v);
  const out = [];
  let i = 0,
    j = 0;
  while (i < deb.length && j < cred.length) {
    const pay = r2(Math.min(deb[i].v, cred[j].v));
    out.push({
      from: deb[i].id,
      to: cred[j].id,
      amount: pay
    });
    deb[i].v = r2(deb[i].v - pay);
    cred[j].v = r2(cred[j].v - pay);
    if (deb[i].v < 0.009) i++;
    if (cred[j].v < 0.009) j++;
  }
  return out;
}
function computePairwise(expenses, splits, settlements) {
  const debt = {};
  const ensure = (a, b) => {
    if (!debt[a]) debt[a] = {};
    if (!debt[b]) debt[b] = {};
    if (debt[a][b] == null) debt[a][b] = 0;
    if (debt[b][a] == null) debt[b][a] = 0;
  };
  splits.forEach(s => {
    const exp = expenses.find(e => e.id === s.expense);
    if (!exp || exp.paid_by === s.user) return;
    ensure(s.user, exp.paid_by);
    debt[s.user][exp.paid_by] = r2(debt[s.user][exp.paid_by] + s.amount);
  });
  settlements.forEach(s => {
    ensure(s.from, s.to);
    debt[s.to][s.from] = r2(debt[s.to][s.from] + s.amount);
  });
  const out = [];
  const seen = new Set();
  Object.keys(debt).forEach(a => {
    Object.keys(debt[a]).forEach(b => {
      const key = [a, b].sort().join("|");
      if (seen.has(key)) return;
      seen.add(key);
      const net = r2((debt[a][b] || 0) - (debt[b][a] || 0));
      if (net > 0.009) out.push({
        from: a,
        to: b,
        amount: net
      });else if (net < -0.009) out.push({
        from: b,
        to: a,
        amount: -net
      });
    });
  });
  return out.sort((a, b) => b.amount - a.amount);
}
function logActivity(trip, actor, action, detail) {
  col("activity").create({
    trip,
    actor,
    action,
    detail
  }).catch(() => {});
}
function exportCSV(trip, expenses, splits, members) {
  const base = normCur(trip.currency);
  const uName = id => members.find(m => m.id === id)?.name || id;
  const splitIdx = new Map(splits.map(s => [`${s.expense}:${s.user}`, s.amount]));
  const head = ["Date", "Description", "Category", "Paid by", "Currency", "Amount", "Rate", `Base (${base})`, ...members.map(m => m.name)];
  const rows = expenses.map(e => {
    const per = members.map(m => {
      const amount = splitIdx.get(`${e.id}:${m.id}`);
      return amount == null ? "" : Number(amount).toFixed(2);
    });
    return [e.date?.slice(0, 10) || "", e.description, catOf(e.category).label, uName(e.paid_by), normCur(e.currency || base), e.amount.toFixed(2), e.fx_rate || 1, baseAmt(e).toFixed(2), ...per];
  });
  const csv = [head, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob(["﻿" + csv], {
    type: "text/csv"
  }));
  a.download = `${trip.name}-expenses.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}
function Avatar({
  user,
  size = 36
}) {
  return React.createElement("span", {
    className: "avatar",
    style: {
      width: size,
      height: size,
      background: avColor(user?.id),
      fontSize: size * .36
    }
  }, initials(user?.name || user?.email));
}
function Toast({
  msg
}) {
  return msg ? React.createElement("div", {
    className: "toast"
  }, msg) : null;
}
function Sheet({
  title,
  onClose,
  children
}) {
  const ref = useRef(null);
  const drag = useRef(null);
  useEffect(() => {
    const f = e => e.key === "Escape" && onClose();
    window.addEventListener("keydown", f);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", f);
      document.body.style.overflow = "";
    };
  }, []);
  const onTS = e => {
    drag.current = {
      y: e.touches[0].clientY,
      dy: 0
    };
  };
  const onTM = e => {
    if (!drag.current || !ref.current) return;
    const dy = e.touches[0].clientY - drag.current.y;
    drag.current.dy = dy;
    if (dy > 0) {
      ref.current.style.transition = "none";
      ref.current.style.transform = `translateY(${dy}px)`;
    }
  };
  const onTE = () => {
    const d = drag.current;
    drag.current = null;
    if (!ref.current) return;
    ref.current.style.transition = "transform .22s ease";
    if (d && d.dy > 110) {
      ref.current.style.transform = "translateY(105%)";
      setTimeout(onClose, 180);
    } else ref.current.style.transform = "";
  };
  return React.createElement("div", {
    className: "overlay",
    onClick: e => e.target === e.currentTarget && onClose()
  }, React.createElement("div", {
    className: "sheet",
    ref: ref
  }, React.createElement("div", {
    className: "grabzone",
    onTouchStart: onTS,
    onTouchMove: onTM,
    onTouchEnd: onTE
  }, React.createElement("div", {
    className: "grab"
  }), React.createElement("div", {
    className: "sheet-head"
  }, React.createElement("h2", {
    className: "disp"
  }, title), React.createElement("button", {
    className: "iconbtn",
    onClick: onClose,
    "aria-label": "Close"
  }, "\u2715"))), children));
}
function Confirm({
  title,
  body,
  yes = "Delete",
  onYes,
  onClose
}) {
  const [busy, setBusy] = useState(false);
  return React.createElement(Sheet, {
    title: title,
    onClose: onClose
  }, React.createElement("p", {
    className: "sub",
    style: {
      marginTop: 2
    }
  }, body), React.createElement("div", {
    className: "grid2",
    style: {
      marginTop: 20
    }
  }, React.createElement("button", {
    className: "btn ghost",
    onClick: onClose
  }, "Cancel"), React.createElement("button", {
    className: "btn danger",
    disabled: busy,
    onClick: async () => {
      setBusy(true);
      await onYes();
    }
  }, yes)));
}
function useHash() {
  const [h, setH] = useState(window.location.hash || "#/");
  useEffect(() => {
    const f = () => setH(window.location.hash || "#/");
    window.addEventListener("hashchange", f);
    return () => window.removeEventListener("hashchange", f);
  }, []);
  return h;
}
const go = h => window.location.hash = h;
function verificationContextFromHash(hash) {
  const h = String(hash || "");
  const m = h.match(/^#\/auth\/confirm-verification\/([^/?#]+)(?:\?([^#]*))?/i) || h.match(/^#\/verify-email\/([^/?#]+)(?:\?([^#]*))?/i);
  if (!m) return {
    token: "",
    email: ""
  };
  let token = m[1];
  try {
    token = decodeURIComponent(token);
  } catch {}
  const params = new URLSearchParams(m[2] || "");
  const email = cleanEmail(params.get("email") || params.get("e") || "");
  return {
    token,
    email
  };
}
function AuthScreen({
  onAuth,
  toast
}) {
  const [signupMode, setSignupMode] = useState(false);
  const [signupAllowed, setSignupAllowed] = useState(SELF_SIGNUP_ENABLED);
  const [name, setName] = useState("");
  const [email, setEmail] = useState(() => getAuthPrefillEmail());
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit() {
    const guard = canAttemptAuth();
    if (!guard.ok) {
      const msg = `Too many attempts. Try again in ${Math.max(guard.waitSec, 1)}s.`;
      setErr(msg);
      toast(msg);
      return;
    }
    const id = cleanEmail(email);
    if (!id || !pw) return;
    setErr("");
    setBusy(true);
    try {
      if (signupMode) {
        const safeName = cleanText(name, 64);
        if (!safeName) throw new Error("Name is required");
        if (pw.length < 8) throw new Error("Password must be at least 8 characters");
        if (pw !== pw2) throw new Error("Passwords do not match");
        await col("users").create({
          name: safeName,
          email: id,
          password: pw,
          passwordConfirm: pw2,
          emailVisibility: true
        });
        if (REQUIRE_EMAIL_VERIFICATION) {
          setAuthPrefillEmail(id);
          await col("users").requestVerification(id);
          clearAuthGuard();
          setSignupMode(false);
          setName("");
          setPw("");
          setPw2("");
          const msg = "Account created. Check your email for a verification link before signing in.";
          setErr(msg);
          toast(msg);
          track("signup_verification_requested", {
            method: "email"
          });
          setBusy(false);
          return;
        }
      }
      await col("users").authWithPassword(id, pw);
      if (REQUIRE_EMAIL_VERIFICATION && pb.authStore.record?.verified !== true) {
        pb.authStore.clear();
        throw new Error("Your email is not verified yet. Please verify from the link in your inbox.");
      }
      clearAuthPrefillEmail();
      clearAuthGuard();
      track(signupMode ? "signup_success" : "signin_success", {
        method: "password"
      });
      onAuth();
    } catch (e) {
      const signupBlocked = signupMode && e?.status === 403 && /only superusers can perform this action/i.test(String(e?.message || ""));
      if (!signupBlocked) markAuthFailure();
      track(signupMode ? "signup_failed" : "signin_failed", {
        code: e?.status || "unknown"
      });
      if (signupBlocked) {
        setSignupAllowed(false);
        setSignupMode(false);
        const msg = "Sign-up is disabled on this server. Sign in with an existing account, or ask the admin to enable splitit_users createRule.";
        setErr(msg);
        toast(msg);
      } else {
        const signInError = REQUIRE_EMAIL_VERIFICATION ? "Wrong email or password, or your email is not verified yet." : "Wrong email or password — try again.";
        setErr(signupMode ? e?.data?.message || e?.message || "Couldn't create the account." : e?.status === 400 ? signInError : e?.message || "Failed");
      }
    }
    setBusy(false);
  }
  return React.createElement("div", {
    className: "center anim"
  }, React.createElement("h1", {
    className: "disp",
    style: {
      fontSize: 38
    }
  }, APP_NAME), React.createElement("p", {
    className: "sub"
  }, APP_TAGLINE, " Every cent accounted for."), React.createElement("div", {
    className: "card anim-pop",
    style: {
      marginTop: 20
    }
  }, signupMode && React.createElement(React.Fragment, null, React.createElement("label", null, "Full name"), React.createElement("input", {
    value: name,
    maxLength: 64,
    onChange: e => setName(e.target.value),
    placeholder: "Jane Doe",
    autoFocus: true
  })), React.createElement("label", null, "Email"), React.createElement("input", {
    type: "email",
    inputMode: "email",
    value: email,
    onChange: e => setEmail(e.target.value),
    placeholder: "you@mail.com",
    autoFocus: !signupMode
  }), React.createElement("label", null, "Password"), React.createElement("input", {
    type: "password",
    value: pw,
    onChange: e => setPw(e.target.value),
    onKeyDown: e => e.key === "Enter" && submit(),
    placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
  }), signupMode && React.createElement(React.Fragment, null, React.createElement("label", null, "Confirm password"), React.createElement("input", {
    type: "password",
    value: pw2,
    onChange: e => setPw2(e.target.value),
    onKeyDown: e => e.key === "Enter" && submit(),
    placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
  })), err && React.createElement("div", {
    className: "err"
  }, err), React.createElement("button", {
    className: "btn",
    style: {
      marginTop: 16
    },
    disabled: busy || !pw || !email || signupMode && !name,
    onClick: submit
  }, busy ? signupMode ? "Creating account…" : "Signing in…" : signupMode ? "Create account" : "Sign in")), signupAllowed && React.createElement("p", {
    className: "sub",
    style: {
      textAlign: "center",
      marginTop: 12
    }
  }, React.createElement("a", {
    onClick: () => {
      setSignupMode(!signupMode);
      setErr("");
    }
  }, signupMode ? "Already have an account? Sign in" : "New here? Create an account")));
}
function VerifyEmailScreen({
  token,
  emailHint
}) {
  const [state, setState] = useState("loading");
  const [msg, setMsg] = useState("Verifying your email…");
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        await col("users").confirmVerification(token);
        if (!active) return;
        const safeEmail = cleanEmail(emailHint) || getAuthPrefillEmail();
        if (safeEmail) setAuthPrefillEmail(safeEmail);
        setState("ok");
        setMsg("Email verified. You can sign in now.");
        track("email_verification_success");
      } catch (e) {
        if (!active) return;
        setState("err");
        setMsg(e?.data?.message || e?.message || "Verification failed or link expired.");
        track("email_verification_failed", {
          code: e?.status || "unknown"
        });
      }
    })();
    return () => {
      active = false;
    };
  }, [token]);
  return React.createElement("div", {
    className: "center anim",
    style: {
      paddingTop: 40
    }
  }, React.createElement("h1", {
    className: "disp",
    style: {
      fontSize: 34
    }
  }, APP_NAME), React.createElement("p", {
    className: "sub",
    style: {
      marginTop: 12
    }
  }, msg), React.createElement("div", {
    className: "card",
    style: {
      marginTop: 18
    }
  }, state === "ok" ? React.createElement("button", {
    className: "btn",
    onClick: () => go("#/")
  }, "Continue to sign in") : React.createElement("button", {
    className: "btn ghost",
    onClick: () => go("#/")
  }, "Back to sign in")));
}
function TripsScreen({
  me,
  toast
}) {
  const [trips, setTrips] = useState(() => cache.get("trips"));
  const [show, setShow] = useState(false);
  const [f, setF] = useState({
    name: "",
    currency: DEFAULT_CURRENCY
  });
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    try {
      const t = await col("trips").getFullList({
        sort: "-created",
        expand: "members,owner"
      });
      setTrips(t);
      cache.set("trips", t);
    } catch (e) {
      if (!cache.get("trips")) toast(e.message);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);
  async function create() {
    const name = cleanText(f.name, MAX_LEN.tripName);
    if (!name) return;
    setBusy(true);
    try {
      const t = await col("trips").create({
        ...f,
        name,
        owner: me.id,
        members: [me.id]
      });
      track("trip_created", {
        currency: f.currency
      });
      logActivity(t.id, me.id, "trip_created", `created trip “${t.name}”`);
      setShow(false);
      setF({
        name: "",
        currency: DEFAULT_CURRENCY
      });
      go("#/trip/" + t.id);
    } catch (e) {
      toast(e?.data?.message || e.message);
    }
    setBusy(false);
  }
  return React.createElement(React.Fragment, null, React.createElement("div", {
    className: "topbar"
  }, React.createElement("span", {
    className: "wordmark"
  }, APP_NAME), React.createElement("div", {
    className: "stack"
  }, React.createElement("button", {
    className: "iconbtn",
    title: "Profile & account",
    "aria-label": "Profile & account",
    style: {
      padding: 0,
      borderRadius: "999px"
    },
    onClick: () => go("#/profile")
  }, React.createElement(Avatar, {
    user: me,
    size: 34
  })), React.createElement("button", {
    className: "iconbtn",
    title: "Sign out",
    onClick: () => {
      pb.authStore.clear();
      location.reload();
    }
  }, "\u23FB"))), React.createElement("h1", {
    className: "disp anim"
  }, "Your trips"), React.createElement("p", {
    className: "sub anim"
  }, "Hey ", first(me.name), " \u2014 pick a trip or start a new one."), React.createElement("div", {
    style: {
      height: 18
    }
  }), trips === null && React.createElement(React.Fragment, null, React.createElement("div", {
    className: "skl"
  }), React.createElement("div", {
    className: "skl"
  })), trips?.length === 0 && React.createElement("div", {
    className: "card empty anim"
  }, React.createElement("div", {
    className: "big"
  }, "\uD83C\uDFDD\uFE0F"), "No trips yet.", React.createElement("br", null), "Start one and add your people."), trips?.map((t, i) => {
    const members = [t.expand?.owner, ...(t.expand?.members || [])].filter(Boolean).filter((m, x, a) => a.findIndex(y => y.id === m.id) === x);
    return React.createElement("button", {
      key: t.id,
      className: "card rrow anim",
      style: {
        animationDelay: `${i * 60}ms`,
        padding: 18
      },
      onClick: () => go("#/trip/" + t.id)
    }, React.createElement("div", {
      className: "rmain"
    }, React.createElement("div", {
      className: "rtitle",
      style: {
        fontFamily: "var(--disp)",
        fontSize: 18
      }
    }, t.name), React.createElement("div", {
      className: "rsub"
    }, members.length, " member", members.length !== 1 ? "s" : "", " \xB7 ", normCur(t.currency))), React.createElement("span", {
      className: "stack",
      style: {
        gap: 0
      }
    }, members.slice(0, 5).map((m, x) => React.createElement("span", {
      key: m.id,
      style: {
        marginLeft: x ? -10 : 0
      }
    }, React.createElement(Avatar, {
      user: m,
      size: 32
    })))));
  }), React.createElement("button", {
    className: "btn fab",
    onClick: () => setShow(true)
  }, "\uFF0B New trip"), show && React.createElement(Sheet, {
    title: "New trip",
    onClose: () => setShow(false)
  }, React.createElement("label", null, "Trip name"), React.createElement("input", {
    value: f.name,
    maxLength: MAX_LEN.tripName,
    onChange: e => setF({
      ...f,
      name: e.target.value
    }),
    placeholder: "Weekend in Goa",
    autoFocus: true
  }), React.createElement("label", null, "Base currency (balances are kept in this)"), React.createElement("div", {
    className: "chips"
  }, CURRENCIES.map(c => React.createElement("button", {
    key: c.code,
    className: "chip" + (f.currency === c.code ? " on" : ""),
    onClick: () => setF({
      ...f,
      currency: c.code
    })
  }, c.sym.trim(), " ", c.code))), React.createElement("button", {
    className: "btn",
    style: {
      marginTop: 24
    },
    disabled: busy || !f.name.trim(),
    onClick: create
  }, "Create trip")));
}
function ProfileScreen({
  me,
  toast
}) {
  const [busy, setBusy] = useState("");
  const [confirm, setConfirm] = useState("");
  async function eraseLocalData() {
    setBusy("local");
    try {
      Object.keys(localStorage).filter(k => k.startsWith("si_") || k.startsWith("si_c_")).forEach(k => localStorage.removeItem(k));
      toast("Local app data erased from this device.");
      track("profile_erase_local");
    } catch (e) {
      toast(e?.message || "Couldn't erase local data.");
    }
    setBusy("");
  }
  async function eraseServerData() {
    setBusy("server");
    try {
      const [ownedTrips, memberTrips, paidExpenses, mySettlements] = await Promise.all([col("trips").getFullList({
        filter: `owner=\"${me.id}\"`
      }), col("trips").getFullList({
        filter: `members.id ?= \"${me.id}\" && owner != \"${me.id}\"`
      }), col("expenses").getFullList({
        filter: `paid_by=\"${me.id}\"`
      }), col("settlements").getFullList({
        filter: `from=\"${me.id}\" || to=\"${me.id}\"`
      })]);
      for (const e of paidExpenses) {
        try {
          await col("expenses").delete(e.id);
        } catch {}
      }
      for (const s of mySettlements) {
        try {
          await col("settlements").delete(s.id);
        } catch {}
      }
      for (const t of memberTrips) {
        try {
          await col("trips").update(t.id, {
            "members-": me.id
          });
        } catch {}
      }
      for (const t of ownedTrips) {
        try {
          await col("trips").delete(t.id);
        } catch {}
      }
      toast("Data erase complete (best effort based on permissions).");
      track("profile_erase_server", {
        ownedTrips: ownedTrips.length,
        memberTrips: memberTrips.length,
        paidExpenses: paidExpenses.length,
        settlements: mySettlements.length
      });
      setConfirm("");
    } catch (e) {
      toast(e?.data?.message || e.message || "Couldn't erase server data.");
    }
    setBusy("");
  }
  async function deleteAccount() {
    setBusy("account");
    try {
      await col("users").delete(me.id);
      track("profile_delete_account");
      pb.authStore.clear();
      location.hash = "#/";
      location.reload();
    } catch (e) {
      if (e?.status === 403 || e?.status === 400) {
        toast("Account deletion is disabled by server rules. Ask your admin to enable it.");
      } else {
        toast(e?.data?.message || e.message || "Couldn't delete account.");
      }
    }
    setBusy("");
  }
  return React.createElement(React.Fragment, null, React.createElement("div", {
    className: "topbar"
  }, React.createElement("button", {
    className: "iconbtn",
    onClick: () => go("#/"),
    "aria-label": "Back"
  }, "\u2190"), React.createElement("span", {
    className: "wordmark",
    style: {
      fontSize: 17
    }
  }, "Profile"), React.createElement("button", {
    className: "iconbtn",
    title: "Sign out",
    onClick: () => {
      pb.authStore.clear();
      location.reload();
    }
  }, "\u23FB")), React.createElement("h1", {
    className: "disp anim"
  }, "Your profile"), React.createElement("p", {
    className: "sub anim"
  }, "Manage your account details, member ID, and personal data controls."), React.createElement("h3", {
    className: "h3"
  }, "User profile"), React.createElement("div", {
    className: "card anim"
  }, React.createElement("div", {
    className: "rrow"
  }, React.createElement(Avatar, {
    user: me,
    size: 44
  }), React.createElement("div", {
    className: "rmain"
  }, React.createElement("div", {
    className: "rtitle"
  }, me.name || "Unnamed user"), React.createElement("div", {
    className: "rsub"
  }, me.email || "No email"))), React.createElement("div", {
    className: "rrow"
  }, React.createElement("div", {
    className: "rmain"
  }, React.createElement("div", {
    className: "rtitle",
    style: {
      fontSize: 14
    }
  }, "Member ID"), React.createElement("div", {
    className: "rsub mono"
  }, me.id)), React.createElement("button", {
    className: "btn sm ghost",
    onClick: async () => {
      toast((await copyText(me.id)) ? "Member ID copied" : "Couldn't copy member ID");
    }
  }, "Copy"))), React.createElement("h3", {
    className: "h3"
  }, "Details"), React.createElement("div", {
    className: "card anim",
    style: {
      animationDelay: "40ms"
    }
  }, React.createElement("div", {
    className: "rrow"
  }, React.createElement("div", {
    className: "rmain"
  }, React.createElement("div", {
    className: "rtitle",
    style: {
      fontSize: 14
    }
  }, "Email status"), React.createElement("div", {
    className: "rsub"
  }, me.verified ? "Verified" : "Not verified"))), React.createElement("div", {
    className: "rrow"
  }, React.createElement("div", {
    className: "rmain"
  }, React.createElement("div", {
    className: "rtitle",
    style: {
      fontSize: 14
    }
  }, "Joined"), React.createElement("div", {
    className: "rsub"
  }, niceDate(me.created)))), React.createElement("div", {
    className: "rrow"
  }, React.createElement("div", {
    className: "rmain"
  }, React.createElement("div", {
    className: "rtitle",
    style: {
      fontSize: 14
    }
  }, "Last updated"), React.createElement("div", {
    className: "rsub"
  }, niceDate(me.updated))))), React.createElement("h3", {
    className: "h3"
  }, "Erase data"), React.createElement("div", {
    className: "card anim",
    style: {
      animationDelay: "80ms"
    }
  }, React.createElement("div", {
    className: "rrow"
  }, React.createElement("div", {
    className: "rmain"
  }, React.createElement("div", {
    className: "rtitle",
    style: {
      fontSize: 14
    }
  }, "Erase local app data"), React.createElement("div", {
    className: "rsub"
  }, "Removes cached trips, auth guard state, and local preferences on this device.")), React.createElement("button", {
    className: "btn sm ghost",
    disabled: busy !== "",
    onClick: eraseLocalData
  }, busy === "local" ? "Erasing…" : "Erase")), React.createElement("div", {
    className: "rrow"
  }, React.createElement("div", {
    className: "rmain"
  }, React.createElement("div", {
    className: "rtitle",
    style: {
      fontSize: 14
    }
  }, "Erase my trip data"), React.createElement("div", {
    className: "rsub"
  }, "Deletes expenses you paid, settlements involving you, leaves shared trips, and removes trips you own.")), React.createElement("button", {
    className: "btn sm danger",
    disabled: busy !== "",
    onClick: () => setConfirm("server")
  }, "Erase"))), React.createElement("h3", {
    className: "h3"
  }, "Danger zone"), React.createElement("div", {
    className: "card anim",
    style: {
      animationDelay: "120ms"
    }
  }, React.createElement("div", {
    className: "rrow"
  }, React.createElement("div", {
    className: "rmain"
  }, React.createElement("div", {
    className: "rtitle",
    style: {
      fontSize: 14
    }
  }, "Delete account"), React.createElement("div", {
    className: "rsub"
  }, "Permanently deletes your account if your server allows self-delete.")), React.createElement("button", {
    className: "btn sm danger",
    disabled: busy !== "",
    onClick: () => setConfirm("account")
  }, "Delete"))), confirm === "server" && React.createElement(Confirm, {
    title: "Erase your trip data?",
    body: "This removes your paid expenses and settlements, leaves shared trips, and deletes trips that you own. This cannot be undone.",
    yes: "Erase data",
    onClose: () => setConfirm(""),
    onYes: eraseServerData
  }), confirm === "account" && React.createElement(Confirm, {
    title: "Delete account?",
    body: "Your account will be permanently removed if server rules allow it. If deletion is blocked, you'll see an error and can contact your admin.",
    yes: "Delete account",
    onClose: () => setConfirm(""),
    onYes: deleteAccount
  }));
}
const TABS = ["expenses", "balances", "totals", "activity"];
function TripScreen({
  tripId,
  me,
  toast
}) {
  const cached = cache.get("trip_" + tripId) || {};
  const [trip, setTrip] = useState(cached.trip || null);
  const [expenses, setExpenses] = useState(cached.expenses || []);
  const [splits, setSplits] = useState(cached.splits || []);
  const [settlements, setSettlements] = useState(cached.settlements || []);
  const [activity, setActivity] = useState(cached.activity || []);
  const [tab, setTab] = useState("expenses");
  const [settleMode, setSettleMode] = useState(() => localStorage.getItem("ts_settle_mode") || "simplified");
  const [sheet, setSheet] = useState(null);
  const [q, setQ] = useState("");
  const [qCat, setQCat] = useState("");
  const base = normCur(trip?.currency);
  const members = useMemo(() => {
    if (!trip) return [];
    const all = [trip.expand?.owner, ...(trip.expand?.members || [])].filter(Boolean);
    return all.filter((m, i, a) => a.findIndex(x => x.id === m.id) === i);
  }, [trip]);
  const uById = id => members.find(m => m.id === id) || {
    name: "?",
    id
  };
  const isTripOwner = trip?.owner === me.id;
  const load = useCallback(async () => {
    try {
      const [t, ex, sp, se, ac] = await Promise.all([col("trips").getOne(tripId, {
        expand: "members,owner"
      }), col("expenses").getFullList({
        filter: `trip="${tripId}"`,
        sort: "-date,-created"
      }), col("splits").getFullList({
        filter: `expense.trip="${tripId}"`
      }), col("settlements").getFullList({
        filter: `trip="${tripId}"`,
        sort: "-date,-created"
      }), col("activity").getFullList({
        filter: `trip="${tripId}"`,
        sort: "-created"
      })]);
      setTrip(t);
      setExpenses(ex);
      setSplits(sp);
      setSettlements(se);
      setActivity(ac);
      cache.set("trip_" + tripId, {
        trip: t,
        expenses: ex,
        splits: sp,
        settlements: se,
        activity: ac
      });
    } catch (e) {
      toast(e.message);
      if (e.status === 404) go("#/");
    }
  }, [tripId]);
  useEffect(() => {
    load();
  }, [load]);
  const timer = useRef(null);
  useEffect(() => {
    const bump = () => {
      clearTimeout(timer.current);
      timer.current = setTimeout(load, 300);
    };
    const names = ["expenses", "splits", "settlements", "activity", "trips"];
    names.forEach(n => col(n).subscribe("*", bump).catch(() => {}));
    return () => {
      clearTimeout(timer.current);
      names.forEach(n => col(n).unsubscribe("*").catch(() => {}));
    };
  }, [tripId]);
  const touch = useRef(null);
  const onTS = e => {
    touch.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
  };
  const onTE = e => {
    const t = touch.current;
    touch.current = null;
    if (!t) return;
    const dx = e.changedTouches[0].clientX - t.x,
      dy = e.changedTouches[0].clientY - t.y;
    if (Math.abs(dx) > 64 && Math.abs(dy) < 48) {
      const n = TABS[TABS.indexOf(tab) + (dx < 0 ? 1 : -1)];
      if (n) setTab(n);
    }
  };
  const nets = useMemo(() => computeNets(expenses, splits, settlements), [expenses, splits, settlements]);
  const suggestions = useMemo(() => simplify(nets), [nets]);
  const settleRows = useMemo(() => settleMode === "simplified" ? simplify(nets) : computePairwise(expenses, splits, settlements), [settleMode, nets, expenses, splits, settlements]);
  const total = useMemo(() => r2(expenses.reduce((a, e) => a + baseAmt(e), 0)), [expenses]);
  const myPaid = useMemo(() => r2(expenses.filter(e => e.paid_by === me.id).reduce((a, e) => a + baseAmt(e), 0)), [expenses]);
  const myShare = useMemo(() => r2(splits.filter(s => s.user === me.id).reduce((a, s) => a + s.amount, 0)), [splits]);
  const myNet = nets[me.id] || 0;
  const shown = useMemo(() => expenses.filter(e => (!qCat || e.category === qCat) && (!q || e.description.toLowerCase().includes(q.toLowerCase()))), [expenses, q, qCat]);
  const grouped = useMemo(() => {
    const g = [];
    shown.forEach(e => {
      const k = monthKey(e.date || e.created);
      let grp = g.find(x => x.k === k);
      if (!grp) {
        grp = {
          k,
          items: []
        };
        g.push(grp);
      }
      grp.items.push(e);
    });
    return g;
  }, [shown]);
  const mySplitByExpense = useMemo(() => {
    const out = {};
    splits.forEach(s => {
      if (s.user === me.id) out[s.expense] = s.amount;
    });
    return out;
  }, [splits, me.id]);
  if (!trip) return React.createElement(React.Fragment, null, React.createElement("div", {
    style: {
      height: 20
    }
  }), React.createElement("div", {
    className: "skl",
    style: {
      height: 120
    }
  }), React.createElement("div", {
    className: "skl"
  }), React.createElement("div", {
    className: "skl"
  }));
  return React.createElement(React.Fragment, null, React.createElement("div", {
    className: "topbar"
  }, React.createElement("button", {
    className: "iconbtn",
    onClick: () => go("#/"),
    "aria-label": "Back"
  }, "\u2190"), React.createElement("span", {
    className: "wordmark",
    style: {
      fontSize: 17,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    }
  }, trip.name), React.createElement("button", {
    className: "iconbtn",
    onClick: () => setSheet({
      type: "members"
    }),
    title: "Members & settings"
  }, "\u2699")), React.createElement("div", {
    className: "card hero anim"
  }, React.createElement("span", {
    className: "k"
  }, "Trip total \xB7 ", base), React.createElement("div", {
    className: "big"
  }, fmt(total, base)), React.createElement("p", {
    className: "sub",
    style: {
      marginTop: 6
    }
  }, Math.abs(myNet) < 0.01 ? "You're all settled up ✓" : myNet > 0 ? React.createElement(React.Fragment, null, "you are owed ", React.createElement("b", {
    className: "mono"
  }, fmt(myNet, base))) : React.createElement(React.Fragment, null, "you owe ", React.createElement("b", {
    className: "mono"
  }, fmt(myNet, base)))), React.createElement("div", {
    className: "stack",
    style: {
      gap: 0,
      marginTop: 14
    }
  }, members.map((m, i) => React.createElement("span", {
    key: m.id,
    style: {
      marginLeft: i ? -9 : 0
    }
  }, React.createElement(Avatar, {
    user: m,
    size: 30
  }))), React.createElement("span", {
    style: {
      marginLeft: 10,
      fontSize: 12.5,
      opacity: .85
    }
  }, members.map(m => first(m.name)).join(" · ")))), React.createElement("div", {
    className: "tabs",
    role: "tablist"
  }, [["expenses", "Expenses"], ["balances", "Balances"], ["totals", "Totals"], ["activity", "Activity"]].map(([k, l]) => React.createElement("button", {
    key: k,
    role: "tab",
    "aria-selected": tab === k,
    className: tab === k ? "on" : "",
    onClick: () => setTab(k)
  }, l))), React.createElement("div", {
    onTouchStart: onTS,
    onTouchEnd: onTE
  }, tab === "expenses" && React.createElement("div", {
    key: "t-exp",
    className: "anim"
  }, React.createElement("div", {
    className: "stack",
    style: {
      marginBottom: 12
    }
  }, React.createElement("input", {
    placeholder: "Search expenses\u2026",
    value: q,
    onChange: e => setQ(e.target.value),
    style: {
      flex: 1
    }
  }), React.createElement("select", {
    value: qCat,
    onChange: e => setQCat(e.target.value),
    style: {
      width: 130
    }
  }, React.createElement("option", {
    value: ""
  }, "All"), CATEGORIES.map(c => React.createElement("option", {
    key: c.key,
    value: c.key
  }, c.emoji, " ", c.label)))), expenses.length === 0 && React.createElement("div", {
    className: "card empty"
  }, React.createElement("div", {
    className: "big"
  }, "\uD83E\uDDFE"), "No expenses yet.", React.createElement("br", null), "Add the first one below."), expenses.length > 0 && shown.length === 0 && React.createElement("div", {
    className: "card empty"
  }, "Nothing matches that search."), grouped.map(g => React.createElement(React.Fragment, {
    key: g.k
  }, React.createElement("h3", {
    className: "h3"
  }, g.k), React.createElement("div", {
    className: "card",
    style: {
      padding: "6px 14px"
    }
  }, g.items.map((e, i) => {
    const d = new Date(e.date || e.created);
    const foreign = normCur(e.currency || base) !== base;
    const mine = mySplitByExpense[e.id] || 0;
    const lent = e.paid_by === me.id ? r2(baseAmt(e) - mine) : -mine;
    return React.createElement("button", {
      key: e.id,
      className: "rrow anim",
      style: {
        animationDelay: `${i * 35}ms`
      },
      onClick: () => setSheet({
        type: "detail",
        id: e.id
      })
    }, React.createElement("span", {
      className: "datechip"
    }, React.createElement("b", null, d.getDate()), React.createElement("span", null, d.toLocaleDateString(undefined, {
      month: "short"
    }))), React.createElement("span", {
      className: "catmoji"
    }, catOf(e.category).emoji), React.createElement("div", {
      className: "rmain"
    }, React.createElement("div", {
      className: "rtitle"
    }, e.description), React.createElement("div", {
      className: "rsub"
    }, first(uById(e.paid_by).name), " paid ", fmt(e.amount, e.currency || base), foreign ? ` ≈ ${fmt(baseAmt(e), base)}` : "")), React.createElement("span", {
      className: "ramt " + (Math.abs(lent) < 0.005 ? "mut" : lent > 0 ? "pos" : "neg")
    }, Math.abs(lent) < 0.005 ? "—" : fmt(lent, base), React.createElement("small", null, Math.abs(lent) < 0.005 ? "not involved" : lent > 0 ? "you lent" : "you borrowed")));
  }))))), tab === "balances" && React.createElement("div", {
    key: "t-bal",
    className: "anim"
  }, React.createElement("div", {
    className: "card"
  }, members.map((m, i) => {
    const v = nets[m.id] || 0;
    const max = Math.max(...Object.values(nets).map(Math.abs), 1);
    return React.createElement("div", {
      key: m.id,
      className: "rrow anim",
      style: {
        animationDelay: `${i * 40}ms`
      }
    }, React.createElement(Avatar, {
      user: m
    }), React.createElement("div", {
      className: "rmain"
    }, React.createElement("div", {
      className: "rtitle"
    }, m.name, m.id === me.id ? " (you)" : ""), React.createElement("div", {
      className: "bar",
      style: {
        width: 130,
        marginTop: 6
      }
    }, React.createElement("div", {
      style: {
        width: `${Math.abs(v) / max * 100}%`,
        background: v >= 0 ? "var(--green-2)" : "var(--red)",
        animationDelay: `${i * 60}ms`
      }
    }))), React.createElement("span", {
      className: "ramt " + (Math.abs(v) < 0.01 ? "mut" : v > 0 ? "pos" : "neg")
    }, Math.abs(v) < 0.01 ? "settled" : fmt(v, base), React.createElement("small", null, Math.abs(v) < 0.01 ? "✓" : v > 0 ? "gets back" : "owes")));
  })), (() => {
    return React.createElement(React.Fragment, null, React.createElement("div", {
      className: "tabs mini",
      style: {
        marginTop: 18,
        marginBottom: 4
      }
    }, [["simplified", "Simplified"], ["pairwise", "Pairwise"]].map(([k, l]) => React.createElement("button", {
      key: k,
      className: settleMode === k ? "on" : "",
      onClick: () => {
        setSettleMode(k);
        try {
          localStorage.setItem("ts_settle_mode", k);
        } catch {}
      }
    }, l))), React.createElement("p", {
      className: "sub",
      style: {
        marginTop: 2,
        marginBottom: 8,
        fontSize: 12.5
      }
    }, settleMode === "simplified" ? "Fewest transfers. Debts rerouted, totals identical." : "Actual debts per person, from expense history."), React.createElement("h3", {
      className: "h3"
    }, settleMode === "simplified" ? `Simplest way to settle · ${settleRows.length} payment${settleRows.length !== 1 ? "s" : ""}` : `Who owes whom · ${settleRows.length} payment${settleRows.length !== 1 ? "s" : ""}`), React.createElement("div", {
      className: "card"
    }, settleRows.length === 0 && React.createElement("div", {
      className: "empty"
    }, React.createElement("div", {
      className: "big"
    }, "\uD83C\uDF89"), "Everyone is settled up."), settleRows.map((s, i) => React.createElement("div", {
      key: i,
      className: "rrow anim",
      style: {
        animationDelay: `${i * 40}ms`
      }
    }, React.createElement("span", {
      className: "stack",
      style: {
        gap: 6
      }
    }, React.createElement(Avatar, {
      user: uById(s.from),
      size: 30
    }), React.createElement("span", {
      style: {
        color: "var(--mut)"
      }
    }, "\u2192"), React.createElement(Avatar, {
      user: uById(s.to),
      size: 30
    })), React.createElement("div", {
      className: "rmain"
    }, React.createElement("div", {
      className: "rtitle",
      style: {
        fontSize: 14
      }
    }, first(uById(s.from).name), " pays ", first(uById(s.to).name))), React.createElement("span", {
      className: "ramt"
    }, fmt(s.amount, base)), React.createElement("button", {
      className: "btn sm",
      onClick: () => setSheet({
        type: "settle",
        from: s.from,
        to: s.to,
        amount: s.amount
      })
    }, "Settle"))), settleRows.length > 0 && React.createElement("button", {
      className: "btn ghost",
      style: {
        marginTop: 12
      },
      onClick: () => setSheet({
        type: "settle"
      })
    }, "Record a different payment")));
  })(), settlements.length > 0 && React.createElement(React.Fragment, null, React.createElement("h3", {
    className: "h3"
  }, "Payments recorded"), React.createElement("div", {
    className: "card"
  }, settlements.map((s, i) => React.createElement("div", {
    key: s.id,
    className: "rrow anim",
    style: {
      animationDelay: `${i * 35}ms`
    }
  }, React.createElement("span", {
    className: "catmoji",
    style: {
      background: "var(--green-soft)"
    }
  }, "\uD83D\uDCB8"), React.createElement("div", {
    className: "rmain"
  }, React.createElement("div", {
    className: "rtitle",
    style: {
      fontSize: 14
    }
  }, first(uById(s.from).name), " paid ", first(uById(s.to).name)), React.createElement("div", {
    className: "rsub"
  }, niceDate(s.date || s.created), s.notes ? ` · ${s.notes}` : "")), React.createElement("span", {
    className: "ramt mut"
  }, fmt(s.amount, base)), (isTripOwner || s.from === me.id || s.to === me.id) && React.createElement("button", {
    className: "iconbtn",
    title: "Delete payment",
    style: {
      width: 34,
      height: 34,
      fontSize: 13
    },
    onClick: () => setSheet({
      type: "delpay",
      rec: s
    })
  }, "\uD83D\uDDD1")))))), tab === "totals" && React.createElement("div", {
    key: "t-tot",
    className: "anim"
  }, React.createElement("div", {
    className: "grid2"
  }, React.createElement("div", {
    className: "stat anim"
  }, React.createElement("div", {
    className: "k"
  }, "Trip spend"), React.createElement("div", {
    className: "v"
  }, fmt(total, base))), React.createElement("div", {
    className: "stat anim",
    style: {
      animationDelay: "40ms"
    }
  }, React.createElement("div", {
    className: "k"
  }, "Per head avg"), React.createElement("div", {
    className: "v"
  }, fmt(members.length ? total / members.length : 0, base))), React.createElement("div", {
    className: "stat anim",
    style: {
      animationDelay: "80ms"
    }
  }, React.createElement("div", {
    className: "k"
  }, "You paid"), React.createElement("div", {
    className: "v"
  }, fmt(myPaid, base))), React.createElement("div", {
    className: "stat anim",
    style: {
      animationDelay: "120ms"
    }
  }, React.createElement("div", {
    className: "k"
  }, "Your share"), React.createElement("div", {
    className: "v"
  }, fmt(myShare, base)))), React.createElement("h3", {
    className: "h3"
  }, "By category"), React.createElement("div", {
    className: "card"
  }, (() => {
    const byCat = {};
    expenses.forEach(e => {
      const k = catOf(e.category).key;
      byCat[k] = r2((byCat[k] || 0) + baseAmt(e));
    });
    const list = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
    if (!list.length) return React.createElement("div", {
      className: "empty"
    }, "No expenses yet.");
    const max = list[0][1];
    return list.map(([k, v], i) => {
      const c = catOf(k);
      return React.createElement("div", {
        key: k,
        className: "rrow anim",
        style: {
          animationDelay: `${i * 40}ms`
        }
      }, React.createElement("span", {
        className: "catmoji"
      }, c.emoji), React.createElement("div", {
        className: "rmain"
      }, React.createElement("div", {
        className: "rtitle",
        style: {
          fontSize: 14
        }
      }, c.label), React.createElement("div", {
        className: "bar",
        style: {
          marginTop: 6
        }
      }, React.createElement("div", {
        style: {
          width: `${v / max * 100}%`,
          background: "var(--green-2)",
          animationDelay: `${i * 60}ms`
        }
      }))), React.createElement("span", {
        className: "ramt"
      }, fmt(v, base), React.createElement("small", null, total ? Math.round(v / total * 100) : 0, "%")));
    });
  })()), React.createElement("h3", {
    className: "h3"
  }, "Who paid what"), React.createElement("div", {
    className: "card"
  }, members.map((m, i) => {
    const paid = r2(expenses.filter(e => e.paid_by === m.id).reduce((a, e) => a + baseAmt(e), 0));
    const share = r2(splits.filter(s => s.user === m.id).reduce((a, s) => a + s.amount, 0));
    const max = Math.max(...members.map(x => expenses.filter(e => e.paid_by === x.id).reduce((a, e) => a + baseAmt(e), 0)), 1);
    return React.createElement("div", {
      key: m.id,
      className: "rrow anim",
      style: {
        animationDelay: `${i * 40}ms`
      }
    }, React.createElement(Avatar, {
      user: m,
      size: 32
    }), React.createElement("div", {
      className: "rmain"
    }, React.createElement("div", {
      className: "rtitle",
      style: {
        fontSize: 14
      }
    }, first(m.name)), React.createElement("div", {
      className: "bar",
      style: {
        marginTop: 6
      }
    }, React.createElement("div", {
      style: {
        width: `${paid / max * 100}%`,
        background: avColor(m.id),
        animationDelay: `${i * 60}ms`
      }
    }))), React.createElement("span", {
      className: "ramt"
    }, fmt(paid, base), React.createElement("small", null, "share ", fmt(share, base))));
  })), React.createElement("button", {
    className: "btn ghost",
    onClick: () => exportCSV(trip, expenses, splits, members)
  }, "\u2B07 Export expenses as CSV")), tab === "activity" && React.createElement("div", {
    key: "t-act",
    className: "anim card"
  }, activity.filter(a => a.action !== "comment").length === 0 && React.createElement("div", {
    className: "empty"
  }, "Nothing yet."), activity.filter(a => a.action !== "comment").map((a, i) => {
    const icon = {
      trip_created: "🌱",
      expense_added: "🧾",
      expense_edited: "✏️",
      expense_deleted: "🗑️",
      payment_added: "💸",
      payment_deleted: "↩️",
      member_added: "👋",
      member_linked: "🔗"
    }[a.action] || "•";
    return React.createElement("div", {
      key: a.id,
      className: "rrow anim",
      style: {
        animationDelay: `${i * 30}ms`
      }
    }, React.createElement("span", {
      className: "catmoji"
    }, icon), React.createElement("div", {
      className: "rmain"
    }, React.createElement("div", {
      className: "rtitle",
      style: {
        fontSize: 14,
        whiteSpace: "normal"
      }
    }, React.createElement("b", null, first(uById(a.actor).name)), " ", a.detail), React.createElement("div", {
      className: "rsub"
    }, timeAgo(a.created))));
  }))), React.createElement("button", {
    className: "btn fab",
    onClick: () => setSheet({
      type: "add"
    })
  }, "\uFF0B Add expense"), sheet?.type === "add" && React.createElement(ExpenseForm, {
    trip: trip,
    members: members,
    me: me,
    base: base,
    onDone: () => {
      setSheet(null);
      load();
    },
    onClose: () => setSheet(null),
    toast: toast
  }), sheet?.type === "edit" && React.createElement(ExpenseForm, {
    trip: trip,
    members: members,
    me: me,
    base: base,
    expense: expenses.find(e => e.id === sheet.id),
    splits: splits.filter(s => s.expense === sheet.id),
    onDone: () => {
      setSheet(null);
      load();
    },
    onClose: () => setSheet(null),
    toast: toast
  }), sheet?.type === "detail" && (() => {
    const e = expenses.find(x => x.id === sheet.id);
    return e ? React.createElement(ExpenseDetail, {
      expense: e,
      splits: splits.filter(s => s.expense === e.id),
      activity: activity,
      me: me,
      base: base,
      uById: uById,
      trip: trip,
      toast: toast,
      canManage: isTripOwner || e.paid_by === me.id,
      onEdit: () => setSheet({
        type: "edit",
        id: e.id
      }),
      onDelete: () => setSheet({
        type: "delexp",
        rec: e
      }),
      onClose: () => setSheet(null),
      onRefresh: load
    }) : null;
  })(), sheet?.type === "delexp" && React.createElement(Confirm, {
    title: "Delete expense?",
    body: `“${sheet.rec.description}” (${fmt(sheet.rec.amount, sheet.rec.currency || base)}) and its splits will be removed for everyone.`,
    onClose: () => setSheet(null),
    onYes: async () => {
      try {
        await col("expenses").delete(sheet.rec.id);
        logActivity(trip.id, me.id, "expense_deleted", `deleted “${sheet.rec.description}” (${fmt(baseAmt(sheet.rec), base)})`);
        setSheet(null);
        load();
      } catch (e) {
        toast(e.message);
      }
    }
  }), sheet?.type === "settle" && React.createElement(SettleForm, {
    trip: trip,
    members: members,
    me: me,
    base: base,
    preset: sheet,
    uById: uById,
    onDone: () => {
      setSheet(null);
      load();
    },
    onClose: () => setSheet(null),
    toast: toast
  }), sheet?.type === "delpay" && React.createElement(Confirm, {
    title: "Delete payment?",
    body: `${first(uById(sheet.rec.from).name)} → ${first(uById(sheet.rec.to).name)} of ${fmt(sheet.rec.amount, base)} will be removed.`,
    onClose: () => setSheet(null),
    onYes: async () => {
      try {
        await col("settlements").delete(sheet.rec.id);
        logActivity(trip.id, me.id, "payment_deleted", `deleted payment ${first(uById(sheet.rec.from).name)} → ${first(uById(sheet.rec.to).name)} (${fmt(sheet.rec.amount, base)})`);
        setSheet(null);
        load();
      } catch (e) {
        toast(e.message);
      }
    }
  }), sheet?.type === "members" && React.createElement(Members, {
    trip: trip,
    members: members,
    me: me,
    expenseCount: expenses.length,
    onDone: load,
    onClose: () => setSheet(null),
    toast: toast
  }));
}
function ExpenseForm({
  trip,
  members,
  me,
  base,
  expense,
  splits: oldSplits,
  onDone,
  onClose,
  toast
}) {
  const editing = !!expense;
  const [f, setF] = useState(() => editing ? {
    description: expense.description,
    amount: String(expense.amount),
    paid_by: expense.paid_by,
    date: (expense.date || expense.created).slice(0, 10),
    category: expense.category || "misc",
    notes: expense.notes || ""
  } : {
    description: "",
    amount: "",
    paid_by: me.id,
    date: today(),
    category: "food",
    notes: ""
  });
  const [cur, setCur] = useState(editing ? normCur(expense.currency || base) : base);
  const [rate, setRate] = useState(editing ? String(expense.fx_rate || 1) : "1");
  const [rateBusy, setRateBusy] = useState(false);
  const [mode, setMode] = useState(editing ? expense.split_mode || "equal" : "equal");
  const [among, setAmong] = useState(() => editing ? oldSplits.map(s => s.user) : members.map(m => m.id));
  const [vals, setVals] = useState(() => {
    if (!editing) return {};
    const v = {};
    oldSplits.forEach(s => {
      v[s.user] = String(expense.split_mode === "exact" ? s.share ?? s.amount : s.share ?? "");
    });
    return v;
  });
  const [busy, setBusy] = useState(false);
  const amt = parseFloat(f.amount) || 0;
  const rateNum = parseFloat(rate) || 0;
  const baseTotal = r2(amt * (cur === base ? 1 : rateNum));
  const foreign = cur !== base;
  useEffect(() => {
    let dead = false;
    if (!foreign) {
      setRate("1");
      return;
    }
    if (editing && normCur(expense.currency || base) === cur && expense.fx_rate) {
      setRate(String(expense.fx_rate));
      return;
    }
    setRateBusy(true);
    setRate("");
    fetchRate(cur, base).then(r => {
      if (!dead) {
        setRate(String(Math.round(r * 1e6) / 1e6 || r));
      }
    }).catch(e => {
      if (!dead) {
        setRate("");
        toast(e.message);
      }
    }).finally(() => {
      if (!dead) setRateBusy(false);
    });
    return () => {
      dead = true;
    };
  }, [cur]);
  const toggle = id => setAmong(a => a.includes(id) ? a.filter(x => x !== id) : [...a, id]);
  const val = id => parseFloat(vals[id]) || 0;
  const valSum = r2(among.reduce((a, id) => a + val(id), 0));
  function weights() {
    if (mode === "equal") return among.map(() => 1);
    if (mode === "exact") return among.map(id => val(id));
    if (mode === "percent") return among.map(id => val(id));
    return among.map(id => vals[id] === undefined || vals[id] === "" ? 1 : val(id));
  }
  function buildSplits() {
    const amts = distribute(baseTotal, weights());
    return among.map((id, i) => ({
      user: id,
      amount: amts[i],
      share: mode === "equal" ? null : mode === "exact" ? val(id) : mode === "percent" ? val(id) : vals[id] === undefined || vals[id] === "" ? 1 : val(id)
    }));
  }
  function validate() {
    if (!cleanText(f.description, MAX_LEN.description)) return "Add a description";
    if (amt <= 0) return "Amount must be more than zero";
    if (foreign && (!rateNum || rateNum <= 0)) return "Enter the exchange rate";
    if (among.length === 0) return "Pick at least one person";
    if (mode === "exact" && Math.abs(valSum - amt) > 0.01) return `Exact amounts must add up to ${fmt(amt, cur)} (currently ${fmt(valSum, cur)})`;
    if (mode === "percent" && Math.abs(valSum - 100) > 0.01) return `Percentages must add up to 100 (currently ${r2(valSum)})`;
    if ((mode === "shares" || mode === "exact") && weights().every(w => w === 0)) return "Values can't all be zero";
    return null;
  }
  async function save() {
    const err = validate();
    if (err) return toast(err);
    const description = cleanText(f.description, MAX_LEN.description);
    const notes = cleanText(f.notes, MAX_LEN.notes);
    setBusy(true);
    try {
      const data = {
        trip: trip.id,
        description,
        amount: amt,
        paid_by: f.paid_by,
        currency: cur,
        fx_rate: foreign ? rateNum : 1,
        base_amount: baseTotal,
        date: new Date(f.date + "T12:00:00").toISOString(),
        category: f.category,
        notes,
        split_mode: mode
      };
      let e;
      if (editing) {
        e = await col("expenses").update(expense.id, data);
        await Promise.all(oldSplits.map(s => col("splits").delete(s.id)));
      } else {
        e = await col("expenses").create(data);
      }
      await Promise.all(buildSplits().map(s => col("splits").create({
        expense: e.id,
        ...s
      })));
      track(editing ? "expense_edited" : "expense_added", {
        splitMode: mode,
        foreign
      });
      logActivity(trip.id, me.id, editing ? "expense_edited" : "expense_added", `${editing ? "edited" : "added"} “${description}” (${fmt(baseTotal, base)}${foreign ? ` · ${fmt(amt, cur)}` : ""})`);
      onDone();
    } catch (e) {
      toast(e?.data?.message || e.message);
    }
    setBusy(false);
  }
  const per = mode === "equal" && among.length > 0 && baseTotal > 0 ? baseTotal / among.length : null;
  return React.createElement(Sheet, {
    title: editing ? "Edit expense" : "Add expense",
    onClose: onClose
  }, React.createElement("label", null, "Description"), React.createElement("input", {
    value: f.description,
    maxLength: MAX_LEN.description,
    onChange: e => setF({
      ...f,
      description: e.target.value
    }),
    placeholder: "Dinner at the shack",
    autoFocus: !editing
  }), React.createElement("label", null, "Currency"), React.createElement("div", {
    className: "chips scrollx"
  }, CURRENCIES.map(c => React.createElement("button", {
    key: c.code,
    className: "chip" + (cur === c.code ? " on" : ""),
    onClick: () => setCur(c.code)
  }, c.sym.trim(), " ", c.code))), React.createElement("div", {
    className: "grid2"
  }, React.createElement("div", null, React.createElement("label", null, "Amount (", curOf(cur).sym.trim(), ")"), React.createElement("input", {
    type: "number",
    min: "0",
    step: "any",
    inputMode: "decimal",
    value: f.amount,
    onChange: e => setF({
      ...f,
      amount: e.target.value
    }),
    placeholder: "0.00",
    className: "mono"
  })), React.createElement("div", null, React.createElement("label", null, "Date"), React.createElement("input", {
    type: "date",
    value: f.date,
    onChange: e => setF({
      ...f,
      date: e.target.value
    })
  }))), foreign && React.createElement("div", {
    className: "fxbox anim-pop"
  }, React.createElement("div", {
    className: "grid2",
    style: {
      alignItems: "end"
    }
  }, React.createElement("div", null, React.createElement("label", {
    style: {
      marginTop: 0
    }
  }, "Rate \xB7 1 ", cur, " \u2192 ", base), React.createElement("input", {
    type: "number",
    min: "0",
    step: "any",
    inputMode: "decimal",
    className: "mono",
    value: rate,
    placeholder: rateBusy ? "fetching…" : "rate",
    onChange: e => setRate(e.target.value)
  })), React.createElement("div", {
    className: "fxpreview"
  }, React.createElement("span", {
    className: "k"
  }, rateBusy ? "Fetching rate…" : "Converted"), React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 17
    }
  }, amt > 0 && rateNum > 0 ? fmt(baseTotal, base) : "—"))), React.createElement("p", {
    className: "rsub",
    style: {
      marginTop: 8
    }
  }, "Balances stay in ", base, ". Daily mid-market rate, editable if you got a different one.")), React.createElement("label", null, "Paid by"), React.createElement("select", {
    value: f.paid_by,
    onChange: e => setF({
      ...f,
      paid_by: e.target.value
    })
  }, members.map(m => React.createElement("option", {
    key: m.id,
    value: m.id
  }, m.name))), React.createElement("label", null, "Category"), React.createElement("div", {
    className: "chips"
  }, CATEGORIES.map(c => React.createElement("button", {
    key: c.key,
    className: "chip" + (f.category === c.key ? " on" : ""),
    onClick: () => setF({
      ...f,
      category: c.key
    })
  }, c.emoji, " ", c.label))), React.createElement("label", null, "Split between"), React.createElement("div", {
    className: "chips"
  }, members.map(m => React.createElement("button", {
    key: m.id,
    className: "chip" + (among.includes(m.id) ? " on" : ""),
    onClick: () => toggle(m.id)
  }, first(m.name)))), React.createElement("label", null, "How to split"), React.createElement("div", {
    className: "tabs mini"
  }, [["equal", "Equally"], ["exact", "Exact"], ["percent", "%"], ["shares", "Shares"]].map(([k, l]) => React.createElement("button", {
    key: k,
    className: mode === k ? "on" : "",
    onClick: () => setMode(k)
  }, l))), mode === "equal" && per !== null && React.createElement("p", {
    className: "sub"
  }, "= ", React.createElement("span", {
    className: "mono"
  }, fmt(per, base)), " each (", among.length, " people)"), mode !== "equal" && React.createElement("div", null, among.map(id => {
    const m = members.find(x => x.id === id);
    return React.createElement("div", {
      key: id,
      className: "stack",
      style: {
        marginBottom: 8
      }
    }, React.createElement(Avatar, {
      user: m,
      size: 28
    }), React.createElement("span", {
      style: {
        flex: 1,
        fontSize: 14,
        fontWeight: 600
      }
    }, first(m?.name)), baseTotal > 0 && React.createElement("span", {
      className: "rsub mono",
      style: {
        width: 82,
        textAlign: "right"
      }
    }, (() => {
      try {
        const s = buildSplits().find(x => x.user === id);
        return s ? fmt(s.amount, base) : "";
      } catch {
        return "";
      }
    })()), React.createElement("input", {
      type: "number",
      min: "0",
      step: "any",
      inputMode: "decimal",
      className: "mono",
      style: {
        width: 100
      },
      placeholder: mode === "shares" ? "1" : mode === "percent" ? "%" : "0.00",
      value: vals[id] ?? "",
      onChange: e => setVals({
        ...vals,
        [id]: e.target.value
      })
    }));
  }), mode === "exact" && React.createElement("p", {
    className: "sub"
  }, "Total ", React.createElement("span", {
    className: "mono " + (Math.abs(valSum - amt) > 0.01 ? "neg" : "pos")
  }, fmt(valSum, cur)), " of ", React.createElement("span", {
    className: "mono"
  }, fmt(amt, cur)), Math.abs(valSum - amt) > 0.01 && amt > 0 && React.createElement(React.Fragment, null, " \xB7 ", React.createElement("a", {
    onClick: () => {
      const left = r2(amt - r2(among.slice(0, -1).reduce((a, id) => a + val(id), 0)));
      setVals({
        ...vals,
        [among[among.length - 1]]: String(Math.max(left, 0))
      });
    }
  }, "fill last"))), mode === "percent" && React.createElement("p", {
    className: "sub"
  }, "Total ", React.createElement("span", {
    className: "mono " + (Math.abs(valSum - 100) > 0.01 ? "neg" : "pos")
  }, r2(valSum), "%"), " of 100%"), mode === "shares" && React.createElement("p", {
    className: "sub"
  }, "Empty boxes count as 1 share.")), React.createElement("label", null, "Notes (optional)"), React.createElement("input", {
    value: f.notes,
    maxLength: MAX_LEN.notes,
    onChange: e => setF({
      ...f,
      notes: e.target.value
    }),
    placeholder: "Anything worth remembering"
  }), React.createElement("button", {
    className: "btn",
    style: {
      marginTop: 22
    },
    disabled: busy || rateBusy,
    onClick: save
  }, busy ? "Saving…" : editing ? "Save changes" : "Add expense"));
}
function ExpenseDetail({
  expense: e,
  splits,
  activity,
  me,
  base,
  uById,
  trip,
  toast,
  canManage,
  onEdit,
  onDelete,
  onClose,
  onRefresh
}) {
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const ecur = normCur(e.currency || base);
  const foreign = ecur !== base;
  const comments = activity.filter(a => {
    if (a.action !== "comment") return false;
    try {
      return JSON.parse(a.detail).expense === e.id;
    } catch {
      return false;
    }
  });
  async function addComment() {
    const text = cleanText(comment, MAX_LEN.comment);
    if (!text) return;
    setBusy(true);
    try {
      await col("activity").create({
        trip: trip.id,
        actor: me.id,
        action: "comment",
        detail: JSON.stringify({
          expense: e.id,
          text
        })
      });
      setComment("");
      onRefresh();
    } catch (err) {
      toast(err.message);
    }
    setBusy(false);
  }
  const modeLabel = {
    equal: "equally",
    exact: "by exact amounts",
    percent: "by percentage",
    shares: "by shares"
  }[e.split_mode] || "equally";
  return React.createElement(Sheet, {
    title: catOf(e.category).emoji + " " + e.description,
    onClose: onClose
  }, React.createElement("p", {
    className: "sub",
    style: {
      marginTop: 0
    }
  }, React.createElement("b", {
    className: "mono",
    style: {
      fontSize: 22,
      color: "var(--ink)"
    }
  }, fmt(e.amount, ecur)), foreign && React.createElement(React.Fragment, null, " ", React.createElement("span", {
    className: "mono mut"
  }, "\u2248 ", fmt(baseAmt(e), base), " @ ", +Number(e.fx_rate || 1).toFixed(4))), React.createElement("br", null), "Paid by ", React.createElement("b", null, first(uById(e.paid_by).name)), " on ", niceDate(e.date || e.created), " \xB7 split ", modeLabel, e.notes && React.createElement(React.Fragment, null, React.createElement("br", null), "\uD83D\uDDD2 ", e.notes)), React.createElement("h3", {
    className: "h3"
  }, "Split breakdown", foreign ? ` · in ${base}` : ""), React.createElement("div", {
    className: "card",
    style: {
      padding: "6px 14px"
    }
  }, splits.map((s, i) => React.createElement("div", {
    key: s.id,
    className: "rrow anim",
    style: {
      animationDelay: `${i * 35}ms`
    }
  }, React.createElement(Avatar, {
    user: uById(s.user),
    size: 30
  }), React.createElement("div", {
    className: "rmain"
  }, React.createElement("div", {
    className: "rtitle",
    style: {
      fontSize: 14
    }
  }, uById(s.user).name, s.user === me.id ? " (you)" : "")), React.createElement("span", {
    className: "ramt"
  }, fmt(s.amount, base), e.split_mode === "percent" && s.share != null ? React.createElement("small", null, s.share, "%") : null, e.split_mode === "shares" && s.share != null ? React.createElement("small", null, s.share, " share", s.share !== 1 ? "s" : "") : null, e.split_mode === "exact" && s.share != null && foreign ? React.createElement("small", null, fmt(s.share, ecur)) : null)))), React.createElement("h3", {
    className: "h3"
  }, "Comments ", comments.length ? `(${comments.length})` : ""), React.createElement("div", {
    className: "card",
    style: {
      padding: "6px 14px"
    }
  }, comments.length === 0 && React.createElement("div", {
    className: "empty",
    style: {
      padding: "16px 8px"
    }
  }, "No comments yet."), comments.map(c => {
    let t = "";
    try {
      t = JSON.parse(c.detail).text;
    } catch {}
    return React.createElement("div", {
      key: c.id,
      className: "rrow"
    }, React.createElement(Avatar, {
      user: uById(c.actor),
      size: 28
    }), React.createElement("div", {
      className: "rmain"
    }, React.createElement("div", {
      className: "rtitle",
      style: {
        fontSize: 13.5,
        whiteSpace: "normal"
      }
    }, t), React.createElement("div", {
      className: "rsub"
    }, first(uById(c.actor).name), " \xB7 ", timeAgo(c.created))));
  }), React.createElement("div", {
    className: "stack",
    style: {
      padding: "10px 0"
    }
  }, React.createElement("input", {
    placeholder: "Add a comment\u2026",
    maxLength: MAX_LEN.comment,
    value: comment,
    onChange: ev => setComment(ev.target.value),
    onKeyDown: ev => ev.key === "Enter" && addComment()
  }), React.createElement("button", {
    className: "btn sm",
    disabled: busy || !comment.trim(),
    onClick: addComment
  }, "Post"))), canManage ? React.createElement("div", {
    className: "grid2",
    style: {
      marginTop: 16
    }
  }, React.createElement("button", {
    className: "btn ghost",
    onClick: onEdit
  }, "\u270F\uFE0F Edit"), React.createElement("button", {
    className: "btn danger",
    onClick: onDelete
  }, "\uD83D\uDDD1 Delete")) : React.createElement("p", {
    className: "sub",
    style: {
      marginTop: 14
    }
  }, "Only the payer or trip owner can edit or delete this expense."));
}
function SettleForm({
  trip,
  members,
  me,
  base,
  preset,
  uById,
  onDone,
  onClose,
  toast
}) {
  const [from, setFrom] = useState(preset.from || me.id);
  const [to, setTo] = useState(preset.to || members.find(m => m.id !== (preset.from || me.id))?.id || me.id);
  const [amount, setAmount] = useState(preset.amount ? String(preset.amount) : "");
  const [date, setDate] = useState(today());
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  async function save() {
    const a = parseFloat(amount);
    if (!a || a <= 0) return toast("Enter a valid amount");
    if (from === to) return toast("Payer and receiver must differ");
    const safeNotes = cleanText(notes, MAX_LEN.notes);
    setBusy(true);
    try {
      await col("settlements").create({
        trip: trip.id,
        from,
        to,
        amount: r2(a),
        date: new Date(date + "T12:00:00").toISOString(),
        notes: safeNotes
      });
      logActivity(trip.id, me.id, "payment_added", `recorded ${first(uById(from).name)} → ${first(uById(to).name)} (${fmt(a, base)})`);
      onDone();
    } catch (e) {
      toast(e?.data?.message || e.message);
    }
    setBusy(false);
  }
  return React.createElement(Sheet, {
    title: "Record a payment",
    onClose: onClose
  }, React.createElement("div", {
    className: "grid2"
  }, React.createElement("div", null, React.createElement("label", null, "From (payer)"), React.createElement("select", {
    value: from,
    onChange: e => setFrom(e.target.value)
  }, members.map(m => React.createElement("option", {
    key: m.id,
    value: m.id
  }, m.name)))), React.createElement("div", null, React.createElement("label", null, "To (receiver)"), React.createElement("select", {
    value: to,
    onChange: e => setTo(e.target.value)
  }, members.map(m => React.createElement("option", {
    key: m.id,
    value: m.id
  }, m.name))))), React.createElement("div", {
    className: "grid2"
  }, React.createElement("div", null, React.createElement("label", null, "Amount (", base, ")"), React.createElement("input", {
    type: "number",
    min: "0",
    step: "any",
    inputMode: "decimal",
    className: "mono",
    value: amount,
    onChange: e => setAmount(e.target.value),
    autoFocus: true,
    placeholder: "0.00"
  })), React.createElement("div", null, React.createElement("label", null, "Date"), React.createElement("input", {
    type: "date",
    value: date,
    onChange: e => setDate(e.target.value)
  }))), React.createElement("label", null, "Notes (optional)"), React.createElement("input", {
    value: notes,
    maxLength: MAX_LEN.notes,
    onChange: e => setNotes(e.target.value),
    placeholder: "Bank transfer / cash / ref\u2026"
  }), React.createElement("button", {
    className: "btn",
    style: {
      marginTop: 22
    },
    disabled: busy,
    onClick: save
  }, busy ? "Saving…" : "Record payment"));
}
function Members({
  trip,
  members,
  me,
  expenseCount,
  onDone,
  onClose,
  toast
}) {
  const [memberId, setMemberId] = useState("");
  const [busy, setBusy] = useState(false);
  const [pName, setPName] = useState("");
  const [linkFor, setLinkFor] = useState("");
  const [linkId, setLinkId] = useState("");
  const [name, setName] = useState(trip.name);
  const [currency, setCurrency] = useState(normCur(trip.currency));
  const [confirmDel, setConfirmDel] = useState(false);
  const [shareBusy, setShareBusy] = useState(false);
  const isOwner = trip.owner === me.id;
  const curLocked = expenseCount > 0;
  async function add() {
    if (!isOwner) return;
    const id = cleanText(memberId, 40).toLowerCase();
    if (!id) return;
    setBusy(true);
    try {
      const u = await col("users").getOne(id);
      if (members.some(m => m.id === u.id)) {
        toast("Already in this trip");
        setBusy(false);
        return;
      }
      await col("trips").update(trip.id, {
        "members+": u.id
      });
      logActivity(trip.id, me.id, "member_added", `added ${u.name} to the trip`);
      setMemberId("");
      onDone();
      toast(`Added ${u.name}`);
    } catch (e) {
      toast(e.status === 404 ? "No user found with that member ID" : e.message);
    }
    setBusy(false);
  }
  async function addParticipant() {
    if (!isOwner) return;
    const safeName = cleanText(pName, 64);
    if (!safeName) return toast("Name is required");
    setBusy(true);
    try {
      const token = randToken();
      const pw = token + randToken();
      const ph = await col("users").create({
        name: safeName,
        email: `ph-${token}@placeholder.invalid`,
        password: pw,
        passwordConfirm: pw,
        emailVisibility: false,
        is_placeholder: true
      });
      await col("trips").update(trip.id, {
        "members+": ph.id
      });
      logActivity(trip.id, me.id, "member_added", `added ${safeName} to the trip`);
      setPName("");
      onDone();
      toast(`Added ${safeName}`);
    } catch (e) {
      toast(e?.data?.message || e.message);
    }
    setBusy(false);
  }
  async function link(placeholderId) {
    const realId = cleanText(linkId, 40).toLowerCase();
    if (!realId) return;
    setBusy(true);
    try {
      const u = await col("users").getOne(realId);
      if (u.id === placeholderId) {
        toast("That's the same person");
        setBusy(false);
        return;
      }
      if (members.some(m => m.id === u.id)) {
        toast("Already in this trip");
        setBusy(false);
        return;
      }
      const [exps, sps, settles] = await Promise.all([col("expenses").getFullList({
        filter: `trip="${trip.id}" && paid_by="${placeholderId}"`
      }), col("splits").getFullList({
        filter: `expense.trip="${trip.id}" && user="${placeholderId}"`
      }), col("settlements").getFullList({
        filter: `trip="${trip.id}" && (from="${placeholderId}" || to="${placeholderId}")`
      })]);
      await Promise.all([...exps.map(e => col("expenses").update(e.id, {
        paid_by: u.id
      })), ...sps.map(s => col("splits").update(s.id, {
        user: u.id
      })), ...settles.map(s => col("settlements").update(s.id, {
        ...(s.from === placeholderId ? {
          from: u.id
        } : {}),
        ...(s.to === placeholderId ? {
          to: u.id
        } : {})
      }))]);
      await col("trips").update(trip.id, {
        "members-": placeholderId,
        "members+": u.id
      });
      logActivity(trip.id, me.id, "member_linked", `linked ${u.name} to existing entries`);
      setLinkFor("");
      setLinkId("");
      onDone();
      toast(`Linked to ${u.name}`);
    } catch (e) {
      toast(e.status === 404 ? "No user found with that member ID" : e?.data?.message || e.message);
    }
    setBusy(false);
  }
  async function remove(id) {
    try {
      await col("trips").update(trip.id, {
        "members-": id
      });
      onDone();
    } catch (e) {
      toast(e.message);
    }
  }
  async function saveSettings() {
    const safeName = cleanText(name, MAX_LEN.tripName);
    if (!safeName) return toast("Trip name cannot be empty");
    try {
      await col("trips").update(trip.id, {
        name: safeName,
        ...(curLocked ? {} : {
          currency
        })
      });
      onDone();
      toast("Trip updated");
    } catch (e) {
      toast(e.message);
    }
  }
  return React.createElement(Sheet, {
    title: "Trip settings",
    onClose: onClose
  }, React.createElement("h3", {
    className: "h3",
    style: {
      marginTop: 4
    }
  }, "Members"), React.createElement("div", {
    className: "card",
    style: {
      padding: "6px 14px"
    }
  }, members.map(m => React.createElement(React.Fragment, {
    key: m.id
  }, React.createElement("div", {
    className: "rrow"
  }, React.createElement(Avatar, {
    user: m,
    size: 32
  }), React.createElement("div", {
    className: "rmain"
  }, React.createElement("div", {
    className: "rtitle",
    style: {
      fontSize: 14
    }
  }, m.name, m.id === me.id ? " (you)" : ""), React.createElement("div", {
    className: "rsub"
  }, m.id === trip.owner ? "owner" : m.is_placeholder ? "not joined yet" : "member")), isOwner && m.id !== trip.owner && m.is_placeholder && React.createElement("button", {
    className: "btn sm",
    onClick: () => {
      setLinkFor(linkFor === m.id ? "" : m.id);
      setLinkId("");
    }
  }, "Link"), isOwner && m.id !== trip.owner && React.createElement("button", {
    className: "btn sm danger",
    onClick: () => remove(m.id)
  }, "Remove")), linkFor === m.id && React.createElement("div", {
    className: "stack",
    style: {
      padding: "0 0 10px"
    }
  }, React.createElement("input", {
    value: linkId,
    onChange: e => setLinkId(e.target.value),
    onKeyDown: e => e.key === "Enter" && link(m.id),
    placeholder: "Their member ID\u2026"
  }), React.createElement("button", {
    className: "btn sm",
    disabled: busy || !linkId.trim(),
    onClick: () => link(m.id)
  }, "Confirm")))), isOwner ? React.createElement("div", {
    className: "stack",
    style: {
      padding: "10px 0"
    }
  }, React.createElement("input", {
    value: memberId,
    onChange: e => setMemberId(e.target.value),
    onKeyDown: e => e.key === "Enter" && add(),
    placeholder: "Add by member ID\u2026"
  }), React.createElement("button", {
    className: "btn sm",
    disabled: busy || !memberId.trim(),
    onClick: add
  }, "Add")) : React.createElement("p", {
    className: "sub",
    style: {
      padding: "10px 0"
    }
  }, "Only the trip owner can add or remove members."), isOwner && React.createElement("p", {
    className: "sub",
    style: {
      paddingBottom: 8
    }
  }, "Ask the person to copy their member ID from the home screen.")), isOwner && React.createElement(React.Fragment, null, React.createElement("h3", {
    className: "h3"
  }, "Add participant"), React.createElement("div", {
    className: "card",
    style: {
      padding: "6px 14px"
    }
  }, React.createElement("p", {
    className: "sub",
    style: {
      padding: "10px 0 0"
    }
  }, "For people who haven't joined ", APP_NAME, " yet. Add their name so you can put them in expenses right away. Share the invite link below so they can join for real."), React.createElement("div", {
    className: "stack",
    style: {
      padding: "10px 0"
    }
  }, React.createElement("input", {
    value: pName,
    maxLength: 64,
    onChange: e => setPName(e.target.value),
    onKeyDown: e => e.key === "Enter" && addParticipant(),
    placeholder: "Name"
  }), React.createElement("button", {
    className: "btn sm",
    disabled: busy || !pName.trim(),
    onClick: addParticipant
  }, "Add")))), isOwner && React.createElement(React.Fragment, null, React.createElement("h3", {
    className: "h3"
  }, "Invite link"), React.createElement("div", {
    className: "card",
    style: {
      padding: "6px 14px"
    }
  }, trip.share_enabled && trip.share_token ? React.createElement(React.Fragment, null, React.createElement("p", {
    className: "sub",
    style: {
      padding: "10px 0 0"
    }
  }, "Anyone with this link can view the trip without an account, and can join it after signing in."), React.createElement("div", {
    className: "stack",
    style: {
      padding: "10px 0"
    }
  }, React.createElement("input", {
    readOnly: true,
    value: shareUrl(trip.id, trip.share_token),
    className: "mono",
    style: {
      fontSize: 12.5
    },
    onFocus: e => e.target.select()
  }), React.createElement("button", {
    className: "btn sm",
    onClick: async () => {
      toast((await copyText(shareUrl(trip.id, trip.share_token))) ? "Link copied" : "Couldn't copy link");
    }
  }, "Copy")), React.createElement("div", {
    className: "stack",
    style: {
      paddingBottom: 10
    }
  }, React.createElement("button", {
    className: "btn sm ghost",
    disabled: shareBusy,
    onClick: async () => {
      setShareBusy(true);
      try {
        await col("trips").update(trip.id, {
          share_token: randToken()
        });
        onDone();
        toast("Link reset — old link stopped working");
      } catch (e) {
        toast(e.message);
      }
      setShareBusy(false);
    }
  }, "Reset link"), React.createElement("button", {
    className: "btn sm danger",
    disabled: shareBusy,
    onClick: async () => {
      setShareBusy(true);
      try {
        await col("trips").update(trip.id, {
          share_enabled: false
        });
        onDone();
        toast("Sharing turned off");
      } catch (e) {
        toast(e.message);
      }
      setShareBusy(false);
    }
  }, "Turn off sharing"))) : React.createElement(React.Fragment, null, React.createElement("p", {
    className: "sub",
    style: {
      padding: "10px 0 0"
    }
  }, "Create a link people can open to see this trip read-only, no account needed \u2014 and join it once they sign in."), React.createElement("div", {
    style: {
      padding: "10px 0"
    }
  }, React.createElement("button", {
    className: "btn sm",
    disabled: shareBusy,
    onClick: async () => {
      setShareBusy(true);
      try {
        await col("trips").update(trip.id, {
          share_enabled: true,
          share_token: randToken()
        });
        onDone();
        toast("Invite link created");
      } catch (e) {
        toast(e.message);
      }
      setShareBusy(false);
    }
  }, "Create invite link"))))), React.createElement("h3", {
    className: "h3"
  }, "Details"), React.createElement("div", {
    className: "card"
  }, React.createElement("label", {
    style: {
      marginTop: 0
    }
  }, "Trip name"), React.createElement("input", {
    value: name,
    maxLength: MAX_LEN.tripName,
    disabled: !isOwner,
    onChange: e => setName(e.target.value)
  }), React.createElement("label", null, "Base currency", curLocked ? " (locked — trip has expenses)" : ""), React.createElement("div", {
    className: "chips",
    style: curLocked || !isOwner ? {
      opacity: .5,
      pointerEvents: "none"
    } : null
  }, CURRENCIES.map(c => React.createElement("button", {
    key: c.code,
    className: "chip" + (currency === c.code ? " on" : ""),
    onClick: () => setCurrency(c.code)
  }, c.sym.trim(), " ", c.code))), isOwner ? React.createElement("button", {
    className: "btn ghost",
    style: {
      marginTop: 16
    },
    onClick: saveSettings
  }, "Save details") : React.createElement("p", {
    className: "sub",
    style: {
      marginTop: 14
    }
  }, "Only the trip owner can update trip details.")), isOwner && React.createElement("button", {
    className: "btn danger",
    style: {
      marginTop: 6
    },
    onClick: () => setConfirmDel(true)
  }, "Delete this trip"), confirmDel && React.createElement(Confirm, {
    title: "Delete trip?",
    body: `“${trip.name}” and every expense, split and payment in it will be permanently removed.`,
    onClose: () => setConfirmDel(false),
    onYes: async () => {
      try {
        await col("trips").delete(trip.id);
        go("#/");
      } catch (e) {
        toast(e.message);
      }
    }
  }));
}
function SharedTripScreen({
  tripId,
  token,
  me,
  toast
}) {
  const [trip, setTrip] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [splits, setSplits] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [err, setErr] = useState("");
  const [joining, setJoining] = useState(false);
  const load = useCallback(async () => {
    try {
      const [t, ex, sp, se] = await Promise.all([col("trips").getOne(tripId, {
        expand: "members,owner",
        query: {
          token
        }
      }), col("expenses").getFullList({
        filter: `trip="${tripId}"`,
        sort: "-date,-created",
        query: {
          token
        }
      }), col("splits").getFullList({
        filter: `expense.trip="${tripId}"`,
        query: {
          token
        }
      }), col("settlements").getFullList({
        filter: `trip="${tripId}"`,
        query: {
          token
        }
      })]);
      setTrip(t);
      setExpenses(ex);
      setSplits(sp);
      setSettlements(se);
    } catch (e) {
      setErr(e?.status === 404 ? "This link is invalid or no longer active." : e.message || "Couldn't load this trip.");
    }
  }, [tripId, token]);
  useEffect(() => {
    load();
  }, [load]);
  const members = useMemo(() => {
    if (!trip) return [];
    const all = [trip.expand?.owner, ...(trip.expand?.members || [])].filter(Boolean);
    return all.filter((m, i, a) => a.findIndex(x => x.id === m.id) === i);
  }, [trip]);
  const base = normCur(trip?.currency);
  const nets = useMemo(() => computeNets(expenses, splits, settlements), [expenses, splits, settlements]);
  const total = useMemo(() => r2(expenses.reduce((a, e) => a + baseAmt(e), 0)), [expenses]);
  const alreadyIn = !!(me && trip && (trip.owner === me.id || members.some(m => m.id === me.id)));
  useEffect(() => {
    if (alreadyIn) go("#/trip/" + tripId);
  }, [alreadyIn, tripId]);
  async function doJoin() {
    try {
      await col("trips").update(tripId, {
        "members+": pb.authStore.record.id
      }, {
        query: {
          token
        }
      });
      toast("You're in!");
      go("#/trip/" + tripId);
    } catch (e) {
      toast(e?.data?.message || e.message || "Couldn't join this trip.");
    }
  }
  if (err) return React.createElement("div", {
    className: "center anim",
    style: {
      paddingTop: 40
    }
  }, React.createElement("h1", {
    className: "disp",
    style: {
      fontSize: 30
    }
  }, APP_NAME), React.createElement("p", {
    className: "sub",
    style: {
      marginTop: 12
    }
  }, err));
  if (!trip || alreadyIn) return React.createElement(React.Fragment, null, React.createElement("div", {
    style: {
      height: 20
    }
  }), React.createElement("div", {
    className: "skl",
    style: {
      height: 120
    }
  }), React.createElement("div", {
    className: "skl"
  }));
  return React.createElement(React.Fragment, null, React.createElement("div", {
    className: "topbar"
  }, React.createElement("span", {
    className: "wordmark"
  }, APP_NAME)), React.createElement("p", {
    className: "sub anim",
    style: {
      marginTop: 4
    }
  }, "You're viewing a shared trip, read-only."), React.createElement("div", {
    className: "card hero anim"
  }, React.createElement("span", {
    className: "k"
  }, "Trip total \xB7 ", base), React.createElement("div", {
    className: "big"
  }, fmt(total, base)), React.createElement("div", {
    className: "stack",
    style: {
      gap: 0,
      marginTop: 14
    }
  }, members.map((m, i) => React.createElement("span", {
    key: m.id,
    style: {
      marginLeft: i ? -9 : 0
    }
  }, React.createElement(Avatar, {
    user: m,
    size: 30
  }))), React.createElement("span", {
    style: {
      marginLeft: 10,
      fontSize: 12.5,
      opacity: .85
    }
  }, members.map(m => first(m.name)).join(" · ")))), React.createElement("h3", {
    className: "h3"
  }, "Balances"), React.createElement("div", {
    className: "card",
    style: {
      padding: "6px 14px"
    }
  }, members.map(m => {
    const n = nets[m.id] || 0;
    return React.createElement("div", {
      key: m.id,
      className: "rrow"
    }, React.createElement(Avatar, {
      user: m,
      size: 32
    }), React.createElement("div", {
      className: "rmain"
    }, React.createElement("div", {
      className: "rtitle",
      style: {
        fontSize: 14
      }
    }, m.name)), React.createElement("span", {
      className: "ramt"
    }, Math.abs(n) < 0.01 ? "settled" : n > 0 ? `gets ${fmt(n, base)}` : `owes ${fmt(-n, base)}`));
  })), React.createElement("h3", {
    className: "h3"
  }, "Expenses"), expenses.length === 0 && React.createElement("div", {
    className: "card empty"
  }, "No expenses yet."), expenses.length > 0 && React.createElement("div", {
    className: "card",
    style: {
      padding: "6px 14px"
    }
  }, expenses.map(e => {
    const payer = members.find(m => m.id === e.paid_by);
    return React.createElement("div", {
      key: e.id,
      className: "rrow"
    }, React.createElement("span", {
      className: "catmoji"
    }, catOf(e.category).emoji), React.createElement("div", {
      className: "rmain"
    }, React.createElement("div", {
      className: "rtitle",
      style: {
        fontSize: 14
      }
    }, e.description), React.createElement("div", {
      className: "rsub"
    }, first(payer?.name || "?"), " paid ", fmt(e.amount, e.currency || base))), React.createElement("span", {
      className: "ramt"
    }, fmt(baseAmt(e), base)));
  })), joining ? React.createElement("div", {
    className: "card anim",
    style: {
      marginTop: 12
    }
  }, React.createElement("h3", {
    className: "h3",
    style: {
      marginTop: 0
    }
  }, "Sign in or create an account to join"), React.createElement(AuthScreen, {
    onAuth: doJoin,
    toast: toast
  })) : React.createElement("button", {
    className: "btn fab",
    onClick: () => me ? doJoin() : setJoining(true)
  }, "\uFF0B Join this trip"));
}
function App() {
  const hash = useHash();
  const verificationContext = useMemo(() => verificationContextFromHash(hash), [hash]);
  const [, force] = useState(0);
  const [ready, setReady] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const toast = useCallback(m => {
    setToastMsg(String(m));
    setTimeout(() => setToastMsg(""), 2800);
  }, []);
  useEffect(() => pb.authStore.onChange(() => force(x => x + 1)), []);
  useEffect(() => {
    const onErr = ev => reportError(ev.error || ev.message, "window.error");
    const onRej = ev => reportError(ev.reason, "window.unhandledrejection");
    window.addEventListener("error", onErr);
    window.addEventListener("unhandledrejection", onRej);
    track("app_loaded", {
      app: APP_NAME
    });
    return () => {
      window.removeEventListener("error", onErr);
      window.removeEventListener("unhandledrejection", onRej);
    };
  }, []);
  useEffect(() => {
    (async () => {
      if (pb.authStore.isValid) {
        const rec = pb.authStore.record;
        if (!rec || rec.collectionName !== PREFIX + "users") {
          pb.authStore.clear();
        } else {
          try {
            await col("users").authRefresh();
            if (REQUIRE_EMAIL_VERIFICATION && pb.authStore.record?.verified !== true) pb.authStore.clear();
          } catch (e) {
            if (e?.status === 401 || e?.status === 403 || e?.status === 404) pb.authStore.clear();
          }
        }
      }
      setReady(true);
    })();
  }, []);
  if (!ready) return React.createElement("div", {
    className: "center"
  }, React.createElement("div", {
    className: "skl",
    style: {
      height: 100
    }
  }));
  if (verificationContext.token) return React.createElement(React.Fragment, null, React.createElement(VerifyEmailScreen, {
    token: verificationContext.token,
    emailHint: verificationContext.email
  }), React.createElement(Toast, {
    msg: toastMsg
  }));
  const sharedMatch = hash.match(/^#\/shared\/(\w+)\/([^/?#]+)/);
  if (sharedMatch) return React.createElement(React.Fragment, null, React.createElement(SharedTripScreen, {
    key: sharedMatch[1] + sharedMatch[2],
    tripId: sharedMatch[1],
    token: sharedMatch[2],
    me: pb.authStore.isValid ? pb.authStore.record : null,
    toast: toast
  }), React.createElement(Toast, {
    msg: toastMsg
  }));
  if (!pb.authStore.isValid) return React.createElement(React.Fragment, null, React.createElement(AuthScreen, {
    onAuth: () => force(x => x + 1),
    toast: toast
  }), React.createElement(Toast, {
    msg: toastMsg
  }));
  const me = pb.authStore.record;
  const isProfileRoute = /^#\/profile\/?$/.test(hash);
  const tripMatch = hash.match(/^#\/trip\/(\w+)/);
  return React.createElement(React.Fragment, null, tripMatch ? React.createElement(TripScreen, {
    key: tripMatch[1],
    tripId: tripMatch[1],
    me: me,
    toast: toast
  }) : isProfileRoute ? React.createElement(ProfileScreen, {
    me: me,
    toast: toast
  }) : React.createElement(TripsScreen, {
    me: me,
    toast: toast
  }), React.createElement(Toast, {
    msg: toastMsg
  }));
}
ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(App, null));
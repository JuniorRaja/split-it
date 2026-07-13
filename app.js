/* Generated from app.jsx — do not edit. Run: node build.mjs */
const {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef
} = React;
const PB_URL = "https://db.prasannar.com";
const PREFIX = "splitit_";
const pb = new PocketBase(PB_URL);
pb.autoCancellation(false);
const col = name => pb.collection(PREFIX + name);
const ROSTER = [{
  name: "Prasanna",
  email: "prasanna@prasannar.com"
}, {
  name: "Chinna",
  email: "chinna@prasannar.com"
}, {
  name: "Sabari",
  email: "sabari@prasannar.com"
}, {
  name: "Lokesh",
  email: "lokesh@prasannar.com"
}, {
  name: "Dinesh",
  email: "dinesh@prasannar.com"
}];
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
  const head = ["Date", "Description", "Category", "Paid by", "Currency", "Amount", "Rate", `Base (${base})`, ...members.map(m => m.name)];
  const rows = expenses.map(e => {
    const per = members.map(m => {
      const s = splits.find(x => x.expense === e.id && x.user === m.id);
      return s ? s.amount.toFixed(2) : "";
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
function AuthScreen({
  onAuth,
  toast
}) {
  const [sel, setSel] = useState(null);
  const [emailMode, setEmailMode] = useState(false);
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit() {
    const id = emailMode ? email.trim() : sel?.email;
    if (!id || !pw) return;
    setErr("");
    setBusy(true);
    try {
      await col("users").authWithPassword(id, pw);
      onAuth();
    } catch (e) {
      setErr(e?.status === 400 ? "Wrong password — try again." : e?.message || "Failed");
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
  }, "split", React.createElement("b", {
    style: {
      color: "var(--green-ink)"
    }
  }, "\xB7it")), React.createElement("p", {
    className: "sub"
  }, "Split trips, not friendships. Every rupee accounted for."), !emailMode && React.createElement(React.Fragment, null, React.createElement("div", {
    className: "profiles"
  }, ROSTER.map((u, i) => React.createElement("button", {
    key: u.email,
    className: "profile anim" + (sel?.email === u.email ? " sel" : ""),
    style: {
      animationDelay: `${i * 50}ms`
    },
    onClick: () => {
      setSel(u);
      setErr("");
    }
  }, React.createElement(Avatar, {
    user: {
      id: u.email,
      name: u.name
    },
    size: 52
  }), u.name))), sel && React.createElement("div", {
    className: "card anim-pop",
    style: {
      marginTop: 16
    }
  }, React.createElement("label", null, "Password for ", sel.name), React.createElement("input", {
    type: "password",
    autoFocus: true,
    value: pw,
    onChange: e => setPw(e.target.value),
    onKeyDown: e => e.key === "Enter" && submit(),
    placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
  }), err && React.createElement("div", {
    className: "err"
  }, err), React.createElement("button", {
    className: "btn",
    style: {
      marginTop: 16
    },
    disabled: busy || !pw,
    onClick: submit
  }, busy ? "Signing in…" : `Continue as ${sel.name}`))), emailMode && React.createElement("div", {
    className: "card anim-pop",
    style: {
      marginTop: 20
    }
  }, React.createElement("label", null, "Email"), React.createElement("input", {
    type: "email",
    inputMode: "email",
    value: email,
    onChange: e => setEmail(e.target.value),
    placeholder: "you@mail.com",
    autoFocus: true
  }), React.createElement("label", null, "Password"), React.createElement("input", {
    type: "password",
    value: pw,
    onChange: e => setPw(e.target.value),
    onKeyDown: e => e.key === "Enter" && submit(),
    placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
  }), err && React.createElement("div", {
    className: "err"
  }, err), React.createElement("button", {
    className: "btn",
    style: {
      marginTop: 16
    },
    disabled: busy || !pw || !email,
    onClick: submit
  }, busy ? "Signing in…" : "Sign in")), React.createElement("p", {
    className: "sub",
    style: {
      textAlign: "center",
      marginTop: 18
    }
  }, React.createElement("a", {
    onClick: () => {
      setEmailMode(!emailMode);
      setSel(null);
      setErr("");
    }
  }, emailMode ? "← back to profiles" : "sign in with email instead")));
}
function TripsScreen({
  me,
  toast
}) {
  const [trips, setTrips] = useState(() => cache.get("trips"));
  const [show, setShow] = useState(false);
  const [f, setF] = useState({
    name: "",
    currency: "INR"
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
    if (!f.name.trim()) return;
    setBusy(true);
    try {
      const t = await col("trips").create({
        ...f,
        owner: me.id,
        members: [me.id]
      });
      logActivity(t.id, me.id, "trip_created", `created trip “${t.name}”`);
      setShow(false);
      setF({
        name: "",
        currency: "INR"
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
  }, "split", React.createElement("b", null, "\xB7it")), React.createElement("div", {
    className: "stack"
  }, React.createElement(Avatar, {
    user: me,
    size: 34
  }), React.createElement("button", {
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
    onChange: e => setF({
      ...f,
      name: e.target.value
    }),
    placeholder: "Goa 2027",
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
    const mine = splits.find(s => s.expense === e.id && s.user === me.id)?.amount || 0;
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
  })), React.createElement("h3", {
    className: "h3"
  }, "Simplest way to settle"), React.createElement("div", {
    className: "card"
  }, suggestions.length === 0 && React.createElement("div", {
    className: "empty"
  }, React.createElement("div", {
    className: "big"
  }, "\uD83C\uDF89"), "Everyone is settled up."), suggestions.map((s, i) => React.createElement("div", {
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
  }, "Settle"))), suggestions.length > 0 && React.createElement("button", {
    className: "btn ghost",
    style: {
      marginTop: 12
    },
    onClick: () => setSheet({
      type: "settle"
    })
  }, "Record a different payment")), settlements.length > 0 && React.createElement(React.Fragment, null, React.createElement("h3", {
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
  }, fmt(s.amount, base)), React.createElement("button", {
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
      member_added: "👋"
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
    if (!f.description.trim()) return "Add a description";
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
    setBusy(true);
    try {
      const data = {
        trip: trip.id,
        description: f.description.trim(),
        amount: amt,
        paid_by: f.paid_by,
        currency: cur,
        fx_rate: foreign ? rateNum : 1,
        base_amount: baseTotal,
        date: new Date(f.date + "T12:00:00").toISOString(),
        category: f.category,
        notes: f.notes.trim(),
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
      logActivity(trip.id, me.id, editing ? "expense_edited" : "expense_added", `${editing ? "edited" : "added"} “${f.description.trim()}” (${fmt(baseTotal, base)}${foreign ? ` · ${fmt(amt, cur)}` : ""})`);
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
    if (!comment.trim()) return;
    setBusy(true);
    try {
      await col("activity").create({
        trip: trip.id,
        actor: me.id,
        action: "comment",
        detail: JSON.stringify({
          expense: e.id,
          text: comment.trim()
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
    value: comment,
    onChange: ev => setComment(ev.target.value),
    onKeyDown: ev => ev.key === "Enter" && addComment()
  }), React.createElement("button", {
    className: "btn sm",
    disabled: busy || !comment.trim(),
    onClick: addComment
  }, "Post"))), React.createElement("div", {
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
  }, "\uD83D\uDDD1 Delete")));
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
    setBusy(true);
    try {
      await col("settlements").create({
        trip: trip.id,
        from,
        to,
        amount: r2(a),
        date: new Date(date + "T12:00:00").toISOString(),
        notes: notes.trim()
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
    onChange: e => setNotes(e.target.value),
    placeholder: "GPay / cash / UPI ref\u2026"
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
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState(trip.name);
  const [currency, setCurrency] = useState(normCur(trip.currency));
  const [confirmDel, setConfirmDel] = useState(false);
  const isOwner = trip.owner === me.id;
  const curLocked = expenseCount > 0;
  async function add() {
    if (!email.trim()) return;
    setBusy(true);
    try {
      const u = await col("users").getFirstListItem(`email="${email.trim().toLowerCase()}"`);
      if (members.some(m => m.id === u.id)) {
        toast("Already in this trip");
        setBusy(false);
        return;
      }
      await col("trips").update(trip.id, {
        "members+": u.id
      });
      logActivity(trip.id, me.id, "member_added", `added ${u.name} to the trip`);
      setEmail("");
      onDone();
      toast(`Added ${u.name}`);
    } catch (e) {
      toast(e.status === 404 ? "No account with that email" : e.message);
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
    try {
      await col("trips").update(trip.id, {
        name: name.trim() || trip.name,
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
  }, members.map(m => React.createElement("div", {
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
  }, m.name, m.id === me.id ? " (you)" : ""), React.createElement("div", {
    className: "rsub"
  }, m.id === trip.owner ? "owner" : "member")), isOwner && m.id !== trip.owner && React.createElement("button", {
    className: "btn sm danger",
    onClick: () => remove(m.id)
  }, "Remove"))), React.createElement("div", {
    className: "stack",
    style: {
      padding: "10px 0"
    }
  }, React.createElement("input", {
    type: "email",
    inputMode: "email",
    value: email,
    onChange: e => setEmail(e.target.value),
    onKeyDown: e => e.key === "Enter" && add(),
    placeholder: "Add by email\u2026"
  }), React.createElement("button", {
    className: "btn sm",
    disabled: busy || !email.trim(),
    onClick: add
  }, "Add"))), React.createElement("h3", {
    className: "h3"
  }, "Details"), React.createElement("div", {
    className: "card"
  }, React.createElement("label", {
    style: {
      marginTop: 0
    }
  }, "Trip name"), React.createElement("input", {
    value: name,
    onChange: e => setName(e.target.value)
  }), React.createElement("label", null, "Base currency", curLocked ? " (locked — trip has expenses)" : ""), React.createElement("div", {
    className: "chips",
    style: curLocked ? {
      opacity: .5,
      pointerEvents: "none"
    } : null
  }, CURRENCIES.map(c => React.createElement("button", {
    key: c.code,
    className: "chip" + (currency === c.code ? " on" : ""),
    onClick: () => setCurrency(c.code)
  }, c.sym.trim(), " ", c.code))), React.createElement("button", {
    className: "btn ghost",
    style: {
      marginTop: 16
    },
    onClick: saveSettings
  }, "Save details")), isOwner && React.createElement("button", {
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
function App() {
  const hash = useHash();
  const [, force] = useState(0);
  const [ready, setReady] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const toast = useCallback(m => {
    setToastMsg(String(m));
    setTimeout(() => setToastMsg(""), 2800);
  }, []);
  useEffect(() => pb.authStore.onChange(() => force(x => x + 1)), []);
  useEffect(() => {
    (async () => {
      if (pb.authStore.isValid) {
        const rec = pb.authStore.record;
        if (!rec || rec.collectionName !== PREFIX + "users") {
          pb.authStore.clear();
        } else {
          col("users").authRefresh().catch(e => {
            if (e?.status === 401 || e?.status === 403 || e?.status === 404) pb.authStore.clear();
          });
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
  if (!pb.authStore.isValid) return React.createElement(React.Fragment, null, React.createElement(AuthScreen, {
    onAuth: () => force(x => x + 1),
    toast: toast
  }), React.createElement(Toast, {
    msg: toastMsg
  }));
  const me = pb.authStore.record;
  const tripMatch = hash.match(/^#\/trip\/(\w+)/);
  return React.createElement(React.Fragment, null, tripMatch ? React.createElement(TripScreen, {
    key: tripMatch[1],
    tripId: tripMatch[1],
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
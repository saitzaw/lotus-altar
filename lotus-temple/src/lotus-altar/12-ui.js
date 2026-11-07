/* ---------- UI ---------- */
const money = n => "$" + n.toLocaleString("en-US");
function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
const itemsEl = $("items");
KEYS.forEach(key => {
  const it = ITEMS[key], kinds = Object.entries(it.kinds);
  const el = document.createElement("div"); el.className = "item"; el.dataset.item = key;
  el.innerHTML = `<div class="ico">${it.icon}</div>
    <div class="meta"><div class="name">${it.name}</div><div class="term">${it.term}</div><p class="desc">${it.desc}</p>
      ${kinds.length > 1 ? `<div class="kinds" role="radiogroup" aria-label="${it.name} type">${kinds.map(([k, v]) =>
        `<button type="button" role="radio" id="${key}_${k}" data-k="${k}" aria-checked="false"><i style="background:${v.dot}"></i>${v.name}</button>`).join("")}</div>` : ""}
    </div>
    <div class="buy"><div class="price" id="p_${key}"></div><div class="step">
      <button type="button" id="${key}Minus" data-d="-1" aria-label="Fewer ${it.name.toLowerCase()}"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 12h12"/></svg></button><output id="q_${key}">0</output><button type="button" id="${key}Plus" data-d="1" aria-label="More ${it.name.toLowerCase()}"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 12h12M12 6v12"/></svg></button>
    </div></div>`;
  el.querySelectorAll(".step button").forEach(b => b.addEventListener("click", () => setQty(key, cart[key].q + Number(b.dataset.d))));
  el.querySelectorAll(".kinds button").forEach(b => b.addEventListener("click", () => { cart[key].k = b.dataset.k; if (!cart[key].q) cart[key].q = 1; render(); }));
  itemsEl.appendChild(el);
});
function pulse(it) {
  const el = document.querySelector(`.item[data-item="${it}"]`);
  el.classList.add("pulse"); clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove("pulse"), 700);
  el.scrollIntoView({ block: "nearest", behavior: reduceMotion ? "auto" : "smooth" });
}
function setQty(it, v) { cart[it].q = clamp(v, 0, 99); render(); }

const lineItems = items => KEYS.filter(k => items[k] && items[k].q > 0).map(k => {
  const kind = kindOf(k, items[k].k);
  return { text: ITEMS[k].phrase(items[k].q, kind.name), amount: items[k].q * kind.price };
});
const describe = items => lineItems(items).map(l => l.text).join(", ");
const totalOf = items => lineItems(items).reduce((s, l) => s + l.amount, 0);
function fillSummary(linesEl, totalEl) {
  const ls = lineItems(cart);
  linesEl.innerHTML = ls.length ? ls.map(l => `<div class="line"><span>${esc(l.text)}</span><span>${money(l.amount)}</span></div>`).join("")
    : `<div class="line"><span>Nothing in your basket yet</span><span></span></div>`;
  totalEl.textContent = money(totalOf(cart));
}
const inShop = () => current === "shop";
// what is in the bag, as {item: {q, k}} rows (one per kind) and as a count
const bagRows = () => KEYS.flatMap(k => Object.entries(state.bag[k] || {}).filter(([, q]) => q > 0).map(([kind, q]) => ({ key: k, items: { [k]: { q, k: kind } } })));
const bagCount = () => bagRows().reduce((s, r) => s + r.items[r.key].q, 0);
// how many of an offering this visitor has placed on the altar (from their log; the sample entries do not count)
const offeredByMe = k => state.log.reduce((n, r) => n + (r.items && r.items[k] && !r.example ? r.items[k].q : 0), 0);
function render() {
  KEYS.forEach(k => {
    $("q_" + k).textContent = cart[k].q;
    const kind = kindOf(k, cart[k].k);
    $("p_" + k).innerHTML = `${money(kind.price)} <small>${ITEMS[k].per}</small>`;
    document.querySelectorAll(`.item[data-item="${k}"] .kinds button`).forEach(b => b.setAttribute("aria-checked", String(b.dataset.k === cart[k].k)));
    const mine = offeredByMe(k);   // only what this visitor has placed, not the sample altar
    $("t_" + k).textContent = mine; $("t_" + k).closest(".chip").hidden = !mine;
  });
  fillSummary($("lines"), $("total"));
  const shop = inShop(), t = totalOf(cart), n = bagCount();
  $("panel").classList.toggle("in-shop", shop);
  $("reviewBtn").textContent = shop ? (t ? `Buy · ${money(t)}` : "Choose something to buy") : "Go to the temple shop to buy";
  $("reviewBtn").disabled = shop && !t;
  $("shopHint").textContent = shop ? "You are in the shop. Choose what to buy, or tap the shelves." : "Offerings are sold at the temple shop, on the left of the lotus pond. You can fill your basket here and pay there.";
  const rows = bagRows();
  $("bag").innerHTML = rows.length ? rows.map(r => `<div class="line"><span>${esc(describe(r.items))}</span><span></span></div>`).join("")
    : `<div class="line"><span>Your bag is empty. Buy offerings at the shop first.</span><span></span></div>`;
  $("offerBtn").disabled = !n;
  $("bagBadge").hidden = !n; $("bagBadge").textContent = n;
  // the Offer button appears only once something is in the bag; the tally only once something has been offered
  const offerBtnBar = document.querySelector('#actions [data-sheet="offer"]');
  offerBtnBar.hidden = !n;
  if (!n && sheet === "offer") openSheet(null);
  document.querySelector(".tally").hidden = !KEYS.some(k => offeredByMe(k));
  $("offerBtn").textContent = current === 1 ? "Offer everything at Guanyin's altar" : "Go to Guanyin's altar and offer everything";
  // where the visitor is in the journey: buying, carrying, offering
  const stage = shop ? 1 : n ? (current === 1 ? 3 : 2) : 1;
  [1, 2, 3].forEach(i => { const li = $("j" + i); li.classList.toggle("on", i === stage); li.classList.toggle("done", i < stage); });
}
function renderLog() {
  const ul = $("log"); ul.innerHTML = "";
  const rows = state.log.length ? state.log.slice().reverse() : [
    { t: Date.now() - 864e5 * 2, items: { flower: { q: 5, k: "lotus" }, water: { q: 7, k: "pure" }, incense: { q: 1, k: "sandal" } }, ded: "all beings, may they be free from suffering", example: true },
    { t: Date.now() - 864e5 * 9, items: { fruit: { q: 3, k: "mixed" }, candle: { q: 2, k: "red" } }, ded: "", example: true }
  ];
  rows.slice(0, 8).forEach(r => {
    const li = document.createElement("li");
    const when = new Date(r.t).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    li.innerHTML = r.donate ? `<span class="when">${when} · Donation</span><span>${money(r.donate)} · ${esc(r.purpose)}${r.name ? " · from " + esc(r.name) : ""}</span>` :
      `<span class="when">${when} · ${r.at ? "Before " + esc(r.at) : "Guanyin's altar"}${r.example ? ' <span class="tag">Example</span>' : ""}</span>
      <span>${esc(describe(r.items))}</span>
      ${r.ded ? `<span class="ded">For ${esc(r.ded)}</span>` : ""}`;
    ul.appendChild(li);
  });
}

// donating: a demo gift, recorded with the offerings; nothing is charged
let donAmount = 10;
[1, 5, 10, 20].forEach(v => {
  const b = document.createElement("button"); b.type = "button"; b.setAttribute("role", "radio"); b.textContent = money(v); b.dataset.v = v;
  b.addEventListener("click", () => { donAmount = v; donRender(); });
  $("donAmounts").appendChild(b);
});
function donRender() { document.querySelectorAll("#donAmounts button").forEach(b => b.setAttribute("aria-checked", String(+b.dataset.v === donAmount))); $("donBtn").textContent = `Donate ${money(donAmount)}`; }
donRender();
$("donBtn").addEventListener("click", () => {
  const purpose = $("donPurpose").value, name = $("donName").value.trim();
  state.log.push({ t: Date.now(), donate: donAmount, purpose, name });
  save(); renderLog();
  if ($("soundOn").checked) { tone(1046, null, .12, 1.2); tone(1568, null, .06, 1.0, "sine", .08); }
  toast(`Thank you${name ? ", " + name : ""}: ${money(donAmount)} for ${purpose.toLowerCase()}. May the merit return to you. (Demo: nothing was charged.)`);
});
// 1 · buying at the shop
$("reviewBtn").addEventListener("click", () => {
  if (!inShop()) { goTo("shop"); return; }
  fillSummary($("rLines"), $("rTotal"));
  $("orderView").hidden = true; $("reviewView").hidden = false; $("confirmBtn").focus();
});
$("backBtn").addEventListener("click", () => { $("reviewView").hidden = true; $("orderView").hidden = false; });
let toastT;
// the interface shows no Chinese characters: strip them (and the separators they leave) from any text shown over the scene
const noHan = str => String(str).replace(/[\u2E80-\u9FFF\uF900-\uFAFF]+/g, "").replace(/\(\s*\)/g, "").replace(/(\s*·\s*)+/g, " · ").replace(/^\s*·\s*|\s*·\s*$/g, "").replace(/\s{2,}/g, " ").replace(/\s+([,.:])/g, "$1").trim();
function toast(msg) { msg = noHan(msg); const t = $("toast"); t.textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => t.hidden = true, 3800); }
$("confirmBtn").addEventListener("click", () => {
  const items = {};
  KEYS.forEach(k => { if (cart[k].q) { items[k] = { ...cart[k] }; const b = state.bag[k] = state.bag[k] || {}; b[cart[k].k] = (b[cart[k].k] || 0) + cart[k].q; cart[k].q = 0; } });
  save(); render();
  $("reviewView").hidden = true; $("orderView").hidden = false;
  toast(`Bought ${describe(items)}. They are in your bag: carry them to Guanyin's altar on the pagoda's ground floor, or to the altar of any statue in the temple.`);
});
// 2 and 3 · placing what is in the bag on Guanyin's altar
const PLACE = {
  incense: (n, k, d) => addIncense(n, k, true, d), candle: (n, k, d) => addCandle(n, k, true, d), flower: (n, k, d) => addFlower(n, k, true, d),
  water: (n, k, d) => addWater(n, k, true, d), fruit: (n, k, d) => addFruit(n, true, d)
};
const ORDER = ["incense", "candle", "flower", "water", "fruit"];
function offerAll() {
  const items = {};
  let delay = 0;
  const stepD = reduceMotion ? .15 : .45;
  ORDER.forEach(k => Object.entries(state.bag[k] || {}).forEach(([kind, q]) => {
    for (let i = 0; i < q; i++) { PLACE[k](state.counts[k]++, kind, delay); delay += stepD * (k === "water" ? .7 : 1); }
    if (q) items[k] = items[k] ? { q: items[k].q + q, k: kind } : { q, k: kind };
  }));
  state.bag = {};
  state.log.push({ t: Date.now(), items, ded: $("dedication").value.trim() });
  save(); render(); renderLog();
  toast(`Offered ${describe(items)}. May Guanyin's compassion be with you.`);
}
$("offerBtn").addEventListener("click", inHall(offerAll));
// one at a time, by tapping the altar
function offerOne(k) {
  const kinds = state.bag[k] || {}, kind = Object.keys(kinds).find(x => kinds[x] > 0);
  if (!kind) { toast(`You have no ${ITEMS[k].name.toLowerCase()} in your bag. Buy them at the temple shop on the left of the lotus pond.`); pulse(k); return; }
  kinds[kind]--;
  PLACE[k](state.counts[k]++, kind, 0);
  const items = { [k]: { q: 1, k: kind } };
  const last = state.log[state.log.length - 1];
  if (last && last.items && Date.now() - last.t < 6e4 && !last.example && !last.at) { const it = last.items[k]; last.items[k] = it ? { q: it.q + 1, k: it.k } : items[k]; last.t = Date.now(); }
  else state.log.push({ t: Date.now(), items, ded: $("dedication").value.trim() });
  save(); render(); renderLog();
  toast(`Placed ${describe(items)} on the altar.`);
}


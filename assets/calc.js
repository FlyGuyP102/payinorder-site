// Spending-room calculator: the same order as the workbook's Payday tab.
// Pure functions are exported for tests; bindCalculator wires them to the page.

export function toAmount(value) {
  const n = Number(String(value ?? "").replace(/[$,\s]/g, ""));
  return Number.isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : 0;
}

export function spendingRoom(inputs) {
  const start = toAmount(inputs.takeHome) + toAmount(inputs.leftover);
  const committed = ["bills", "future", "essentials", "savings"]
    .reduce((sum, key) => sum + toAmount(inputs[key]), 0);
  const diff = Math.round((start - committed) * 100) / 100;
  const days = Math.floor(toAmount(inputs.days));
  const room = Math.max(diff, 0);
  return {
    start,
    committed,
    room,
    shortfall: Math.max(-diff, 0),
    perDay: days > 0 && room > 0 ? room / days : null,
  };
}

export function formatUSD(n) {
  const whole = Math.abs(n - Math.round(n)) < 0.005;
  const digits = whole ? 0 : 2;
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

export function bindCalculator(form, out) {
  const roomEl = out.querySelector("[data-room]");
  const labelEl = out.querySelector("[data-label]");
  const perDayEl = out.querySelector("[data-perday]");
  const render = () => {
    const r = spendingRoom(Object.fromEntries(new FormData(form)));
    const short = r.shortfall > 0;
    out.dataset.state = short ? "short" : "ok";
    labelEl.textContent = short ? "Shortfall before you spend" : "Your spending room";
    roomEl.textContent = formatUSD(short ? r.shortfall : r.room);
    perDayEl.hidden = r.perDay === null;
    if (r.perDay !== null) perDayEl.textContent = "About " + formatUSD(r.perDay) + " a day until payday";
  };
  form.addEventListener("input", render);
  form.addEventListener("submit", (e) => e.preventDefault());
  render();
}

(() => {
  const STORAGE_KEY = "cajaclara_movements_v1";
  const CURRENCY_KEY = "cajaclara_currency_v1";
  const $ = (id) => document.getElementById(id);
  const els = {
    form: $("movementForm"), type: $("typeInput"), amount: $("amountInput"), category: $("categoryInput"), description: $("descriptionInput"), date: $("dateInput"),
    currency: $("currencySelect"), prefix: $("currencyPrefix"), message: $("formMessage"), rows: $("movementRows"), table: document.querySelector(".table-wrap"), empty: $("emptyState"),
    search: $("searchInput"), filter: $("filterInput"), demo: $("demoButton"), exportCsv: $("exportCsv"), exportJson: $("exportJson"), importJson: $("importJson"), clearAll: $("clearAll")
  };
  let movements = loadMovements();
  let currency = localStorage.getItem(CURRENCY_KEY) || "CLP";
  els.currency.value = currency;
  els.date.value = new Date().toISOString().slice(0, 10);

  function loadMovements() {
    try { const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); return Array.isArray(parsed) ? parsed : []; }
    catch { return []; }
  }
  function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(movements)); }
  function formatMoney(value) {
    try { return new Intl.NumberFormat("es-CL", { style: "currency", currency, maximumFractionDigits: currency === "CLP" ? 0 : 2 }).format(value); }
    catch { return `${currency} ${Number(value).toLocaleString("es-CL")}`; }
  }
  function dateLabel(value) { const [y, m, d] = value.split("-"); return `${d}/${m}/${y}`; }
  function escapeHtml(value) { return String(value).replace(/[&<>"']/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[char])); }
  function filteredMovements() {
    const query = els.search.value.trim().toLowerCase();
    return [...movements].sort((a, b) => `${b.date}${b.createdAt}`.localeCompare(`${a.date}${a.createdAt}`)).filter((item) => {
      const matchesType = els.filter.value === "all" || item.type === els.filter.value;
      const haystack = `${item.description} ${item.category}`.toLowerCase();
      return matchesType && (!query || haystack.includes(query));
    });
  }
  function render() {
    const sales = movements.filter((m) => m.type === "sale");
    const expenses = movements.filter((m) => m.type === "expense");
    const salesTotal = sales.reduce((sum, m) => sum + m.amount, 0);
    const expensesTotal = expenses.reduce((sum, m) => sum + m.amount, 0);
    $("salesTotal").textContent = formatMoney(salesTotal); $("expensesTotal").textContent = formatMoney(expensesTotal); $("balanceTotal").textContent = formatMoney(salesTotal - expensesTotal);
    $("salesCount").textContent = `${sales.length} ${sales.length === 1 ? "movimiento" : "movimientos"}`; $("expensesCount").textContent = `${expenses.length} ${expenses.length === 1 ? "movimiento" : "movimientos"}`;
    $("balanceHint").textContent = movements.length ? (salesTotal >= expensesTotal ? "Vas en positivo" : "Revisa tus egresos") : "Aún no hay movimientos";
    $("movementCount").textContent = movements.length;
    const list = filteredMovements();
    els.empty.hidden = movements.length > 0; els.table.hidden = movements.length === 0;
    els.rows.innerHTML = list.length ? list.map((m) => `<tr><td>${escapeHtml(m.description || (m.type === "sale" ? "Venta" : "Gasto"))}<small>${m.type === "sale" ? "Ingreso" : "Egreso"}</small></td><td>${escapeHtml(m.category)}</td><td>${dateLabel(m.date)}</td><td class="align-right ${m.type === "sale" ? "amount-sale" : "amount-expense"}">${m.type === "sale" ? "+" : "−"}${formatMoney(m.amount)}</td><td class="align-right"><button class="delete-button" data-delete="${m.id}" type="button" aria-label="Eliminar movimiento">×</button></td></tr>`).join("") : `<tr><td colspan="5" class="empty-row">No hay coincidencias con tu búsqueda.</td></tr>`;
  }
  function flash(message, isError = false) { els.message.textContent = message; els.message.style.color = isError ? "#ba4d4d" : "#238275"; window.clearTimeout(flash.timer); flash.timer = window.setTimeout(() => { els.message.textContent = ""; }, 3500); }
  function download(filename, content, type) { const blob = new Blob([content], { type }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = filename; link.click(); URL.revokeObjectURL(url); }
  els.form.addEventListener("submit", (event) => { event.preventDefault(); const amount = Number(els.amount.value); if (!Number.isFinite(amount) || amount <= 0) return flash("Ingresa un monto mayor que cero.", true); movements.push({ id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()), type: els.type.value, amount, category: els.category.value, description: els.description.value.trim(), date: els.date.value, createdAt: Date.now() }); save(); els.form.reset(); els.type.value = "sale"; els.date.value = new Date().toISOString().slice(0, 10); flash("Movimiento guardado."); render(); });
  els.rows.addEventListener("click", (event) => { const button = event.target.closest("[data-delete]"); if (!button) return; movements = movements.filter((m) => m.id !== button.dataset.delete); save(); render(); flash("Movimiento eliminado."); });
  els.currency.addEventListener("change", () => { currency = els.currency.value; localStorage.setItem(CURRENCY_KEY, currency); els.prefix.textContent = currency === "CLP" ? "$" : currency; render(); });
  els.search.addEventListener("input", render); els.filter.addEventListener("change", render);
  els.demo.addEventListener("click", () => { const today = new Date(); const day = (offset) => new Date(today.getTime() - offset * 86400000).toISOString().slice(0, 10); movements = [{ id: "demo-1", type: "sale", amount: currency === "CLP" ? 42000 : 42, category: "Ventas", description: "Venta de productos", date: day(0), createdAt: 3 }, { id: "demo-2", type: "expense", amount: currency === "CLP" ? 12500 : 12.5, category: "Insumos", description: "Compra de materiales", date: day(1), createdAt: 2 }, { id: "demo-3", type: "sale", amount: currency === "CLP" ? 28000 : 28, category: "Servicios", description: "Servicio a cliente", date: day(2), createdAt: 1 }]; save(); render(); flash("Ejemplo cargado. Puedes borrarlo y comenzar con tus datos."); });
  els.exportCsv.addEventListener("click", () => { if (!movements.length) return flash("Primero agrega al menos un movimiento.", true); const header = "fecha,tipo,categoria,descripcion,monto"; const lines = movements.map((m) => [m.date, m.type === "sale" ? "venta" : "gasto", m.category, m.description || "", m.amount].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")); download(`cajaclara-${new Date().toISOString().slice(0,10)}.csv`, `\ufeff${header}\n${lines.join("\n")}`, "text/csv;charset=utf-8"); });
  els.exportJson.addEventListener("click", () => { if (!movements.length) return flash("Primero agrega al menos un movimiento.", true); download(`cajaclara-respaldo-${new Date().toISOString().slice(0,10)}.json`, JSON.stringify({ app: "CajaClara", version: 1, currency, movements }, null, 2), "application/json"); });
  els.importJson.addEventListener("change", async () => { const file = els.importJson.files[0]; if (!file) return; try { const parsed = JSON.parse(await file.text()); const incoming = Array.isArray(parsed) ? parsed : parsed.movements; if (!Array.isArray(incoming) || incoming.some((m) => !m.date || !m.type || !Number.isFinite(Number(m.amount)))) throw new Error("Formato inválido"); movements = incoming.map((m) => ({ ...m, amount: Number(m.amount), id: m.id || String(Date.now() + Math.random()) })); if (parsed.currency && els.currency.querySelector(`[value="${parsed.currency}"]`)) { currency = parsed.currency; els.currency.value = currency; localStorage.setItem(CURRENCY_KEY, currency); } save(); render(); flash("Respaldo importado correctamente."); } catch { flash("No pude importar ese archivo. Usa un respaldo JSON de CajaClara.", true); } els.importJson.value = ""; });
  els.clearAll.addEventListener("click", () => { if (!movements.length) return flash("No hay datos para borrar.", true); if (window.confirm("¿Borrar todos los movimientos? Esta acción no se puede deshacer.")) { movements = []; save(); render(); flash("Datos borrados."); } });
  render();
})();

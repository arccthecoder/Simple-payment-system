'use strict';
function renderAnalytics(payments) {
  const active = payments.filter(p => !p.Cancelled);
  const values = active.map(p => p.Rub).sort((a, b) => a - b);
  const total = values.reduce((a, b) => a + b, 0);
  const gross = payments.reduce((a, p) => a + p.Rub, 0);
  const median = values.length ? (values[Math.floor((values.length - 1) / 2)] + values[Math.floor(values.length / 2)]) / 2 : null;
  $('#median').textContent = median === null ? '—' : money(median);
  $('#minimum').textContent = values.length ? money(values[0]) : '—';
  $('#maximum').textContent = values.length ? money(values.at(-1)) : '—';
  $('#cancel-rate').textContent = gross ? `${Math.round((gross - total) / gross * 100)}%` : '—';
  const top = [...active].sort((a, b) => b.Rub - a.Rub).slice(0, 3);
  const container = $('#top-payments'); container.replaceChildren();
  if (!top.length) { const empty = document.createElement('p'); empty.className = 'analytics-empty'; empty.textContent = 'Здесь появятся три крупнейших действующих платежа.'; container.append(empty); }
  for (const [index, p] of top.entries()) {
    const button = document.createElement('button'); button.className = 'top-payment'; button.onclick = () => showDetails(p);
    const rank = document.createElement('span'); rank.className = 'rank'; rank.textContent = `0${index + 1}`;
    const description = document.createElement('span'); description.className = 'top-description'; description.textContent = p.Description;
    const amount = document.createElement('b'); amount.textContent = money(p.Rub);
    const bar = document.createElement('span'); bar.className = 'top-bar'; bar.style.setProperty('--width', `${total ? p.Rub / total * 100 : 0}%`);
    button.append(rank, description, amount, bar); container.append(button);
  }
  const dataset = $('#chart-scope').value === 'active' ? active : payments;
  const buckets = [{label:'1–100', max:100}, {label:'101–500', max:500}, {label:'501–1 000', max:1000}, {label:'1 001–5 000', max:5000}, {label:'5 001+', max:Infinity}];
  const counts = buckets.map(() => 0);
  for (const p of dataset) { const index = buckets.findIndex(b => p.Rub <= b.max); if (index >= 0) counts[index]++; }
  const chart = $('#histogram'); chart.replaceChildren();
  const maxCount = Math.max(...counts, 1);
  buckets.forEach((bucket, index) => {
    const column = document.createElement('div'); column.className = 'hist-column';
    const button = document.createElement('button'); button.className = 'hist-bar'; button.style.setProperty('--height', `${counts[index] / maxCount * 100}%`);
    button.setAttribute('aria-label', `${bucket.label} ₽: ${counts[index]} операций`);
    button.title = `${bucket.label} ₽ · ${counts[index]} операций`;
    const count = document.createElement('span'); count.textContent = counts[index]; button.append(count);
    const label = document.createElement('small'); label.textContent = bucket.label;
    column.append(button, label); chart.append(column);
  });
  $('#insight-text').textContent = top.length ? `Крупнейший платёж — ${money(top[0].Rub)}. Он составляет ${Math.round(top[0].Rub / total * 100)}% принятой суммы. Всего действующих операций: ${active.length}.` : 'Нет действующих платежей. Создайте новую операцию, чтобы увидеть аналитику.';
}
function showDetails(payment) {
  const list = $('#payment-details'); list.replaceChildren();
  for (const [label, value] of [['ID', payment.id], ['Описание', payment.Description], ['Сумма', money(payment.Rub)], ['Статус', payment.Cancelled ? 'Отменён' : 'Принят']]) {
    const row = document.createElement('div'), term = document.createElement('dt'), detail = document.createElement('dd');
    term.textContent = label; detail.textContent = value; row.append(term, detail); list.append(row);
  }
  $('#details-dialog').showModal();
}

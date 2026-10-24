'use strict';
const $ = selector => document.querySelector(selector);
const money = value => new Intl.NumberFormat('ru-RU', {style: 'currency', currency: 'RUB', maximumFractionDigits: 0}).format(value);
let payments = [], loaded = false, loading = false;
let currentPage = 1;
const pageSize = 8;
const dialog = $('#payment-dialog');
try { document.documentElement.dataset.theme = localStorage.getItem('permach-theme') || 'light'; } catch {}
$('#theme').onclick = () => {
  const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = theme;
  try { localStorage.setItem('permach-theme', theme); } catch {}
};
function notify(message, error = false) { $('#notice').textContent = message; $('#notice').classList.toggle('error', error); }
async function request(path, options) {
  const response = await fetch(path, options);
  if (!response.ok) throw new Error(`Сервер вернул ошибку ${response.status}. Попробуйте ещё раз.`);
  // Go generates int64 IDs that can exceed JavaScript's safe integer range.
  const body = await response.text();
  return JSON.parse(body.replace(/("id"\s*:\s*)(\d+)(?=\s*[,}])/g, '$1"$2"'));
}
function visiblePayments() {
  const query = $('#search').value.trim().toLocaleLowerCase('ru');
  return payments.filter(p => (p.Description.toLocaleLowerCase('ru').includes(query) || p.id.includes(query)) &&
    ($('#filter').value === 'all' || p.Cancelled === ($('#filter').value === 'cancelled'))).sort((a, b) => {
      if ($('#sort').value === 'description') return a.Description.localeCompare(b.Description, 'ru');
      return $('#sort').value === 'amount-asc' ? a.Rub - b.Rub : b.Rub - a.Rub;
    });
}
function render() {
  const active = payments.filter(p => !p.Cancelled), cancelled = payments.filter(p => p.Cancelled);
  const total = active.reduce((sum, p) => sum + p.Rub, 0);
  $('#revenue').textContent = money(total); $('#count').textContent = payments.length;
  $('#active').textContent = `${active.length} действующих`;
  $('#average').textContent = money(active.length ? total / active.length : 0);
  $('#cancelled').textContent = cancelled.length;
  $('#cancelled-sum').textContent = `На сумму ${money(cancelled.reduce((sum, p) => sum + p.Rub, 0))}`;
  const share = payments.length ? Math.round(active.length / payments.length * 100) : 0;
  $('#share').textContent = `${share}%`; $('#donut').style.setProperty('--portion', `${share}%`);
  $('#legend-active').textContent = active.length; $('#legend-cancelled').textContent = cancelled.length;
  renderAnalytics(payments);
  const rows = visiblePayments(); $('#result-count').textContent = rows.length;
  const pages = Math.max(1, Math.ceil(rows.length / pageSize));
  currentPage = Math.min(currentPage, pages);
  $('#page-label').textContent = `${currentPage} / ${pages}`;
  $('#prev-page').disabled = currentPage <= 1; $('#next-page').disabled = currentPage >= pages;
  $('#payments').replaceChildren();
  for (const payment of rows.slice((currentPage - 1) * pageSize, currentPage * pageSize)) {
    const row = document.createElement('tr');
    const description = document.createElement('td'), title = document.createElement('button'), id = document.createElement('small');
    title.className = 'payment-link'; title.onclick = () => showDetails(payment);
    title.textContent = payment.Description; id.textContent = `#${payment.id}`; description.append(title, id);
    const amount = document.createElement('td'); amount.className = 'amount'; amount.textContent = money(payment.Rub);
    const status = document.createElement('td'), badge = document.createElement('span');
    badge.className = `badge${payment.Cancelled ? ' cancelled' : ''}`; badge.textContent = payment.Cancelled ? 'Отменён' : 'Принят'; status.append(badge);
    const actions = document.createElement('td');
    if (!payment.Cancelled) {
      const button = document.createElement('button'); button.className = 'cancel-button'; button.textContent = 'Отменить';
      button.setAttribute('aria-label', `Отменить платёж ${payment.id}`);
      button.onclick = () => cancel(payment, button); actions.append(button);
    }
    row.append(description, amount, status, actions); $('#payments').append(row);
  }
  $('#empty').hidden = rows.length > 0;
  $('#empty h3').textContent = payments.length ? 'Ничего не найдено' : 'Пока нет операций';
  $('#empty p').textContent = payments.length ? 'Измените запрос или выберите другой статус.' : 'Создайте первый платёж — он появится здесь.';
  $('#export').disabled = !rows.length;
}
async function load() {
  if (loading) return false;
  loading = true; $('#refresh').disabled = true;
  try {
    const data = await request('/api/payments');
    payments = Object.entries(data).map(([id, p]) => ({...p, id})); loaded = true;
    render(); $('#updated').textContent = `Обновлено в ${new Date().toLocaleTimeString('ru-RU')}`;
    $('.online').textContent = '● Сервер подключён'; return true;
  } catch (error) {
    notify(`Не удалось загрузить операции. ${error.message}`, true);
    $('.online').textContent = '○ Нет связи с сервером';
    $('#updated').textContent = loaded ? 'Показаны последние загруженные данные' : 'Данные недоступны. Нажмите «Обновить».';
    return false;
  } finally { loading = false; $('#refresh').disabled = false; }
}
function openPayment() { $('#form-error').textContent = ''; dialog.showModal(); $('#description').focus(); }
$('#create').onclick = openPayment; $('#nav-create').onclick = openPayment;
$('#close').onclick = () => dialog.close();
$('#payment-form').onsubmit = async event => {
  event.preventDefault(); const description = $('#description').value.trim(), rub = Number($('#amount').value);
  if (!description || !Number.isSafeInteger(rub) || rub < 1 || rub > 1000000000) {
    $('#form-error').textContent = 'Укажите описание и целую сумму от 1 до 1 000 000 000 ₽.'; return;
  }
  $('#submit').disabled = true; $('#form-error').textContent = '';
  try {
    const result = await request('/api/payments', {method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({description, rub, method: $('#method').value})});
    dialog.close(); $('#payment-form').reset(); notify(`Платёж #${result.id} создан.`); await load();
  } catch (error) { $('#form-error').textContent = error.message; }
  finally { $('#submit').disabled = false; }
};
async function cancel(payment, button) {
  if (!confirm(`Отменить платёж #${payment.id} на ${money(payment.Rub)}?`)) return;
  button.disabled = true;
  try { await request(`/api/payments/${encodeURIComponent(payment.id)}`, {method: 'DELETE'}); notify(`Платёж #${payment.id} отменён.`); await load(); }
  catch (error) { notify(error.message, true); }
  finally { button.disabled = false; }
}
const resetView = () => { currentPage = 1; render(); };
$('#search').oninput = resetView; $('#filter').onchange = resetView; $('#sort').onchange = resetView;
$('#chart-scope').onchange = () => renderAnalytics(payments);
$('#prev-page').onclick = () => { currentPage--; render(); };
$('#next-page').onclick = () => { currentPage++; render(); };
$('#close-details').onclick = () => $('#details-dialog').close();
$('#refresh').onclick = async () => { if (await load()) notify('Данные обновлены.'); };
$('#export').onclick = () => {
  // Prevent spreadsheet applications from treating user descriptions as formulas.
  const cell = value => '"' + String(/^[\s]*[=+@\-\t\r]/.test(String(value)) ? "'" + value : value).replaceAll('"', '""') + '"';
  const csv = [['ID', 'Описание', 'Сумма ₽', 'Статус'], ...visiblePayments().map(p => [p.id, p.Description, p.Rub, p.Cancelled ? 'Отменён' : 'Принят'])].map(row => row.map(cell).join(';')).join('\r\n');
  const url = URL.createObjectURL(new Blob(['\uFEFF' + csv], {type:'text/csv;charset=utf-8'}));
  const link = document.createElement('a'); link.href = url; link.download = 'permach-payments.csv'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
};
$('#export').disabled = true;
load();
document.addEventListener('visibilitychange', () => { if (!document.hidden && !dialog.open) load(); });

// Track section positions rather than visibility: tall sections can fill the viewport.
const sectionLinks = [...document.querySelectorAll('.menu a[href^="#"]')];
let navigationFrame = 0;
function updateNavigation() {
  navigationFrame = 0;
  let active = sectionLinks[0];
  const sidebar = document.querySelector('.sidebar');
  const sectionThreshold = getComputedStyle(sidebar).position === 'sticky'
    ? sidebar.getBoundingClientRect().bottom + 30 : 120;
  for (const link of sectionLinks) {
    const section = document.querySelector(link.getAttribute('href'));
    if (section && section.getBoundingClientRect().top <= sectionThreshold) active = link;
  }
  if (window.scrollY > 0 && Math.ceil(window.scrollY + window.innerHeight) >= document.documentElement.scrollHeight - 2) {
    active = sectionLinks.at(-1);
  }
  for (const link of sectionLinks) {
    const selected = link === active;
    link.classList.toggle('selected', selected);
    if (selected) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  }
  $('#current-section').textContent = active.textContent.trim();
}
function scheduleNavigation() {
  if (!navigationFrame) navigationFrame = requestAnimationFrame(updateNavigation);
}
window.addEventListener('scroll', scheduleNavigation, {passive: true});
window.addEventListener('resize', scheduleNavigation);
window.addEventListener('hashchange', scheduleNavigation);
new ResizeObserver(scheduleNavigation).observe(document.querySelector('.workspace'));
updateNavigation();

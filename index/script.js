const $ = s => document.querySelector(s);
const fmt = n => Math.round(n).toLocaleString('ru-RU') + ' ₽';

// тема
$('#theme').onclick = () => {
	const r = document.documentElement;
	r.dataset.theme = (r.dataset.theme || 'light') === 'dark' ? 'light' : 'dark';
};

// появление при прокрутке и счётчики
const io = new IntersectionObserver(es => es.forEach(e => {
	if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { threshold: .15 });
document.querySelectorAll('.rv').forEach(el => io.observe(el));

document.querySelectorAll('[data-n]').forEach(el => {
	const t = +el.dataset.n, d = +el.dataset.d || 0, s = performance.now();
	(function f(now) {
		const p = Math.min((now - s) / 1500, 1);
		el.textContent = (t * (1 - Math.pow(1 - p, 3))).toLocaleString('ru-RU', { minimumFractionDigits: d, maximumFractionDigits: d });
		if (p < 1) requestAnimationFrame(f);
	})(s);
});

// бегущая строка
$('#marq').textContent = ('ВИЗА · МИР · СБП · QR-ОПЛАТА · РАССРОЧКА · ПОДПИСКИ · ЧЕКИ 54-ФЗ · ВОЗВРАТЫ · API · ').repeat(6);

// наклон карточек за курсором
document.querySelectorAll('.tilt').forEach(c => {
	c.addEventListener('mousemove', e => {
		const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
		c.style.transform = `perspective(700px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-4px)`;
	});
	c.addEventListener('mouseleave', () => c.style.transform = '');
});

// демо-терминал
const goods = [['Футболка', 1490], ['Кроссовки', 5990], ['Рюкзак', 3290]];
const qty = goods.map(() => 0);
function renderItems() {
	$('#items').innerHTML = goods.map((g, i) => `
		<div class="it"><span>${g[0]}<br><small class="mono" style="color:#6fd8bd">${fmt(g[1])}</small></span>
		<span class="q"><button data-i="${i}" data-d="-1">−</button>${qty[i]}<button data-i="${i}" data-d="1">+</button></span></div>`).join('');
	const total = goods.reduce((a, g, i) => a + g[1] * qty[i], 0);
	$('#total').textContent = fmt(total);
	$('#pay').disabled = !total;
	$('#paper').classList.remove('out');
}
$('#items').onclick = e => {
	const b = e.target.closest('button'); if (!b) return;
	const i = +b.dataset.i; qty[i] = Math.max(0, qty[i] + +b.dataset.d);
	$('#prog i').style.width = 0; $('#status').textContent = 'Добавьте товары в корзину';
	renderItems();
};
$('#pay').onclick = () => {
	const method = document.querySelector('input[name=m]:checked').value;
	const steps = ['Проверка платежа…', 'Подтверждение банка…', 'Чек отправлен в ОФД…', 'Оплачено'];
	const pay = $('#pay'); pay.disabled = true;
	steps.forEach((t, k) => setTimeout(() => {
		$('#status').textContent = t; $('#prog i').style.width = (k + 1) * 25 + '%';
		if (k === 3) showReceipt(method);
	}, k * 800));
};
function showReceipt(method) {
	const total = goods.reduce((a, g, i) => a + g[1] * qty[i], 0);
	$('#paper').innerHTML = '<div><b>ЧЕК № ' + Math.floor(10000 + Math.random() * 89999) + '</b><span>приход</span></div><hr>' +
		goods.map((g, i) => qty[i] ? `<div><span>${g[0]} ×${qty[i]}</span><span>${fmt(g[1] * qty[i])}</span></div>` : '').join('') +
		`<hr><div><span>НДС 20%</span><span>${fmt(total / 6)}</span></div><div><b>ИТОГО</b><b>${fmt(total)}</b></div><div><span>Оплата</span><span>${method}</span></div><div><span>ОФД</span><span>отправлен</span></div>`;
	requestAnimationFrame(() => $('#paper').classList.add('out'));
	$('#pay').disabled = false;
}
renderItems();

// как идёт платёж
const how = [
	['Покупатель', 'Клиент выбирает товар на вашем сайте и нажимает «Оплатить».'],
	['Шлюз', 'Касса принимает заказ и безопасно передаёт данные в банк.'],
	['Банк', 'Банк проверяет карту, 3-D Secure подтверждает владельца за секунды.'],
	['Чек', 'Касса пробивает чек по 54-ФЗ и отправляет клиенту и в ОФД.']
];
const xs = [50, 190, 330, 470];
$('#steps').innerHTML = how.map((h, i) => `<button class="st" data-i="${i}"><i>0${i + 1}</i>${h[0]}</button>`).join('');
$('#flow .nodes').innerHTML = xs.map((x, i) => `<g data-i="${i}"><circle cx="${x}" cy="75" r="16"/><text x="${x}" y="115">${how[i][0]}</text></g>`).join('');
let cur = 0, timer;
function setStep(i) {
	cur = i;
	document.querySelectorAll('.st').forEach((b, k) => b.classList.toggle('on', k === i));
	document.querySelectorAll('.nodes g').forEach((g, k) => g.classList.toggle('on', k <= i));
	$('#dot').setAttribute('cx', xs[i]);
	$('#stepText').textContent = how[i][1];
}
$('#steps').onclick = e => { const b = e.target.closest('.st'); if (b) { clearInterval(timer); setStep(+b.dataset.i); } };
setStep(0);
timer = setInterval(() => setStep((cur + 1) % 4), 2800);

// живая панель
let sum = 0, cnt = 0, pts = Array(20).fill(40);
const mths = ['Карта', 'СБП', 'Кошелёк'];
function tick() {
	const a = Math.round((500 + Math.random() * 7000) / 10) * 10, m = mths[Math.floor(Math.random() * 3)];
	sum += a; cnt++;
	$('#sum').textContent = fmt(sum); $('#cnt').textContent = cnt; $('#ofd').textContent = cnt;
	const li = document.createElement('li');
	li.innerHTML = `<span>#${1000 + cnt} · ${m}</span><span>+${fmt(a)}</span>`;
	$('#feed').prepend(li);
	while ($('#feed').children.length > 5) $('#feed').lastChild.remove();
	pts.push(80 - Math.min(70, a / 110)); pts.shift();
	$('#line').setAttribute('points', pts.map((y, i) => `${i * 21},${y}`).join(' '));
}
tick(); tick(); setInterval(tick, 2200);

// калькулятор
function calc() {
	const t = +$('#turn').value, r = +$('#method').value;
	const other = t * (r + .8) / 100 + 3000, mine = t * Math.max(r - .6, .3) / 100;
	$('#turnV').textContent = fmt(t);
	$('#v1').textContent = fmt(other); $('#v2').textContent = fmt(mine);
	$('#b1').style.width = '100%'; $('#b2').style.width = Math.max(mine / other * 100, 4) + '%';
	$('#sv').textContent = fmt((other - mine) * 12);
}
['#turn', '#method'].forEach(s => $(s).addEventListener('input', calc));
calc();

// заявка
const m = $('#modal'), cl = () => m.classList.remove('on');
document.querySelectorAll('[data-open]').forEach(b => b.onclick = () => {
	m.classList.add('on'); $('#form').hidden = false; $('#done').hidden = true; $('#err').textContent = '';
});
$('#close').onclick = cl; $('#close2').onclick = cl; m.onclick = e => { if (e.target === m) cl(); };
$('#send').onclick = () => {
	const e = $('#email').value.trim();
	if (!$('#shop').value.trim()) return $('#err').textContent = 'Укажите название магазина';
	if (!/^\S+@\S+\.\S+$/.test(e)) return $('#err').textContent = 'Проверьте email';
	$('#em2').textContent = e; $('#form').hidden = true; $('#done').hidden = false;
};

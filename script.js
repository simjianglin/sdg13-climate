const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const pick = (btns, on) => btns.forEach(b => b.setAttribute('aria-pressed', b === on));

/* ---------- Tab navigation (uses the #hash in the address bar) ---------- */
const ids = $$('main > section').map(s => s.id);
function route() {
  let h = location.hash.slice(1);
  if (!ids.includes(h)) h = 'overview';
  ids.forEach(i => $('#' + i).hidden = i !== h);
  $$('#nav a').forEach(a => a.getAttribute('href') === '#' + h
    ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'));
  scrollTo(0, 0);
}
addEventListener('hashchange', route);
route();

/* ---------- Causes: click a source to learn more ---------- */
const causes = [
  ['⚡', 'Fossil fuels', 'Burning coal, oil and gas for electricity, heat and vehicles is the largest source of greenhouse gases.', 'Switch off devices you are not using.'],
  ['🌳', 'Deforestation', 'Forests store carbon. When they are cleared or burned, that carbon returns to the air and fewer trees remain to absorb more.', 'Choose recycled paper and certified wood.'],
  ['🐄', 'Farming', 'Livestock, rice fields and fertiliser release methane and nitrous oxide, which trap heat strongly.', 'Waste less food and try more plant-based meals.'],
  ['🚗', 'Transport', 'Cars, trucks, ships and planes mostly run on fossil fuels and add emissions with every trip.', 'Walk, cycle or share rides for short trips.'],
  ['🏭', 'Industry', 'Making cement, steel and plastics needs lots of energy, and some processes release CO₂ directly.', 'Repair and reuse before buying new.']
];
const chips = $('#chips');
chips.innerHTML = causes.map((c, i) => `<button class="chip" aria-pressed="false" data-i="${i}">${c[0]} ${c[1]}</button>`).join('');
chips.addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b) return;
  pick($$('.chip', chips), b);
  const c = causes[b.dataset.i];
  $('#cd').innerHTML = `<h3>${c[0]} ${c[1]}</h3><p>${c[2]}</p><p><b>Try this:</b> ${c[3]}</p>`;
});
$('.chip', chips).click();

/* ---------- Effects: compare 1.5°C and 2°C ---------- */
const fx = {
  '1.5': { h: 55, rows: [['🪸 Coral reefs', '70–90% lost'], ['🧊 Arctic summers', 'Ice-free about once a century'], ['🥵 Severe heatwaves', 'About 14% of people hit at least once every 5 years']] },
  '2':   { h: 80, rows: [['🪸 Coral reefs', 'More than 99% lost'], ['🧊 Arctic summers', 'Ice-free at least once a decade'], ['🥵 Severe heatwaves', 'About 37% of people hit at least once every 5 years']] }
};
function showFx(k) {
  $('.fill').style.setProperty('--h', fx[k].h + '%');
  $('#tv').textContent = '+' + k + '°C';
  $('#stats').innerHTML = fx[k].rows.map(r => `<div class="stat"><span>${r[0]}</span><b>${r[1]}</b></div>`).join('');
}
$('#seg').addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b) return;
  pick($$('#seg button'), b);
  showFx(b.dataset.k);
});
setTimeout(() => showFx('1.5'), 150);

/* ---------- Solutions: filter cards by who acts ---------- */
$('#flt').addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b) return;
  pick($$('#flt button'), b);
  $$('#sol .card').forEach(c => c.hidden = b.dataset.f !== 'all' && c.dataset.who !== b.dataset.f);
});

/* ---------- Footprint calculator ---------- */
const tips = [
  'Your biggest slice is car travel. Try walking, cycling or sharing rides.',
  'Your biggest slice is meat. Swapping a few meals for plant-based ones adds up fast.',
  'Your biggest slice is flying. Choose trains or video calls where you can.',
  'Your biggest slice is electricity. Use LEDs, switch off standby and set air-con higher.'
];
function calc() {
  let total = 0, max = 0, top = 0;
  $$('#calc input').forEach((inp, n) => {
    $('output', inp.parentNode).textContent = inp.value;
    const kg = inp.value * inp.dataset.k;
    total += kg;
    if (kg > max) { max = kg; top = n; }
  });
  $('#tot').textContent = (total / 1000).toFixed(1);
  $('.bar i').style.width = Math.min(100, total / 100) + '%';
  $('#tip').textContent = tips[top];
}
$('#calc').addEventListener('input', calc);
calc();

/* ---------- Feedback form ---------- */
let list = [], rating = 0;
try { list = JSON.parse(localStorage.getItem('sdg13-feedback') || '[]'); } catch (e) {}
const stars = $('#stars'), er = $('#er');
stars.innerHTML = [1, 2, 3, 4, 5].map(n => `<button type="button" role="radio" aria-checked="false" aria-label="${n} star${n > 1 ? 's' : ''}" data-n="${n}">★</button>`).join('');
stars.addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b) return;
  rating = +b.dataset.n;
  [...stars.children].forEach((s, i) => { s.classList.toggle('on', i < rating); s.setAttribute('aria-checked', i + 1 === rating); });
});
$('#ms').addEventListener('input', e => $('#cnt').textContent = e.target.value.length + ' / 300');

function render() {
  const box = $('#fl');
  box.textContent = '';
  if (!list.length) { box.innerHTML = '<p class="note">No feedback yet. Be the first!</p>'; return; }
  list.forEach(x => {
    const d = document.createElement('div'), h = document.createElement('b'), p = document.createElement('p');
    d.className = 'item';
    h.textContent = `${x.name}: ${'★'.repeat(x.rating)}${'☆'.repeat(5 - x.rating)} (${x.section})`;
    p.textContent = x.msg;
    d.append(h, p);
    box.append(d);
  });
}
$('#fb').addEventListener('submit', e => {
  e.preventDefault();
  er.className = '';
  const name = $('#nm').value.trim(), msg = $('#ms').value.trim();
  if (!name) return er.textContent = 'Enter your name so we know who to thank.';
  if ($('#em').value && !$('#em').checkValidity()) return er.textContent = 'That email looks incomplete. Fix it or leave it blank.';
  if (!rating) return er.textContent = 'Pick a star rating from 1 to 5.';
  if (msg.length < 10) return er.textContent = 'Write at least 10 characters in your message.';
  list.unshift({ name, rating, section: $('#fv').value, msg });
  list = list.slice(0, 20);
  try { localStorage.setItem('sdg13-feedback', JSON.stringify(list)); } catch (x) {}
  e.target.reset();
  rating = 0;
  [...stars.children].forEach(s => s.classList.remove('on'));
  $('#cnt').textContent = '0 / 300';
  er.className = 'ok';
  er.textContent = 'Thank you, ' + name + '! Your feedback was sent.';
  render();
});
render();

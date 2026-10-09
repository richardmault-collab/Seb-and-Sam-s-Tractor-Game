// Headless gameplay smoke test (Node.js; no dependencies or emulator needed).
const fs = require('fs');
const vm = require('vm');
const assert = require('assert');
const path = require('path');
let handlers = {}, timers = [], nextId = 0;
class FakeElement {
  constructor() {
    this.innerHTML = ''; this.textContent = ''; this.hidden = false; this.style = {};
    this.classList = {add(){}, remove(){}, toggle(){}};
  }
  setAttribute() {}
  scrollIntoView() {}
  appendChild() {}
  addEventListener() {}
}
const ids = {};
for (const id of ['main', 'toast', 'homeBtn', 'soundBtn', 'musicBtn',
                  'gameArea', 'confetti', 'tractorTemplate']) {
  ids[id] = new FakeElement();
}
ids.tractorTemplate.innerHTML = '<svg></svg>';
const document = {
  getElementById: id => ids[id],
  addEventListener: (event, fn) => { handlers[event] = fn; },
  createElement: () => new FakeElement()
};
const window = {};
const context = {
  document, window, Math, console,
  localStorage: {getItem: () => 'false', setItem() {}},
  setTimeout: (fn, ms) => {const id = ++nextId; timers.push({id, fn, ms}); return id;},
  clearTimeout: id => {timers = timers.filter(t => t.id !== id);},
  setInterval: () => 1,
  clearInterval() {}
};
const js = fs.readFileSync(path.join(__dirname, '../app/src/main/assets/game.js'), 'utf8');
vm.runInNewContext(js, context);

function click(dataset) {
  const button = {dataset, classList: new FakeElement().classList, closest: () => button};
  handlers.click({target: button});
}
function advance(ms) {
  const i = timers.findIndex(t => t.ms === ms);
  assert(i !== -1, 'Missing game timer ' + ms);
  const [timer] = timers.splice(i, 1);
  timer.fn();
}
function sheepCount() {
  return (ids.gameArea.innerHTML.match(/data-sheep=/g) || []).length;
}
assert.equal((ids.main.innerHTML.match(/data-activity=/g) || []).length, 4, 'Sam has 4 activities including sound guessing');
click({player: 'seb'});
assert.equal((ids.main.innerHTML.match(/data-activity=/g) || []).length, 8, 'Seb has 8 activities including sound guessing');
click({activity: 'count'});
for (let count = 1; count <= 5; count++) {
  assert.equal(sheepCount(), count);
  for (let sheep = 0; sheep < count; sheep++) click({sheep: String(sheep)});
  advance(2200);
}
assert.equal(sheepCount(), 1, 'Counting cycles to 1, never exceeds 5');

// Guess the Farm Sound: exactly three unique clickable picture choices per round.
// Wrong answers keep the same target; right answers advance and never repeat the
// correct answer immediately. Listen button can be used any number of times.
click({activity: 'guess'});
let previousAnswer = null;
for (let round = 0; round < 6; round++) {
  const html = ids.gameArea.innerHTML;
  const optionKeys = [...html.matchAll(/data-guess-option="([^"]+)"/g)].map(m => m[1]);
  assert.equal(optionKeys.length, 3, 'Exactly three picture options per sound');
  assert.equal(new Set(optionKeys).size, 3, 'Three different farm pictures');
  assert(html.includes('data-do="play-guess"'), 'Big replay button exists');
  click({do: 'play-guess'});
  click({do: 'play-guess'});
  // Sound is disabled in this smoke environment; app must explain how to enable it.
  assert(ids.toast.textContent.includes('Switch on'), 'Muted playback offers sound guidance');
  let correct = null;
  for (const key of optionKeys) {
    click({guessOption: key});
    if (ids.toast.textContent.includes('Well done')) {
      correct = key;
      break;
    }
    assert.equal(ids.gameArea.innerHTML, html, 'Wrong guess leaves options untouched');
  }
  assert(correct, 'One of three choices must be correct');
  assert.notEqual(correct, previousAnswer, 'Back-to-back sound targets differ');
  previousAnswer = correct;
  // Tapping during celebration must not trigger another result.
  click({guessOption: correct});
  advance(2200);
}
click({player: 'sam'});
assert.equal((ids.main.innerHTML.match(/data-activity=/g) || []).length, 4);
click({activity: 'guess'});
assert.equal((ids.gameArea.innerHTML.match(/data-guess-option=/g) || []).length, 3);
click({activity: 'animals'});
assert(ids.gameArea.innerHTML.includes('data-animal="cow"'));
click({animal: 'cow'});
click({activity: 'colours'});
assert(ids.gameArea.innerHTML.includes('data-colour="RED"'));
click({colour: 'RED'}); advance(1900);
assert(ids.gameArea.innerHTML.includes('data-colour="BLUE"'));
click({activity: 'plant'});
for (let i = 0; i < 3; i++) click({do: 'plant'});
assert(ids.gameArea.innerHTML.includes('HARVEST'));
click({do: 'plant'}); advance(2200);
click({activity: 'hay'});
for (let i = 0; i < 3; i++) click({do: 'load'});
assert(ids.gameArea.innerHTML.includes('DELIVER HAY'));
click({do: 'deliver'}); advance(2200);
click({activity: 'drive'});
for (let i = 0; i < 4; i++) click({do: 'drive'});
advance(2300);
click({activity: 'peek'});
click({do: 'peek'}); click({do: 'peek'});
assert(window.goHome(), 'Can return home');
assert(!window.goHome(), 'Can exit home');
console.log('PASS: eight activities including 3-choice farm sounds, two age profiles, and counting 1–5');

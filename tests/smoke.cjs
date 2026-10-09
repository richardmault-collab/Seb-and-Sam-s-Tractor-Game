// Headless gameplay smoke test (Node.js; no dependencies or emulator needed).
const fs = require('fs');
const vm = require('vm');
const assert = require('assert');
const path = require('path');
let handlers = {}, timers = [], nextId = 0;
const recordedPlays = [];
class FakeAudio {
  constructor(url) {this.url=url;this.currentTime=0;this.volume=1;this.preload="auto";}
  pause() {}
  play() {recordedPlays.push(this.url);return Promise.resolve();}
}
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
  document, window, Math, console, Audio: FakeAudio,
  localStorage: {getItem: key => key === 'farm_music' ? 'false' : 'true', setItem() {}},
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
  const guessedSound=recordedPlays[recordedPlays.length-1];
  assert(guessedSound && /^sounds\/(cow|sheep|pig|chicken|tractor)(?:_2)?\.(?:ogg|wav)$/.test(guessedSound),
    'Actual bundled farm recording plays, never a robotic spoken imitation');
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
assert(recordedPlays.some(s=>/^sounds\/cow(?:_2)?\.(?:ogg|wav)$/.test(s)), 'Animal tap plays a recorded cow');

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
assert(recordedPlays.includes('sounds/hay.ogg'), 'Loading hay uses a physical foley recording');

click({activity: 'drive'});
for (let i = 0; i < 4; i++) click({do: 'drive'});
advance(2300);
assert(recordedPlays.some(s=>/^sounds\/tractor(?:_2)?\.ogg$/.test(s)), 'Driving plays a tractor engine recording');
click({activity: 'peek'});
click({do: 'peek'}); click({do: 'peek'});
assert(window.goHome(), 'Can return home');
assert(!window.goHome(), 'Can exit home');
// Verify the real audio assets will be packed into the APK.
for (const id of ['cow', 'sheep', 'pig', 'chicken', 'tractor', 'horn', 'water', 'seed', 'hay', 'cow_2', 'sheep_2', 'pig_2', 'chicken_2', 'tractor_2']) {
  const isWav = id.endsWith('_2') && id !== 'tractor_2';
  const filename=path.join(__dirname, '../app/src/main/assets/sounds', id+(isWav?'.wav':'.ogg'));
  assert(fs.statSync(filename).size > 500, 'Missing authentic recording: '+id);
  assert.equal(fs.readFileSync(filename).subarray(0,4).toString(), isWav?'RIFF':'OggS', 'Invalid farm recording: '+id);
}
console.log('PASS: 8 activities, animal/tractor recordings, fourteen offline audio assets and counting 1–5');

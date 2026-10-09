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
  addEventListener: (event, fn) => { (handlers[event] ||= []).push(fn); },
  querySelector: () => null,
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
const assets = path.join(__dirname, '../app/src/main/assets');
for (const script of ['v14.js', 'game.js']) {
  vm.runInNewContext(fs.readFileSync(path.join(assets, script), 'utf8'), context);
}

function click(dataset) {
  const button = {dataset, classList: new FakeElement().classList, closest: () => button};
  for (const callback of handlers.click) callback({target: button});
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
  assert(guessedSound && /^sounds\/(cow|sheep|pig|chicken|horse|duck|goat|dog|cat|tractor|combine|digger|loader)(?:_2)?\.(?:ogg|wav)$/.test(guessedSound),
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
// Explore is a non-quiz, interactive three-place sound discovery experience.
click({activity: 'animals'});
assert(ids.gameArea.innerHTML.includes('data-v14="discover:cow"') || ids.gameArea.innerHTML.includes('data-v14="discover:chicken"'));
click({v14: 'discover:chicken'});
click({v14: 'explore-scene:1'});
assert(ids.gameArea.innerHTML.includes('data-v14="discover:combine"'), 'Combine appears in the pasture');
click({v14: 'discover:combine'});
assert(recordedPlays.includes('sounds/combine.wav'));
click({v14: 'explore-scene:2'});
assert(ids.gameArea.innerHTML.includes('data-v14="discover:digger"'), 'Digger appears by the pond');
click({v14: 'discover:digger'});

click({activity: 'colours'});
assert(ids.gameArea.innerHTML.includes('data-colour="RED"'));
click({colour: 'RED'}); advance(1900);
assert(ids.gameArea.innerHTML.includes('data-colour="BLUE"'));
click({activity: 'plant'});
for (let i = 0; i < 3; i++) click({do: 'plant'});
assert(ids.gameArea.innerHTML.includes('HARVEST'));
click({do: 'plant'}); advance(2200);
click({activity: 'hay'});
assert(ids.gameArea.innerHTML.includes('v14-drop-target'), 'Hay trailer has a visible drop zone');
for (let i = 0; i < 3; i++) click({v14: 'bale'});
assert.equal(window.FarmV14.snapshot().loaded, 3, 'Three hay bales loaded');
assert(ids.gameArea.innerHTML.includes('data-v14="deliver"'));
click({v14: 'deliver'});
assert(ids.gameArea.innerHTML.includes('Another delivery'), 'Completed hay trip has a restart');
click({v14: 'hay-again'});
assert.equal(window.FarmV14.snapshot().loaded, 0);

click({activity: 'drive'});
for (let i = 0; i < 5; i++) {
  assert(ids.gameArea.innerHTML.includes('data-v14="step:'+i+'"'));
  click({v14: 'step:'+i});
}
assert.equal(window.FarmV14.snapshot().step, 5, 'All five farm steps complete');
assert(ids.gameArea.innerHTML.includes('finished'), 'Tractor moves forward into the field');
click({v14: 'drive-again'});

click({activity: 'peek'});
for (let scene = 0; scene < 3; scene++) {
  assert(ids.gameArea.innerHTML.includes('v14-barn'), 'Actual barn illustration available');
  for(let i=0;i<3;i++)click({v14:'find:'+i});
  assert.equal(window.FarmV14.snapshot().found.length,3,'Three animals found');
  click({v14:'search-next'});
}
assert.equal(window.FarmV14.snapshot().scene,0, 'Barn, field, farmyard loop correctly');
assert(window.goHome(), 'Can return home');
assert(!window.goHome(), 'Can exit home');
// Verify the real audio assets will be packed into the APK.
for (const id of ['cow', 'sheep', 'pig', 'chicken', 'tractor', 'horn', 'water', 'seed', 'hay', 'cow_2', 'sheep_2', 'pig_2', 'chicken_2', 'tractor_2',
                 'horse', 'horse_2', 'duck', 'duck_2', 'goat', 'goat_2',
                 'dog', 'dog_2', 'cat', 'cat_2', 'combine', 'digger', 'loader']) {
  const isWav = (id.endsWith('_2') && id !== 'tractor_2') || ['horse','duck','goat','dog','cat','combine','digger','loader'].includes(id);
  const filename=path.join(__dirname, '../app/src/main/assets/sounds', id+(isWav?'.wav':'.ogg'));
  assert(fs.statSync(filename).size > 500, 'Missing authentic recording: '+id);
  assert.equal(fs.readFileSync(filename).subarray(0,4).toString(), isWav?'RIFF':'OggS', 'Invalid farm recording: '+id);
}
assert(fs.readFileSync(path.join(assets,'index.html'),'utf8').includes('v14.js'), 'Android shell loads new gameplay module');
console.log('PASS: 8 games, hay loading, five tractor tasks, three search scenes, farm exploration, 27 audio files, counting 1–5');

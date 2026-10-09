
/* Seb & Sam's Tractor Farm — 100% offline, no third-party scripts or tracking. */
(function () {
  "use strict";
  var main = document.getElementById("main");
  var toast = document.getElementById("toast");
  var homeButton = document.getElementById("homeBtn");
  var soundButton = document.getElementById("soundBtn");
  var musicButton = document.getElementById("musicBtn");
  var selection = "sam";
  var current = "home";
  var state = {};
  var toastTimer = null;
  var nextRoundTimer = null;
  var audioContext = null;
  var musicTimer = null;
  var musicStep = 0;
  // Reusable local Ogg files: real animal and farm machinery recordings.
  // Bundled inside the APK (file:///android_asset/sounds/), never streamed.
  var recordingCache = {};
  var activeRecordings = {};
  var recordingRounds = {};
  var recordedAlternates = { cow: true, sheep: true, pig: true, chicken: true, tractor: true };
  var realEffects = { horn: "horn", engine: "tractor", water: "water", seed: "seed", hay: "hay" };
  function playRecording(key) {
    if (!sounds || paused) return false;
    try {
      // Rotate between two real takes, keeping the animal/vehicle identity.
      var index = recordingRounds[key] || 0;
      recordingRounds[key] = index + 1;
      var chosen = recordedAlternates[key] && index % 2 ? key + "_2" : key;
      var clip = recordingCache[chosen];
      if (!clip) {
        clip = new Audio("sounds/" + chosen + ".ogg");
        clip.preload = "auto";
        clip.volume = key === "horn" ? 0.68 : 0.85;
        recordingCache[chosen] = clip;
      }
      // Stop an earlier take, so sounds never pile on top of each other.
      stopRecordedSounds();
      clip.currentTime = 0;
      var playing = clip.play();
      if (playing && typeof playing.catch === "function") {
        playing.catch(function () { message("Could not play sound. Please try again."); });
      }
      activeRecordings[chosen] = clip;
      return true;
    } catch (_) {
      message("Could not play sound. Please try again.");
      return false;
    }
  }
  function stopRecordedSounds() {
    Object.keys(activeRecordings).forEach(function(key) {
      try { activeRecordings[key].pause(); activeRecordings[key].currentTime = 0; } catch (_) {}
    });
  }
  var paused = false;
  var sounds = loadPref("sounds", true);
  var music = loadPref("music", true);
  var animalList = [
    { key: "cow", name: "Cow", emoji: "🐄", say: "Moooo! Cow!", colour: "tint-blue" },
    { key: "sheep", name: "Sheep", emoji: "🐑", say: "Baaaa! Sheep!", colour: "tint-green" },
    { key: "pig", name: "Pig", emoji: "🐖", say: "Oink oink! Pig!", colour: "tint-pink" },
    { key: "chicken", name: "Chicken", emoji: "🐔", say: "Cluck cluck! Chicken!", colour: "tint-yellow" }
  ];
  var colours = [
    { name: "RED", hex: "#e9352e" },
    { name: "BLUE", hex: "#3983ed" },
    { name: "GREEN", hex: "#52b750" },
    { name: "YELLOW", hex: "#f0bd26" }
  ];
  var games = {
    animals: { title: "Tap the Animals", short: "Animal Sounds", icon: "🐄", tint: "tint-green", sub: "Listen and learn" },
    guess: { title: "Guess the Farm Sound", short: "Guess the Sound", icon: "🔊", tint: "tint-blue", sub: "Listen and choose a picture" },
    drive: { title: "Drive the Tractor", short: "Tractor Time", icon: "🚜", tint: "tint-yellow", sub: "Brrrm! Beep beep!" },
    peek: { title: "Who's in the Barn?", short: "Barn Peekaboo", icon: "🏠", tint: "tint-pink", sub: "What will you find?" },
    count: { title: "Count the Sheep", short: "Count to Five", icon: "🐑", tint: "tint-blue", sub: "One, two, three, four, five" },
    colours: { title: "Tractor Colours", short: "Tractor Colours", icon: "🚜", tint: "tint-purple", sub: "Find the right colour" },
    plant: { title: "Plant the Seeds", short: "Grow a Garden", icon: "🌻", tint: "tint-mint", sub: "Seeds, water and sunshine" },
    hay: { title: "Deliver the Hay", short: "Hay Delivery", icon: "🌾", tint: "tint-yellow", sub: "Help on the farm" }
  };
  var farmSounds = animalList.map(function(a) {
    return { key: a.key, name: a.name, emoji: a.emoji, colour: a.colour };
  }).concat([{ key: "tractor", name: "Tractor", emoji: "🚜", colour: "tint-yellow" }]);
  var lists = {
    sam: ["animals", "guess", "drive", "peek"],
    seb: ["guess", "count", "colours", "plant", "hay", "animals", "drive", "peek"]
  };

  function loadPref(key, fallback) {
    try { var v = localStorage.getItem("farm_" + key); return v === null ? fallback : v === "true"; } catch (_) { return fallback; }
  }
  function savePref(key, value) {
    try { localStorage.setItem("farm_" + key, String(value)); } catch (_) {}
  }
  function startAudio() {
    if (!audioContext) {
      try { audioContext = new (window.AudioContext || window.webkitAudioContext)(); } catch (_) { return; }
    }
    if (audioContext.state === "suspended") audioContext.resume().catch(function(){});
    syncMusic();
  }
  function note(freq, duration, volume, type, delay) {
    if (!audioContext || audioContext.state !== "running" || freq <= 0) return;
    try {
      var osc = audioContext.createOscillator();
      var gain = audioContext.createGain();
      var now = audioContext.currentTime + (delay || 0);
      osc.type = type || "sine";
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(Math.max(.001, volume), now + .018);
      gain.gain.exponentialRampToValueAtTime(.0001, now + duration);
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.start(now);
      osc.stop(now + duration + .02);
    } catch (_) {}
  }
  function slide(from, to, duration, volume, type) {
    if (!audioContext || audioContext.state !== "running") return;
    try {
      var osc = audioContext.createOscillator(), gain = audioContext.createGain(), t = audioContext.currentTime;
      osc.type = type || "sawtooth";
      osc.frequency.setValueAtTime(from, t);
      osc.frequency.exponentialRampToValueAtTime(to, t + duration);
      gain.gain.setValueAtTime(volume, t);
      gain.gain.exponentialRampToValueAtTime(.0001, t + duration);
      osc.connect(gain);gain.connect(audioContext.destination);osc.start(t);osc.stop(t + duration + .01);
    } catch (_) {}
  }
  function fx(kind) {
    if (!sounds || paused) return;
    if (realEffects[kind]) { playRecording(realEffects[kind]); return; }
    startAudio();
    if (kind === "tap") { note(620,.09,.11,"sine"); }
    else if (kind === "success") { note(523,.2,.13,"triangle");note(659,.2,.13,"triangle",.16);note(784,.35,.13,"triangle",.32); }
    else if (kind === "horn") { note(230,.29,.2,"sawtooth");note(310,.28,.12,"square",.04); }
    else if (kind === "engine") { slide(120,74,.42,.2,"sawtooth");note(65,.29,.1,"triangle"); }
    else if (kind === "water") { for (var w=0;w<6;w++) note(450+w*70,.12,.065,"sine",w*.065); }
    else if (kind === "seed") { note(230,.18,.09,"triangle");note(325,.17,.10,"triangle",.10); }
    else if (kind === "wrong") { note(250,.14,.065,"sine"); }
  }
  function animalNoise(key) {
    if (key === "cow" || key === "sheep" || key === "pig" || key === "chicken") {
      // Never say "moo" or "baa" with text-to-speech: play the real animal.
      playRecording(key);
    }
  }
  function say(words) {
    if (!sounds || paused) return;
    try {
      if (window.FarmAndroid && typeof window.FarmAndroid.speak === "function") {
        window.FarmAndroid.speak(words); return;
      }
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        var u = new SpeechSynthesisUtterance(words);
        u.lang = "en-GB";u.rate = .88;u.pitch = 1.18;u.volume = .9;
        window.speechSynthesis.speak(u);
      }
    } catch (_) {}
  }
  function syncMusic() {
    musicButton.classList.toggle("off", !music);
    musicButton.setAttribute("aria-pressed", String(music));
    musicButton.textContent = music ? "🎵" : "🎼";
    soundButton.classList.toggle("off", !sounds);
    soundButton.setAttribute("aria-pressed", String(sounds));
    soundButton.textContent = sounds ? "🔊" : "🔇";
    if ((!music || paused || !audioContext || current === "guess") && musicTimer !== null) {
      clearInterval(musicTimer);musicTimer=null;
    }
    if (music && !paused && current !== "guess" && audioContext && musicTimer === null) {
      musicTimer = setInterval(musicTick, 375);
      musicTick();
    }
  }
  function musicTick() {
    if (!audioContext || audioContext.state !== "running" || !music || paused) return;
    var melody = [392,440,523,440,392,330,349,392,440,523,587,523,440,392,349,330];
    var bass = [196,196,174.61,174.61,220,220,196,196];
    note(melody[musicStep % melody.length],.28,.027,"sine");
    if (musicStep % 2 === 0) note(bass[Math.floor(musicStep/2)%bass.length],.53,.022,"triangle");
    musicStep++;
  }
  function message(words) {
    clearTimeout(toastTimer);toast.textContent=words;toast.classList.add("show");
    toastTimer=setTimeout(function(){toast.classList.remove("show");},1350);
  }
  function celebrate(words) {
    fx("success");message(words || "Hooray! Well done! 🌟");say(words || "Hooray! Well done!");
    var c=document.getElementById("confetti");c.textContent="";
    var symbols=["🌟","⭐","💛","🌼","✨"];
    for(var i=0;i<16;i++){
      var el=document.createElement("span");
      el.textContent=symbols[i%symbols.length];
      el.style.left=(Math.random()*96)+"%";
      el.style.animationDelay=(Math.random()*.5)+"s";
      c.appendChild(el);
    }
    setTimeout(function(){c.textContent="";},2250);
  }
  function delay(action, ms) {
    clearTimeout(nextRoundTimer);
    var active=current;
    nextRoundTimer=setTimeout(function(){if(current===active)action();},ms);
  }
  function esc(s) {return String(s).replace(/[&<>"]/g,function(ch){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[ch];});}
  function renderHome() {
    clearTimeout(nextRoundTimer);stopRecordedSounds();current="home";syncMusic();homeButton.hidden=true;
    var heading='<div class="home-sign"><h1><span class="seb-text">Seb</span><span class="amp-text"> & </span><span class="sam-text">Sam’s</span></h1><p>TRACTOR FARM</p></div>';
    var illustration='<div class="hero-wrap"><div class="hero-farm-scene"></div>'+document.getElementById("tractorTemplate").innerHTML+'<span class="hero-sticker hero-sticker-a">🌻</span><span class="hero-sticker hero-sticker-b">🐄</span></div>';
    var tabs='<p class="home-intro">WHO IS PLAYING TODAY?</p><div class="mode-picker" role="group" aria-label="Choose player">'+
      '<button data-player="sam" class="mode-option '+(selection==="sam"?"active":"")+'">👶 Sam <span class="age">Little farmer · 1+</span></button>'+
      '<button data-player="seb" class="mode-option '+(selection==="seb"?"active":"")+'">🧒 Seb <span class="age">Big farmer · 3+</span></button></div>';
    var grid='<div class="game-grid">'+lists[selection].map(function(id){
      var g=games[id];
      return '<button class="game-card '+g.tint+'" data-activity="'+id+'" aria-label="'+esc(g.title)+'"><span class="pic" aria-hidden="true">'+g.icon+'</span><span class="card-copy"><strong>'+esc(g.short)+'</strong><span class="sub">'+esc(g.sub)+'</span></span><span class="card-arrow" aria-hidden="true">➜</span></button>';
    }).join("")+'</div>';
    main.innerHTML=heading+illustration+tabs+'<div class="game-picker-title">🌾 Pick a farm adventure! 🌾</div>'+grid+'<p class="parent-note">Made with love ❤️ No adverts · No timers · Play offline</p>';
    main.scrollIntoView({block:"start",behavior:"auto"});
  }
  function renderGame(id) {
    if (!games[id]) return;
    clearTimeout(nextRoundTimer);stopRecordedSounds();current=id;state={};syncMusic();
    homeButton.hidden=false;
    main.innerHTML='<div class="game-heading"><h1>'+games[id].icon+" "+esc(games[id].title)+'</h1><p>'+esc(games[id].sub)+'</p></div><div id="gameArea" class="play-panel theme-'+id+'"></div>';
    if (id==="animals") drawAnimals();
    else if (id==="guess") newSoundRound();
    else if (id==="drive") {state.progress=0;drawDrive();}
    else if (id==="peek") {state.open=false;state.pick=0;drawPeek();}
    else if (id==="count") {state.goal=1;state.counted=[];drawCount();}
    else if (id==="colours") {state.target=0;drawColours();}
    else if (id==="plant") {state.stage=0;state.crop=0;drawPlant();}
    else if (id==="hay") {state.loaded=0;state.delivered=false;drawHay();}
    main.scrollIntoView({block:"start",behavior:"auto"});
  }
  function area(html) {var node=document.getElementById("gameArea");if(node) node.innerHTML=html;}
  function drawAnimals() {
    area('<div class="bubble">Tap an animal to hear its sound!</div><div class="animal-grid">'+animalList.map(function(a){
      return '<button class="animal-card '+a.colour+'" data-animal="'+a.key+'" aria-label="'+a.name+'"><span class="animal-emoji" aria-hidden="true">'+a.emoji+'</span><span>'+a.name+'</span></button>';
    }).join("")+'</div><div class="bubble">🚜 Moo, baa, oink, cluck!</div>');
  }

  function shuffled(items) {
    var copy=items.slice();
    for (var i=copy.length-1;i>0;i--) {
      var j=Math.floor(Math.random()*(i+1));
      var temp=copy[i];copy[i]=copy[j];copy[j]=temp;
    }
    return copy;
  }
  // Exactly one answer and two different distractors on every round.
  // Avoid back-to-back repetitions of the same correct answer.
  function newSoundRound() {
    if (current !== "guess") return;
    var previous=state.answer;
    var pool=farmSounds.filter(function(item){return item.key!==previous;});
    var answer=pool[Math.floor(Math.random()*pool.length)];
    var others=shuffled(farmSounds.filter(function(item){return item.key!==answer.key;})).slice(0,2);
    state.answer=answer.key;
    state.options=shuffled([answer].concat(others));
    state.solved=false;
    drawGuess();
  }
  function drawGuess() {
    var pictures=state.options.map(function(item){
      return '<button class="sound-picture '+item.colour+'" data-guess-option="'+item.key+'" '+
        'aria-label="'+item.name+'"><span class="sound-picture-icon" aria-hidden="true">'+item.emoji+
        '</span><strong>'+item.name+'</strong></button>';
    }).join("");
    area('<div class="bubble">What made that farm sound?</div>'+
      '<div class="sound-stage"><span class="sound-sparkles" aria-hidden="true">🎵 ✨ 🎶</span>'+
      '<button class="listen-button" data-do="play-guess" aria-label="Play the farm sound">'+
      '<span aria-hidden="true">🔊</span><strong>TAP TO LISTEN</strong></button>'+
      '<span class="listen-hint">Tap again to hear it again!</span></div>'+
      '<div class="sound-picture-grid" role="group" aria-label="Choose from three pictures">'+pictures+'</div>'+
      '<div class="sound-tip">👂 Listen, look and choose!</div>');
  }
  function playGuessSound() {
    if (current !== "guess" || state.solved) return;
    if (!sounds) {
      message("Switch on the 🔊 sound button first!");
      return;
    }
    if (state.answer === "tractor") { fx("engine"); return; }
    // A real sound is the ONLY clue: do not read out or imitate its name.
    animalNoise(state.answer);
  }
  function chooseSoundPicture(key, button) {
    if (current !== "guess" || state.solved) return;
    if (key === state.answer) {
      state.solved=true;
      var match=farmSounds.find(function(item){return item.key===key;});
      if (button) button.classList.add("correct");
      celebrate("That's the "+match.name.toLowerCase()+"! Well done!");
      delay(newSoundRound,2200);
    } else {
      if (button) button.classList.add("wrong");
      fx("wrong");
      say("Good try! Listen again.");
      message("Good try! Listen again! 💛");
    }
  }
  function drawDrive() {
    var pct=Math.min(state.progress*18,73);
    area('<div class="bubble">Tap DRIVE to zoom across the farm!</div><div class="drive-stage"><span class="tree">🌳</span><span class="barn">🏠</span><span class="driving-tractor" style="left:'+pct+'%">🚜</span></div><div class="action-row"><button class="action-btn" data-do="drive">🚜 DRIVE!</button><button class="action-btn secondary" data-do="horn">📣 BEEP!</button></div>');
  }
  function drawPeek() {
    var animal=animalList[state.pick]||animalList[0];
    area('<div class="bubble">'+(state.open?"Look who is here!":"Tap the barn doors to see who's inside!")+'</div><div class="barn-stage"><button class="barn-btn" data-do="peek" aria-label="Open or close barn doors">'+(state.open?'<span class="reveal">'+animal.emoji+'</span>':'🏠')+'</button><p style="font-weight:1000;font-size:26px">'+(state.open?animal.name+" says hello!":"Knock, knock! 👋")+'</p></div>');
  }
  function drawCount() {
    var dots="<div class='count-status' aria-label='Count progress'>";
    for(var k=1;k<=state.goal;k++) dots+='<div class="count-dot '+(k<=state.counted.length?"done":"")+'">'+k+'</div>';
    dots+="</div>";
    var sheep='<div class="sheep-grid">'+Array.from({length:state.goal},function(_,i){
      var done=state.counted.indexOf(i)>=0;
      return '<button class="sheep-card '+(done?"done":"")+'" data-sheep="'+i+'" aria-label="Sheep '+(i+1)+'" '+(done?"disabled":"")+'>🐑</button>';
    }).join("")+"</div>";
    area('<div class="bubble">Tap each sheep. How many can you count?</div><div class="count-number">'+(state.counted.length||"?")+'</div>'+sheep+dots+'<div class="bubble">Only numbers 1 to 5! 🌟</div>');
  }
  function tractorSVG(hex) {
    return '<svg class="mini-tractor" viewBox="0 0 190 110" role="img" aria-label="Coloured tractor"><rect x="55" y="20" width="65" height="65" rx="13" fill="'+hex+'"/><rect x="66" y="29" width="44" height="31" rx="5" fill="#a6ebff"/><rect x="22" y="62" width="155" height="29" rx="9" fill="'+hex+'"/><rect x="36" y="32" width="8" height="41" rx="2" fill="#414248"/><circle cx="55" cy="89" r="23" fill="#38383d"/><circle cx="55" cy="89" r="11" fill="#ffd848"/><circle cx="145" cy="88" r="25" fill="#38383d"/><circle cx="145" cy="88" r="12" fill="#ffd848"/><circle cx="29" cy="73" r="9" fill="#ffee9a"/></svg>';
  }
  function drawColours() {
    var target=colours[state.target%colours.length];
    var options=[target,colours[(state.target+1)%colours.length],colours[(state.target+2)%colours.length]];
    if (state.target%2) options.reverse();
    area('<div class="bubble">Find the <strong style="color:'+target.hex+'">'+target.name+'</strong> tractor!</div><div class="colour-grid">'+options.map(function(c){
      return '<button class="colour-card" data-colour="'+c.name+'" aria-label="'+c.name+' tractor">'+tractorSVG(c.hex)+'</button>';
    }).join("")+'</div><div class="bubble">🔴 Red · 🔵 Blue · 🟢 Green · 🟡 Yellow</div>');
  }
  function drawPlant() {
    var cropIcons=["🌻","🥕","🍎"],steps=["🟤","🌰","🌱","🌻"], labels=["Tap to plant a seed!","Now give it some water!","A little sunshine!","Look what you grew!"];
    if(state.crop%3===1) steps[3]="🥕";
    if(state.crop%3===2) steps[3]="🍎";
    area('<div class="bubble">'+labels[state.stage]+'</div><div class="plant-stage"><div class="plant-grow">'+steps[state.stage]+'</div><button class="plot" data-do="plant" aria-label="Garden plot">🌱 🟫 🌱</button></div><div class="action-row"><button class="action-btn" data-do="plant">'+(["🌱 PLANT","💧 WATER","☀️ SUNSHINE","🌾 HARVEST"][state.stage])+'</button></div><div class="plant-help">Seeds need water and sunshine to grow!</div>');
  }
  function drawHay() {
    var bales="";
    for(var k=0;k<3;k++)bales+='<span class="hay-item">'+(k<state.loaded?"🟨":"▫️")+'</span>';
    area('<div class="bubble">'+(state.loaded<3?"Load 3 hay bales onto your tractor!":"The trailer is full! Take the hay to the barn!")+'</div><div class="hay-truck">🚜</div><div class="hay-load">'+bales+'</div><div class="action-row">'+(state.loaded<3?'<button class="action-btn" data-do="load">🌾 LOAD HAY</button>':'<button class="action-btn" data-do="deliver">🏠 DELIVER HAY!</button>')+'</div>');
  }
  function tapAnimal(key, button) {
    var animal=animalList.find(function(a){return a.key===key;});
    if(!animal)return;
    animalNoise(key);message(animal.emoji+" "+animal.name+"!");
    if(button){button.classList.remove("jiggle");void button.offsetWidth;button.classList.add("jiggle");}
  }
  function doAction(which, button) {
    if(which==="play-guess"){playGuessSound();return;}
    if(which==="horn"){fx("horn");return;}
    if(which==="drive"){
      state.progress++;fx("engine");drawDrive();
      if(state.progress>=4){celebrate("Great driving! Beep beep!");delay(function(){state.progress=0;drawDrive();},2300);}
      return;
    }
    if(which==="peek"){
      if(!state.open){state.pick=Math.floor(Math.random()*animalList.length);state.open=true;drawPeek();tapAnimal(animalList[state.pick].key);}
      else {state.open=false;drawPeek();fx("tap");}return;
    }
    if(which==="plant"){
      if(state.stage<3){state.stage++;fx(state.stage===2?"water":"seed");drawPlant();say(["","Seed planted!","Water helps plants grow!","Sunshine makes plants grow!"][state.stage]);}
      else {celebrate("You grew a lovely crop!");delay(function(){state.crop++;state.stage=0;drawPlant();},2200);}
      return;
    }
    if(which==="load"){
      if(state.loaded<3){state.loaded++;fx("hay");drawHay();say(String(state.loaded));}
      return;
    }
    if(which==="deliver"){
      if(state.loaded!==3)return;
      celebrate("Hay delivered! Fantastic farming!");
      delay(function(){state.loaded=0;drawHay();},2200);
    }
  }
  document.addEventListener("click",function(e){
    var button=e.target.closest("button");
    if(!button)return;
    startAudio();
    if(button.dataset.player){
      selection=button.dataset.player;fx("tap");say(selection==="sam"?"Hello Sam!":"Hello Seb!");renderHome();return;
    }
    if(button.dataset.activity){
      fx("tap");renderGame(button.dataset.activity);return;
    }
    if(button.dataset.animal){tapAnimal(button.dataset.animal,button);return;}
    if(button.dataset.guessOption){chooseSoundPicture(button.dataset.guessOption,button);return;}
    if(button.dataset.sheep!==undefined){
      if(current!=="count")return;
      var i=Number(button.dataset.sheep);
      if(state.counted.indexOf(i)>=0)return;
      state.counted.push(i);fx("tap");var n=state.counted.length;
      drawCount();say(String(n));
      if(n>=state.goal){
        message("You counted "+n+" sheep! 🌟");fx("success");
        delay(function(){state.goal=state.goal%5+1;state.counted=[];drawCount();say("Let's count the sheep!");},2200);
      }
      return;
    }
    if(button.dataset.colour){
      if(current!=="colours")return;
      var target=colours[state.target%4].name;
      if(button.dataset.colour===target){
        celebrate("That's "+target.toLowerCase()+"! Well done!");
        delay(function(){state.target++;drawColours();},1900);
      }else{
        fx("wrong");say("Try another tractor!");button.classList.add("wrong");message("Try another colour 💛");
      }return;
    }
    if(button.dataset.do){doAction(button.dataset.do,button);return;}
  });
  homeButton.addEventListener("click",function(){fx("tap");renderHome();});
  soundButton.addEventListener("click",function(){sounds=!sounds;if(!sounds)stopRecordedSounds();savePref("sounds",sounds);syncMusic();fx("tap");});
  musicButton.addEventListener("click",function(){music=!music;savePref("music",music);startAudio();syncMusic();});
  window.goHome=function(){if(current!=="home"){renderHome();return true;}return false;};
  window.setAppPaused=function(isPaused){paused=!!isPaused;if(paused){stopRecordedSounds();try{if(window.speechSynthesis)window.speechSynthesis.cancel();}catch(_){};}syncMusic();};
  document.addEventListener("visibilitychange",function(){window.setAppPaused(document.hidden);});
  renderHome();syncMusic();
})();

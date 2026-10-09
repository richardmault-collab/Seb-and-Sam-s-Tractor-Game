/* Seb and Sam v1.4 scene-based farming games; no accounts, network or tracking. */
(function(){
"use strict";
var api=window.FarmV14={},c,mode,s,drag,suppressBaleClickUntil=0;
var names={cow:"Cow",sheep:"Sheep",pig:"Pig",chicken:"Chicken",horse:"Pony",duck:"Duck",goat:"Goat",dog:"Dog",cat:"Cat",tractor:"Tractor",combine:"Combine",digger:"Digger",loader:"Loader"};
var emoji={cow:"🐄",sheep:"🐑",pig:"🐷",chicken:"🐓",horse:"🐴",duck:"🦆",goat:"🐐",dog:"🐕",cat:"🐈",tractor:"🚜",combine:"🌾",digger:"🚧",loader:"🏗️"};
var scenes=[
 {name:"Barn",type:"barn",places:["Barn doors","Straw pile","Wheelbarrow"],covers:["🚪","🌾","🛒"],animals:["cow","cat","chicken"]},
 {name:"Field",type:"field",places:["Haystack","Big bush","Feed trough"],covers:["🌾","🌳","🪣"],animals:["sheep","horse","goat"]},
 {name:"Farmyard",type:"yard",places:["Wooden gate","Feed sacks","Little shed"],covers:["🚧","🧺","🛖"],animals:["pig","duck","dog"]}
];
var explore=[
 {name:"Farmyard",type:"yard",keys:["chicken","pig","dog","cat","tractor","loader"]},
 {name:"Pasture",type:"field",keys:["cow","sheep","horse","goat","combine"]},
 {name:"Pond & digger",type:"pond",keys:["duck","goat","dog","digger"]}
];
function art(key){
 if(["cow","sheep","pig","chicken"].includes(key))return c.art(key);
 if(key==="tractor")return c.tractor("#eb3a2b");
 if(["combine","digger","loader"].includes(key))return '<span class="v14-vehicle" aria-hidden="true">'+(key==="combine"?"🚜🌾":key==="digger"?"🚧🏗️":"🚜🪣")+'</span>';
 return '<span class="v14-emoji" aria-hidden="true">'+(emoji[key]||"🌱")+'</span>';
}
function barn(){
 return '<svg class="v14-barn" viewBox="0 0 220 190" aria-label="Red wooden barn with broad barn doors" role="img"><path d="M20 72L111 9L200 72V180H20Z" fill="#e5473b" stroke="#fff0ca" stroke-width="8"/><path d="M9 74L110 2L211 74" fill="none" stroke="#9b3428" stroke-width="17" stroke-linejoin="round"/><path d="M72 180V94H147V180" fill="#83462d" stroke="#fff2d9" stroke-width="8"/><path d="M75 98L144 176M145 98L74 176" stroke="#fff0ce" stroke-width="6"/><rect x="86" y="46" width="49" height="29" fill="#abeafd" stroke="#fff3df" stroke-width="5"/></svg>';
}
function scenic(type){return '<div class="v14-landscape '+type+'"><span class="v14-sunny">☀️</span><span class="v14-illustrated-barn">'+barn()+'</span><span class="v14-fence">▥ ▥ ▥ ▥ ▥</span></div>';}
function tabs(index,arr,kind){return '<div class="v14-tabs">'+arr.map(function(x,i){return '<button data-v14="'+kind+':'+i+'" class="'+(index===i?"active":"")+'">'+["🏠","🌾","🚜"][i]+' '+x.name+'</button>';}).join("")+'</div>';}
function show(html){c.area(html);}
function render(){if(mode==="hay")hay();if(mode==="drive")drive();if(mode==="peek")search();if(mode==="animals")animals();}
function hay(){
 var bales=Array.from({length:3-s.loaded},function(){return '<button data-v14="bale" class="v14-bale" aria-label="Hay bale. Drag to the trailer or tap to load">🌾</button>';}).join("");
 var loaded=Array.from({length:s.loaded},function(_,i){return '<span class="v14-stacked" style="left:'+(14+(i%2)*37)+'%;bottom:'+(15+Math.floor(i/2)*33)+'px">🌾</span>';}).join("");
 show('<div class="v14-story">'+(s.delivered?"Hay safely delivered!":s.loaded<3?"Load three bales onto the trailer!":"The trailer is full. Off to the barn!")+'</div>'+scenic("field")+
 '<div class="v14-hay-route '+(s.delivered?"completed":"")+'"><div class="v14-tractor-trailer"><div class="v14-small-tractor">'+c.tractor("#ed3a31")+'</div><div data-drop="trailer" class="v14-drop-target">'+loaded+'<small>'+(s.loaded===3?"READY!":"DROP HERE")+'</small></div></div></div>'+
 '<div class="v14-loose-bales">'+(bales||"✅ Loaded!")+'</div><div class="v14-stars">'+Array.from({length:3},function(_,i){return i<s.loaded?"⭐":"☆";}).join("")+'</div>'+
 (s.delivered?'<button class="v14-big-button" data-v14="hay-again">🚜 Another delivery</button>':s.loaded===3?'<button class="v14-big-button" data-v14="deliver">🚜 Drive to the barn!</button>':'<p class="v14-hint">Drag hay onto the trailer or tap to load.</p>'));
}
function load(){if(mode!=="hay"||s.loaded>=3||s.delivered)return;s.loaded++;c.fx("hay");render();if(s.loaded===3)c.message("Trailer full! Great job!");}
function drive(){
 var tasks=[["🔑","Start engine"],["🚨","Flashing beacon"],["🔗","Attach trailer"],["🚪","Open gate"],["🚜","Drive to field"]];
 show('<div class="v14-story">'+(s.step===5?"You're in the field!":tasks[s.step][1]+"!")+'</div>'+scenic("field")+
 '<div class="v14-drive-scene"><div class="v14-driving '+(s.step===5?"finished":"")+'">'+c.tractor("#e43c32")+'<i class="v14-beacon '+(s.step>=2?"lit":"")+'">🚨</i>'+(s.step>=3?'<b class="v14-tow">🛞🌾</b>':"")+'</div><span class="v14-gate '+(s.step>=4?"open":"")+'">🚧</span></div>'+
 '<div class="v14-job-grid">'+tasks.map(function(t,i){return '<button class="v14-job '+(i<s.step?"complete":i===s.step?"next":"waiting")+'" data-v14="step:'+i+'" '+(i!==s.step?"disabled":"")+'><span>'+t[0]+'</span><strong>'+t[1]+'</strong><small>'+(i<s.step?"✓":i===s.step?"TAP":"○")+'</small></button>';}).join("")+'</div>'+
 (s.step===5?'<button class="v14-big-button" data-v14="drive-again">🚜 Another farm job</button>':'<p class="v14-hint">Complete each job, then drive to the field!</p>'));
}
function search(){
 var scene=scenes[s.scene],done=s.found.length===3;
 var cards=scene.places.map(function(place,i){var found=s.found.includes(i);return '<button class="v14-cover '+(found?"revealed":"")+'" data-v14="find:'+i+'" '+(found?"disabled":"")+'><span>'+(found?art(scene.animals[i]):scene.covers[i])+'</span><strong>'+(found?names[scene.animals[i]]:place)+'</strong></button>';}).join("");
 var badges=scene.animals.map(function(key,i){var found=s.found.includes(i);return '<span class="v14-target '+(found?"found":"")+'">'+art(key)+'<small>'+(found?"✓":names[key])+'</small></span>';}).join("");
 show('<div class="v14-story">'+(done?"You found them all!":"Find the three hidden farm animals!")+'</div>'+tabs(s.scene,scenes,"search-scene")+
 '<div class="v14-search-scene '+scene.type+'">'+scenic(scene.type)+'<div class="v14-covers">'+cards+'</div></div>'+
 '<div class="v14-find-progress" aria-label="Animals to find">'+badges+'</div>'+
 (done?'<button class="v14-big-button" data-v14="search-next">'+(s.scene===2?"🔄 Find them again":"🌻 Next farm place ➜")+'</button>':'<p class="v14-hint">Tap doors, straw or farm objects to see who is hiding!</p>'));
}
function animals(){
 var scene=explore[s.scene];
 show('<div class="v14-story">Explore! Tap an animal or machine.</div>'+tabs(s.scene,explore,"explore-scene")+
 '<div class="v14-explore-scene '+scene.type+'">'+scenic(scene.type)+'<div class="v14-hotspots">'+scene.keys.map(function(key){return '<button data-v14="discover:'+key+'" class="v14-hotspot '+(s.visited.includes(key)?"visited":"")+'"><span>'+art(key)+'</span><strong>'+names[key]+'</strong></button>';}).join("")+'</div></div>'+
 '<div class="v14-care-row"><button class="v14-care-button" data-v14="care">'+
 (s.scene===0?'🌽 Feed the chickens':s.scene===1?'🪮 Brush the pony':'🪣 Scoop with the digger')+
 '</button></div><p class="v14-hint">Tap anything to hear it, or help with a farm job!</p>');
}
api.start=function(which,context){mode=which;c=context;s=which==="hay"?{loaded:0,delivered:false}:which==="drive"?{step:0}:which==="peek"?{scene:0,found:[]}:{scene:0,visited:[]};drag=null;render();};
api.snapshot=function(){return {mode:mode,loaded:s.loaded,step:s.step,scene:s.scene,found:s.found&&s.found.slice()};};
api.handle=function(value,btn){
 if(!value)return false;
 var bits=value.split(":"),cmd=bits[0],arg=bits[1];
 if(cmd==="bale"&&mode==="hay"){if(Date.now()>=suppressBaleClickUntil)load();return true;}
 if(cmd==="deliver"&&mode==="hay"&&s.loaded===3){s.delivered=true;c.fx("engine");render();c.celebrate("Hay delivered! Brilliant farming!");return true;}
 if(cmd==="hay-again"&&mode==="hay"){s={loaded:0,delivered:false};render();return true;}
 if(cmd==="step"&&mode==="drive"){var n=Number(arg);if(n===s.step){c.fx(n===0||n===4?"engine":n===1?"horn":"hay");s.step++;render();if(s.step===5)c.celebrate("You made it to the field!");}return true;}
 if(cmd==="drive-again"&&mode==="drive"){s.step=0;render();return true;}
 if(cmd==="search-scene"&&mode==="peek"){s={scene:Number(arg),found:[]};render();return true;}
 if(cmd==="find"&&mode==="peek"){var i=Number(arg);if(!s.found.includes(i)){s.found.push(i);c.play(scenes[s.scene].animals[i]);render();if(s.found.length===3)c.celebrate("All three animals found!");}return true;}
 if(cmd==="search-next"&&mode==="peek"){s={scene:(s.scene+1)%3,found:[]};render();return true;}
 if(cmd==="explore-scene"&&mode==="animals"){s={scene:Number(arg),visited:[]};render();return true;}
 if(cmd==="care"&&mode==="animals"){
   var target=s.scene===0?"chicken":s.scene===1?"horse":"digger";
   c.play(target);c.message(s.scene===0?"Chickens are fed! 🌽":s.scene===1?"Pony's coat is lovely! 🐴":"Great digging! 🪣");
   if(btn)btn.classList.add("dancing");return true;
 }
 if(cmd==="discover"&&mode==="animals"){if(!s.visited.includes(arg))s.visited.push(arg);c.play(arg);c.message(names[arg]+"!");if(btn)btn.classList.add("dancing");return true;}
 return false;
};
document.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest("button[data-v14]");if(b)api.handle(b.dataset.v14,b);});
document.addEventListener("pointerdown",function(e){var b=e.target.closest&&e.target.closest('button[data-v14="bale"]');if(!b||mode!=="hay")return;drag={id:e.pointerId,x:e.clientX,y:e.clientY,moved:false};});
document.addEventListener("pointermove",function(e){
 if(!drag||drag.id!==e.pointerId)return;
 if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>13){
 drag.moved=true;e.preventDefault();var ghost=document.querySelector(".v14-ghost");
 if(!ghost){ghost=document.createElement("div");ghost.className="v14-ghost";ghost.textContent="🌾";document.body.appendChild(ghost);}
 ghost.style.left=e.clientX+"px";ghost.style.top=e.clientY+"px";
 }
},{passive:false});
document.addEventListener("pointerup",function(e){
 if(!drag||drag.id!==e.pointerId)return;var moved=drag.moved;drag=null;
 var ghost=document.querySelector(".v14-ghost");if(ghost)ghost.remove();
 if(!moved)return;
 suppressBaleClickUntil=Date.now()+350; // Ignore synthetic click after a drop.
 e.preventDefault();
 var t=document.querySelector(".v14-drop-target");
 if(t){var r=t.getBoundingClientRect();if(e.clientX>=r.left-20&&e.clientX<=r.right+20&&e.clientY>=r.top-20&&e.clientY<=r.bottom+20){load();return;}}
 c.message("Try putting the hay on the trailer!");
});
})();
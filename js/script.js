// header + clock
(function(){
  const auth = JSON.parse(localStorage.getItem('auth')||'null');
  if(auth) document.getElementById('userName').textContent = `Welcome, ${auth.name}`;
  function tick(){
    const d=new Date(), h=d.getHours(), m=String(d.getMinutes()).padStart(2,'0'), s=String(d.getSeconds()).padStart(2,'0');
    document.getElementById('clock').textContent=`${h}:${m}:${s}`;
    document.getElementById('currentDate').textContent=d.toDateString();
    document.getElementById('greetText').textContent = h<12?'Good Morning ☀️':h<18?'Good Afternoon 🌤':'Good Evening 🌙';
  }
  tick(); setInterval(tick,1000);
})();

// weather preview + live sync
function paintWeather(){
  const saved = JSON.parse(localStorage.getItem('lastWeather')||'null');
  document.getElementById('weatherInfo').textContent = saved ? `${saved.city}: ${saved.cond}, ${saved.temp}°C` : 'No city selected';
}
paintWeather();
window.addEventListener('storage', (e)=>{ if(e.key==='lastWeather') paintWeather(); });
window.addEventListener('pageshow', paintWeather);
document.addEventListener('visibilitychange', ()=>{ if(document.visibilityState==='visible') paintWeather(); });

// upcoming tasks (sorted) + live sync
function loadTodoPreview(){
  let tasks = JSON.parse(localStorage.getItem('tasks')||'[]');
  tasks = tasks.filter(t=>!t.done && t.date)
               .sort((a,b)=> new Date(`${a.date}T${a.start||'00:00'}`) - new Date(`${b.date}T${b.start||'00:00'}`));
  const list = document.getElementById('todoPreview');
  list.innerHTML = tasks.length ? '' : '<li>No upcoming tasks</li>';
  tasks.slice(0,3).forEach(t=>{
    const li=document.createElement('li'); li.textContent=`${t.title} (${t.date}${t.start?' '+t.start:''})`;
    list.appendChild(li);
  });
}
loadTodoPreview();
window.addEventListener('storage', (e)=>{ if(e.key==='tasks') loadTodoPreview(); });
window.addEventListener('pageshow', loadTodoPreview);
document.addEventListener('visibilitychange', ()=>{ if(document.visibilityState==='visible') loadTodoPreview(); });

// notes preview
(function(){
  const text = localStorage.getItem('notesText') || '';
  const files = JSON.parse(localStorage.getItem('notesFiles') || '[]');
  const el = document.getElementById('notesPreview');
  if(text) el.textContent = text.slice(0,80)+'...';
  else if(files.length) el.textContent = `📂 ${files.length} file(s) saved`;
})();

// focus timer shared state
function paintFocus(){
  const f = JSON.parse(localStorage.getItem('focusState')||'null');
  if(!f || f.timeLeft==null) return;
  const m=Math.floor(f.timeLeft/60), s=String(f.timeLeft%60).padStart(2,'0');
  document.getElementById('focusDisplay').textContent=`${m}:${s}`;
}
paintFocus();
window.addEventListener('storage', (e)=>{ if(e.key==='focusState') paintFocus(); });
setInterval(paintFocus,1000); // guarantees ticking even if focus page closed

// timeline mini preview: show last 3 sessions
(function(){
  const data = JSON.parse(localStorage.getItem('timeline')||'[]');
  const today = new Date().toDateString();
  const cont = document.getElementById('timelineContainer');
  const todayData = data.filter(d=>d.date===today);
  cont.innerHTML = todayData.slice(-3).map(d=>`<div>${d.task} • ${d.duration}min</div>`).join('') || '<p>No sessions today</p>';
})();

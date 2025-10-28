const container=document.getElementById('timelineContainer');
const sessions=JSON.parse(localStorage.getItem('timeline')||'[]');
const tasks=JSON.parse(localStorage.getItem('tasks')||'[]');
const todayStr=new Date().toDateString();
const todayISO=new Date().toISOString().slice(0,10);

// hours grid 6AM→12PM
for(let h=6;h<=24;h++){
  const d=document.createElement('div'); d.className='hour';
  d.setAttribute('data-hour', h>12?`${h-12} PM`:`${h} AM`); container.appendChild(d);
}
const mins=t=>{ const [h,m]=(t||'00:00').split(':').map(Number); return h*60+m; };
function addBlock(title,start,end,color){
  const top=(mins(start)-6*60); const height=Math.max(24,(mins(end)-mins(start))||30);
  const el=document.createElement('div'); el.className='session';
  el.style.top=`${top}px`; el.style.height=`${height}px`; el.style.background=color;
  el.innerHTML=`<strong>${title}</strong><br>${start} – ${end}`; container.appendChild(el);
}

// focus sessions
sessions.filter(s=>s.date===todayStr).forEach(s=>{
  const st=s.start.split(':').slice(0,2).join(':'), en=s.end.split(':').slice(0,2).join(':');
  addBlock(s.task, st, en, 'linear-gradient(90deg,#7367f0,#4a4ff3)');
});

// tasks (upcoming + ongoing)
const nowMin=new Date().getHours()*60+new Date().getMinutes();
tasks.filter(t=>t.date===todayISO && !t.done && t.start && t.end)
     .sort((a,b)=>new Date(`${a.date}T${a.start}`)-new Date(`${b.date}T${b.start}`))
     .forEach(t=>{
       const ongoing = mins(t.start) <= nowMin && nowMin < mins(t.end);
       addBlock(`📝 ${t.title}`, t.start, t.end, ongoing ? 'linear-gradient(90deg,#ff8a00,#e52e71)' : 'linear-gradient(90deg,#22c1c3,#7367f0)');
     });

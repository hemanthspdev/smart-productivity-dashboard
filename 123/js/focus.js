const timerDisplay=document.getElementById('timerDisplay');
const startBtn=startBtn=document.getElementById('startBtn');
const pauseBtn=document.getElementById('pauseBtn');
const resetBtn=document.getElementById('resetBtn');
const setTimeBtn=document.getElementById('setTimeBtn');
const minutesInput=document.getElementById('minutesInput');
const sessionNameInput=document.getElementById('sessionName');
const sessionList=document.getElementById('sessionList');

let timer; let timeLeft=25*60; let running=false;
let sessions=JSON.parse(localStorage.getItem('timeline')||'[]');

function share(){ localStorage.setItem('focusState', JSON.stringify({timeLeft, running, ts:Date.now()})); }
function updateDisplay(){ const m=Math.floor(timeLeft/60), s=String(timeLeft%60).padStart(2,'0'); timerDisplay.textContent=`${m}:${s}`; share(); }
updateDisplay();

function startTimer(){
  if(running) return; running=true; share();
  const startTime=new Date();
  timer=setInterval(()=>{
    if(timeLeft>0){ timeLeft--; updateDisplay(); }
    else{
      clearInterval(timer); running=false; share();
      const endTime=new Date();
      const task=sessionNameInput.value||'Focus Session';
      const duration=Math.max(1, Math.round((minutesInput.value?minutesInput.value*60:25*60)/60));
      sessions.push({ task, start:startTime.toLocaleTimeString(), end:endTime.toLocaleTimeString(), duration, date:new Date().toDateString() });
      localStorage.setItem('timeline', JSON.stringify(sessions));
      renderSessions(); alert('Session complete!');
    }
  },1000);
}
function pauseTimer(){ clearInterval(timer); running=false; share(); }
function resetTimer(){ clearInterval(timer); running=false; timeLeft=25*60; updateDisplay(); }
function setCustomTime(){ const m=parseInt(minutesInput.value); if(!m||m<=0) return alert('Enter valid minutes'); timeLeft=m*60; updateDisplay(); }

startBtn.onclick=startTimer; pauseBtn.onclick=pauseTimer; resetBtn.onclick=resetTimer; setTimeBtn.onclick=setCustomTime;

function renderSessions(){
  const today=new Date().toDateString(); const arr=sessions.filter(s=>s.date===today);
  sessionList.innerHTML = arr.length ? '' : '<p>No sessions today.</p>';
  arr.forEach(s=>{ const d=document.createElement('div'); d.className='session-card'; d.innerHTML=`<h3>${s.task}</h3><p>${s.start} → ${s.end}</p><p>⏱ ${s.duration} min</p>`; sessionList.appendChild(d);});
}
renderSessions();

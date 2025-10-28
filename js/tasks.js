const modal = document.getElementById('taskModal');
const newTaskBtn = document.getElementById('newTaskBtn');
const cancelTask = document.getElementById('cancelTask');
const saveTask = document.getElementById('saveTask');
const list = document.getElementById('taskList');
let editIndex = null;

const getTasks = ()=> JSON.parse(localStorage.getItem('tasks')||'[]');
const saveTasks = (t)=> localStorage.setItem('tasks', JSON.stringify(t));

function toast(msg){
  let t = document.getElementById('toast');
  if(!t){ t=document.createElement('div'); t.id='toast'; document.body.appendChild(t); }
  t.textContent=msg; t.style.opacity='1'; setTimeout(()=>t.style.opacity='0',1200);
}

function openModal(i=null){
  modal.style.display='flex'; editIndex=i;
  if(i!==null){
    const t=getTasks()[i];
    taskTitle.value=t.title; taskCategory.value=t.category||''; taskDate.value=t.date||'';
    taskStart.value=t.start||''; taskEnd.value=t.end||'';
  }else{ modal.querySelectorAll('input').forEach(x=>x.value=''); }
}
newTaskBtn.onclick=()=>openModal();
cancelTask.onclick=()=>modal.style.display='none';

saveTask.onclick=()=>{
  const title = taskTitle.value.trim(); if(!title) return alert('Title required');
  const obj = { title, category: taskCategory.value.trim(), date: taskDate.value, start: taskStart.value, end: taskEnd.value, done:false };
  let tasks = getTasks();
  if(editIndex!==null) tasks[editIndex]=obj; else tasks.push(obj);
  saveTasks(tasks);
  window.dispatchEvent(new StorageEvent('storage',{key:'tasks'})); // notify other tabs/pages
  modal.style.display='none';
  renderTasks(); toast('Task saved ✅');
};

function renderTasks(){
  let tasks = getTasks();
  if(!tasks.length){ list.innerHTML='<p>No tasks yet.</p>'; return; }
  tasks.sort((a,b)=> new Date(`${a.date||'2100-01-01'}T${a.start||'00:00'}`) - new Date(`${b.date||'2100-01-01'}T${b.start||'00:00'}`));
  list.innerHTML='';
  tasks.forEach((t,i)=>{
    const div=document.createElement('div');
    div.className='task-card'+(t.done?' done':'');
    div.innerHTML=`<h3>${t.title}</h3>
      <p>${t.category||'General'} • ${t.date||''} ${t.start||''}${t.end?'-'+t.end:''}</p>
      <div class="actions">
        <button onclick="toggleDone(${i})">${t.done?'Undo':'Done'}</button>
        <button onclick="editTask(${i})">Edit</button>
        <button onclick="deleteTask(${i})">Delete</button>
      </div>`;
    list.appendChild(div);
  });
}

function toggleDone(i){ const t=getTasks(); t[i].done=!t[i].done; saveTasks(t); renderTasks(); window.dispatchEvent(new StorageEvent('storage',{key:'tasks'})); }
function deleteTask(i){ const t=getTasks(); t.splice(i,1); saveTasks(t); renderTasks(); window.dispatchEvent(new StorageEvent('storage',{key:'tasks'})); }
function editTask(i){ openModal(i); }

renderTasks();

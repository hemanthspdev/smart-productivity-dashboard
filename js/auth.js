// animation toggle
const container = document.getElementById('container');
document.getElementById('signUp').onclick = ()=>container.classList.add('right-panel-active');
document.getElementById('signIn').onclick = ()=>container.classList.remove('right-panel-active');

// hashing (avoid plain passwords)
async function sha256(text){
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
}
const getUsers = ()=> JSON.parse(localStorage.getItem('users')||'[]');
const saveUsers = (u)=> localStorage.setItem('users', JSON.stringify(u));

// sign up
document.getElementById('signupForm').addEventListener('submit', async e=>{
  e.preventDefault();
  const name  = suName.value.trim();
  const email = suEmail.value.trim().toLowerCase();
  const pass  = suPass.value;
  const users = getUsers();
  if(users.find(u=>u.email===email)) return alert('Email already exists');
  users.push({ name, email, hash: await sha256(pass), createdAt: Date.now() });
  saveUsers(users);
  localStorage.setItem('auth', JSON.stringify({ name, email, loginAt: Date.now() }));
  location.href = 'index.html';
});

// sign in
document.getElementById('loginForm').addEventListener('submit', async e=>{
  e.preventDefault();
  const email = siEmail.value.trim().toLowerCase();
  const pass  = siPass.value;
  const users = getUsers();
  const user  = users.find(u=>u.email===email);
  if(!user) return alert('No account for this email');
  if(await sha256(pass) !== user.hash) return alert('Incorrect password');
  localStorage.setItem('auth', JSON.stringify({ name: user.name, email, loginAt: Date.now() }));
  location.href = 'index.html';
});

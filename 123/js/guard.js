const auth = JSON.parse(localStorage.getItem('auth')||'null');
if(!auth){ location.href = 'auth.html'; }
window.currentUser = auth;

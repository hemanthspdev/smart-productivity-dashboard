// ========== CLOCK ==========
function updateClock() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const seconds = now.getSeconds().toString().padStart(2, "0");
  const greet =
    hours < 12
      ? "Good Morning 🌞"
      : hours < 18
      ? "Good Afternoon ☀️"
      : "Good Evening 🌙";
  document.querySelector("header h1").textContent = `${greet}`;
  document.getElementById("clock").textContent = `${hours}:${minutes}:${seconds}`;
}
setInterval(updateClock, 1000);
updateClock();

// ========== TO-DO LIST ==========
const addBtn = document.getElementById("addTask");
const newTask = document.getElementById("newTask");
const list = document.getElementById("todoList");

function saveTasks() {
  const tasks = [];
  list.querySelectorAll("li").forEach(li => {
    tasks.push({
      text: li.querySelector("span").textContent,
      done: li.querySelector("input").checked,
    });
  });
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasks() {
  const saved = JSON.parse(localStorage.getItem("tasks") || "[]");
  list.innerHTML = "";
  saved.forEach(t => {
    const li = document.createElement("li");
    li.innerHTML = `<input type="checkbox" ${t.done ? "checked" : ""}><span>${t.text}</span>`;
    li.querySelector("input").addEventListener("change", saveTasks);
    list.appendChild(li);
  });
}
addBtn.addEventListener("click", () => {
  if (newTask.value.trim() === "") return;
  const li = document.createElement("li");
  li.innerHTML = `<input type="checkbox"><span>${newTask.value}</span>`;
  li.querySelector("input").addEventListener("change", saveTasks);
  list.appendChild(li);
  newTask.value = "";
  saveTasks();
});
loadTasks();

// ========== NOTES ==========
const notesBox = document.createElement("div");
notesBox.className = "widget notes-widget";
notesBox.innerHTML = `
  <h3>Notes</h3>
  <textarea id="notesArea" rows="6" placeholder="Write your notes here..."></textarea>
`;
document.querySelector(".widgets").appendChild(notesBox);

const notesArea = document.getElementById("notesArea");
notesArea.value = localStorage.getItem("notes") || "";
notesArea.addEventListener("input", () => {
  localStorage.setItem("notes", notesArea.value);
});

// ========== WEATHER ==========
const apiKey = "347c6cedc233f2189f0b8d7bbfaef08d"; // <-- Get one free from openweathermap.org
const btnWeather = document.getElementById("getWeather");
btnWeather.addEventListener("click", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(success, error);
  } else {
    alert("Geolocation not supported!");
  }
});

function success(pos) {
  const lat = pos.coords.latitude;
  const lon = pos.coords.longitude;
  fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
  )
    .then(res => res.json())
    .then(data => {
      document.getElementById("location").textContent = data.name;
      document.getElementById("temp").textContent = `${data.main.temp}°C`;
    });
}
function error() {
  alert("Could not get location.");
}

// ========== QUOTE GENERATOR ==========
const quoteBox = document.createElement("div");
quoteBox.className = "widget quote-widget";
quoteBox.innerHTML = `
  <h3>Motivation</h3>
  <p id="quoteText">Click below to get inspired!</p>
  <button id="newQuote">New Quote</button>
`;
document.querySelector(".widgets").appendChild(quoteBox);

const quotes = [
  "Don’t watch the clock; do what it does. Keep going.",
  "Success is the sum of small efforts, repeated daily.",
  "Push yourself, because no one else is going to do it for you.",
  "Your future is created by what you do today.",
  "It always seems impossible until it’s done.",
];
document.getElementById("newQuote").addEventListener("click", () => {
  const q = quotes[Math.floor(Math.random() * quotes.length)];
  document.getElementById("quoteText").textContent = q;
});

// ========== DISPLAY CLOCK DIGITALLY ON HEADER ==========
const clockDisplay = document.createElement("span");
clockDisplay.id = "clock";
clockDisplay.style.fontSize = "1.1em";
clockDisplay.style.color = "#666";
document.querySelector("header").appendChild(clockDisplay);

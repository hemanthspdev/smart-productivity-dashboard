// Clock + Greeting
function updateClock() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const seconds = now.getSeconds().toString().padStart(2, "0");
  const greet =
    hours < 12
      ? "Good Morning ☀️"
      : hours < 18
      ? "Good Afternoon 🌤"
      : "Good Evening 🌙";
  document.getElementById("greetText").textContent = greet;
  document.getElementById("clock").textContent = `${hours}:${minutes}:${seconds}`;
}
setInterval(updateClock, 1000);
updateClock();

// To-Do
const addTaskBtn = document.getElementById("addTask");
const taskInput = document.getElementById("newTask");
const taskList = document.getElementById("taskList");

function loadTasks() {
  const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
  taskList.innerHTML = "";
  tasks.forEach((t, i) => {
    const li = document.createElement("li");
    li.innerHTML = `<input type='checkbox' ${t.done ? "checked" : ""}> ${t.text}`;
    li.querySelector("input").addEventListener("change", () => {
      tasks[i].done = !tasks[i].done;
      localStorage.setItem("tasks", JSON.stringify(tasks));
    });
    taskList.appendChild(li);
  });
}

addTaskBtn.addEventListener("click", () => {
  const text = taskInput.value.trim();
  if (!text) return;
  const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
  tasks.push({ text, done: false });
  localStorage.setItem("tasks", JSON.stringify(tasks));
  taskInput.value = "";
  loadTasks();
});

loadTasks();

// Notes
const notesArea = document.getElementById("notesArea");
notesArea.value = localStorage.getItem("notes") || "";
notesArea.addEventListener("input", () => {
  localStorage.setItem("notes", notesArea.value);
});

// Focus Timer
let timer;
let timeLeft = 25 * 60;
const timerDisplay = document.getElementById("timerDisplay");

function updateTimerDisplay() {
  const m = Math.floor(timeLeft / 60);
  const s = (timeLeft % 60).toString().padStart(2, "0");
  timerDisplay.textContent = `${m}:${s}`;
}

document.getElementById("startTimer").onclick = () => {
  clearInterval(timer);
  timer = setInterval(() => {
    if (timeLeft > 0) {
      timeLeft--;
      updateTimerDisplay();
    } else clearInterval(timer);
  }, 1000);
};
document.getElementById("pauseTimer").onclick = () => clearInterval(timer);
document.getElementById("resetTimer").onclick = () => {
  clearInterval(timer);
  timeLeft = 25 * 60;
  updateTimerDisplay();
};
updateTimerDisplay();

// Weather (manual city)
document.getElementById("getWeather").addEventListener("click", () => {
  const city = document.getElementById("cityInput").value.trim();
  if (!city) return alert("Enter city name!");
  const apiKey = "YOUR_OPENWEATHER_API_KEY";
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`)
    .then(res => res.json())
    .then(data => {
      const info = `${data.name}: ${data.weather[0].main}, ${data.main.temp}°C`;
      document.getElementById("weatherInfo").textContent = info;

      // Change widget color
      const widget = document.getElementById("weatherWidget");
      const cond = data.weather[0].main.toLowerCase();
      if (cond.includes("rain")) widget.style.background = "linear-gradient(135deg,#3a4a8f,#1f232d)";
      else if (cond.includes("cloud")) widget.style.background = "linear-gradient(135deg,#444b63,#1f232d)";
      else widget.style.background = "linear-gradient(135deg,#7367f0,#3f3f74)";
    })
    .catch(() => alert("City not found"));
});
// Dashboard weather auto-load
window.addEventListener("load", () => {
  const saved = JSON.parse(localStorage.getItem("lastWeather"));
  if (saved) {
    document.getElementById("weatherInfo").textContent =
      `${saved.city}: ${saved.cond}, ${saved.temp}°C`;
  }
});

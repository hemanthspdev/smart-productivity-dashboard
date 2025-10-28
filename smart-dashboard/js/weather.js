const cityInput = document.getElementById('cityInput');
const fetchWeather = document.getElementById('fetchWeather');
const cityName = document.getElementById('cityName');
const condition = document.getElementById('condition');
const temperature = document.getElementById('temperature');
const humidity = document.getElementById('humidity');
const box = document.querySelector('.weather-box');

const apiKey = "347c6cedc233f2189f0b8d7bbfaef08d";

fetchWeather.addEventListener('click', getWeather);

function getWeather() {
  const city = cityInput.value.trim();
  if (!city) return alert("Enter city name!");
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`)
    .then(res => res.json())
    .then(data => {
      if (data.cod !== 200) return alert("City not found!");

      const cond = data.weather[0].main;
      const temp = data.main.temp;
      const hum = data.main.humidity;

      cityName.textContent = data.name;
      condition.textContent = `Condition: ${cond}`;
      temperature.textContent = `Temp: ${temp}°C`;
      humidity.textContent = `Humidity: ${hum}%`;

      localStorage.setItem("lastWeather", JSON.stringify({ city, cond, temp, hum }));

      // change color
      box.className = "weather-box";
      if (cond.toLowerCase().includes("rain")) box.classList.add("rainy");
      else if (cond.toLowerCase().includes("cloud")) box.classList.add("cloudy");
      else if (cond.toLowerCase().includes("clear")) {
        const hour = new Date().getHours();
        box.classList.add(hour >= 18 ? "night" : "sunny");
      } else box.classList.add("cloudy");
    })
    .catch(() => alert("Error fetching weather"));
}

// Load last weather
window.onload = () => {
  const saved = JSON.parse(localStorage.getItem("lastWeather"));
  if (saved) {
    cityName.textContent = saved.city;
    condition.textContent = `Condition: ${saved.cond}`;
    temperature.textContent = `Temp: ${saved.temp}°C`;
    humidity.textContent = `Humidity: ${saved.hum}%`;
  }
};

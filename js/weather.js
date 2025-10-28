const API_KEY = "YOUR_OPENWEATHER_API_KEY"; // put your key
const cityInput=document.getElementById('cityInput');
const box=document.getElementById('weatherBox');
const cityName=document.getElementById('cityName');
const condition=document.getElementById('condition');
const temperature=document.getElementById('temperature');
const humidity=document.getElementById('humidity');

document.getElementById('getWeather').onclick = ()=>{
  const city = cityInput.value.trim(); if(!city) return alert('Enter city!');
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`)
    .then(r=>r.json()).then(d=>{
      if(d.cod!==200) return alert('City not found');
      const cond=d.weather[0].main, temp=d.main.temp, hum=d.main.humidity;
      cityName.textContent=d.name; condition.textContent=`Condition: ${cond}`;
      temperature.textContent=`Temperature: ${temp}°C`; humidity.textContent=`Humidity: ${hum}%`;
      localStorage.setItem('lastWeather', JSON.stringify({ city:d.name, cond, temp, hum, ts:Date.now() }));
      setTheme(cond);
      // notify dashboard immediately
      window.dispatchEvent(new StorageEvent('storage',{key:'lastWeather'}));
    }).catch(()=>alert('Error fetching data'));
};

function setTheme(cond){
  box.className='weather-box';
  const c=cond.toLowerCase(); const hr=new Date().getHours();
  if(c.includes('rain')) box.classList.add('rainy');
  else if(c.includes('cloud')) box.classList.add('cloudy');
  else if(c.includes('clear')) box.classList.add(hr>=18?'night':'sunny');
  else box.classList.add('cloudy');
}

// load saved
(function(){
  const saved = JSON.parse(localStorage.getItem('lastWeather')||'null');
  if(saved){
    cityName.textContent=saved.city; condition.textContent=`Condition: ${saved.cond}`;
    temperature.textContent=`Temperature: ${saved.temp}°C`; humidity.textContent=`Humidity: ${saved.hum}%`;
    setTheme(saved.cond);
  }
})();

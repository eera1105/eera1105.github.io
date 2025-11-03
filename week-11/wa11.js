const API_KEY = "4d99cdbd3c2544b3b3620544250311";
const ROOT = "https://api.weatherapi.com/v1";
const out = document.getElementById("out");
const btn = document.getElementById("getWeather");
const manualRow = document.getElementById("manualRow");
const cityInput = document.getElementById("city");

document.querySelectorAll('input[name="mode"]').forEach(r => {
  r.onchange = () => manualRow.style.display = r.value === "manual" ? "block" : "none";
});
btn.onclick = getWeather;

function blurCoord(x){ return Math.round(x/0.25)*0.25; }

async function getWeather(){
  const mode = document.querySelector('input[name="mode"]:checked').value;
  out.textContent = "Loading...";
  try {
    if(mode==="manual"){
      const city = cityInput.value.trim();
      if(!city){ out.textContent="Enter a city name."; return; }
      const data = await fetchWeather(city);
      show(data, "Manual city");
      return;
    }

    const pos = await new Promise((res,rej)=>
      navigator.geolocation.getCurrentPosition(res,rej,{enableHighAccuracy:mode==="exact",timeout:7000})
    );
    let {latitude,longitude} = pos.coords;
    if(mode==="city"){ latitude=blurCoord(latitude); longitude=blurCoord(longitude); }
    const data = await fetchWeather(`${latitude},${longitude}`);
    show(data, mode==="exact"?"Exact location":"City-level");
  } catch(e){
    out.textContent = e.message.includes("User denied") ?
      "Location denied. Try manual mode." :
      "Could not get weather.";
  }
}

async function fetchWeather(q){
  const url = `${ROOT}/current.json?key=${API_KEY}&q=${encodeURIComponent(q)}`;
  const res = await fetch(url);
  if(!res.ok) throw new Error("API error");
  return res.json();
}

function show(data,label){
  const loc = data.location?.name || "Unknown";
  const cond = data.current?.condition?.text || "—";
  const t = Math.round(data.current?.temp_f) + "°F";
  const feels = Math.round(data.current?.feelslike_f) + "°F";
  out.textContent = `${loc} — ${t}, feels like ${feels}, ${cond}. (${label})`;
}

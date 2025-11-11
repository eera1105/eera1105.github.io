
const API_KEY = "4d99cdbd3c2544b3b3620544250311";
const ROOT = "https://api.weatherapi.com/v1";

const out = document.getElementById("out");
const btn = document.getElementById("getWeather");
const manualRow = document.getElementById("manualRow");
const cityInput = document.getElementById("city");
const modeRadios = document.querySelectorAll('input[name="mode"]');

modeRadios.forEach(radio => {
  radio.addEventListener("change", () => {
    const isManual = radio.value === "manual" && radio.checked;
    manualRow.hidden = !isManual;
    if (isManual) {
      cityInput.focus();
    }
  });
});

btn.addEventListener("click", getWeather);

// Enter to fetch
cityInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    getWeather();
  }
});

function blurCoord(x) {
  return Math.round(x / 0.25) * 0.25;
}

async function getWeather() {
  const mode = document.querySelector('input[name="mode"]:checked').value;
  out.textContent = "Loading weather…";

  try {
    if (mode === "manual") {
      const city = cityInput.value.trim();
      if (!city) {
        out.textContent = "Please enter a city name before requesting the weather.";
        cityInput.focus();
        return;
      }
      const data = await fetchWeather(city);
      show(data, "Manual city");
      return;
    }

    // Geolocation path
    const pos = await new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported in this browser. Please use manual mode."));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy: mode === "exact",
          timeout: 7000
        }
      );
    });

    let { latitude, longitude } = pos.coords;

    if (mode === "city") {
      latitude = blurCoord(latitude);
      longitude = blurCoord(longitude);
    }

    const query = `${latitude},${longitude}`;
    const data = await fetchWeather(query);
    show(data, mode === "exact" ? "Exact location" : "City-level (blurred)");
  } catch (e) {
    handleError(e);
  }
}

async function fetchWeather(q) {
  const url = `${ROOT}/current.json?key=${API_KEY}&q=${encodeURIComponent(q)}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Weather service error. Please try again.");
  }
  return res.json();
}

function show(data, label) {
  const loc = data?.location?.name || "Unknown location";
  const region = data?.location?.region || "";
  const country = data?.location?.country || "";
  const place = [loc, region, country].filter(Boolean).join(", ");

  const cond = data?.current?.condition?.text || "No condition data";
  const t = data?.current?.temp_f;
  const feels = data?.current?.feelslike_f;

  const tempText = (typeof t === "number") ? `${Math.round(t)}°F` : "N/A";
  const feelsText = (typeof feels === "number") ? `${Math.round(feels)}°F` : "N/A";

  out.textContent = `${place} — ${tempText}, feels like ${feelsText}, ${cond}. (${label})`;
}

function handleError(e) {
  // Permission denied
  if (e && e.message && e.message.toLowerCase().includes("denied")) {
    out.textContent = "Location request denied. Switch to “Type a city” mode and enter a city name.";
    manualRow.hidden = false;
    document.getElementById("mode-manual").checked = true;
    cityInput.focus();
    return;
  }

  // Fallback
  out.textContent = e && e.message
    ? e.message
    : "Could not get weather. Please try again or use the manual city option.";
}

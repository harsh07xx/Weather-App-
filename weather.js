// weather.js — Open-Meteo data fetching, geocoding, and weather-code -> icon/label mapping.
// Depends on: app (DOM ref) and render() from ui.js — both are available by the time
// these functions are actually called (after all scripts have loaded).
// Also uses saveLastLocation() from storage.js to remember the last-viewed place.

const ICONS = {
  sun: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="4.2"/><g stroke-linecap="round"><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/><line x1="4.9" y1="4.9" x2="7" y2="7"/><line x1="17" y1="17" x2="19.1" y2="19.1"/><line x1="4.9" y1="19.1" x2="7" y2="17"/><line x1="17" y1="7" x2="19.1" y2="4.9"/></g></svg>`,
  moon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.8 6.8 0 0 0 10.5 10.5z"/></svg>`,
  cloudSun: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="8" cy="8" r="3"/><line x1="8" y1="1.5" x2="8" y2="3" stroke-linecap="round"/><line x1="1.5" y1="8" x2="3" y2="8" stroke-linecap="round"/><line x1="3.2" y1="3.2" x2="4.3" y2="4.3" stroke-linecap="round"/><path d="M6 14.5h10.5a3.7 3.7 0 0 0 .3-7.4 5 5 0 0 0-9.6 1.7A3.6 3.6 0 0 0 6 14.5z"/></svg>`,
  cloudMoon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M9.5 3.3A4.2 4.2 0 1 0 12.8 8"/><path d="M6 14.5h10.5a3.7 3.7 0 0 0 .3-7.4 5 5 0 0 0-9.6 1.7A3.6 3.6 0 0 0 6 14.5z"/></svg>`,
  cloud: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 16.5h11a3.9 3.9 0 0 0 .3-7.8 5.3 5.3 0 0 0-10.2 1.8A3.8 3.8 0 0 0 6 16.5z"/></svg>`,
  fog: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><line x1="4" y1="9" x2="20" y2="9"/><line x1="3" y1="13" x2="21" y2="13"/><line x1="5" y1="17" x2="19" y2="17"/></svg>`,
  drizzle: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 12.5h11a3.7 3.7 0 0 0 .3-7.4 5 5 0 0 0-9.6 1.7A3.6 3.6 0 0 0 6 12.5z"/><g stroke-linecap="round"><line x1="9" y1="17" x2="8" y2="19.5"/><line x1="13" y1="17" x2="12" y2="19.5"/><line x1="17" y1="17" x2="16" y2="19.5"/></g></svg>`,
  rain: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 11.5h11a3.7 3.7 0 0 0 .3-7.4 5 5 0 0 0-9.6 1.7A3.6 3.6 0 0 0 6 11.5z"/><g stroke-linecap="round"><line x1="8" y1="16" x2="6.5" y2="20"/><line x1="12.5" y1="16" x2="11" y2="20"/><line x1="17" y1="16" x2="15.5" y2="20"/></g></svg>`,
  snow: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 11.5h11a3.7 3.7 0 0 0 .3-7.4 5 5 0 0 0-9.6 1.7A3.6 3.6 0 0 0 6 11.5z"/><g stroke-linecap="round"><line x1="8" y1="16.5" x2="8" y2="20.5"/><line x1="6" y1="18.5" x2="10" y2="18.5"/><line x1="16" y1="16.5" x2="16" y2="20.5"/><line x1="14" y1="18.5" x2="18" y2="18.5"/></g></svg>`,
  thunder: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 11.5h11a3.7 3.7 0 0 0 .3-7.4 5 5 0 0 0-9.6 1.7A3.6 3.6 0 0 0 6 11.5z"/><path d="M13 14.5l-3 4.2h2.6l-2 4.3 5-5.4h-2.7z" stroke-linejoin="round"/></svg>`
};

function weatherInfo(code, isDay){
  const map = {
    0:{label:'Clear sky', icon: isDay?'sun':'moon'},
    1:{label:'Mostly clear', icon: isDay?'sun':'moon'},
    2:{label:'Partly cloudy', icon: isDay?'cloudSun':'cloudMoon'},
    3:{label:'Overcast', icon:'cloud'},
    45:{label:'Fog', icon:'fog'}, 48:{label:'Rime fog', icon:'fog'},
    51:{label:'Light drizzle', icon:'drizzle'}, 53:{label:'Drizzle', icon:'drizzle'}, 55:{label:'Dense drizzle', icon:'drizzle'},
    56:{label:'Freezing drizzle', icon:'drizzle'}, 57:{label:'Freezing drizzle', icon:'drizzle'},
    61:{label:'Light rain', icon:'rain'}, 63:{label:'Rain', icon:'rain'}, 65:{label:'Heavy rain', icon:'rain'},
    66:{label:'Freezing rain', icon:'rain'}, 67:{label:'Freezing rain', icon:'rain'},
    71:{label:'Light snow', icon:'snow'}, 73:{label:'Snow', icon:'snow'}, 75:{label:'Heavy snow', icon:'snow'}, 77:{label:'Snow grains', icon:'snow'},
    80:{label:'Rain showers', icon:'rain'}, 81:{label:'Rain showers', icon:'rain'}, 82:{label:'Violent showers', icon:'rain'},
    85:{label:'Snow showers', icon:'snow'}, 86:{label:'Snow showers', icon:'snow'},
    95:{label:'Thunderstorm', icon:'thunder'}, 96:{label:'Thunderstorm & hail', icon:'thunder'}, 99:{label:'Thunderstorm & hail', icon:'thunder'}
  };
  return map[code] || {label:'—', icon:'cloud'};
}

let currentPlace = '';

async function fetchWeather(lat, lon, place){
  app.innerHTML = `<div class="state-msg">Reading the sky over ${place}…</div>`;
  try{
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,cloud_cover,wind_speed_10m,surface_pressure&hourly=temperature_2m,weather_code,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max&timezone=auto&forecast_days=8`;
    const res = await fetch(url);
    const data = await res.json();
    render(data, place);
    saveLastLocation(lat, lon, place);
  }catch(e){
    app.innerHTML = `<div class="state-msg">Couldn't reach the sky right now. Please try again.</div>`;
  }
}

async function geocodeSearch(q){
  const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=6&language=en&format=json`);
  const data = await res.json();
  return data.results || [];
}

async function reverseGeocode(lat, lon){
  try{
    const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
    const data = await res.json();
    return data.city || data.locality || data.principalSubdivision || 'Your location';
  }catch(e){ return 'Your location'; }
}

function placeLabel(r){
  return [r.name, r.admin1, r.country].filter(Boolean).join(', ');
}

let unit = loadUnit() || 'C';
let currentData = null;
const app = document.getElementById('app');
if(unit === 'F'){
  document.getElementById('unitF').classList.add('active');
  document.getElementById('unitC').classList.remove('active');
}

function c2f(c){ return c*9/5+32; }
function fmtTemp(c){
  const v = unit==='C' ? c : c2f(c);
  return Math.round(v);
}

function setSky(){ /* background is static white/black now — no-op kept for compatibility */ }

function sunArcSVG(nowISO, sunriseISO, sunsetISO){
  const now = new Date(nowISO), sr = new Date(sunriseISO), ss = new Date(sunsetISO);
  const isDay = now >= sr && now <= ss;
  const w=680, h=130, r=210, cx=w/2, cy=126;
  let frac;
  if(isDay){ frac = (now-sr)/(ss-sr); }
  else {
    const nightLen = (24*3600000) - (ss-sr);
    const sinceSet = now < sr ? (now - new Date(ss.getTime()-24*3600000)) : (now-ss);
    frac = Math.max(0,Math.min(1, sinceSet/nightLen));
  }
  const ang = Math.PI*(1-frac);
  const px = cx + r*Math.cos(ang);
  const py = cy - r*Math.sin(ang);
  const startX = cx-r, endX = cx+r;
  return `<svg class="arc" viewBox="0 0 ${w} ${h+18}" xmlns="http://www.w3.org/2000/svg">
    <path d="M${startX} ${cy} A ${r} ${r} 0 0 1 ${endX} ${cy}" fill="none" stroke="var(--ink)" stroke-opacity="0.18" stroke-width="1.4"/>
    <circle cx="${px}" cy="${py}" r="7" fill="${isDay?'#e8a23c':'#dfe6f0'}" stroke="var(--ink)" stroke-width="1"/>
    <circle cx="${startX}" cy="${cy}" r="2.5" fill="var(--ink)" fill-opacity="0.5"/>
    <circle cx="${endX}" cy="${cy}" r="2.5" fill="var(--ink)" fill-opacity="0.5"/>
  </svg>`;
}

function timeStr(iso){
  return new Date(iso).toLocaleTimeString([], {hour:'numeric', minute:'2-digit'});
}
function hourStr(iso){
  return new Date(iso).toLocaleTimeString([], {hour:'numeric'});
}
function dayName(iso, idx){
  if(idx===0) return 'Today';
  return new Date(iso).toLocaleDateString([], {weekday:'short'});
}
function dateStr(iso){
  return new Date(iso).toLocaleDateString([], {month:'short', day:'numeric'});
}

function render(data, place){
  currentData = data; currentPlace = place;
  const cur = data.current;
  const info = weatherInfo(cur.weather_code, cur.is_day===1);
  const todaySunrise = data.daily.sunrise[0], todaySunset = data.daily.sunset[0];

  setSky(cur.time, todaySunrise, todaySunset, cur.cloud_cover ?? 20);

  // hourly: next 24 from current hour
  const nowTime = new Date(cur.time).getTime();
  let startIdx = data.hourly.time.findIndex(t => new Date(t).getTime() >= nowTime);
  if(startIdx < 0) startIdx = 0;
  const hourlySlice = [];
  for(let i=0;i<24;i++){
    const idx = startIdx+i;
    if(idx>=data.hourly.time.length) break;
    hourlySlice.push({
      time:data.hourly.time[idx], temp:data.hourly.temperature_2m[idx],
      code:data.hourly.weather_code[idx], isDay:data.hourly.is_day[idx]
    });
  }

  const maxHi = Math.max(...data.daily.temperature_2m_max);
  const minLo = Math.min(...data.daily.temperature_2m_min);
  const span = Math.max(1, maxHi-minLo);

  app.innerHTML = `
    <div class="eyebrow">Current conditions · ${place}</div>
    <div class="hero">
      <div class="temp-display">${fmtTemp(cur.temperature_2m)}<sup>°${unit}</sup></div>
      <div class="hero-meta">
        <div class="condition">${info.label}</div>
        <div class="feels">Feels ${fmtTemp(cur.apparent_temperature)}°${unit} · ${timeStr(cur.time)}</div>
      </div>
    </div>

    <div class="arc-card">
      <div class="arc-label-row"><span>Sunrise ${timeStr(todaySunrise)}</span><span>Sunset ${timeStr(todaySunset)}</span></div>
      ${sunArcSVG(cur.time, todaySunrise, todaySunset)}
    </div>

    <div class="section-label">Next 24 hours</div>
    <div class="ticker">
      ${hourlySlice.map((h,i)=>{
        const hi = weatherInfo(h.code, h.isDay===1);
        return `<div class="tick"><div class="hr">${i===0?'Now':hourStr(h.time)}</div><div class="ic">${ICONS[hi.icon]}</div><div class="t">${fmtTemp(h.temp)}°</div></div>`;
      }).join('')}
    </div>
    <canvas id="hourlyChart" class="hourly-chart" height="90"></canvas>

    <div class="section-label">Instrument readings</div>
    <div class="grid">
      <div class="stat"><div class="k">Wind</div><div class="v">${Math.round(cur.wind_speed_10m)}<small> km/h</small></div></div>
      <div class="stat"><div class="k">Humidity</div><div class="v">${cur.relative_humidity_2m}<small>%</small></div></div>
      <div class="stat"><div class="k">Pressure</div><div class="v">${Math.round(cur.surface_pressure)}<small> hPa</small></div></div>
      <div class="stat"><div class="k">UV Index</div><div class="v">${Math.round(data.daily.uv_index_max?.[0] ?? 0)}</div></div>
      <div class="stat"><div class="k">Cloud cover</div><div class="v">${cur.cloud_cover ?? '—'}<small>%</small></div></div>
      <div class="stat"><div class="k">Precip. chance</div><div class="v">${data.daily.precipitation_probability_max?.[0] ?? 0}<small>%</small></div></div>
    </div>

    <div class="section-label">Seven‑day almanac</div>
    <div class="almanac">
      ${data.daily.time.map((t,i)=>{
        const info2 = weatherInfo(data.daily.weather_code[i], true);
        const hi = data.daily.temperature_2m_max[i], lo = data.daily.temperature_2m_min[i];
        const left = ((lo-minLo)/span*100).toFixed(1);
        const width = (((hi-lo)/span)*100).toFixed(1);
        return `<div class="day-row">
          <div class="dname">${dayName(t,i)}<small>${dateStr(t)}</small></div>
          <div class="dic">${ICONS[info2.icon]}</div>
          <div class="bar-wrap">
            <span class="dlo">${fmtTemp(lo)}°</span>
            <div class="bar-track"><div class="bar-fill" style="left:${left}%;width:${width}%"></div></div>
          </div>
          <span class="dhi">${fmtTemp(hi)}°</span>
        </div>`;
      }).join('')}
    </div>
  `;

  drawHourlyChart(document.getElementById('hourlyChart'), hourlySlice);
}

const form = document.getElementById('searchForm');
const input = document.getElementById('searchInput');
const results = document.getElementById('searchResults');
let searchTimer;

input.addEventListener('input', ()=>{
  clearTimeout(searchTimer);
  const q = input.value.trim();
  if(q.length < 2){ results.classList.remove('show'); return; }
  searchTimer = setTimeout(async ()=>{
    const list = await geocodeSearch(q);
    if(!list.length){ results.classList.remove('show'); return; }
    results.innerHTML = list.map(r=>`<button type="button" data-lat="${r.latitude}" data-lon="${r.longitude}" data-label="${placeLabel(r)}">${r.name}<small>${[r.admin1,r.country].filter(Boolean).join(', ')}</small></button>`).join('');
    results.classList.add('show');
  }, 320);
});
results.addEventListener('click', (e)=>{
  const btn = e.target.closest('button');
  if(!btn) return;
  results.classList.remove('show');
  input.value = '';
  fetchWeather(btn.dataset.lat, btn.dataset.lon, btn.dataset.label);
});
form.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const q = input.value.trim();
  if(!q) return;
  const list = await geocodeSearch(q);
  if(list.length){
    results.classList.remove('show'); input.value='';
    fetchWeather(list[0].latitude, list[0].longitude, placeLabel(list[0]));
  }
});
document.addEventListener('click',(e)=>{
  if(!form.contains(e.target)) results.classList.remove('show');
});

document.getElementById('unitC').addEventListener('click', ()=>{
  unit='C'; document.getElementById('unitC').classList.add('active'); document.getElementById('unitF').classList.remove('active');
  saveUnit(unit);
  if(currentData) render(currentData, currentPlace);
});
document.getElementById('unitF').addEventListener('click', ()=>{
  unit='F'; document.getElementById('unitF').classList.add('active'); document.getElementById('unitC').classList.remove('active');
  saveUnit(unit);
  if(currentData) render(currentData, currentPlace);
});

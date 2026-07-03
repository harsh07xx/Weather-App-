// app.js — entry point. Wires everything up once storage.js, weather.js,
// charts.js, and ui.js have all loaded, then kicks the app off.

function init(){
  if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition(
      async (pos)=>{
        const {latitude, longitude} = pos.coords;
        const place = await reverseGeocode(latitude, longitude);
        fetchWeather(latitude, longitude, place);
      },
      ()=>{ fallbackToLastOrDefault(); },
      {timeout:6000}
    );
  } else {
    fallbackToLastOrDefault();
  }
}

function fallbackToLastOrDefault(){
  const last = loadLastLocation();
  if(last){
    fetchWeather(last.lat, last.lon, last.place);
  } else {
    fetchWeather(28.6139, 77.2090, 'New Delhi, India');
  }
}

if('serviceWorker' in navigator){
  window.addEventListener('load', ()=>{
    navigator.serviceWorker.register('service-worker.js').catch(()=>{
      // offline support is a nice-to-have; ignore registration failures
    });
  });
}

init();

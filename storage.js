// storage.js — small localStorage helpers so the app remembers the user's
// unit preference (°C/°F) and last-viewed location between visits.

const STORAGE_KEYS = {
  unit: 'almanac:unit',
  location: 'almanac:lastLocation'
};

function saveUnit(u){
  try{ localStorage.setItem(STORAGE_KEYS.unit, u); }catch(e){}
}

function loadUnit(){
  try{ return localStorage.getItem(STORAGE_KEYS.unit); }catch(e){ return null; }
}

function saveLastLocation(lat, lon, place){
  try{
    localStorage.setItem(STORAGE_KEYS.location, JSON.stringify({ lat, lon, place }));
  }catch(e){}
}

function loadLastLocation(){
  try{
    const raw = localStorage.getItem(STORAGE_KEYS.location);
    return raw ? JSON.parse(raw) : null;
  }catch(e){ return null; }
}

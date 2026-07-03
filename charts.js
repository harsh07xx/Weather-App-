// charts.js — a tiny, dependency-free canvas line chart of the next-24-hour
// temperature trend. Called from ui.js's render() after the hourly ticker.

function drawHourlyChart(canvas, hourlySlice){
  if(!canvas || !hourlySlice || !hourlySlice.length) return;

  // Match the canvas's backing resolution to its displayed size (with DPR scaling)
  const dpr = window.devicePixelRatio || 1;
  const cssWidth = canvas.clientWidth || canvas.parentElement.clientWidth || 320;
  const cssHeight = canvas.height || 90;
  canvas.width = cssWidth * dpr;
  canvas.height = cssHeight * dpr;
  canvas.style.width = cssWidth + 'px';
  canvas.style.height = cssHeight + 'px';

  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssWidth, cssHeight);

  const temps = hourlySlice.map(h => fmtTemp(h.temp));
  const max = Math.max(...temps);
  const min = Math.min(...temps);
  const span = Math.max(1, max - min);
  const padX = 6, padY = 10;
  const w = cssWidth - padX * 2;
  const h = cssHeight - padY * 2;

  const points = temps.map((t, i) => {
    const x = padX + (i / (temps.length - 1 || 1)) * w;
    const y = padY + h - ((t - min) / span) * h;
    return [x, y];
  });

  // line
  ctx.beginPath();
  points.forEach(([x, y], i) => i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y));
  ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--brass') || '#d9b976';
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.stroke();

  // soft fill under the line
  ctx.lineTo(points[points.length - 1][0], padY + h);
  ctx.lineTo(points[0][0], padY + h);
  ctx.closePath();
  ctx.fillStyle = 'rgba(217, 185, 118, 0.12)';
  ctx.fill();

  // dot on the current hour
  ctx.beginPath();
  ctx.arc(points[0][0], points[0][1], 3, 0, Math.PI * 2);
  ctx.fillStyle = ctx.strokeStyle;
  ctx.fill();
}

// System tray clock, always shown in Pacific time (PST/PDT).

const trayClock = document.getElementById('tray-clock');

function updateTrayClock() {
  const now = new Date();
  const time = now.toLocaleTimeString('en-US', {
    timeZone: 'America/Los_Angeles',
    hour: 'numeric',
    minute: '2-digit',
  });
  const zone = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    timeZoneName: 'short',
  })
    .formatToParts(now)
    .find(part => part.type === 'timeZoneName').value;
  trayClock.textContent = `${time} ${zone}`;
}

export function initTrayClock() {
  updateTrayClock();
  setInterval(updateTrayClock, 30000);
}

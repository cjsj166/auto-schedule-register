document.getElementById('create-event-button').addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'createEvent' }, response => {
    console.log(response);
  });
});

document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['gptResponse'], (result) => {
    if (result.gptResponse) {
      document.getElementById('gptResponse').innerText = result.gptResponse;
    }
  });
});

document.getElementById('calculateEnd').addEventListener('click', () => {
  const timeRequired = parseInt(document.getElementById('timeRequired').value, 10);
  const gptResponse = document.getElementById('gptResponse').innerText;

  if (!isNaN(timeRequired)) {
    const endDateTime = addHoursToDateTime(gptResponse, timeRequired);
    alert(`The schedule will end at: ${endDateTime}`);
  } else {
    alert('Invalid integer input');
  }
});

function addHoursToDateTime(dateTime, hours) {
  const date = new Date(dateTime);
  date.setHours(date.getHours() + hours);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  const second = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
}

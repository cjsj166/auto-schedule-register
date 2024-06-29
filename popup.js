window.onload = () => {
  // document.addEventListener('DOMContentLoaded', () => {
  // console.log('DOMContentLoaded event triggered');

  // Delete the previous listener
  chrome.runtime.onMessage.removeListener(messageHandler);
  console.log('window onload event triggered');

  // Make a listener that automatically fills the input fields when message received
  chrome.runtime.onMessage.addListener(messageHandler);
}

function messageHandler(request, sender, sendResponse) {
  if (request.action === 'fillValue') {
    console.log('fillValue message received')

    chrome.storage.local.get(['eventInfo'], (result) => {
      if (result.eventInfo) {

        // Fill input fields automatically from gpt response
        document.getElementById('summary').value = result.eventInfo.summary;
        document.getElementById('description').value = result.eventInfo.description;
        document.getElementById('startDate').value = result.eventInfo.start.dateTime;
        document.getElementById('endDate').value = result.eventInfo.end.dateTime;
      }
    });

  }

  document.getElementById('create-event-button').addEventListener('click', () => {
    // Delete the previous listener
    chrome.runtime.onMessage.removeListener(messageHandler);

    console.log('create event button clicked')

    const eventSchedule = {
      summary: '',
      description: '',
      start: {
        dateTime: '',
        timeZone: 'Asia/Tokyo'
      },
      end: {
        dateTime: '',
        timeZone: 'Asia/Tokyo'
      }
    };

    // Get event info from popup
    eventSchedule.summary = document.getElementById('summary').value;
    eventSchedule.description = document.getElementById('description').value;
    eventSchedule.start.dateTime = document.getElementById('startDate').value + ':00';
    eventSchedule.end.dateTime = document.getElementById('endDate').value + ':00';

    // Save the inputted event info to local storage
    chrome.storage.local.set({ 'eventInfo': eventSchedule }, function () {
      console.log('Value is set to ' + eventSchedule);
      chrome.runtime.sendMessage({ action: 'createEvent' }, response => {
        // Send message to background to close this popup
        chrome.runtime.sendMessage({ action: 'closePopup' });
      });
    });

  }, { once: true });

};

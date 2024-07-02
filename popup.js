window.onload = () => {
  // document.addEventListener('DOMContentLoaded', () => {
  // console.log('DOMContentLoaded event triggered');
  chrome.runtime.onMessage.addListener(eventCreated);

  // Delete the previous listener
  // chrome.runtime.onMessage.removeListener(messageHandler);
  // console.log('window onload event triggered');

  // Make a listener that automatically fills the input fields when message received
  chrome.runtime.onMessage.addListener(messageHandler);

}

function eventCreated(message, sender, sendResponse) {
  if (message.action === 'eventCreated') {
    console.log('eventCreated message received in popup')
    console.log(message)

    if (message.response && message.response.status === 'success') {
      document.getElementById('success-div').style.display = 'block';
      document.getElementById('link').innerText = message.response.link;

    } else {
      document.getElementById('fail-div').style.display = 'block';
      alert('Failed to create event: ' + response.error.message);

    }
  }
}

function messageHandler(request, sender, sendResponse) {
  if (request.action === 'fillValue') {
    // console.log('fillValue message received')

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
    // chrome.runtime.onMessage.removeListener(messageHandler);

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

    document.getElementById('create-calendar-tab').addEventListener('click', () => {
      chrome.runtime.sendMessage({ action: 'createCalendarTab', link: document.getElementById('link').innerText });
      // console.log('createCalendarTab message sent')
      chrome.runtime.sendMessage({ action: 'closePopup' });
    }, { once: true });

    // Save the inputted event info to local storage
    chrome.storage.local.set({ 'eventInfo': eventSchedule }, function () {
      chrome.runtime.sendMessage({ action: 'createEvent' }, response => {
        document.getElementById('form').style.display = 'none';
        // console.log('in popup response:', response);

        return true;
      });

      return true;
    });

  }, { once: true });


};

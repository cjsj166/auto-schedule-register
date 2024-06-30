window.onload = () => {
  // document.addEventListener('DOMContentLoaded', () => {
  // console.log('DOMContentLoaded event triggered');

  // Delete the previous listener
  chrome.runtime.onMessage.removeListener(messageHandler);
  // console.log('window onload event triggered');

  // Make a listener that automatically fills the input fields when message received
  chrome.runtime.onMessage.addListener(messageHandler);

  chrome.runtime.onMessage.addListener(eventCreated);
}

function eventCreated(request, sender, sendResponse) {
  if (request.action === 'eventCreated') {

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
    chrome.runtime.onMessage.removeListener(messageHandler);

    // console.log('create event button clicked')

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

    // document.getElementById('success-div').style.display = 'none';
    // document.getElementById('fail-div').style.display = 'none';

    // Get event info from popup
    eventSchedule.summary = document.getElementById('summary').value;
    eventSchedule.description = document.getElementById('description').value;
    eventSchedule.start.dateTime = document.getElementById('startDate').value + ':00';
    eventSchedule.end.dateTime = document.getElementById('endDate').value + ':00';

    // Save the inputted event info to local storage
    chrome.storage.local.set({ 'eventInfo': eventSchedule }, function () {
      // console.log('Value is set to ' + eventSchedule);
      chrome.runtime.sendMessage({ action: 'createEvent' }, response => {
        document.getElementById('form').style.display = 'none';
          
        if (response.status === 'success') {
          // console.log('response.status is success!')
          // 입력 폼을 숨기고 링크를 표시
          document.getElementById('success-div').style.display = 'block';
          document.getElementById('link').innerText = response.link;
          // document.getElementById('create-calendar-tab').href = response.link;
        } else {
          document.getElementById('fail-div').style.display = 'block';
          alert('Failed to create event: ' + response.error.message);
        }

        return true;

        // chrome.runtime.sendMessage({ action: 'closePopup' });
      });
    });

  }, { once: true });

  document.getElementById('create-calendar-tab').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'createCalendarTab', link: document.getElementById('link').innerText});
    // console.log('createCalendarTab message sent')
    chrome.runtime.sendMessage({ action: 'closePopup' });
  }, { once: true });;

};

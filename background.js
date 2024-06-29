url = null;
apiKey = null;

// 일정 데이터
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

// global variable
currentTabId = null;
popupWindowId = null

// Make "Fetch GPT-3 Response" button in right click menus
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(['apiUrl', 'apiKey'], function (items) {

    url = 'https://api.openai.com/v1/chat/completions'
    apiKey = items.apiKey;
  });

  chrome.contextMenus.create({
    id: "fetch-gpt3-response",
    title: "Fetch GPT-3 Response",
    contexts: ["selection"]
  });

  // Make a listener that create event when submit button in popup clicked
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'createEvent') {
      console.log('createEvent message received')

      // Get event info from popup.html
      chrome.storage.local.get(['eventInfo'], (result) => {
        // console.log("Result: ", result);
        if (result.eventInfo) {
          // console.log(result.eventInfo);

          createCalendarEvent(result.eventInfo).then(response => {
            sendResponse(response);
          });
          return true; // 비동기 응답을 위해 true를 반환
        }
      });

    }
  });

  // Make a listener to close the window after event is registered in Google Calendar
  chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === 'closePopup') {

      chrome.storage.local.get(['windowId'], (result) => {
        if (result.windowId) {
          chrome.windows.remove(result.windowId, function () {
            chrome.storage.local.set({ 'windowId': null });
          });
        }
      });
    }
  });

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'createCalendarTab') {
      chrome.tabs.create({ url: message.link });
    }
  });

});


// When Fetch GPT-3 Response button is clicked
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "fetch-gpt3-response") {
    const selectedText = info.selectionText;
    console.log('tab:', tab.id, 'selectedText:', selectedText)
    currentTabId = tab.id;

    if (popupWindowId !== null) {
      // When there is already a window, focus on it
      chrome.windows.update(popupWindowId, { focused: true });
      return;
    }

    // A window for confirming event details
    chrome.windows.create({
      url: chrome.runtime.getURL("popup.html"),
      type: "popup",
      width: 400,
      height: 250
    }, function (window) {
      chrome.storage.local.set({ 'windowId': window.id });
    });

    // Fetch organized schedule info using GPT-3
    const eventSchedule = await fetchScheduleByGPT3Response(selectedText);

    // Save the event info to local storage so that it can be accessed in popup.html
    chrome.storage.local.set({ 'eventInfo': eventSchedule }, function () {
      // console.log('Value is set to ' + eventSchedule);
      chrome.runtime.sendMessage({ action: 'fillValue' }, response => {
      });
    });

    // console.log(eventSchedule)

  }
});


// //
// "Information about arranged schedule will be provided.\n\
// Do your best to describe the schedule as concisely as possible in json format.\n\
// Required json format is as follow\nY:year M:month D:day h:hour m:minute s:second X:unknown\n\
// You can use X instead of any other character if you cannot determine specific year, month, date ex)XXXX-02-13T15:20:00\n\
// { \"starting_date_time\": \"YYYY-MM-DDThh:mm:ss\", \"end_date_time\": \"YYYY-MM-DDThh:mm:ss\", \"title\": \"Title of the event\", \"description\": \"description of the meeting, meeting room url, address of the place, etc.\" }"
// //

// "Information about arranged schedule will be provided.\n\
// Do your best to describe the schedule as concisely as possible in json format.\n\
// Required json format is as follow.\n\
// { \"starting_date_time\": \"YYYY-MM-DDThh:mm:ss\", \"end_date_time\": \"YYYY-MM-DDThh:mm:ss\", \"title\": \"Title of the event\", \"description\": \"description of the meeting, meeting room url, address of the place, etc.\" }\n\
// If you only know relative time duration, the json format should be as follow.\n\
// { \"starting_date_time\": \"PnYnMnDTnHnMnS\", \"end_date_time\": \"PnYnMnDTnHnMnS\", \"title\": \"Title of the event\", \"description\": \"description of the meeting, meeting room url, address of the place, etc.\" }"
// //

// "Information about arranged schedule will be provided.\n\
// Do your best to describe the schedule as concisely as possible in json format.\n\
// Required json format is as follow.\n\
// { \"starting_date_time\": \"PnYnMnDTnHnMnS\", \"end_date_time\": \"PnYnMnDTnHnMnS\", \"title\": \"Title of the event\", \"description\": \"description of the meeting, meeting room url, address of the place, etc.\" }\
// The ISO 8601 duration format \"PnYnMnDTnHnMnS\" represents a time interval from now:\n\
// P: Period start.\n\
// nY: Number of years.\n\
// nM: Number of months.\n\
// nW: Number of weeks.\n\
// nD: Number of days.\n\
// T: Time start (separates date and time).\n\
// nH: Number of hours.\n\
// nM: Number of minutes.\n\
// nS: Number of seconds.\n\
// If you know the exact time, the json format should be as follow.\n\
// { \"starting_date_time\": \"YYYY-MM-DDThh:mm:ss\", \"end_date_time\": \"YYYY-MM-DDThh:mm:ss\", \"title\": \"Title of the event\", \"description\": \"description of the meeting, meeting room url, address of the place, etc.\" }"
// //

// "Information about arranged schedule will be provided.\n\
// Do your best to describe the schedule as concisely as possible in json format.\n\
// Required json format is as follow.\n\
// { \"starting_date_time\": \"PnYnMnDTnHnMnS\", \"end_date_time\": \"PnYnMnDTnHnMnS\", \"title\": \"Title of the event\", \"description\": \"description of the meeting, meeting room url, address of the place, etc.\" }\
// The ISO 8601 duration format \"PnYnMnDTnHnMnS\" represents a time interval from now:\n\
// P: Period start.\n\
// nY: Number of years.\n\
// nM: Number of months.\n\
// nW: Number of weeks.\n\
// nD: Number of days.\n\
// T: Time start (separates date and time).\n\
// nH: Number of hours.\n\
// nM: Number of minutes.\n\
// nS: Number of seconds.\n\
// If you know the exact time, the json format should be as follow.\n\
// { \"starting_date_time\": \"YYYY-MM-DDThh:mm:ss\", \"end_date_time\": \"YYYY-MM-DDThh:mm:ss\", \"title\": \"Title of the event\", \"description\": \"description of the meeting, meeting room url, address of the place, etc.\" }"
// //

//   `Information about arranged schedule will be provided.\n\
// Do your best to describe the schedule as concisely as possible in json format.\n\
// Consider the date now : ${isoString}.\n\" + "Required json format is as follow\n\
// { \"starting_date_time\": \"YYYY-MM-DDThh:mm:ss\", \"end_date_time\": \"YYYY-MM-DDThh:mm:ss\", \"title\": \"Title of the event\", \"description\": \"description of the meeting, meeting room url, address of the place, etc.\" }`


// Process information about scheduling into json file using gpt3 api call
async function fetchScheduleByGPT3Response(inputText) {
  const now = new Date();
  const isoString = now.toISOString();
  prompt_text = `Information about arranged schedule will be provided.\n\
Do your best to describe the schedule as concisely as possible in json format.\n\
Consider the date now : ${isoString}.\n\" + "Required json format is as follow.\n\
{ \"starting_date_time\": \"YYYY-MM-DDThh:mm:ss\", \"end_date_time\": \"YYYY-MM-DDThh:mm:ss\", \"title\": \"Title of the event\", \"description\": \"description of the meeting, meeting room url, address of the place, etc.\" \
 For title and description, you need to answer in the same language in which you were asked.}`

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  };
  const body = JSON.stringify({
    model: "gpt-3.5-turbo-1106",
    response_format: { "type": "json_object" },
    messages: [
      { role: "system", content: prompt_text },
      { role: "user", content: inputText }
    ]
  });

  console.log(prompt_text)

  console.log('fetchGPT3Response called with input:', inputText);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: body
    });
    console.log('GPT-3 response:', response);

    const data = await response.json();
    const scheduleName = data.choices[0].message.content;

    console.log('schedule info in GPT-3 response:', scheduleName);
    schedule = JSON.parse(scheduleName);
    // console.log(schedule);

    eventSchedule.description = schedule.description;
    eventSchedule.summary = schedule.title;
    eventSchedule.start.dateTime = schedule.starting_date_time;
    eventSchedule.end.dateTime = schedule.end_date_time;
    eventSchedule.start.timeZone = 'Asia/Tokyo';
    eventSchedule.end.timeZone = 'Asia/Tokyo';

    // console.log(eventSchedule);

    return eventSchedule;
  } catch (error) {
    console.error('Error fetching GPT-3 response:', error);
    throw error;
  }
}



// Get token by OAuth2 authentication 
function getAccessToken(interactive) {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: interactive }, function (token) {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(token);
      }
    });
  });
}

// Making an event with Google Calendar API
async function createCalendarEvent(eventSchedule) {
  try {
    console.log('createCalendarEvent function called')
    // First, get access token
    const token = await getAccessToken(true);
    console.log('Make eventSchedule : ')
    console.log(eventSchedule)
    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventSchedule)
    });

    if (response.ok) {
      console.log('Got response')
      const eventData = await response.json();
      console.log('Event created: ', eventData.htmlLink);

      // chrome.tabs.getCurrent((tab) => {
      //   chrome.tabs.sendMessage(tab.id, { action: 'eventCreated', link: eventData.htmlLink });
      // });

      // Send message to content.js to show the link of the created event
      console.log('Sending message to currentTabId: ', currentTabId)
      chrome.tabs.sendMessage(currentTabId, { action: 'eventCreated', link: eventData.htmlLink });

      return { status: 'success', link: eventData.htmlLink };
    } else {
      const errorData = await response.json();
      console.error('Error creating event: ', errorData);
      return { status: 'error', error: errorData };
    }
  } catch (error) {
    console.error('Error: ', error);
    return { status: 'error', error: error };
  }
}

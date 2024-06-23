const url = '';
const apiKey = '';

// Function for fetching response
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "fetch-gpt3-response",
    title: "Fetch GPT-3 Response",
    contexts: ["selection"]
  });
});

// When the item in right click menus was clicked
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "fetch-gpt3-response") {
    const selectedText = info.selectionText;

    // const dateTime = await fetchStartingDateByGPT3Response(selectedText)
    const scheduleName = await fetchScheduleNameByGPT3Response(selectedText);

    // chrome.scripting.executeScript({
    //   target: { tabId: tab.id },
    //   files: ['content.js']
    // }, () => {
    //   chrome.tabs.sendMessage(tab.id, { action: "executeFunction", dateTime: dateTime });
    // });

    // console.log(dateTime)
    console.log(scheduleName)

    chrome.tabs.create({ url: "popup.html" });

  }
});

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

//
"Information about arranged schedule will be provided.\n\
Do your best to describe the schedule as concisely as possible in json format.\n\
Required json format is as follow\nY:year M:month D:day h:hour m:minute s:second X:unknown\n\
You can use X instead of any other character if you cannot determine specific year, month, date ex)XXXX-02-13T15:20:00\n\
{ \"starting_date_time\": \"YYYY-MM-DDThh:mm:ss\", \"end_date_time\": \"YYYY-MM-DDThh:mm:ss\", \"title\": \"Title of the event\", \"description\": \"description of the meeting, meeting room url, address of the place, etc.\" }"
//

"Information about arranged schedule will be provided.\n\
Do your best to describe the schedule as concisely as possible in json format.\n\
Required json format is as follow.\n\
{ \"starting_date_time\": \"YYYY-MM-DDThh:mm:ss\", \"end_date_time\": \"YYYY-MM-DDThh:mm:ss\", \"title\": \"Title of the event\", \"description\": \"description of the meeting, meeting room url, address of the place, etc.\" }\n\
If you only know relative time duration, the json format should be as follow.\n\
{ \"starting_date_time\": \"PnYnMnDTnHnMnS\", \"end_date_time\": \"PnYnMnDTnHnMnS\", \"title\": \"Title of the event\", \"description\": \"description of the meeting, meeting room url, address of the place, etc.\" }"
//

"Information about arranged schedule will be provided.\n\
Do your best to describe the schedule as concisely as possible in json format.\n\
Required json format is as follow.\n\
{ \"starting_date_time\": \"PnYnMnDTnHnMnS\", \"end_date_time\": \"PnYnMnDTnHnMnS\", \"title\": \"Title of the event\", \"description\": \"description of the meeting, meeting room url, address of the place, etc.\" }\
The ISO 8601 duration format \"PnYnMnDTnHnMnS\" represents a time interval from now:\n\
P: Period start.\n\
nY: Number of years.\n\
nM: Number of months.\n\
nW: Number of weeks.\n\
nD: Number of days.\n\
T: Time start (separates date and time).\n\
nH: Number of hours.\n\
nM: Number of minutes.\n\
nS: Number of seconds.\n\
If you know the exact time, the json format should be as follow.\n\
{ \"starting_date_time\": \"YYYY-MM-DDThh:mm:ss\", \"end_date_time\": \"YYYY-MM-DDThh:mm:ss\", \"title\": \"Title of the event\", \"description\": \"description of the meeting, meeting room url, address of the place, etc.\" }"
//

"Information about arranged schedule will be provided.\n\
Do your best to describe the schedule as concisely as possible in json format.\n\
Required json format is as follow.\n\
{ \"starting_date_time\": \"PnYnMnDTnHnMnS\", \"end_date_time\": \"PnYnMnDTnHnMnS\", \"title\": \"Title of the event\", \"description\": \"description of the meeting, meeting room url, address of the place, etc.\" }\
The ISO 8601 duration format \"PnYnMnDTnHnMnS\" represents a time interval from now:\n\
P: Period start.\n\
nY: Number of years.\n\
nM: Number of months.\n\
nW: Number of weeks.\n\
nD: Number of days.\n\
T: Time start (separates date and time).\n\
nH: Number of hours.\n\
nM: Number of minutes.\n\
nS: Number of seconds.\n\
If you know the exact time, the json format should be as follow.\n\
{ \"starting_date_time\": \"YYYY-MM-DDThh:mm:ss\", \"end_date_time\": \"YYYY-MM-DDThh:mm:ss\", \"title\": \"Title of the event\", \"description\": \"description of the meeting, meeting room url, address of the place, etc.\" }"
//

//   `Information about arranged schedule will be provided.\n\
// Do your best to describe the schedule as concisely as possible in json format.\n\
// Consider the date now : ${isoString}.\n\" + "Required json format is as follow\n\
// { \"starting_date_time\": \"YYYY-MM-DDThh:mm:ss\", \"end_date_time\": \"YYYY-MM-DDThh:mm:ss\", \"title\": \"Title of the event\", \"description\": \"description of the meeting, meeting room url, address of the place, etc.\" }`


// Process information about scheduling into json file using gpt3 api call
async function fetchScheduleNameByGPT3Response(inputText) {
  const now = new Date();
  const isoString = now.toISOString();
  prompt_text = `Information about arranged schedule will be provided.\n\
Do your best to describe the schedule as concisely as possible in json format.\n\
Consider the date now : ${isoString}.\n\" + "Required json format is as follow\n\
{ \"starting_date_time\": \"YYYY-MM-DDThh:mm:ss\", \"end_date_time\": \"YYYY-MM-DDThh:mm:ss\", \"title\": \"Title of the event\", \"description\": \"description of the meeting, meeting room url, address of the place, etc.\" }`

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
    const data = await response.json();
    const scheduleName = data.choices[0].message.content;

    console.log('GPT-3 response:', scheduleName);
    schedule = JSON.parse(scheduleName);
    console.log(schedule);

    eventSchedule.summary = schedule.title;
    eventSchedule.start.dateTime = schedule.starting_date_time;
    eventSchedule.start.timeZone = 'Asia/Tokyo';

    eventSchedule.end.dateTime = schedule.end_date_time;
    eventSchedule.end.timeZone = 'Asia/Tokyo';

    console.log(eventSchedule);

    return eventSchedule;
  } catch (error) {
    console.error('Error fetching GPT-3 response:', error);
    throw error;
  }
}


// async function fetchStartingDateByGPT3Response(inputText) {
//   const headers = {
//     'Content-Type': 'application/json',
//     'Authorization': `Bearer ${apiKey}`
//   };
//   const body = JSON.stringify({
//     model: "gpt-3.5-turbo-1106",
//     messages: [
//       { role: "system", content: "Y:year M:month D:day h:hour m:minute s:second X:unknown\nInformation about schedule arranging will be provided. Do your best to find the starting date of the schedule and the end date of the schedule. Starting date and the end date should be separated by comma ex)YYYY-MM-DDThh:mm:ss,YYYY-MM-DDThh:mm:ss\nYou can use X instead of any other character if you cannot determine specific year, month, date\nDO NOT RETURN ANY OTHER TEXT FORMAT OTHER THAN YYYY-MM-DDThh:mm:ss,YYYY-MM-DDThh:mm:ss\nDo NOT SHORTEN LIKE X-03-25T13:00:00. It SHOULD BE INSTEAD XXXX-03-25T13:00:00" },
//       { role: "user", content: inputText }
//     ]
//   });

//   // "Y:year M:month D:day h:hour m:minute s:second X:unknown\nInformation about schedule arranging will be provided. Do your best to find the starting date of the schedule. You should strictly follow the output format YYYY-MM-DDThh:mm:ss\nYou can use X instead of any other character if you cannot determine specific year, month, date\nDO NOT RETURN ANY OTHER TEXT FORMAT OTHER THAN YYYY-MM-DDThh:mm:ss\nex1)2020-12-11T15:20:00\nex2)XXXX-02-16T18:00:00\nex3)XXXX-XX-12T17:50:00"
//   // "Y:year M:month D:day h:hour m:minute s:second X:unknown\nInformation about schedule arranging will be provided. Do your best to find the starting date of the schedule and the end date of the schedule. Starting date and the end date should be separated by comma ex)YYYY-MM-DDThh:mm:ss,YYYY-MM-DDThh:mm:ss\nYou can use X instead of any other character if you cannot determine specific year, month, date\nDO NOT RETURN ANY OTHER TEXT FORMAT OTHER THAN YYYY-MM-DDThh:mm:ss,YYYY-MM-DDThh:mm:ss\nex1)2020-12-11T15:20:00,2020-12-11T16:20:00\nex2)XXXX-02-16T18:00:00,XXXX-02-16T20:25:00\nex3)XXXX-XX-12T17:50:00,XXXX-XX-XXTXX:XX:XX"
//   // "Y:year M:month D:day h:hour m:minute s:second X:unknown\nInformation about schedule arranging will be provided. Do your best to find the starting date of the schedule and the end date of the schedule. Starting date and the end date should be separated by comma ex)YYYY-MM-DDThh:mm:ss,YYYY-MM-DDThh:mm:ss\nYou can use X instead of any other character if you cannot determine specific year, month, date\nDO NOT RETURN ANY OTHER TEXT FORMAT OTHER THAN YYYY-MM-DDThh:mm:ss,YYYY-MM-DDThh:mm:ss\nDo NOT SHORTEN LIKE X-03-25T13:00:00. It SHOULD BE INSTEAD XXXX-03-25T13:00:00"

//   console.log('fetchGPT3Response called with input:', inputText);

//   try {
//     const response = await fetch(url, {
//       method: 'POST',
//       headers: headers,
//       body: body
//     });
//     const data = await response.json();
//     const dateTime = data.choices[0].message.content;

//     console.log('GPT-3 response:', dateTime);

//     return dateTime;
//   } catch (error) {
//     console.error('Error fetching GPT-3 response:', error);
//     throw error;
//   }


// }

// When submit button in popup.html clicked
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'createEvent') {
    createCalendarEvent(eventSchedule).then(response => {
      sendResponse(response);
    });
    return true; // 비동기 응답을 위해 true를 반환
  }
});

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
    // First, get access token
    const token = await getAccessToken(true);
    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventSchedule)
    });

    if (response.ok) {
      const eventData = await response.json();
      console.log('Event created: ', eventData.htmlLink);
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
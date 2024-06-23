const url = 'https://api.openai.com/v1/chat/completions';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "fetch-gpt3-response",
    title: "Fetch GPT-3 Response",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "fetch-gpt3-response") {
    const selectedText = info.selectionText;

    const dateTime = await fetchStartingDateByGPT3Response(selectedText)
    const scheduleName = await fetchScheduleNameByGPT3Response(selectedText);

    // chrome.scripting.executeScript({
    //   target: { tabId: tab.id },
    //   files: ['content.js']
    // }, () => {
    //   chrome.tabs.sendMessage(tab.id, { action: "executeFunction", dateTime: dateTime });
    // });

    console.log(dateTime)
    console.log(scheduleName)

    chrome.tabs.create({ url: "popup.html" });

  }
});

// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   if (request.action === "timeRequired") {
//     console.log('Received timeRequired:', request.timeRequired);

//   }
// });


// chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
//   if (request.action === "fetch-gpt3-response") {
//     const response = await fetchGPT3Response(request.inputText).then(response => {
//       chrome.storage.local.set({ gptResponse: response }, () => {
//         chrome.runtime.sendMessage({ action: "display-response", gptResponse: response });
//       });
//     }).catch(error => {
//       console.error('Error fetching GPT-3 response:', error);
//     });
//   }
// });

async function fetchScheduleNameByGPT3Response(inputText) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  };
  const body = JSON.stringify({
    model: "gpt-3.5-turbo-1106",
    response_format: { "type": "json_object" },
    messages: [
      { role: "system", content: "Information about arranged schedule will be provided.\nDo your best to describe the schedule as concisely as possible in json format.\nDO NOT INCLUDE ANY IRRELATIVE WORDS." },
      { role: "user", content: inputText }
    ]
  });

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

    return scheduleName;
  } catch (error) {
    console.error('Error fetching GPT-3 response:', error);
    throw error;
  }
}


async function fetchStartingDateByGPT3Response(inputText) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  };
  const body = JSON.stringify({
    model: "gpt-3.5-turbo-1106",
    messages: [
      { role: "system", content: "Y:year M:month D:day h:hour m:minute s:second X:unknown\nInformation about schedule arranging will be provided. Do your best to find the starting date of the schedule and the end date of the schedule. Starting date and the end date should be separated by comma ex)YYYY-MM-DDThh:mm:ss,YYYY-MM-DDThh:mm:ss\nYou can use X instead of any other character if you cannot determine specific year, month, date\nDO NOT RETURN ANY OTHER TEXT FORMAT OTHER THAN YYYY-MM-DDThh:mm:ss,YYYY-MM-DDThh:mm:ss\nDo NOT SHORTEN LIKE X-03-25T13:00:00. It SHOULD BE INSTEAD XXXX-03-25T13:00:00" },
      { role: "user", content: inputText }
    ]
  });

  // "Y:year M:month D:day h:hour m:minute s:second X:unknown\nInformation about schedule arranging will be provided. Do your best to find the starting date of the schedule. You should strictly follow the output format YYYY-MM-DDThh:mm:ss\nYou can use X instead of any other character if you cannot determine specific year, month, date\nDO NOT RETURN ANY OTHER TEXT FORMAT OTHER THAN YYYY-MM-DDThh:mm:ss\nex1)2020-12-11T15:20:00\nex2)XXXX-02-16T18:00:00\nex3)XXXX-XX-12T17:50:00"
  // "Y:year M:month D:day h:hour m:minute s:second X:unknown\nInformation about schedule arranging will be provided. Do your best to find the starting date of the schedule and the end date of the schedule. Starting date and the end date should be separated by comma ex)YYYY-MM-DDThh:mm:ss,YYYY-MM-DDThh:mm:ss\nYou can use X instead of any other character if you cannot determine specific year, month, date\nDO NOT RETURN ANY OTHER TEXT FORMAT OTHER THAN YYYY-MM-DDThh:mm:ss,YYYY-MM-DDThh:mm:ss\nex1)2020-12-11T15:20:00,2020-12-11T16:20:00\nex2)XXXX-02-16T18:00:00,XXXX-02-16T20:25:00\nex3)XXXX-XX-12T17:50:00,XXXX-XX-XXTXX:XX:XX"
  // "Y:year M:month D:day h:hour m:minute s:second X:unknown\nInformation about schedule arranging will be provided. Do your best to find the starting date of the schedule and the end date of the schedule. Starting date and the end date should be separated by comma ex)YYYY-MM-DDThh:mm:ss,YYYY-MM-DDThh:mm:ss\nYou can use X instead of any other character if you cannot determine specific year, month, date\nDO NOT RETURN ANY OTHER TEXT FORMAT OTHER THAN YYYY-MM-DDThh:mm:ss,YYYY-MM-DDThh:mm:ss\nDo NOT SHORTEN LIKE X-03-25T13:00:00. It SHOULD BE INSTEAD XXXX-03-25T13:00:00"

  console.log('fetchGPT3Response called with input:', inputText);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: body
    });
    const data = await response.json();
    const dateTime = data.choices[0].message.content;

    console.log('GPT-3 response:', dateTime);

    return dateTime;
  } catch (error) {
    console.error('Error fetching GPT-3 response:', error);
    throw error;
  }
}

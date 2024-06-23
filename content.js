chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "executeFunction") {
    executeMyFunction(request.dateTime);
  }
});

function executeMyFunction(dateTime) {
  const timeRequiredInput = prompt('How many hours will the schedule take?');
  const timeRequired = parseInt(timeRequiredInput, 10);

  if (!isNaN(timeRequired)) {
    const endDateTime = addHoursToDateTime(dateTime, timeRequired);
    alert(`The schedule will start at: ${dateTime}\nThe schedule will end at: ${endDateTime}`);
  } else {
    alert('Invalid integer input');
  }

  console.log(dateTime)
  console.log(timeRequired)
  console.log(endDateTime)

  // chrome.runtime.sendMessage({ action: "timeRequired", timeRequired: timeRequired });
}

// ----------------------------

// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   if (request.action === "fetch-gpt3-response") {
//     fetchGPT3Response(request.inputText).then(response => {
//       const gptResponse = response;
//       const timeRequiredInput = prompt('How many hours will the schedule take?');
//       const timeRequired = parseInt(timeRequiredInput, 10);

//       if (!isNaN(timeRequired)) {
//         const endDateTime = addHoursToDateTime(gptResponse, timeRequired);
//         alert(`The schedule will end at: ${endDateTime}`);
//       } else {
//         alert('Invalid integer input');
//       }
//     }).catch(error => {
//       console.error('Error fetching GPT-3 response:', error);
//     });
//   }
// });

// async function fetchGPT3Response(inputText) {
//   const apiKey = 'YOUR_OPENAI_API_KEY';
//   const url = 'https://api.openai.com/v1/chat/completions';
//   const headers = {
//     'Content-Type': 'application/json',
//     'Authorization': `Bearer ${apiKey}`
//   };
//   const body = JSON.stringify({
//     model: "gpt-3.5-turbo-0125",
//     messages: [
//       { role: "system", content: "Convert input text into YYYY-MM-DDThh:mm:ss" },
//       { role: "user", content: inputText }
//     ]
//   });

//   try {
//     const response = await fetch(url, {
//       method: 'POST',
//       headers: headers,
//       body: body
//     });
//     const data = await response.json();
//     const dateTime = data.choices[0].message.content;
//     return dateTime;
//   } catch (error) {
//     console.error('Error fetching GPT-3 response:', error);
//     throw error;
//   }
// }


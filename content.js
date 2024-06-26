
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'eventCreated') {
    if (window.confirm('Calendar event created successfully! Click "ok" to check the created event.')) {
      chrome.runtime.sendMessage({ action: 'createCalendarTab', link: message.link });
    };

  }
});

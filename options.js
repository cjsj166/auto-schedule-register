document.addEventListener('DOMContentLoaded', function () {
  // 저장된 값을 불러와서 입력 필드에 설정
  chrome.storage.sync.get(['apiKey'], function (items) {
    // if (items.apiUrl) {
    //   document.getElementById('apiUrl').value = items.apiUrl;
    // }
    if (items.apiKey) {
      document.getElementById('apiKey').value = items.apiKey;
    }
  });

  // 저장 버튼 클릭 이벤트 처리
  document.getElementById('save').addEventListener('click', function () {
    // const apiUrl = document.getElementById('apiUrl').value;
    const apiKey = document.getElementById('apiKey').value;

    chrome.storage.sync.set({ apiKey: apiKey }, function () {
      alert('Settings saved');
    });
  });

  // 클리어 버튼 클릭 이벤트 처리
  document.getElementById('clear').addEventListener('click', function () {
    chrome.storage.sync.remove(['apiKey'], function () {
      document.getElementById('apiUrl').value = '';
      document.getElementById('apiKey').value = '';
      alert('Settings cleared');
    });
  });
});

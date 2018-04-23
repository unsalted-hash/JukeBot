chrome.storage.sync.get('autoDootEnabled', function (response) {
    if (response.autoDootEnabled == null) {
        chrome.storage.sync.set({'autoDootEnabled': false});
    }
});

chrome.storage.sync.get('notifierEnabled', function (response) {
    if (response.notifierEnabled != null) {
        chrome.storage.sync.set({'notifierEnabled': false});
    }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.event == 'user_mentioned') {
        chrome.notifications.create('notification_id', {
            type: 'basic',
            iconUrl: './icons/icon48.png',
            title: request.data.message.author,
            message: request.data.message.text
        });
    }
});
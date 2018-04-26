var notifierOptionsVisible = false;

var defaultValues = [
    { key: 'autoDootEnabled', value: false },
    { key: 'notifierEnabled', value: false },
    { key: 'notifierShowAll', value: false },
    { key: 'notifierShowAlerts', value: false },
];

chrome.storage.sync.get(defaultValues.map(x => x.key), function (response) {
    for (var i = 0; i < defaultValues.length; i++) {
        var key = defaultValues[i].key;
        if (response[key] == null) {
            chrome.storage.sync.set({ key: defaultValues[i].value });
        }
    }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.event == 'message_received') {
        chrome.storage.sync.get(['notifierEnabled', 'notifierShowAll', 'notifierShowAlerts'], function (response) {
            if (response && response.notifierEnabled) {
                var userMentioned = request.data.message.html.indexOf('<span class="mention">') > -1;
                var isAlert = request.data.message.isAlert;
                if (userMentioned || (response.notifierShowAlerts && isAlert) || (!isAlert && response.notifierShowAll)) {
                    var notificationObject = {
                        type: 'basic',
                        iconUrl: './icons/icon48.png',
                        message: request.data.message.text,
                        title: isAlert ? "(Alert)" : request.data.message.author
                    };
                    chrome.notifications.create('jukebot_notif', notificationObject);
                }
            }
        });
    }
});
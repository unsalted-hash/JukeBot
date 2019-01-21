var notifierOptionsVisible = false;
var starred = false;

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
                    createNotification(request.data.message.text, (isAlert ? "(Alert)" : request.data.message.author));
                }
            }
        });
    }
});

function sendMessage(event, data, callback) {
    chrome.tabs.query({url: '*://app.jqbx.fm/*', currentWindow: true}, function (tabs) {
        if (tabs.length > 0) {
            chrome.tabs.sendMessage(tabs[0].id, {
                event: event,
                data: data
            }, callback);
        }
    });
}

chrome.commands.onCommand.addListener(function(command) {
    switch (command) {
        case "dope": sendDope(); break;
        case "stepupdown": sendStepUpDown(); break;
        case "star": sendStar(); break;
        case "syncaudio": sendSyncAudio(); break;
    }

  });

function sendDope() {
    createNotification('You upvoted the current track!',"JQBX Notification");    
    sendMessage('upvote-shortcut', {});
    return;
}

function sendStepUpDown() {
    createNotification("Toggled DJ'ing!","JQBX Notification");    
    sendMessage('stepupdown-shortcut', {});
    return;
}

function sendStar() {
    createNotification('You toggled the star on the current track!',"JQBX Notification");
    sendMessage('star-shortcut', {});
    return;
}

function sendSyncAudio() {
    createNotification('Audio synced!',"JQBX Notification");    
    sendMessage('syncaudio-shortcut', {});
    return;
}

function createNotification(message, title) {
    var notificationObject = {
        type: 'basic',
        iconUrl: './icons/icon48.png',
        message: message,
        title: title
    };
    chrome.notifications.create('jukebot_notif', notificationObject);
}
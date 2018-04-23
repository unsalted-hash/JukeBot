function Notifier(jukeBot) {
    const handlerId = 'notifier';
    var running = false;
    var self = this;

    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.event == 'notifier_toggled') {
            if (request.data.enabled) {
                self.start();
            } else {
                self.stop();
            }
        }
    });

    function parseMessages() {
        var newMessages = jukeBot.latestMessages;
        var keyPhrase = '<span class="mention">' + jukeBot.currentUser + '</span>';
        for (var i = 0; i < newMessages.length; i++) {
            var message = newMessages[i];
            if (message.html.indexOf(keyPhrase) > -1) {
                chrome.runtime.sendMessage({
                    event: 'user_mentioned',
                    data: {
                        message: message
                    }
                });
            }
        }
    }

    this.start = function () {
        if (!running) {
            jukeBot.addHandler(handlerId, jukeBot.events.messageReceived, parseMessages);
            running = true;
        }
    };

    this.stop = function () {
        if (running) {
            jukeBot.removeHandler(handlerId, jukeBot.events.messageReceived);
            running = false;
        }
    };
}
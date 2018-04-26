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

    function sendMessages() {
        var newMessages = jukeBot.latestMessages;
        for (var i = 0; i < newMessages.length; i++) {
            var message = newMessages[i];
            if (message.isAlert || message.author != jukeBot.currentUser) {
                chrome.runtime.sendMessage({
                    event: 'message_received',
                    data: {
                        message: newMessages[i]
                    }
                });
            }
        }
    }

    this.start = function () {
        if (!running) {
            jukeBot.addHandler(handlerId, jukeBot.events.messageReceived, sendMessages);
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
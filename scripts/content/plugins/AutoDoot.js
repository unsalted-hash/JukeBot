function AutoDoot(jukeBot) {
    const handlerId = 'autoDoot';
    var running = false;
    var self = this;

    chrome.storage.sync.get('autoDootEnabled', function (response) {
        if (response.autoDootEnabled != null && response.autoDootEnabled == true) {
            self.start();
        }
    });

    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.event == 'auto_doot_toggled') {
            if (request.data.enabled) {
                self.start();
            } else {
                self.stop();
            }
        }
    });

    this.start = function () {
        if (!running) {
            jukeBot.upvote();
            jukeBot.addHandler(handlerId, jukeBot.events.songChanged, function () {
                setTimeout(function() {
                    jukeBot.upvote();
                }, 2500);
            });
            running = true;
        }
    };

    this.stop = function () {
        if (running) {
            jukeBot.removeHandler(handlerId, jukeBot.events.songChanged);
            running = false;
        }
    };
}
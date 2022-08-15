function AutoDoot(jukeBot) {
    const handlerId = 'autoDoot';
    var running = false;
    var self = this;

    chrome.storage.sync.get('autoDootEnabled', function (response) {
        chrome.storage.sync.get('autoDootType', function (typeResponse) {
            if (response.autoDootEnabled != null && response.autoDootEnabled == true) {
                self.start(typeResponse.autoDootType);
            }
        });
    });

    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.event == 'auto_doot_toggled') {
            if (request.data.enabled) {
                self.start(request.data.type);
            } else {
                self.stop();
            }
        }
        else if (request.event == 'auto_doot_type_changed') {
            if (request.data.enabled) {
                self.stop();
                self.start(request.data.type);
            }
        }
    });

    this.start = function (type) {
        if (!running && type) {
            if (type == "upvote") {
                jukeBot.upvote();
                jukeBot.addHandler(handlerId, jukeBot.events.songChanged, function () {
                    setTimeout(function() {
                        jukeBot.upvote();
                    }, 2500);
                });
            }
            else if (type == "boofstar") {
                jukeBot.downvote();
                jukeBot.star();
                jukeBot.addHandler(handlerId, jukeBot.events.songChanged, function () {
                    setTimeout(function() {
                        jukeBot.downvote();
                        jukeBot.star();
                    }, 2500);
                });
            }
            else if (type == "downvote") {
                jukeBot.downvote();
                jukeBot.addHandler(handlerId, jukeBot.events.songChanged, function () {
                    setTimeout(function() {
                        jukeBot.downvote();
                    }, 2500);
                });
            }

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
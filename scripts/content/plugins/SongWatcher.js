function SongWatcher(jukeBot) {
    const handlerId = 'songWatcher';

    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.event == 'popup_loaded') {
            updateSong();
        }
    });
    
    function updateSong() {
        if (jukeBot && jukeBot.currentSong && jukeBot.currentDj) {
            chrome.runtime.sendMessage({
                event: 'song_changed',
                data: {
                    song: jukeBot.currentSong,
                    dj: jukeBot.currentDj
                }
            });
        } else {
            setTimeout(updateSong, 1000);
        }
    }

    this.start = function () {
        jukeBot.addHandler(handlerId, jukeBot.events.songChanged, updateSong);
    };

    this.stop = function () {
        jukeBot.removeHandler(handlerId, jukeBot.events.songChanged);
    };
}
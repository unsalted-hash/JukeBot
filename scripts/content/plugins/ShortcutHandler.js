function ShortcutHandler(jukeBot) {
    const handlerId = 'shortcutHandler';

    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.event == 'upvote-shortcut') {
            jukeBot.upvote();
        }   
        if (request.event == 'stepupdown-shortcut') {
            jukeBot.stepUpDown();
        }
        if (request.event == 'star-shortcut') {
            jukeBot.star();
        }
        if (request.event == 'syncaudio-shortcut') {
            jukeBot.syncAudio();
        }
    });
}